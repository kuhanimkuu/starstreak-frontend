import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import RichContent from "../components/RichContent";
import Starfield from "../components/ui/Starfield";
import Mascot from "../components/ui/Mascot";
import { Spinner } from "../components/ui/Section";

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPost() {
  const { slug } = useParams();
  // Which slug the current result belongs to — loading until it matches the URL.
  const [result, setResult] = useState({ slug: null, post: null });
  const loading = result.slug !== slug;
  const post = result.post;

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, content, cover_image, author_name, tags, published_at")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setResult({ slug, post: data || null });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <Spinner className="min-h-screen" />;

  if (!post) {
    return (
      <div className="container-ss flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
        <Mascot pose="search" className="w-36" />
        <h1 className="h-display mt-6 text-4xl text-star">Post not found</h1>
        <p className="mt-3 text-mist">This post may have been removed, or the link is wrong.</p>
        <Link to="/blog" className="btn-ghost mt-8">
          Back to updates
        </Link>
      </div>
    );
  }

  return (
    <article>
      <header className="relative overflow-hidden border-b border-line bg-night-gradient pt-36 pb-16">
        <Starfield density={40} />
        <div className="container-ss relative max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-mist hover:text-star">
            <FiArrowLeft /> All updates
          </Link>
          {post.tags?.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-flare/15 px-3 py-1 text-xs font-semibold capitalize text-flare">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="h-display mt-5 text-4xl text-star md:text-6xl">{post.title}</h1>
          {post.excerpt && <p className="mt-5 text-lg text-mist">{post.excerpt}</p>}
          <p className="mt-6 text-sm text-dust">
            {[post.author_name && `By ${post.author_name}`, formatDate(post.published_at)].filter(Boolean).join(" · ")}
          </p>
        </div>
      </header>

      {post.cover_image && (
        <div className="container-ss max-w-4xl pt-12">
          <img src={post.cover_image} alt="" className="w-full rounded-3xl border border-line" />
        </div>
      )}

      <div className="container-ss max-w-3xl py-14 md:py-20">
        {/* HTML from the ops editor, or legacy plain text — RichContent handles both */}
        <RichContent content={post.content} className="text-[1.0625rem]" />
        <div className="mt-16 flex items-center justify-between border-t border-line pt-8">
          <Link to="/blog" className="inline-flex items-center gap-2 font-semibold text-accent hover:text-gold">
            <FiArrowLeft /> More updates
          </Link>
          <Link to="/download" className="btn-flare !py-2.5 text-sm">
            Get the app
          </Link>
        </div>
      </div>
    </article>
  );
}
