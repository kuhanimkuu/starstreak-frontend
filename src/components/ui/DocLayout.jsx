import { PageHero, Spinner } from "./Section";

/**
 * Layout for long-form documents (legal pages, guidelines): hero, then a
 * readable night card with the content. `updated` shows a "Last updated" line.
 */
export default function DocLayout({ eyebrow, title, intro, updated, loading, mascot, children, footer }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} mascot={mascot}>
        {updated && <p className="mt-6 text-sm text-dust">Last updated {updated}</p>}
      </PageHero>
      <section className="py-16 md:py-24">
        <div className="container-ss">
          {loading ? (
            <Spinner />
          ) : (
            <article className="card-night mx-auto max-w-3xl p-8 md:p-12">{children}</article>
          )}
          {footer && <div className="mx-auto mt-10 max-w-3xl text-center text-mist">{footer}</div>}
        </div>
      </section>
    </>
  );
}

export function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
