import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import { PageHero, Reveal } from "../components/ui/Section";
import Mascot from "../components/ui/Mascot";

function timeAgo(ts) {
  if (!ts) return "";
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d} days ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m} month${m > 1 ? "s" : ""} ago`;
  const y = Math.floor(m / 12);
  return `${y} year${y > 1 ? "s" : ""} ago`;
}

function Cover({ post, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-3xl border border-line bg-night-800 ${className}`}>
      {post.cover_image ? (
        <img
          src={post.cover_image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="bg-stars relative grid h-full w-full place-items-center bg-night-850">
          <div className="glow-flare absolute inset-0" />
          <img src="/mascot/flarely_main.png" alt="" className="relative w-24 opacity-90" />
        </div>
      )}
    </div>
  );
}

function Meta({ post }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {post.tags?.[0] && (
        <span className="rounded-full bg-flare/15 px-3 py-1 font-semibold capitalize text-flare">{post.tags[0]}</span>
      )}
      <span className="text-dust">
        {[post.author_name, timeAgo(post.published_at)].filter(Boolean).join(" · ")}
      </span>
    </div>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, cover_image, author_name, tags, published_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false });
        setPosts(data || []);
      } catch (err) {
        console.error("Blog load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="Updates"
        title={
          <>
            News from the <span className="text-flare-gradient">Starstreak universe.</span>
          </>
        }
        intro="Product updates, stories and everything happening across Starstreak."
        mascot={<Mascot pose="chat" className="w-52" />}
      />

      <section className="py-16 md:py-24">
        <div className="container-ss">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-3xl bg-night-800" />
              ))}
            </div>
          ) : !featured ? (
            <div className="card-night flex flex-col items-center px-8 py-20 text-center">
              <Mascot pose="sleep" className="w-32" />
              <h2 className="mt-6 text-2xl font-bold text-star">The first update is on its way.</h2>
              <p className="mt-2 text-mist">Check back soon for news from the team.</p>
            </div>
          ) : (
            <>
              <Reveal>
                <Link to={`/blog/${featured.slug}`} className="group grid items-center gap-8 lg:grid-cols-2">
                  <Cover post={featured} className="aspect-[16/10]" />
                  <div>
                    <Meta post={featured} />
                    <h2 className="h-display mt-4 text-3xl text-star transition-colors group-hover:text-accent md:text-5xl">
                      {featured.title}
                    </h2>
                    {featured.excerpt && <p className="mt-4 text-lg leading-relaxed text-mist">{featured.excerpt}</p>}
                    <span className="mt-6 inline-flex items-center gap-2 font-semibold text-accent">
                      Read the story <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>

              {rest.length > 0 && (
                <div className="mt-16 grid gap-8 border-t border-line pt-16 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, i) => (
                    <Reveal key={post.id} delay={(i % 3) * 80}>
                      <Link to={`/blog/${post.slug}`} className="group block">
                        <Cover post={post} className="aspect-[16/10]" />
                        <div className="mt-5">
                          <Meta post={post} />
                          <h3 className="mt-3 text-xl font-bold text-star transition-colors group-hover:text-accent">
                            {post.title}
                          </h3>
                          {post.excerpt && <p className="mt-2 line-clamp-3 text-mist">{post.excerpt}</p>}
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
