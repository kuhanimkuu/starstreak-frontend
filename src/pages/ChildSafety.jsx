import { Link } from "react-router-dom";
import { FiShield, FiFlag, FiSlash, FiAlertTriangle, FiUserCheck } from "react-icons/fi";
import Section, { PageHero, Reveal } from "../components/ui/Section";

// Starstreak's child safety standards (Google Play "Child safety standards"
// declaration for social apps). Keep the contact in step with Play Console.
const CONTACT_EMAIL = "hello@starstreak.org";
const UPDATED = "9 November 2026";

const PROHIBITED = [
  "Child sexual abuse material (CSAM) of any kind, including drawn, edited or AI-generated images, video or text",
  "Sexualising a minor in any way, including comments, captions, avatars, stickers or usernames",
  "Grooming: building trust with a minor to exploit them, or asking a minor for images, meetings or private contact",
  "Sextortion: threatening to share intimate images, or demanding images or money from anyone, especially minors",
  "Sharing, requesting, selling or linking to any of the above, or directing people to places where it is shared",
  "Trafficking or advertising minors for sexual purposes",
];

const ACTIONS = [
  {
    icon: FiAlertTriangle,
    title: "Remove it",
    body: "Content that breaks these standards is removed as soon as we find it or it is reported to us, and reports about child safety are reviewed first.",
  },
  {
    icon: FiSlash,
    title: "Ban the account",
    body: "Accounts that share or seek CSAM, groom or exploit minors are permanently banned, and we work to stop them coming back.",
  },
  {
    icon: FiShield,
    title: "Report it",
    body: "We report apparent child sexual abuse material and exploitation to the relevant authorities, including the National Center for Missing & Exploited Children (NCMEC) CyberTipline and law enforcement where the child or offender is located.",
  },
  {
    icon: FiUserCheck,
    title: "Preserve evidence",
    body: "We keep the information authorities need for an investigation, as the law allows, and respond to valid legal requests.",
  },
];

export default function ChildSafety() {
  return (
    <>
      <PageHero
        eyebrow="Child safety standards"
        title={
          <>
            Zero tolerance for <span className="text-flare-gradient">child exploitation.</span>
          </>
        }
        intro="Starstreak, made by Hephix Ltd, prohibits child sexual abuse and exploitation (CSAE) everywhere in the app: posts, Flashes, communities, profiles, stickers and private messages."
      />

      <Section>
        <div className="mx-auto max-w-3xl space-y-12 text-mist">
          <Reveal>
            <h2 className="text-2xl font-bold text-star">Who can use Starstreak</h2>
            <p className="mt-4 leading-relaxed">
              You must be at least <strong className="text-star">13</strong> to create an account. People aged 13 to 17 need a parent
              or guardian&rsquo;s permission. Accounts we find belong to someone under 13 are closed and their data is deleted.
            </p>
          </Reveal>

          <Reveal>
            <h2 className="text-2xl font-bold text-star">What is not allowed</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed">
              {PROHIBITED.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-2xl font-bold text-star">How to report</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed">
              <li>
                <strong className="text-star">In the app:</strong> use <em>Report</em> on any post, comment, Flash, community or profile.
                You can also block the person straight away.
              </li>
              <li>
                <strong className="text-star">By email:</strong> write to{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent hover:text-gold">
                  {CONTACT_EMAIL}
                </a>{" "}
                with &ldquo;Child safety&rdquo; in the subject. Include links or usernames, but please do not send us the images themselves.
              </li>
              <li>
                <strong className="text-star">If a child is in immediate danger,</strong> contact your local emergency services first. You can also report
                directly to the{" "}
                <a href="https://report.cybertip.org/" target="_blank" rel="noreferrer" className="font-semibold text-accent hover:text-gold">
                  NCMEC CyberTipline ↗
                </a>{" "}
                or the{" "}
                <a href="https://report.iwf.org.uk/" target="_blank" rel="noreferrer" className="font-semibold text-accent hover:text-gold">
                  Internet Watch Foundation ↗
                </a>
                .
              </li>
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section>
        <h2 className="text-center text-2xl font-bold text-star">What we do</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {ACTIONS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={(i % 2) * 100} className="card-night p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-flare/15 text-flare">
                <Icon size={22} />
              </span>
              <h3 className="mt-6 text-xl font-bold text-star">{title}</h3>
              <p className="mt-3 leading-relaxed text-mist">{body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl space-y-12 text-mist">
          <Reveal>
            <h2 className="text-2xl font-bold text-star">Built-in protections</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed">
              <li>People you don&rsquo;t know must send a message request before they can chat with you, and you choose who can message you.</li>
              <li>Blocking stops someone messaging you or interacting with your content.</li>
              <li>Community and Flash moderators can remove posts and members, and our team reviews reports.</li>
              <li>Uploads such as stickers and avatars for public use are reviewed by our team before anyone else can see them.</li>
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-2xl font-bold text-star">Compliance and contact</h2>
            <p className="mt-4 leading-relaxed">
              Starstreak follows applicable child safety laws, including the reporting of child sexual abuse material to the authorities.
              Our designated point of contact for child safety is the Starstreak Trust &amp; Safety team at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent hover:text-gold">
                {CONTACT_EMAIL}
              </a>
              , Hephix Ltd, Nairobi, Kenya.
            </p>
            <p className="mt-4 leading-relaxed">
              These standards add to our{" "}
              <Link to="/guidelines" className="font-semibold text-accent hover:text-gold">community guidelines</Link>,{" "}
              <Link to="/terms" className="font-semibold text-accent hover:text-gold">terms</Link> and{" "}
              <Link to="/privacy" className="font-semibold text-accent hover:text-gold">privacy policy</Link>.
            </p>
            <p className="mt-6 flex items-center gap-2 text-sm text-dust">
              <FiFlag /> Last updated {UPDATED}
            </p>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
