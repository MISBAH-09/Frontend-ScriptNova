import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, MessageCircle, Search, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { addBlogComment, getBlogDiscussion, getPublishedBlogs, reactToBlog } from "../../services/blog";
import { currentUserId, getUserById } from "../../services/auth";

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

export default function ReaderBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [discussion, setDiscussion] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [reacting, setReacting] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getPublishedBlogs(),
      currentUserId() ? getUserById(currentUserId()) : Promise.resolve(null),
    ])
      .then(([items, user]) => {
        if (!mounted) return;
        setBlogs(items);
        setCurrentUser(user);
      })
      .catch((err) => {
        if (mounted) setMessage(err.message || "Unable to load blogs.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBlog?.id) return;

    let mounted = true;
    setDiscussionLoading(true);
    setMessage("");

    getBlogDiscussion(selectedBlog.id)
      .then((data) => {
        if (mounted) setDiscussion(data);
      })
      .catch((err) => {
        if (mounted) setMessage(err.message || "Unable to load discussion.");
      })
      .finally(() => {
        if (mounted) setDiscussionLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedBlog?.id]);

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

  const handleReaction = async (reaction) => {
    try {
      setReacting(reaction);
      const data = await reactToBlog(selectedBlog.id, reaction);
      setDiscussion(data);
      setMessage("");
    } catch (err) {
      setMessage(err.message || "Unable to save reaction.");
    } finally {
      setReacting("");
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const body = comment.trim();
    if (!body) {
      setMessage("Write a comment before posting.");
      return;
    }

    try {
      setSubmitting(true);
      const newComment = await addBlogComment(selectedBlog.id, body);
      setDiscussion((current) => ({
        likes: current?.likes || 0,
        dislikes: current?.dislikes || 0,
        user_reaction: current?.user_reaction || null,
        comments: [newComment, ...(current?.comments || [])],
      }));
      setComment("");
      setMessage("");
    } catch (err) {
      setMessage(err.message || "Unable to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedBlog) {
    const content = selectedBlog.humanized_content || selectedBlog.content || "";
    const displayName =
      currentUser && `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim()
        ? `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim()
        : currentUser?.username || currentUser?.email || "your account";

    return (
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => {
            setSelectedBlog(null);
            setDiscussion(null);
            setComment("");
            setMessage("");
          }}
          className="mb-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-pink-600 shadow-sm transition hover:text-pink-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all blogs
        </button>

        <article className="rounded-lg bg-white p-6 shadow-sm md:p-8">
          <header className="border-b border-gray-200 pb-6">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{formatDate(selectedBlog.created_at)}</span>
              {selectedBlog.word_count > 0 && <span>{selectedBlog.word_count} words</span>}
              <span>By {selectedBlog.author_name || selectedBlog.author?.name || "ScriptNova author"}</span>
            </div>
            <h2 className="text-3xl font-extrabold leading-tight text-slate-950 md:text-4xl">
              {selectedBlog.title || "Untitled blog"}
            </h2>
            {selectedBlog.prompt && <p className="mt-4 text-base leading-7 text-gray-600">{selectedBlog.prompt}</p>}
          </header>

          <div className="prose prose-gray mt-8 max-w-none prose-headings:text-slate-950 prose-a:text-pink-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </article>

        <section className="mt-6 rounded-lg bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
                <MessageCircle className="h-6 w-6 text-pink-500" />
                Reader discussion
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Comments and reactions will be posted as {displayName}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleReaction("like")}
                disabled={reacting === "like"}
                className={`inline-flex min-w-24 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  discussion?.user_reaction === "like"
                    ? "border-pink-500 bg-pink-50 text-pink-600"
                    : "border-gray-200 bg-white text-gray-700 hover:border-pink-200 hover:text-pink-600"
                } disabled:opacity-60`}
              >
                <ThumbsUp className="h-4 w-4" />
                {discussion?.likes || 0}
              </button>
              <button
                type="button"
                onClick={() => handleReaction("dislike")}
                disabled={reacting === "dislike"}
                className={`inline-flex min-w-24 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  discussion?.user_reaction === "dislike"
                    ? "border-gray-700 bg-gray-100 text-gray-950"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-950"
                } disabled:opacity-60`}
              >
                <ThumbsDown className="h-4 w-4" />
                {discussion?.dislikes || 0}
              </button>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-lg border border-pink-100 bg-pink-50 px-4 py-3 text-sm text-pink-700">
              {message}
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="mt-6">
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              placeholder="Share your thoughts..."
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-50"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Posting..." : "Post comment"}
              </button>
            </div>
          </form>

          <div className="mt-8 space-y-4">
            {discussionLoading ? (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
              </div>
            ) : discussion?.comments?.length ? (
              discussion.comments.map((item) => (
                <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="font-semibold text-gray-950">
                    {item.author?.name || item.author?.username || "Reader"}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">{item.body}</p>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                No comments yet. Be the first reader to start the conversation.
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-950">All published blogs</h2>
          <p className="mt-2 text-sm text-slate-600">
            Open any published blog and interact using your logged-in account details.
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
      </div>

      {message && (
        <div className="mb-5 rounded-lg border border-pink-100 bg-pink-50 px-4 py-3 text-sm text-pink-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-lg bg-white" />
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <h3 className="text-xl font-bold">No blogs found</h3>
          <p className="mt-2 text-sm text-gray-600">
            {query ? "Try a different search term." : "Published blogs will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredBlogs.map((blog) => {
            const body = stripMarkdown(blog.humanized_content || blog.content || blog.prompt);
            const excerpt = body.length > 170 ? `${body.slice(0, 170)}...` : body;

            return (
              <article key={blog.id} className="flex min-h-72 flex-col rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3 text-xs text-gray-500">
                  <span>{formatDate(blog.created_at)}</span>
                  {blog.word_count > 0 && <span>{blog.word_count} words</span>}
                </div>
                <h3 className="text-xl font-bold leading-snug text-slate-950">{blog.title || "Untitled blog"}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">{excerpt}</p>
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-200 pt-4 text-sm">
                  <span className="font-semibold text-gray-700">
                    By {blog.author_name || blog.author?.username || "ScriptNova author"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedBlog(blog)}
                    className="font-semibold text-pink-600 hover:text-pink-700"
                  >
                    Read
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
