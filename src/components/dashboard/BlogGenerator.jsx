import { useState, useEffect } from "react"
import {
  generateBlog,
  generateKeywords,
  regenerateTitle,
  rephraseBlog,
  saveBlog,
  getUserBlogs,
  deleteBlog,
  updateBlog,
} from "../../services/blog"

// ── Shared markdown renderer ─────────────────────────────────────────────────
const renderInline = (text) =>
  text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")

export const renderMarkdown = (md) => {
  if (!md) return ""
  let html = ""
  const lines = md.split("\n")
  let inList = false
  for (let line of lines) {
    const t = line.trim()
    if (!t) {
      if (inList) { html += "</ul>"; inList = false }
      continue
    }
    const f = t.replace(/^# #{1,3} /, "## ").replace(/^# (?!#)/, "## ")
    if (f.startsWith("### ")) {
      if (inList) { html += "</ul>"; inList = false }
      html += `<h3 style="font-size:1.1rem;font-weight:700;margin:1.2rem 0 0.4rem">${renderInline(f.slice(4))}</h3>`
    } else if (f.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false }
      html += `<h2 style="font-size:1.3rem;font-weight:700;margin:1.8rem 0 0.6rem;border-bottom:1px solid #fce7f3;padding-bottom:4px;color:#be185d">${renderInline(f.slice(3))}</h2>`
    } else if (f.startsWith("# ")) {
      if (inList) { html += "</ul>"; inList = false }
      html += `<h1 style="font-size:1.5rem;font-weight:800;margin:1.5rem 0 0.5rem">${renderInline(f.slice(2))}</h1>`
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
const formatDate = (d) => {
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
  catch { return "" }
}

// ── Spinner ──────────────────────────────────────────────────────────────────
const Spin = ({ cls = "w-3 h-3" }) => (
  <svg className={`animate-spin ${cls}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
  </svg>
)

// ── Component ────────────────────────────────────────────────────────────────
export default function BlogGenerator({ generated, setGenerated, setPosts, setPage, setCurrentEdit }) {
  const [prompt, setPrompt]               = useState("")
  const [tone, setTone]                   = useState("Informative & Friendly")
  const [length, setLength]               = useState("Medium (1000-1500 words)")
  const [keywords, setKeywords]           = useState([])
  const [keywordInput, setKeywordInput]   = useState("")
  const [loadingKeywords, setLoadingKeywords] = useState(false)

  const [loading, setLoading]             = useState(false)
  const [saving, setSaving]               = useState(false)
  const [savedMsg, setSavedMsg]           = useState("")
  const [wordCount, setWordCount]         = useState(0)
  const [savedBlogId, setSavedBlogId]     = useState(null)

  const [editableTitle, setEditableTitle]         = useState("")
  const [regenTitleLoading, setRegenTitleLoading] = useState(false)

  const [articleAction, setArticleAction]               = useState("rephrase")
  const [articleActionLoading, setArticleActionLoading] = useState(false)

  const [recentBlogs, setRecentBlogs]   = useState([])
  const [loadingBlogs, setLoadingBlogs] = useState(false)

  useEffect(() => { if (generated?.title) setEditableTitle(generated.title) }, [generated?.title])
  useEffect(() => { fetchRecentBlogs() }, [])

  const fetchRecentBlogs = async () => {
    try {
      setLoadingBlogs(true)
      setRecentBlogs(await getUserBlogs({ limit: 5 }))
    } catch (err) { console.error(err) }
    finally { setLoadingBlogs(false) }
  }

  // ── Keywords ───────────────────────────────────────────────────────────────
  const addKeyword = () => {
    if (!keywordInput.trim()) return
    setKeywords(p => [...p, keywordInput.trim()])
    setKeywordInput("")
  }
  const removeKeyword = (i) => setKeywords(p => p.filter((_, idx) => idx !== i))

  const handleGenerateKeywords = async () => {
    if (!prompt.trim()) return alert("Enter a topic first")
    try {
      setLoadingKeywords(true)
      setKeywords(await generateKeywords(prompt))
    } catch (err) { alert(err.message || "Failed to generate keywords") }
    finally { setLoadingKeywords(false) }
  }

  // ── Generate Blog ──────────────────────────────────────────────────────────
  const handleGenerateBlog = async () => {
    if (!prompt.trim()) return alert("Enter a topic")
    setLoading(true); setSavedMsg(""); setSavedBlogId(null)
    try {
      const res = await generateBlog({ prompt, keywords, tone, length })
      const blog = {
        prompt:   res.prompt || prompt,
        title:    res.suggested_title || prompt,
        content:  res.content,
        keywords, tone, length,
        date: new Date().toISOString(),
      }
      setGenerated(blog)
      setEditableTitle(blog.title)
      setWordCount(calcWordCount(res.content))
      try {
        setSaving(true)
        const saved = await saveBlog({
          prompt: blog.prompt, title: blog.title, content: blog.content,
          keywords: keywords.join(", "), tone, length_preference: length,
          status: "draft", word_count: calcWordCount(res.content),
        })
        setSavedBlogId(saved?.id || null)
        setSavedMsg("✓ Auto-saved to your library")
        fetchRecentBlogs()
        if (setPosts) setPosts(p => [blog, ...p])
      } catch (e) { console.error(e); setSavedMsg("⚠ Generated but couldn't auto-save") }
      finally { setSaving(false) }
    } catch (err) { console.error(err); alert(err.message || "Failed to generate blog") }
    finally { setLoading(false) }
  }

  // ── Regenerate Title — auto-patches DB ────────────────────────────────────
  const handleRegenerateTitle = async () => {
    if (!generated?.content) return
    try {
      setRegenTitleLoading(true)
      const newTitle = await regenerateTitle({
        prompt:          generated.prompt || prompt,
        article_content: generated.content,
        keywords:        keywords.length ? keywords : undefined,
      })
      setEditableTitle(newTitle)
      setGenerated(prev => ({ ...prev, title: newTitle }))

      // ✅ Persist to DB
      if (savedBlogId) {
        await updateBlog(savedBlogId, { title: newTitle })
        setSavedMsg("✓ Title updated & saved")
        fetchRecentBlogs()
      } else {
        setSavedMsg("✎ Title updated — save via Edit to persist")
      }
    } catch (err) { alert(err.message || "Failed to regenerate title") }
    finally { setRegenTitleLoading(false) }
  }

  // ── Rephrase / Rearrange / Regenerate — auto-patches DB ───────────────────
  const handleArticleAction = async () => {
    if (!generated?.content) return
    try {
      setArticleActionLoading(true)
      const newContent = await rephraseBlog({
        article_content: generated.content,
        mode:            articleAction,
        prompt:          generated.prompt || prompt,
        keywords, tone, length,
      })
      setGenerated(prev => ({ ...prev, content: newContent }))
      setWordCount(calcWordCount(newContent))

      // ✅ Persist to DB
      if (savedBlogId) {
        await updateBlog(savedBlogId, {
          content:    newContent,
          word_count: calcWordCount(newContent),
        })
        setSavedMsg("✓ Article updated & saved")
        fetchRecentBlogs()
      } else {
        setSavedMsg("✎ Article updated — save via Edit to persist")
      }
    } catch (err) { alert(err.message || "Operation failed") }
    finally { setArticleActionLoading(false) }
  }

  // ── Manual title blur — auto-patches DB when user edits title inline ───────
  const handleTitleBlur = async () => {
    if (!savedBlogId || !editableTitle.trim()) return
    if (editableTitle === generated?.title) return
    try {
      await updateBlog(savedBlogId, { title: editableTitle })
      setGenerated(prev => ({ ...prev, title: editableTitle }))
      setSavedMsg("✓ Title saved")
      fetchRecentBlogs()
    } catch (err) { console.error("Title patch failed:", err) }
  }

  const openEditor = (blogOrId) => {
    const id = typeof blogOrId === "object" ? blogOrId?.id : blogOrId
    if (!id) return
    setCurrentEdit({ id }); setPage("editor")
  }

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Delete this blog?")) return
    try { await deleteBlog(blogId); setRecentBlogs(p => p.filter(b => b.id !== blogId)) }
    catch { alert("Failed to delete blog") }
  }

  const downloadFile = (format, text) => {
    const name = (editableTitle || "blog").replace(/\s+/g, "_")
    const blob = new Blob([text], { type: format === "md" ? "text/markdown" : "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `${name}.${format}`; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT: Form + Preview ── */}
        <div className="xl:col-span-2 space-y-6 h-fit">

          {/* Form card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Generate Blog</h2>
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blog Topic</label>
                <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
                  placeholder="Enter your blog topic — AI will suggest a title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400" />
                <p className="text-xs text-gray-400 mt-1">Your topic is saved with the blog. The model will suggest the best title.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={keywordInput} onChange={e => setKeywordInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addKeyword()}
                    placeholder="Add SEO keywords or click Generate by AI"
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400" />
                  <button onClick={addKeyword}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 rounded-md border border-gray-300 transition-colors">Add</button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {keywords.map((k, i) => (
                      <span key={i} className="bg-pink-50 text-pink-700 border border-pink-200 px-3 py-1 rounded-full text-sm flex items-center gap-1.5">
                        {k}
                        <button onClick={() => removeKeyword(i)} className="text-pink-400 hover:text-pink-700 font-bold leading-none">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex justify-end">
                  <button onClick={handleGenerateKeywords} disabled={loadingKeywords}
                    className="flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-md transition-colors">
                    {loadingKeywords ? <><Spin />Generating...</> : "Generate Keywords"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={tone} onChange={e => setTone(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400">
                  <option>Informative & Friendly</option><option>Professional</option>
                  <option>Casual</option><option>Humorous</option>
                </select>
                <select value={length} onChange={e => setLength(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400">
                  <option>Short (500-800 words)</option>
                  <option>Medium (1000-1500 words)</option>
                  <option>Long (2000+ words)</option>
                </select>
              </div>

              <button onClick={handleGenerateBlog} disabled={loading || !prompt.trim()}
                className="w-full text-lg bg-pink-500 hover:bg-pink-600 text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-50">
                {loading ? <span className="flex items-center justify-center gap-2"><Spin cls="w-4 h-4" />Generating...</span> : "Generate Blog"}
              </button>
            </div>
          </div>

          {/* Preview card */}
          {generated && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">

              {/* Editable title + regen button */}
              <div className="flex items-center gap-3 mb-2">
                <input type="text" value={editableTitle}
                  onChange={e => { setEditableTitle(e.target.value); setGenerated(p => ({ ...p, title: e.target.value })) }}
                  onBlur={handleTitleBlur}
                  className="flex-1 text-xl font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-pink-400 focus:outline-none bg-transparent py-1" />
                <button onClick={handleRegenerateTitle} disabled={regenTitleLoading}
                  title="Ask AI to suggest a new title"
                  className="flex-shrink-0 flex items-center gap-1 text-xs bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50">
                  {regenTitleLoading ? <Spin /> : "↻"}
                  {regenTitleLoading ? "..." : "Regen Title"}
                </button>
              </div>

              {generated.prompt && (
                <p className="text-xs text-gray-400 mb-3">Topic: <span className="italic">{generated.prompt}</span></p>
              )}

              <div className="flex items-center gap-3 mb-5">
                <p className="text-sm text-gray-400">Word count: {wordCount}</p>
                {saving && <span className="text-xs text-gray-400 flex items-center gap-1"><Spin />Saving...</span>}
                {savedMsg && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    savedMsg.startsWith("✓") ? "bg-green-50 text-green-600"
                    : savedMsg.startsWith("✎") ? "bg-blue-50 text-blue-600"
                    : "bg-pink-50 text-pink-600"}`}>
                    {savedMsg}
                  </span>
                )}
              </div>

              <div className="prose max-w-none max-h-[600px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(generated.content) }} />

              {/* Article options */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Article options</p>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={articleAction} onChange={e => setArticleAction(e.target.value)}
                    className="text-sm px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400">
                    <option value="rephrase">Rephrase</option>
                    <option value="rearrange">Rearrange</option>
                    <option value="regenerate">Regenerate</option>
                  </select>
                  <button onClick={handleArticleAction} disabled={articleActionLoading}
                    className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors">
                    {articleActionLoading ? <><Spin cls="w-3.5 h-3.5" />Working...</> : "Apply"}
                  </button>
                  <span className="text-xs text-gray-400 ml-1">
                    {articleAction === "rephrase" && "Same content, different wording"}
                    {articleAction === "rearrange" && "Same info, better structure"}
                    {articleAction === "regenerate" && "Brand new article on this topic"}
                  </span>
                </div>
              </div>

              {/* Bottom actions */}
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => openEditor(savedBlogId)}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-md font-medium transition-colors">Edit</button>
                <button onClick={() => downloadFile("md", generated.content)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-md font-medium transition-colors border">↓ Markdown</button>
                <button onClick={() => downloadFile("txt", generated.content)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-md font-medium transition-colors border">↓ Text</button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Recent blogs sidebar ── */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border h-fit sticky top-5">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Recent Blogs</h3>
                <p className="text-xs text-gray-400 mt-0.5">Last 5 auto-saved</p>
              </div>
              <button onClick={() => setPage("manage")} className="text-xs text-pink-500 hover:text-pink-700 font-medium">View all →</button>
            </div>

            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {loadingBlogs ? (
                <div className="p-6 text-center text-gray-400 text-sm"><Spin cls="w-5 h-5 mx-auto mb-2" />Loading...</div>
              ) : recentBlogs.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  <div className="text-3xl mb-2">✦</div>
                  <p>No blogs yet.</p><p className="text-xs mt-1">Generated blogs auto-save here.</p>
                </div>
              ) : recentBlogs.map((blog) => (
                <div key={blog.id} className="p-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-start justify-between gap-2">
                    <div onClick={() => openEditor(blog.id)} className="flex-1 min-w-0 cursor-pointer">
                      <p className="font-medium text-gray-800 text-sm truncate">{blog.title}</p>
                      {blog.prompt && <p className="text-xs text-gray-400 truncate italic">"{blog.prompt}"</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{formatDate(blog.created_at)}</span>
                        {blog.is_favourite && (
                          <span className="text-pink-400 text-xs" title="Starred">★</span>
                        )}
                      </div>
                      {blog.word_count > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">{blog.word_count} words{blog.slug ? ` · /${blog.slug.slice(0, 20)}…` : ""}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditor(blog.id)} title="Edit"
                        className="p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDeleteBlog(blog.id)} title="Delete"
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recentBlogs.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <button onClick={() => setPage("manage")}
                  className="w-full text-sm text-center text-pink-500 hover:text-pink-700 font-medium py-1">
                  Manage all blogs →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
