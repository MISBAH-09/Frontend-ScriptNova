// import { motion } from "framer-motion";

// export default function About() {
//   return (
//       <>
//       <section id="about" className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
//         <h2 className="text-5xl font-extrabold mb-6">
//           About <span className="text-indigo-500">ScriptNova</span>
//         </h2>
//         <p className="text-lg text-gray-400 leading-relaxed">
//           ScriptNova is an AI-powered blogging SaaS platform designed to help
//           creators, businesses, and developers generate high-quality content
//           faster using advanced AI models like Gemini.
//         </p>
//       </section>

//       <section className="py-20 bg-gray-950 px-6">
//         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
//           <div>
//             <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
//             <p className="text-gray-400 leading-relaxed">
//               Our mission is to simplify content creation by combining powerful
//               AI generation with a clean, scalable SaaS architecture. We aim to
//               empower writers and startups to publish smarter, faster, and
//               better.
//             </p>
//           </div>
//           <div className="bg-gray-900 p-10 rounded-3xl shadow-lg">
//             <h4 className="text-2xl font-semibold mb-4">Why ScriptNova?</h4>
//             <ul className="space-y-3 text-gray-400">
//               <li>✔ AI-powered content generation</li>
//               <li>✔ Production-ready SaaS architecture</li>
//               <li>✔ Secure JWT authentication</li>
//               <li>✔ Scalable backend with Django & React</li>
//             </ul>
//           </div>
//         </div>
//       </section>

//       <section className="py-20 px-6 text-center">
//         <h3 className="text-3xl font-bold mb-6">Built for the Future</h3>
//         <p className="max-w-3xl mx-auto text-gray-400 leading-relaxed">
//           ScriptNova is crafted as a portfolio-ready, Fiverr-demonstrable, and
//           full-production SaaS product. It showcases full-stack engineering,
//           AI integration, authentication systems, and scalable cloud
//           deployment strategies.
//         </p>
//       </section>
//       </>
//   );
// }


import { motion } from "framer-motion";
import { Sparkles, Target, Rocket, ShieldCheck, Brain, Code2, Zap } from "lucide-react";

const BRAND = import.meta.env.VITE_BRAND_NAME || "ScriptNova";

const reasons = [
  { icon: <Brain className="w-4 h-4" />,      text: "AI-powered content generation with NVIDIA" },
  { icon: <ShieldCheck className="w-4 h-4" />, text: "Secure token-based authentication" },
  { icon: <Code2 className="w-4 h-4" />,       text: "Scalable backend with Django & React" },
  { icon: <Zap className="w-4 h-4" />,         text: "Humanize layer to bypass AI detectors" },
  { icon: <Rocket className="w-4 h-4" />,      text: "Production-ready SaaS architecture" },
  { icon: <Sparkles className="w-4 h-4" />,    text: "SEO-optimised output from day one" },
];

export default function About() {
  return (
    <>
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <section id="about" className="bg-slate-200 pt-24 pb-16 px-6 relative overflow-hidden text-black">
        {/* background */}
        <div className="absolute top-0 left-10 w-[300px] h-[300px] bg-pink-500/50 rounded-full blur-3xl pointer-events-none" />
        
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <span className="inline-flex items-center gap-2 font-medium text-black">
            Our Story
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold mb-5">
            About <span className="text-pink-500">{BRAND}</span>
          </h2>

          <p className="text-lg leading-relaxed">
            {BRAND} is an AI-powered blogging CMS designed to help creators,
            businesses, and developers generate high-quality content faster —
            using advanced AI models and a Humanize layer that makes every post
            feel genuinely human.
          </p>

          <div className="mx-auto mt-6 w-12 h-1 rounded-full bg-gradient-to-r from-pink-500 to-pink-700" />
        </motion.div>
      </section>

      {/* ── Mission + Why ────────────────────────────────────────────────── */}
      <section className="bg-slate-200 py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-start">

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-1 mb-2">
              <div className="w-12 h-12 flex items-center justify-center text-pink-400">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-black">Our Mission</h3>
            </div>
            <p className="text-black leading-relaxed text-sm">
              Our mission is to simplify content creation by combining powerful
              AI generation with a clean, scalable architecture. We aim to
              empower writers and startups to publish smarter, faster, and
              better — without sacrificing the human touch that makes content
              actually connect.
            </p>

            {/* Stat chips */}
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { val: "10x", label: "Faster writing" },
                { val: "✦", label: "Human tone" },
                { val: "100%", label: "SEO ready" },
              ].map((s) => (
                <div key={s.label}
                  className="flex flex-col items-center px-5 py-3 rounded-xl
                    bg-pink-300/40 border border-pink-700/50">
                  <span className="text-pink-500 font-extrabold text-xl">{s.val}</span>
                  <span className="text-black text-xs mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Why ScriptNova */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="border border-slate-700/50 rounded-2xl p-7 bg-pink-300/50"
          >
            <h4 className="text-xl font-bold text-black mb-6">
              Why <span className="text-pink-500">{BRAND}?</span>
            </h4>
            <ul className="space-y-3">
              {reasons.map((r, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-7 h-7 flex items-center justify-center text-pink-600 shrink-0">
                    {r.icon}
                  </div>
                  <span className="text-black text-sm">{r.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

        </div>
      </section>

      {/* ── Built for the future ─────────────────────────────────────────── */}
      <section className="bg-slate-200 py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-9 h-9 flex items-center justify-center text-pink-600">
              <Rocket className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-black">Built for the Future</h3>
          </div>

          <p className="text-slate-900 leading-relaxed text-sm mt-3">
            {BRAND} is crafted as a full-production CMS product. It showcases
            full-stack engineering with Django & React, NVIDIA AI integration,
            token-based authentication, and a Humanize layer — everything a
            modern content platform needs to scale.
          </p>

          {/* Bottom pink line */}
          <div className="mx-auto mt-8 w-12 h-1 rounded-full bg-gradient-to-r from-pink-500 to-pink-700" />
        </motion.div>
      </section>
    </>
  );
}