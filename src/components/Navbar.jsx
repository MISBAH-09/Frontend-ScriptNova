import { Link } from 'react-router-dom';
import { getToken } from "../services/auth";
import { useEffect, useState } from "react";
import { Sparkles} from "lucide-react";

const BRAND = import.meta.env.VITE_BRAND_NAME || "ScriptNova";

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getToken());
  }, []);

  return (
    <nav className="w-full fixed top-0 z-50 bg-slate-200 text-pink-600 text-lg font-semibold backdrop-blur-md border-b-4 border-pink-600">
      <div className="w-full px-6 py-4 flex items-center justify-between">

        {/* Brand — always pinned to the far left, never shrinks */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl text-pink-500 font-bold shrink-0"
        >
          <Sparkles className="w-6 h-6" />
          {BRAND}
        </Link>

        {/* Center nav links — hidden on mobile */}
        <div className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
          <a href="#features" className="hover:text-black transition-all pb-1 border-b-2 border-transparent hover:border-pink-500">Features</a>
          <a href="#pricing"  className="hover:text-black transition-all pb-1 border-b-2 border-transparent hover:border-pink-500">Pricing</a>
          <a href="#about"    className="hover:text-black transition-all pb-1 border-b-2 border-transparent hover:border-pink-500">About</a>
        </div>

        {/* Right side buttons — always pinned to the far right, never shrinks */}
        <div className="flex gap-4 items-center shrink-0">
          <Link
            to="/auth"
            className="px-4 py-2 hover:text-black transition-colors"
          >
            Login
          </Link>
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="bg-pink-500 text-white hover:bg-pink-600 px-5 py-2 rounded-xl font-semibold transition-colors shadow-lg shadow-pink-500/20"
          >
            {user ? "Open App" : "Get Started"}
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;