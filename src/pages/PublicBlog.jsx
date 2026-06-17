import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, MessageCircle, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { addBlogComment, getBlogBySlug, getBlogDiscussion, reactToBlog } from "../services/blog";

const READER_STORAGE_KEY = "scriptnova_reader_identity";

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export default function PublicBlog() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reacting, setReacting] = useState("");
  const [reader, setReader] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(READER_STORAGE_KEY) || "{}");
      return {
        name: saved.name || "",
        email: saved.email || "",
      };
    } catch {
      return { name: "", email: "" };
    }
  });

  const saveReaderIdentity = () => {
    const identity = {
      name: reader.name.trim(),
      email: reader.email.trim().toLowerCase(),
    };

    if (!identity.name || !identity.email) {
      setCommentError("Please enter your name and email first.");
      return null;
    }

    localStorage.setItem(READER_STORAGE_KEY, JSON.stringify(identity));
    setReader(identity);
    return identity;
  };

  useEffect(() => {
    let mounted = true;

    getBlogBySlug(slug)
      .then((item) => {
        if (mounted) setBlog(item);
      })
      .catch(() => {
        if (mounted) setError("This article is not available.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!blog?.id) return;

    let mounted = true;
    setDiscussionLoading(true);

    getBlogDiscussion(blog.id, reader)
      .then((data) => {
        if (mounted) setDiscussion(data);
      })
      .catch(() => {
        if (mounted) setDiscussion(null);
      })
      .finally(() => {
        if (mounted) setDiscussionLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [blog?.id, reader.email]);

  const handleReaction = async (reaction) => {
    const identity = saveReaderIdentity();
    if (!identity) return;

    try {
      setReacting(reaction);
      const data = await reactToBlog(blog.id, reaction, identity);
      setDiscussion(data);
      setCommentError("");
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setReacting("");
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    const body = comment.trim();
    if (!body) {
      setCommentError("Write a comment before posting.");
      return;
    }

    const identity = saveReaderIdentity();
    if (!identity) return;

    try {
      setSubmittingComment(true);
      const newComment = await addBlogComment(blog.id, body, identity);
      setDiscussion((current) => ({
        likes: current?.likes || 0,
        dislikes: current?.dislikes || 0,
        user_reaction: current?.user_reaction || null,
        comments: [newComment, ...(current?.comments || [])],
      }));
      setComment("");
      setCommentError("");
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 pt-32 text-gray-950">
        <div className="mx-auto max-w-3xl animate-pulse space-y-5">
          <div className="h-5 w-40 rounded bg-gray-100" />
          <div className="h-12 w-4/5 rounded bg-gray-100" />
          <div className="h-4 w-64 rounded bg-gray-100" />
          <div className="h-96 rounded bg-gray-100" />
        </div>
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="min-h-screen bg-white px-6 pt-32 text-gray-950">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-bold">Article unavailable</h1>
          <p className="mt-3 text-gray-600">{error || "This article is not available."}</p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-pink-600">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const content = blog.humanized_content || blog.content || "";

  return (
    <main className="min-h-screen bg-white px-6 pb-20 pt-32 text-gray-950">
      <article className="mx-auto max-w-3xl">
        <Link to="/#published-blogs" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-pink-600">
          <ArrowLeft className="h-4 w-4" />
          Back to blogs
        </Link>

        <header className="border-b border-gray-200 pb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{formatDate(blog.created_at)}</span>
            {blog.word_count > 0 && <span>{blog.word_count} words</span>}
            <span>By {blog.author_name || blog.author?.name || "ScriptNova author"}</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-normal text-gray-950 md:text-5xl">
            {blog.title || "Untitled blog"}
          </h1>
          {blog.prompt && <p className="mt-5 text-lg leading-8 text-gray-600">{blog.prompt}</p>}
        </header>

        <div className="prose prose-gray mt-10 max-w-none prose-headings:text-gray-950 prose-a:text-pink-600">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        <section className="mt-14 border-t border-gray-200 pt-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-950">
                <MessageCircle className="h-6 w-6 text-pink-500" />
                Reader discussion
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Enter your name and email once. Your browser will remember them for future reactions.
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

          {commentError && (
            <div className="mt-5 rounded-lg border border-pink-100 bg-pink-50 px-4 py-3 text-sm text-pink-700">
              {commentError}
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="mt-6">
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Name</span>
                <input
                  value={reader.name}
                  onChange={(event) => setReader((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Email</span>
                <input
                  value={reader.email}
                  onChange={(event) => setReader((current) => ({ ...current, email: event.target.value }))}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </label>
            </div>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              placeholder="Share your thoughts..."
              disabled={submittingComment}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-50"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={submittingComment}
                className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {submittingComment ? "Posting..." : "Post comment"}
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
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-950">
                        {item.author?.name || item.author?.username || "Reader"}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                    </div>
                  </div>
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
      </article>
    </main>
  );
}
