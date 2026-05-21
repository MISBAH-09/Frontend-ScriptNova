import { motion } from "framer-motion";

function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 text-gray-400 py-8 text-center">
      <p>© {new Date().getFullYear()} ScriptNova. All rights reserved.</p>
    </footer>
  );
}

export default Footer;