import NavButton from "./NavButton";
import { Zap, BookOpen, PenSquare, Settings, Sparkles, Wand2 } from "lucide-react";

export default function Sidebar({ page, setPage, navigate, mobileMenu, setMobileMenu }) {

  const handleNav = (target) => {
    setPage(target);
    setMobileMenu(false);
  };

  const navItems = [
    { key: "generate",  label: "Generate Blog",  icon: <Zap size={18} /> },
    { key: "manage",    label: "My Blogs",        icon: <BookOpen size={18} /> },
    { key: "editor",    label: "Editor",          icon: <PenSquare size={18} /> },
    { key: "humanize",  label: "Humanize",        icon: <Wand2 size={18} />, badge: "AI" },
    { key: "settings",  label: "Settings",        icon: <Settings size={18} /> },
  ];

  return (
    <div className={`fixed md:static top-0 left-0 z-40
      h-screen w-64 bg-slate-900 text-white
      transform transition-transform duration-300
      ${mobileMenu ? "translate-x-0" : "-translate-x-full"}
      md:translate-x-0
      flex flex-col p-6`}>

      {/* Logo */}
      <h2 className="flex items-center gap-2 text-2xl font-bold mb-8 text-pink-400">
        <Sparkles className="w-6 h-6" />
        ScriptNova
      </h2>

      {/* Nav */}
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavButton
            key={item.key}
            active={page === item.key}
            onClick={() => handleNav(item.key)}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-slate-700">
        <button
          className="w-full bg-red-600 hover:bg-red-700 transition py-2 rounded"
          onClick={() => { localStorage.clear(); navigate("/"); }}>
          Logout
        </button>
      </div>
    </div>
  );
}
