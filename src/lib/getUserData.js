import { supabase } from "./supabase";

export async function getUserData(uid) {
  const { data } = await supabase.rpc("get_website_profile", { p_firebase_uid: uid });
  return data?.[0] || null;
}
