export default function NavButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${active ? "bg-pink-500 text-white" : "text-gray-300 hover:bg-slate-700"}`}>
      <span>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
          active ? "bg-white/20 text-white" : "bg-pink-500 text-white"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}
