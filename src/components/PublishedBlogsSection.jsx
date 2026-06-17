import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedBlogs } from "../services/blog";

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const stripMarkdown = (value = "") =>
  value
    .replace(/[#*_>`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function PublishedBlogsSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getPublishedBlogs({ limit: 6 })
      .then((items) => {
        if (mounted) setBlogs(items);
      })
      .catch(() => {
        if (mounted) setBlogs([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && blogs.length === 0) return null;

  return (
    <section id="published-blogs" className="bg-slate-200 py-20 text-gray-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
            <p className="text-sm leading-6 text-gray-600">
              Read the newest articles published by ScriptNova creators, from practical guides to trend-focused analysis.
            </p>
            <Link to="/blogs" className="mt-3 inline-flex text-sm font-semibold text-pink-600 hover:text-pink-700">
              View all blogs
            </Link>
        </div>
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-pink-500">From the blog</p>
            <h3 className="text-3xl font-bold md:text-4xl">Latest published insights</h3>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-56 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => {
              const body = stripMarkdown(blog.humanized_content || blog.content || blog.prompt);
              const excerpt = body.length > 180 ? `${body.slice(0, 180)}...` : body;

              return (
                <article
                  key={blog.id}
                  className="flex min-h-64 flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-pink-200 hover:shadow-md"
                >
                  <div className="mb-4 flex items-center justify-between gap-3 text-xs text-gray-500">
                    <span>{formatDate(blog.created_at)}</span>
                    {blog.word_count > 0 && <span>{blog.word_count} words</span>}
                  </div>
                  <h4 className="text-xl font-bold leading-snug text-gray-950">{blog.title || "Untitled blog"}</h4>
                  <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">{excerpt}</p>
                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-200 pt-4 text-sm">
                    <span className="font-semibold text-gray-700">
                      By {blog.author_name || blog.author?.username || "ScriptNova author"}
                    </span>
                    {blog.slug && (
                      <Link to={`/blog/${blog.slug}`} className="font-semibold text-pink-600 hover:text-pink-700">
                        Read article
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default PublishedBlogsSection;
