import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
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

export default function PublicBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    getPublishedBlogs()
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

  const filteredBlogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return blogs;

    return blogs.filter((blog) => {
      const searchable = [
        blog.title,
        blog.prompt,
        blog.keywords,
        blog.author_name,
        stripMarkdown(blog.humanized_content || blog.content),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(needle);
    });
  }, [blogs, query]);

  return (
    <main className="min-h-screen bg-white px-6 pb-20 pt-32 text-gray-950">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 border-b border-gray-200 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-pink-500">ScriptNova blog</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight md:text-5xl">All published blogs</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
              Browse every article published by ScriptNova creators.
            </p>
          </div>

          <label className="relative block w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search blogs"
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </label>
        </header>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-64 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
            <h2 className="text-xl font-bold">No blogs found</h2>
            <p className="mt-2 text-sm text-gray-600">
              {query ? "Try a different search term." : "Published blogs will appear here."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => {
              const body = stripMarkdown(blog.humanized_content || blog.content || blog.prompt);
              const excerpt = body.length > 190 ? `${body.slice(0, 190)}...` : body;

              return (
                <article
                  key={blog.id}
                  className="flex min-h-72 flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-pink-200 hover:shadow-md"
                >
                  <div className="mb-4 flex items-center justify-between gap-3 text-xs text-gray-500">
                    <span>{formatDate(blog.created_at)}</span>
                    {blog.word_count > 0 && <span>{blog.word_count} words</span>}
                  </div>
                  <h2 className="text-xl font-bold leading-snug text-gray-950">{blog.title || "Untitled blog"}</h2>
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
    </main>
  );
}
