import { motion } from "framer-motion";
import { Sparkles, LayoutDashboard, Zap, KeyRound, PenLine, Download, Brain } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI Blog Generation",
    desc: "Generate full SEO-optimised articles in seconds. Set your tone, length, and keywords — the AI does the rest.",
  },
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    title: "Smart Dashboard",
    desc: "Manage drafts, published blogs, and analytics in one clean place. Your entire content pipeline at a glance.",
  },
  {
    icon: <Brain className="w-5 h-5" />,   // or Wand2, Fingerprint, Heart
    title: "Humanize Layer",
    desc: "AI-generated content rewritten to sound natural, personal, and undetectable. Bypass AI detectors and connect with real readers.",
  },
  {
    icon: <KeyRound className="w-5 h-5" />,
    title: "SEO Keywords",
    desc: "AI-generated keyword suggestions tailored to your topic. Rank higher without the research grind.",
  },
  {
    icon: <PenLine className="w-5 h-5" />,
    title: "Rich Editor",
    desc: "Edit, reformat, and polish AI-generated content in our distraction-free markdown editor.",
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: "One-Click Export",
    desc: "Download your blogs as Markdown or plain text. Paste anywhere, publish everywhere.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

function FeaturesSection() {
  return (
    <section id="features" className="relative bg-slate-200 py-24 px-6">

      {/* background  */}
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-pink-500/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-pink-500/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-pink-500 mt-3">
            Powerful Features
          </h2>
          <p className="text-black mt-4 max-w-xl mx-auto leading-relaxed">
            Built for creators who want to move fast without compromising on quality.
          </p>
          {/* Pink underline accent */}
          <div className="mx-auto mt-5 w-12 h-1 rounded-full bg-gradient-to-r from-pink-500 to-pink-700" />
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-pink-700/50 border border-slate-700/50 hover:border-pink-500/40
                rounded-2xl p-6 cursor-default
                hover:bg-pink-500/30
                hover:shadow-xl hover:shadow-pink-500/5
                transition-colors duration-300"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-slate-200 border border-pink-500/20
                flex items-center justify-center text-pink-600 mb-4
                group-hover:bg-pink-500/20 group-hover:border-pink-500/40
                group-hover:text-black transition-colors duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-white font-semibold text-base mb-2 group-hover:text-black transition-colors duration-300">
                {feature.title}
              </h3>

              {/* Desc */}
              <p className="text-slate-900 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default FeaturesSection;