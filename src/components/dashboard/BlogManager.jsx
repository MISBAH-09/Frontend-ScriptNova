// import { getUserBlogs, deleteBlog, toggleFavourite } from "../../services/blog"
// import { useState, useEffect } from "react"

// const formatDate = (d) => {
//   try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
//   catch { return "" }
// }

// const StarIcon = ({ filled }) => (
//   <svg className="w-5 h-5" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
//     <path strokeLinecap="round" strokeLinejoin="round"
//       d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
//   </svg>
// )

// export default function BlogManager({ setPage, setCurrentEdit }) {
//   const [blogs, setBlogs]           = useState([])
//   const [loading, setLoading]       = useState(false)
//   const [filter, setFilter]         = useState("all")   // "all" | "favourite"
//   const [copiedSlug, setCopiedSlug] = useState(null)

//   const openEditor = (blog) => {
//     setCurrentEdit({ id: blog.id, slug: blog.slug })
//     setPage("editor")
//   }

//   const fetchBlogs = async () => {
//     try {
//       setLoading(true)
//       setBlogs(await getUserBlogs())
//     } catch (err) { console.error(err) }
//     finally { setLoading(false) }
//   }

//   useEffect(() => { fetchBlogs() }, [])

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this blog?")) return
//     try { await deleteBlog(id); setBlogs(p => p.filter(b => b.id !== id)) }
//     catch (err) { console.error(err) }
//   }

//   // ★ Toggle — optimistic update using the "favourite" string field
//   const handleToggleFavourite = async (blog) => {
//     const wasStarred = blog.is_favourite  // boolean helper from API
//     // Optimistic: flip both the string and the bool helper
//     setBlogs(p => p.map(b => b.id === blog.id
//       ? { ...b, favourite: wasStarred ? "normal" : "favourite", is_favourite: !wasStarred }
//       : b
//     ))
//     try {
//       await toggleFavourite(blog.id)
//     } catch (err) {
//       // Revert on failure
//       setBlogs(p => p.map(b => b.id === blog.id
//         ? { ...b, favourite: blog.favourite, is_favourite: wasStarred }
//         : b
//       ))
//       console.error(err)
//     }
//   }

//   const copySlug = (slug) => {
//     navigator.clipboard.writeText(`/blog/${slug}`)
//     setCopiedSlug(slug)
//     setTimeout(() => setCopiedSlug(null), 2000)
//   }

//   // Filter: "favourite" means favourite === "favourite"
//   const filtered     = filter === "favourite" ? blogs.filter(b => b.favourite === "favourite") : blogs

//   return (
//     <div>
//       {/* ── Header ── */}
//       <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
//         <div className="flex items-center gap-3">
//           <p className="text-gray-600 text-sm">
//             {blogs.length} blog{blogs.length !== 1 ? "s" : ""}
//           </p>
//           <div className="flex items-center gap-1 ml-2">
//             {[{ key: "all", label: "All" }, { key: "favourite", label: "★ Starred" }].map(({ key, label }) => (
//               <button key={key} onClick={() => setFilter(key)}
//                 className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
//                   filter === key
//                     ? "bg-pink-500 text-white border-pink-500"
//                     : "bg-white text-gray-600 border-gray-300 hover:border-pink-400"
//                 }`}>
//                 {label}
//               </button>
//             ))}
//           </div>
//         </div>
//         <button onClick={() => setPage("generate")}
//           className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors">
//           ✦ New Blog
//         </button>
//       </div>

//       {loading ? (
//         <div className="text-center py-16 text-gray-400">
//           <svg className="animate-spin w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
//           </svg>
//           Loading blogs...
//         </div>
//       ) : filtered.length === 0 ? (
//         <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
//           <p className="text-gray-400 text-lg mb-2">
//             {filter === "favourite" ? "⭐ No starred blogs yet" : "📭 No blogs saved yet"}
//           </p>
//           <p className="text-gray-500 text-sm">
//             {filter === "favourite" ? "Star a blog to find it quickly later" : "Generate your first blog to get started"}
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filtered.map((b) => (
//             <div key={b.id}
//               className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col ${
//                 b.favourite === "favourite" ? "border-pink-400" : ""
//               }`}>

//               {/* Title + star */}
//               <div className="flex items-start justify-between gap-2 mb-1">
//                 <h3 onClick={() => openEditor(b)}
//                   className="font-semibold text-base leading-snug cursor-pointer hover:text-pink-600 flex-1">
//                   {b.title || "Untitled"}
//                 </h3>
//                 <button
//                   onClick={e => { e.stopPropagation(); handleToggleFavourite(b) }}
//                   title={b.favourite === "favourite" ? "Remove star" : "Star this blog"}
//                   className={`flex-shrink-0 transition-colors ${
//                     b.favourite === "favourite"
//                       ? "text-pink-400 hover:text-pink-500"
//                       : "text-gray-300 hover:text-pink-400"
//                   }`}>
//                   <StarIcon filled={b.favourite === "favourite"} />
//                 </button>
//               </div>

//               {b.prompt && (
//                 <p className="text-xs text-gray-400 italic mb-2 truncate">Topic: {b.prompt}</p>
//               )}

//               {/* Slug — click to copy */}
//               {b.slug && (
//                 <button onClick={() => copySlug(b.slug)} title="Click to copy slug URL"
//                   className="flex items-center gap-1 text-xs text-gray-300 hover:text-pink-400 font-mono mb-2 truncate text-left transition-colors group">
//                   <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                     <path strokeLinecap="round" strokeLinejoin="round"
//                       d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
//                   </svg>
//                   <span className="truncate">
//                     {copiedSlug === b.slug ? "✓ Copied!" : `/${b.slug}`}
//                   </span>
//                 </button>
//               )}

//               {/* Footer */}
//               <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
//                 <div>
//                   <span>{formatDate(b.created_at)}</span>
//                   {b.word_count > 0 && <span className="ml-2 text-gray-400">{b.word_count} words</span>}
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <button onClick={() => openEditor(b)} title="Edit"
//                     className="p-1 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded transition-colors">
//                     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                     </svg>
//                   </button>
//                   <button onClick={() => handleDelete(b.id)} title="Delete"
//                     className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
//                     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }
import { getUserBlogs, deleteBlog, toggleFavourite } from "../../services/blog"
import { useState, useEffect } from "react"

const formatDate = (d) => {
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
  catch { return "" }
}

const StarIcon = ({ filled }) => (
  <svg className="w-5 h-5" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
)

export default function BlogManager({ setPage, setCurrentEdit }) {
  const [blogs, setBlogs]           = useState([])
  const [loading, setLoading]       = useState(false)
  const [filter, setFilter]         = useState("all")   // "all" | "favourite"
  const [copiedSlug, setCopiedSlug] = useState(null)

  const openEditor = (blog) => {
    setCurrentEdit({ id: blog.id, slug: blog.slug })
    setPage("editor")
  }

  const openHumanize = (blog) => {
    setCurrentEdit({ id: blog.id, slug: blog.slug })
    setPage("humanize")
  }

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      setBlogs(await getUserBlogs())
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBlogs() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return
    try { await deleteBlog(id); setBlogs(p => p.filter(b => b.id !== id)) }
    catch (err) { console.error(err) }
  }

  // ★ Toggle — optimistic update using the "favourite" string field
  const handleToggleFavourite = async (blog) => {
    const wasStarred = blog.is_favourite  // boolean helper from API
    // Optimistic: flip both the string and the bool helper
    setBlogs(p => p.map(b => b.id === blog.id
      ? { ...b, favourite: wasStarred ? "normal" : "favourite", is_favourite: !wasStarred }
      : b
    ))
    try {
      await toggleFavourite(blog.id)
    } catch (err) {
      // Revert on failure
      setBlogs(p => p.map(b => b.id === blog.id
        ? { ...b, favourite: blog.favourite, is_favourite: wasStarred }
        : b
      ))
      console.error(err)
    }
  }

  const copySlug = (slug) => {
    navigator.clipboard.writeText(`/blog/${slug}`)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  // Filter: "favourite" means favourite === "favourite"
  const filtered     = filter === "favourite" ? blogs.filter(b => b.favourite === "favourite") : blogs

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div className="flex items-center gap-3">
          <p className="text-gray-600 text-sm">
            {blogs.length} blog{blogs.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1 ml-2">
            {[{ key: "all", label: "All" }, { key: "favourite", label: "★ Starred" }].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                  filter === key
                    ? "bg-pink-500 text-white border-pink-500"
                    : "bg-white text-gray-600 border-gray-300 hover:border-pink-400"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setPage("generate")}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors">
          ✦ New Blog
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="animate-spin w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Loading blogs...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-400 text-lg mb-2">
            {filter === "favourite" ? "⭐ No starred blogs yet" : "📭 No blogs saved yet"}
          </p>
          <p className="text-gray-500 text-sm">
            {filter === "favourite" ? "Star a blog to find it quickly later" : "Generate your first blog to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div key={b.id}
              className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col ${
                b.favourite === "favourite" ? "border-pink-400" : ""
              }`}>

              {/* Title + star */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 onClick={() => openEditor(b)}
                  className="font-semibold text-base leading-snug cursor-pointer hover:text-pink-600 flex-1">
                  {b.title || "Untitled"}
                </h3>
                <button
                  onClick={e => { e.stopPropagation(); handleToggleFavourite(b) }}
                  title={b.favourite === "favourite" ? "Remove star" : "Star this blog"}
                  className={`flex-shrink-0 transition-colors ${
                    b.favourite === "favourite"
                      ? "text-pink-400 hover:text-pink-500"
                      : "text-gray-300 hover:text-pink-400"
                  }`}>
                  <StarIcon filled={b.favourite === "favourite"} />
                </button>
              </div>

              {b.prompt && (
                <p className="text-xs text-gray-400 italic mb-2 truncate">Topic: {b.prompt}</p>
              )}

              {/* Slug — click to copy */}
              {b.slug && (
                <button onClick={() => copySlug(b.slug)} title="Click to copy slug URL"
                  className="flex items-center gap-1 text-xs text-gray-300 hover:text-pink-400 font-mono mb-2 truncate text-left transition-colors group">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="truncate">
                    {copiedSlug === b.slug ? "✓ Copied!" : `/${b.slug}`}
                  </span>
                </button>
              )}

              {/* Footer */}
              <div className="mt-auto pt-3 border-t border-gray-100 space-y-2">
                {/* Date + words */}
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{formatDate(b.created_at)}</span>
                  <div className="flex items-center gap-2">
                    {b.word_count > 0 && <span>{b.word_count} words</span>}
                    {b.is_humanized && (
                      <span className="text-purple-500 font-medium">✦ Humanized</span>
                    )}
                  </div>
                </div>
                {/* Action buttons row */}
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEditor(b)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 px-2 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editor
                  </button>
                  <button onClick={() => openHumanize(b)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Humanize
                  </button>
                  <button onClick={() => handleDelete(b.id)} title="Delete"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
