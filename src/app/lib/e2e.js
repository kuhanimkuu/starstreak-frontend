/**
 * End-to-end encryption for DMs — byte-for-byte compatible with the phone app
 * (lib/core/services/encryption_service.dart):
 *
 *   message:  AES-256-CBC (PKCS#7) with a random key + IV
 *   key wrap: RSA-2048 OAEP (SHA-1, as pointycastle's OAEPEncoding) over
 *             the 48 bytes key‖IV, once per registered device
 *   keys:     base64(JSON {modulus, exponent[, p, q]}) with decimal numbers
 *   backup:   AES-256-CBC of the private key "PEM", key = HMAC-SHA256(salt,
 *             userId + ':nexora_pk_backup_v2'), IV = first 16 bytes of
 *             HMAC-SHA256(salt, userId + ':nexora_pk_backup_v2:iv')
 *
 * The private key is restored from the owner-only backup each session and
 * kept only in memory as a non-extractable CryptoKey. The web app never
 * generates or uploads a key pair — that would replace the phone's.
 */

const subtle = globalThis.crypto.subtle;
const BACKUP_SUFFIX = ":nexora_pk_backup_v2";
const RSA = { name: "RSA-OAEP", hash: "SHA-1" };
export const DECRYPT_FAILED = "[Encrypted message - failed to decrypt]";

// ── encoding helpers ─────────────────────────────────────────────────────────
const enc = new TextEncoder();
const dec = new TextDecoder();

export function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToB64(bytes) {
  let bin = "";
  const b = new Uint8Array(bytes);
  for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(bin);
}

function bigToB64Url(n) {
  let hex = n.toString(16);
  if (hex.length % 2) hex = `0${hex}`;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytesToB64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function modInverse(a, m) {
  let [oldR, r] = [((a % m) + m) % m, m];
  let [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return ((oldS % m) + m) % m;
}

function parseKeyJson(pem) {
  return JSON.parse(dec.decode(b64ToBytes(pem.trim())));
}

// ── key import ───────────────────────────────────────────────────────────────
export async function importPublicKey(pem) {
  const k = parseKeyJson(pem);
  const jwk = { kty: "RSA", n: bigToB64Url(BigInt(k.modulus)), e: bigToB64Url(BigInt(k.exponent)), alg: "RSA-OAEP", ext: true };
  return subtle.importKey("jwk", jwk, RSA, false, ["encrypt"]);
}

/** The app's private key JSON has n, d, p, q (public exponent is always 65537). */
export async function importPrivateKey(pem, publicExponent = 65537n) {
  const k = parseKeyJson(pem);
  const n = BigInt(k.modulus);
  const d = BigInt(k.exponent);
  const p = BigInt(k.p);
  const q = BigInt(k.q);
  const jwk = {
    kty: "RSA", alg: "RSA-OAEP", ext: false,
    n: bigToB64Url(n), e: bigToB64Url(publicExponent), d: bigToB64Url(d),
    p: bigToB64Url(p), q: bigToB64Url(q),
    dp: bigToB64Url(d % (p - 1n)), dq: bigToB64Url(d % (q - 1n)), qi: bigToB64Url(modInverse(q, p)),
  };
  return { key: await subtle.importKey("jwk", jwk, RSA, false, ["decrypt"]), modulus: k.modulus };
}

/** The public "PEM" (app format) for a private key's modulus. */
export function publicPemFor(modulus, exponent = "65537") {
  return bytesToB64(enc.encode(JSON.stringify({ modulus: String(modulus), exponent: String(exponent) })));
}

// ── backup ───────────────────────────────────────────────────────────────────
async function hmac(keyBytes, text) {
  const k = await subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await subtle.sign("HMAC", k, enc.encode(text)));
}

/** Decrypt the private key backup (user_key_backups row) → the app's private key PEM. */
export async function decryptBackup(userId, encryptedB64, saltB64) {
  const salt = b64ToBytes(saltB64 || "");
  if (!salt.length) throw new Error("This key backup is from an old version — open the phone app once to refresh it.");
  const keyBytes = await hmac(salt, `${userId}${BACKUP_SUFFIX}`);
  const iv = (await hmac(salt, `${userId}${BACKUP_SUFFIX}:iv`)).slice(0, 16);
  const aes = await subtle.importKey("raw", keyBytes, { name: "AES-CBC" }, false, ["decrypt"]);
  const plain = await subtle.decrypt({ name: "AES-CBC", iv }, aes, b64ToBytes(encryptedB64));
  return dec.decode(plain);
}

// ── messages ─────────────────────────────────────────────────────────────────
async function decryptWith(privateKey, contentB64, wrappedKeyB64) {
  const keyAndIv = new Uint8Array(await subtle.decrypt(RSA, privateKey, b64ToBytes(wrappedKeyB64)));
  const aes = await subtle.importKey("raw", keyAndIv.slice(0, 32), { name: "AES-CBC" }, false, ["decrypt"]);
  const plain = await subtle.decrypt({ name: "AES-CBC", iv: keyAndIv.slice(32, 48) }, aes, b64ToBytes(contentB64));
  return dec.decode(plain);
}

/**
 * Decrypt a message row. Tries this device's wrapped key first, then every
 * other device entry (all of your devices restored from the same backup share
 * one key pair), then the legacy single-key columns.
 */
export async function decryptMessageRow(row, { privateKey, deviceId, myId }) {
  if (!row?.is_encrypted) return row?.content ?? "";
  if (!privateKey) return DECRYPT_FAILED;
  const device = row.device_encrypted_keys || {};
  const candidates = [
    device[deviceId],
    ...Object.entries(device).filter(([id]) => id !== deviceId).map(([, v]) => v),
    row.sender_id === myId ? row.sender_encrypted_key : row.encrypted_key,
    row.sender_id === myId ? row.encrypted_key : row.sender_encrypted_key,
  ].filter((v, i, a) => typeof v === "string" && v && a.indexOf(v) === i);
  for (const wrapped of candidates) {
    try {
      return await decryptWith(privateKey, row.content, wrapped);
    } catch {
      /* not ours — try the next one */
    }
  }
  return DECRYPT_FAILED;
}

/**
 * Encrypt text for every registered device of both people (and the legacy
 * columns), exactly like EncryptionService.encryptMessageForBoth.
 * `recipientKeys` / `senderKeys`: { deviceId: publicPem }.
 */
export async function encryptForBoth(plainText, recipientKeys, senderKeys) {
  const recipientEntries = Object.entries(recipientKeys);
  if (!recipientEntries.length) return null;
  const keyBytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const aes = await subtle.importKey("raw", keyBytes, { name: "AES-CBC" }, false, ["encrypt"]);
  const cipher = new Uint8Array(await subtle.encrypt({ name: "AES-CBC", iv }, aes, enc.encode(plainText)));
  const keyAndIv = new Uint8Array(48);
  keyAndIv.set(keyBytes, 0);
  keyAndIv.set(iv, 32);

  const wrap = async (pem) => bytesToB64(new Uint8Array(await subtle.encrypt(RSA, await importPublicKey(pem), keyAndIv)));
  const deviceEncryptedKeys = {};
  for (const [deviceId, pem] of [...recipientEntries, ...Object.entries(senderKeys)]) {
    try {
      deviceEncryptedKeys[deviceId] = await wrap(pem);
    } catch {
      /* skip a malformed device key */
    }
  }
  const encryptedKey = await wrap(recipientEntries[0][1]);
  const senderFirst = Object.values(senderKeys)[0];
  const senderEncryptedKey = senderFirst ? await wrap(senderFirst) : encryptedKey;
  keyBytes.fill(0);
  return { encryptedMessage: bytesToB64(cipher), encryptedKey, senderEncryptedKey, deviceEncryptedKeys };
}
