import React, { useEffect, useState } from "react"
import { useNavigate, useSearchParams, useLocation } from "react-router-dom"

// import Sidebar from "../components/dashboard/Sidebar"
import Sidebar from "../components/dashboard/Sidebar"
import Header from "../components/dashboard/Header"

import BlogGenerator from "../components/dashboard/BlogGenerator"
import BlogManager from "../components/dashboard/BlogManager"
import BlogEditor from "../components/dashboard/BlogEditor"
import Humanize from "../components/dashboard/Humanize"
import Settings from "../components/dashboard/Settings"
import PricingSection from "../components/PricingSection"
import ReaderBlogs from "../components/dashboard/ReaderBlogs"

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const sectionParam = searchParams.get("section") || location.hash.replace("#", "")

  const [posts, setPosts]           = useState([])
  const [page, setPage]             = useState(sectionParam || "generate")
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

  useEffect(() => {
    if (sectionParam && sectionParam !== page) {
      setPage(sectionParam)
    }
  }, [sectionParam])

  useEffect(() => {
    const currentSection = searchParams.get("section")
    const currentHash = location.hash.replace("#", "")

    if (page !== currentSection || page !== currentHash) {
      const params = new URLSearchParams(searchParams)
      params.set("section", page)
      setSearchParams(params, { replace: true })
      window.history.replaceState(null, "", `/dashboard?${params.toString()}#${page}`)
    }
  }, [page, location.hash])

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

      case "reader":
        return <ReaderBlogs />

      case "humanize":
        return (
          <Humanize
            setPage={setPage}
            setCurrentEdit={setCurrentEdit}
            currentEdit={currentEdit}
          />
        )

      case "settings":
        return <Settings />

      case "subscription":
        return <PricingSection />

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
