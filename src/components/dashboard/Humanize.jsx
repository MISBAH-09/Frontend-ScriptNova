import { useState, useEffect } from "react"
import { humanizeBlog, detectAI, getUserBlogs } from "../../services/blog"
import { Wand2, Copy, Check } from "lucide-react"

const Spin = ({ cls = "w-4 h-4" }) => (
  <svg className={`animate-spin ${cls}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
)

const STYLES = [
  { key: "natural", label: "Natural", desc: "Reads like a knowledgeable person wrote it — balanced, clear, human" },
  { key: "conversational", label: "Conversational", desc: "Warm and casual — like explaining to a smart friend over coffee" },
  { key: "storytelling", label: "Storytelling", desc: "Narrative-driven — opens with a scene, weaves in information" },
  { key: "professional", label: "Professional", desc: "Senior expert voice — authoritative, confident, zero filler" },
]

// ── AI score badge ────────────────────────────────────────────────────────
const ScoreBadge = ({ percent, label, small = false }) => {
  if (!percent) return null
  const pct = parseFloat(percent)
  const color = pct < 30
    ? "bg-green-50 text-green-700 border-green-200"
    : pct < 60
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : "bg-red-50 text-red-700 border-red-200"
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full font-medium
      ${small ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"} ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${pct < 30 ? "bg-green-500" : pct < 60 ? "bg-yellow-500" : "bg-red-500"
        }`} />
      {percent} AI {label ? `· ${label}` : ""}
    </span>
  )
}

const renderInline = (t) =>
  t.replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")

const renderMarkdown = (md) => {
  if (!md) return ""
  const normalized = md
    .replace(/([^\n])(## )/g, "$1\n\n$2")
    .replace(/(## [^\n]+)([^\n])/g, "$1\n$2")
  let html = "", inList = false
  for (let line of normalized.split("\n")) {
    const t = line.trim()
    if (!t) { if (inList) { html += "</ul>"; inList = false }; continue }
    if (t.startsWith("### ")) {
      if (inList) { html += "</ul>"; inList = false }
      html += `<h3 style="font-size:1.05rem;font-weight:700;margin:1.2rem 0 0.4rem;color:#374151">${renderInline(t.slice(4))}</h3>`
    } else if (t.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false }
      html += `<h2 style="font-size:1.25rem;font-weight:700;margin:2rem 0 0.6rem;padding-bottom:4px;border-bottom:2px solid #fce7f3;color:#be185d">${renderInline(t.slice(3))}</h2>`
    } else if (t.startsWith("# ")) {
      if (inList) { html += "</ul>"; inList = false }
      html += `<h1 style="font-size:1.5rem;font-weight:800;margin:1.5rem 0 0.5rem;color:#111827">${renderInline(t.slice(2))}</h1>`
    } else if (t.startsWith("- ") || t.startsWith("* ")) {
      if (!inList) { html += `<ul style="list-style:disc;padding-left:1.5rem;margin:0.75rem 0">`; inList = true }
      html += `<li style="margin:0.3rem 0;line-height:1.75;color:#374151">${renderInline(t.slice(2))}</li>`
    } else if (t.startsWith("---")) {
      if (inList) { html += "</ul>"; inList = false }
      html += `<hr style="border:none;border-top:1px solid #fce7f3;margin:1.25rem 0"/>`
    } else {
      if (inList) { html += "</ul>"; inList = false }
      html += `<p style="margin:0.6rem 0;line-height:1.8;color:#374151">${renderInline(t)}</p>`
    }
  }
  if (inList) html += "</ul>"
  return html
}

export default function Humanize({ setPage, setCurrentEdit }) {
  const [mode, setMode] = useState("custom")
  const [customText, setCustomText] = useState("")
  const [blogs, setBlogs] = useState([])
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [loadingBlogs, setLoadingBlogs] = useState(false)

  const [style, setStyle] = useState("natural")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [statusMsg, setStatusMsg] = useState("")
  const [viewMode, setViewMode] = useState("preview")

  const [inputScore, setInputScore] = useState(null)
  const [outputScore, setOutputScore] = useState(null)
  const [detecting, setDetecting] = useState(false)

  useEffect(() => { if (mode === "blog") fetchBlogs() }, [mode])

  // Auto-detect score when input changes
  useEffect(() => {
    const text = mode === "custom" ? customText : (selectedBlog?.content || "")
    if (!text || text.length < 100) { setInputScore(null); return }
    const timer = setTimeout(() => runDetect(text), 800)
    return () => clearTimeout(timer)
  }, [customText, selectedBlog, mode])

  const fetchBlogs = async () => {
    try {
      setLoadingBlogs(true)
      setBlogs(await getUserBlogs())
    } catch (e) { console.error(e) }
    finally { setLoadingBlogs(false) }
  }

  const runDetect = async (text) => {
    try {
      setDetecting(true)
      const r = await detectAI(text)
      console.log('AI Detect:', r)
      setInputScore(r)
    } catch (e) { /* silent */ }
    finally { setDetecting(false) }
  }

  const getSourceContent = () => {
    if (mode === "custom") return customText.trim()
    if (mode === "blog" && selectedBlog) return selectedBlog.content || ""
    return ""
  }

  const wordCount = (t) => t ? t.trim().split(/\s+/).filter(Boolean).length : 0

  const handleHumanize = async () => {
    const content = getSourceContent()
    if (!content) return alert(mode === "custom" ? "Paste some content first" : "Select a blog first")
    try {
      setLoading(true)
      setResult("")
      setSaved(false)
      setStatusMsg("")
      setOutputScore(null)

      const data = await humanizeBlog({
        content,
        style,
        blog_id: mode === "blog" && selectedBlog ? selectedBlog.id : null,
      })

      setResult(data.humanized_content || data.humanized || data.data || "")
      const out = data.ai_score || (data.data && data.data.ai_score) || null
      if (out) setOutputScore({ percent: out.percent, label: out.label })

      const wasSaved = !!data.saved || !!data.data?.saved || false
      if (mode === "blog" && selectedBlog && wasSaved) {
        setSaved(true)
        setStatusMsg("✓ Humanized & saved to your blog")
      }
    } catch (e) {
      alert(e.message || "Humanize failed")
    } finally {
      setLoading(false)
    }
  }

 const handleCopy = () => {
    try { navigator.clipboard.writeText(result) } catch (e) { }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }  // ← add this


  const openEditor = () => {
    if (!result) return
    setCurrentEdit({ content: result, title: selectedBlog?.title || "Humanized content" })
    setPage("editor")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Humanize Layer</h3>
        <div className="flex items-center gap-2">
          <ScoreBadge percent={inputScore?.percent || inputScore} label={inputScore?.label} small />
          <ScoreBadge percent={outputScore?.percent} label={outputScore?.label} small />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="mode" checked={mode==="custom"} onChange={()=>setMode("custom")}/> Custom
            </label>
            <label className="inline-flex items-center gap-2 ml-3">
              <input type="radio" name="mode" checked={mode==="blog"} onChange={()=>setMode("blog")}/> Your blogs
            </label>
            <div className="ml-auto text-sm text-slate-500">Words: {wordCount(getSourceContent())}</div>
          </div>

          {mode === "custom" ? (
            <textarea value={customText} onChange={(e)=>setCustomText(e.target.value)} rows={10} className="w-full p-3 border rounded" placeholder="Paste or type text to humanize..." />
          ) : (
            <div>
              {loadingBlogs ? <Spin/> : (
                <select className="w-full border rounded p-2" onChange={(e)=>{
                  const b = blogs.find(x=>x.id==e.target.value)
                  setSelectedBlog(b)
                }}>
                  <option value="">Select a blog to humanize</option>
                  {blogs.map(b=> <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              )}
              {selectedBlog && <div className="mt-2 p-2 border rounded bg-white text-sm text-slate-700">{selectedBlog.excerpt || selectedBlog.content.slice(0,300)}</div>}
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="text-sm">Style:</label>
            <select value={style} onChange={(e)=>setStyle(e.target.value)} className="border rounded p-1">
              {STYLES.map(s=> <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <button onClick={handleHumanize} className="ml-3 btn" disabled={loading}>{loading? <Spin/> : <><Wand2/> Humanize</>}</button>
            <div className="ml-auto text-sm text-slate-500">{statusMsg}</div>
          </div>

        </div>

        <div className="space-y-3">
          <div className="border rounded p-3 bg-white">
            <div className="flex items-center justify-between">
              <strong>Output</strong>
              <div className="text-sm text-slate-500">{saved ? "Saved" : "Unsaved"}</div>
            </div>
            <div className="mt-3">
              <label className="block text-xs text-slate-500">Output</label>
              <div className="border rounded p-3 bg-white">
                {viewMode === "preview" ? (
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(result) }} />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-slate-700">{result}</pre>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={handleCopy} className="btn">{copied ? <Check/> : <Copy/>} Copy</button>
                <button onClick={openEditor} className="btn flex items-center gap-2"><Wand2/> Open in Editor</button>
                <div className="ml-auto">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="view" checked={viewMode==="preview"} onChange={()=>setViewMode("preview")}/> Preview
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm ml-3">
                    <input type="radio" name="view" checked={viewMode==="raw"} onChange={()=>setViewMode("raw")}/> Raw
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
