import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowDown } from "lucide-react";

const BRAND = import.meta.env.VITE_BRAND_NAME || "ScriptNova";

const animatedWords = ["Made Simple", "Made Powerful", "Made Fast", "Made Yours"];

function HeroSection() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const el = document.getElementById("features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section className="relative pt-20 min-h-screen bg-slate-200 flex flex-col items-center justify-center text-center px-6 overflow-hidden">

      {/* ── Background glow blobs ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-pink-700/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-pink-700/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[200px] h-[200px] bg-pink-500/30 rounded-full blur-2xl pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-3xl w-full">

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-6xl font-extrabold leading-tight text-black"
        >
          AI Powered Blogging
        </motion.h1>

        {/* Slot machine — full phrase slides in/out, no static "Made" */}
        <div className="text-5xl md:text-6xl font-extrabold leading-tight mt-1 flex items-center justify-center">
          <div className="relative inline-block min-w-[420px] h-[1.2em] overflow-hidden">
            {/* Invisible spacer — widest word keeps layout stable */}
            <span className="invisible select-none">Made Powerful.</span>

            {animatedWords.map((word, i) => (
              <motion.span
                key={word}
                className="text-pink-600 absolute inset-0 flex items-center justify-center"
                initial={{ y: 80 }}
                animate={{ y: [80, 0, 0, -80] }}
                transition={{
                  duration: 2.5,
                  delay: i * 2.5,
                  repeat: Infinity,
                  repeatDelay: (animatedWords.length - 1) * 2.5,
                  times: [0, 0.2, 0.8, 1],
                  ease: "easeInOut",
                }}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2, ease: "easeOut" }}
          className="mt-8 text-lg text-slate-900 max-w-xl mx-auto leading-relaxed"
        >
          Generate high-quality SEO-optimised blogs using Script Nova AI.
          Create, edit, publish and scale your content like a pro — in seconds, not hours.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.5, ease: "easeOut" }}
          className="mt-10 flex justify-center gap-4 flex-wrap"
        >
          <button
            onClick={() => navigate("/auth")}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3.5 rounded-2xl font-semibold
              transition-all duration-200 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40
              hover:-translate-y-0.5 active:translate-y-0"
          >
            Start Writing Free →
          </button>

          <button
            onClick={scrollToFeatures}
            className="flex items-center gap-2 border border-slate-600 text-slate-700 px-8 py-3.5
              rounded-2xl font-semibold hover:border-pink-500 hover:text-pink-600
              hover:bg-pink-500/5 transition-all duration-200 hover:-translate-y-0.5"
          >
            <ArrowDown className="w-4 h-4" />
            See Features
          </button>
        </motion.div>

        {/* Social proof chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="mt-10 flex items-center justify-center gap-6 text-sm text-slate-500 flex-wrap"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-pink-500">✓</span> No credit card required
          </span>
          <span className="w-px h-4 bg-slate-400 hidden sm:block" />
          <span className="flex items-center gap-1.5">
            <span className="text-pink-500">✓</span> 5 free blogs / month
          </span>
          <span className="w-px h-4 bg-slate-400 hidden sm:block" />
          <span className="flex items-center gap-1.5">
            <span className="text-pink-500">✓</span> Cancel anytime
          </span>
        </motion.div>
      </div>

    </section>
  );
}

export default HeroSection;
