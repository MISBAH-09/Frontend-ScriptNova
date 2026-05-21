import { useState, useEffect } from "react"
import { getBlogById, updateBlog, toggleFavourite, regenerateTitle, rephraseBlog } from "../../services/blog"

const renderInline = (t) =>
  t.replace(/`([^`]+)`/g, "<code>$1</code>")
   .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
   .replace(/\*([^*]+)\*/g, "<em>$1</em>")

const renderMarkdown = (md) => {
  if (!md) return ""
  let html = "", inList = false
  for (let line of md.split("\n")) {
    const t = line.trim()
    if (!t) { if (inList) { html += "</ul>"; inList = false }; continue }
    const f = t.replace(/^# #{1,3} /, "## ").replace(/^# (?!#)/, "## ")
    if (f.startsWith("### ")) {
      if (inList) { html += "</ul>"; inList = false }
      html += `<h3 style="font-size:1.1rem;font-weight:700;margin:1.2rem 0 0.4rem">${renderInline(f.slice(4))}</h3>`
    } else if (f.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false }
      html += `<h2 style="font-size:1.3rem;font-weight:700;margin:1.8rem 0 0.6rem;border-bottom:1px solid #fce7f3;padding-bottom:4px;color:#be185d">${renderInline(f.slice(3))}</h2>`
    } else if (f.startsWith("# ")) {
      if (inList) { html += "</ul>"; inList = false }
      html += `<h1 style="font-size:1.6rem;font-weight:800;margin:1.5rem 0 0.5rem">${renderInline(f.slice(2))}</h1>`
    } else if (f.startsWith("- ") || f.startsWith("* ")) {
      if (!inList) { html += `<ul style="list-style:disc;padding-left:1.5rem;margin:0.75rem 0">`; inList = true }
      html += `<li style="margin:0.25rem 0">${renderInline(f.slice(2))}</li>`
    } else if (f.startsWith("---")) {
      if (inList) { html += "</ul>"; inList = false }
      html += `<hr style="border:none;border-top:1px solid #fce7f3;margin:1rem 0" />`
    } else {
      if (inList) { html += "</ul>"; inList = false }
      html += `<p style="margin:0.6rem 0;line-height:1.75;color:#374151">${renderInline(f)}</p>`
    }
  }
  if (inList) html += "</ul>"
  return html
}

const calcWordCount = (text) => (text ? text.trim().split(/\s+/).length : 0)

const Spin = ({ cls = "w-3 h-3" }) => (
  <svg className={`animate-spin ${cls}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
  </svg>
)

const StarIcon = ({ filled }) => (
  <svg className="w-6 h-6" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
)

export default function BlogEditor({ blog, setPage }) {
  const [current, setCurrent]       = useState({ title: "", content: "", prompt: "", tone: "", length_preference: "", keywords: "", slug: "", favourite: "normal" })
  const [wordCount, setWordCount]   = useState(0)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [statusMsg, setStatusMsg]   = useState("")
  const [copiedSlug, setCopiedSlug] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [regenTitleLoading, setRegenTitleLoading]       = useState(false)
  const [articleAction, setArticleAction]               = useState("rephrase")
  const [articleActionLoading, setArticleActionLoading] = useState(false)

  // useEffect(() => {
   useEffect(() => {
  if (!blog?.id) {
    setLoading(false); // 🔥 important fix
    return;
  }
    ;(async () => {
      try {
        setLoading(true)
        const data = await getBlogById(blog.id)
        setCurrent(data)
        setWordCount(calcWordCount(data.content))
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    })()
  }, [blog?.id])

  const showMsg = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(""), 4000) }

  // ── Save ──────────────────────────────────────────────────────────────────
  const saveEdited = async () => {
    if (!blog?.id) return
    try {
      setSaving(true)
      const updated = await updateBlog(blog.id, {
        title: current.title, content: current.content,
        word_count: calcWordCount(current.content),
      })
      // slug may have regenerated if title changed
      if (updated?.slug) setCurrent(p => ({ ...p, slug: updated.slug }))
      showMsg("✓ Saved successfully")
    } catch (err) { console.error(err); showMsg("✗ Failed to save") }
    finally { setSaving(false) }
  }

  // ── Toggle Favourite ★ ────────────────────────────────────────────────────
  const handleToggleFavourite = async () => {
    if (!blog?.id) return
    const wasStarred = current.favourite === "favourite"
    // Optimistic flip using the string value
    setCurrent(p => ({ ...p, favourite: wasStarred ? "normal" : "favourite" }))
    try {
      setFavLoading(true)
      await toggleFavourite(blog.id)
      showMsg(wasStarred ? "☆ Removed from starred" : "★ Added to starred")
    } catch (err) {
      setCurrent(p => ({ ...p, favourite: wasStarred ? "favourite" : "normal" })) // revert
      console.error(err)
    } finally { setFavLoading(false) }
  }

  // ── Regen Title ───────────────────────────────────────────────────────────
  const handleRegenTitle = async () => {
    if (!blog?.id) return
    try {
      setRegenTitleLoading(true)
      const kws      = current.keywords ? current.keywords.split(",").map(k => k.trim()).filter(Boolean) : undefined
      const newTitle = await regenerateTitle({ prompt: current.prompt || current.title, article_content: current.content, keywords: kws })
      setCurrent(p => ({ ...p, title: newTitle }))
      const updated  = await updateBlog(blog.id, { title: newTitle })
      if (updated?.slug) setCurrent(p => ({ ...p, slug: updated.slug }))
      showMsg("✓ Title regenerated & saved")
    } catch (err) { console.error(err); showMsg("✗ Title regen failed") }
    finally { setRegenTitleLoading(false) }
  }

  // ── Article Action ────────────────────────────────────────────────────────
  const handleArticleAction = async () => {
    if (!blog?.id || !current.content) return
    try {
      setArticleActionLoading(true)
      const kws        = current.keywords ? current.keywords.split(",").map(k => k.trim()).filter(Boolean) : []
      const newContent = await rephraseBlog({
        article_content: current.content, mode: articleAction,
        prompt: current.prompt || current.title, keywords: kws,
        tone:   current.tone   || "Informative & Friendly",
        length: current.length_preference || "Medium (1000-1500 words)",
      })
      const newWc = calcWordCount(newContent)
      setCurrent(p => ({ ...p, content: newContent }))
      setWordCount(newWc)
      await updateBlog(blog.id, { content: newContent, word_count: newWc })
      showMsg("✓ Article updated & saved")
    } catch (err) { console.error(err); showMsg("✗ Operation failed") }
    finally { setArticleActionLoading(false) }
  }

  const copySlug = () => {
    if (!current.slug) return
    navigator.clipboard.writeText(`/blog/${current.slug}`)
    setCopiedSlug(true)
    setTimeout(() => setCopiedSlug(false), 2000)
  }

  if (!blog?.id) {
    return (
      <div className="flex flex-col bg-gray-50 items-center justify-center h-[30vh] text-center border-dotted border-2 border-slate-500">

        <h2 className="text-2xl font-semibold mb-3 ">
          No Blog Selected
        </h2>

        <p className="mb-6 text-sm">
          Select a blog from My Blogs or create a new one to start editing.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setPage("manage")}
            className="bg-pink-500 hover:bg-pink-600 text-white  px-4 py-2 rounded"
          >
            My Blogs
          </button>

          <button
            onClick={() => setPage("generate")}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded"
          >
            Generate Blog
          </button>
        </div>

      </div>
    );
  }

    if (loading && blog?.id) return (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Spin cls="w-5 h-5" /> Loading blog...
        </div>
      )

  const isStarred = current.favourite === "favourite"

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          <h2 className="text-2xl font-bold">Blog Editor</h2>

          {/* ★ Favourite star */}
          <button onClick={handleToggleFavourite} disabled={favLoading}
            title={isStarred ? "Remove from starred" : "Add to starred"}
            className={`transition-colors disabled:opacity-50 ${isStarred ? "text-pink-400 hover:text-pink-500" : "text-gray-300 hover:text-pink-400"}`}>
            <StarIcon filled={isStarred} />
          </button>

          {/* Slug pill */}
          {current.slug && (
            <button onClick={copySlug} title="Click to copy blog URL"
              className="flex items-center gap-1 text-xs font-mono bg-gray-50 hover:bg-pink-50 text-gray-400 hover:text-pink-500 border border-gray-200 hover:border-pink-200 px-2 py-1 rounded-full transition-colors max-w-[200px]">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="truncate">{copiedSlug ? "✓ Copied!" : `/${current.slug}`}</span>
            </button>
          )}

          {statusMsg && (
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
              statusMsg.startsWith("✓") || statusMsg.startsWith("★") || statusMsg.startsWith("☆")
                ? "bg-green-50 text-green-600"
                : statusMsg.startsWith("✗") ? "bg-red-50 text-red-500"
                : "bg-blue-50 text-blue-600"
            }`}>{statusMsg}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setPage("manage")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border transition-colors">
            ← Back
          </button>
          <button onClick={saveEdited} disabled={saving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg transition-colors flex items-center gap-2">
            {saving ? <><Spin />Saving...</> : "💾 Save"}
          </button>
        </div>
      </div>

      {/* ── AI action bar ── */}
      <div className="bg-white rounded-lg border px-5 py-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Title:</span>
          <button onClick={handleRegenTitle} disabled={regenTitleLoading}
            className="flex items-center gap-1.5 text-xs bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50">
            {regenTitleLoading ? <><Spin />Regenerating...</> : "↻ Regenerate Title"}
          </button>
        </div>
        <div className="h-4 w-px bg-gray-200 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Article:</span>
          <select value={articleAction} onChange={e => setArticleAction(e.target.value)}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400">
            <option value="rephrase">Rephrase</option>
            <option value="rearrange">Rearrange</option>
            <option value="regenerate">Regenerate</option>
          </select>
          <button onClick={handleArticleAction} disabled={articleActionLoading}
            className="flex items-center gap-1.5 text-xs bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white font-medium px-3 py-1.5 rounded-md transition-colors">
            {articleActionLoading ? <><Spin />Working...</> : "Apply"}
          </button>
          <span className="text-xs text-gray-400 hidden md:inline">
            {articleAction === "rephrase" && "Same content, different wording"}
            {articleAction === "rearrange" && "Same info, better structure"}
            {articleAction === "regenerate" && "Brand new article on this topic"}
          </span>
        </div>
        <div className="ml-auto text-xs text-gray-400">{wordCount} words</div>
      </div>

      {/* ── Editor + Preview ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border flex flex-col h-[650px]">
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
            <input type="text" value={current.title}
              onChange={e => setCurrent(p => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
          {current.prompt && <p className="text-xs text-gray-400 italic mb-2">Topic: {current.prompt}</p>}
          <label className="block text-xs font-medium text-gray-500 mb-1">Content (Markdown)</label>
          <textarea value={current.content}
            onChange={e => { setCurrent(p => ({ ...p, content: e.target.value })); setWordCount(calcWordCount(e.target.value)) }}
            className="w-full flex-1 px-3 py-2 border rounded-md font-mono text-sm overflow-y-auto focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none" />
        </div>
        <div className="bg-white p-6 rounded-lg border flex flex-col h-[650px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Preview</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{wordCount} words</span>
          </div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">{current.title}</h2>
          <div className="prose max-w-none flex-1 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(current.content) }} />
        </div>
      </div>
    </div>
  )
}
