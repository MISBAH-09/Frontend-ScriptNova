import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

// import Sidebar from "../components/dashboard/Sidebar"
import Sidebar from "../components/dashboard/sidebar"
import Header from "../components/dashboard/Header"

import BlogGenerator from "../components/dashboard/BlogGenerator"
import BlogManager from "../components/dashboard/BlogManager"
import BlogEditor from "../components/dashboard/BlogEditor"
import Humanize from "../components/dashboard/Humanize"
import Settings from "../components/dashboard/Settings"

export default function Dashboard() {
  const navigate = useNavigate()

  const [posts, setPosts]           = useState([])
  const [page, setPage]             = useState("generate")
  const [generated, setGenerated]   = useState(null)
  const [currentEdit, setCurrentEdit] = useState(null)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("sn_posts")
    if (saved) setPosts(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("sn_posts", JSON.stringify(posts))
  }, [posts])

  const renderPage = () => {
    switch (page) {

      case "manage":
        return (
          <BlogManager
            posts={posts}
            setPage={setPage}
            setCurrentEdit={setCurrentEdit}
          />
        )

      case "editor":
        return (
          <BlogEditor
            blog={currentEdit}
            setPosts={setPosts}
            setPage={setPage}
          />
        )

      case "humanize":
        return (
          <Humanize
            setPage={setPage}
            setCurrentEdit={setCurrentEdit}
          />
        )

      case "settings":
        return <Settings />

      default:
        return (
          <BlogGenerator
            generated={generated}
            setGenerated={setGenerated}
            setPosts={setPosts}
            setPage={setPage}
            setCurrentEdit={setCurrentEdit}
          />
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900 overflow-hidden">
      <Sidebar
        page={page}
        setPage={setPage}
        posts={posts}
        navigate={navigate}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
      />
      <div className="flex-1 flex flex-col">
        <Header page={page} setMobileMenu={setMobileMenu} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-200">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
