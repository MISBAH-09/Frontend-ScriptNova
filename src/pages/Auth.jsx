import React, { useState } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginUser, SignupUser } from '../services/auth';
import { createCheckoutSession } from "../services/payment";
import { Sparkles} from "lucide-react";

const BRAND = import.meta.env.VITE_BRAND_NAME || "ScriptNova";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await loginUser(email, password);
        if (next === "checkout") {
          const checkoutUrl = await createCheckoutSession();
          window.location.href = checkoutUrl;
          return;
        }
        navigate('/dashboard');
      } else {
        const nameParts = name.split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';
        await SignupUser(username || email, email, password, first_name, last_name);
        setIsLogin(true);
        setError('Account created successfully! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow effects matching landing page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand name at top */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 group">
            <span className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight group-hover:text-pink-400 transition-colors">
              <Sparkles className="w-6 h-6 text-pink-500" />
              <span className="text-pink-500">{BRAND}</span>
            </span>
          </a>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 w-full p-8 rounded-2xl shadow-2xl text-white">
          <h2 className="text-2xl font-bold text-center mb-1">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-center text-slate-400 text-sm mb-7">
            {isLogin ? 'Sign in to continue creating' : 'Start writing AI-powered blogs'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm mb-1.5 text-slate-400 font-medium">Username</label>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    type="text"
                    className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-slate-600 transition"
                    placeholder="johndoe"
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1.5 text-slate-400 font-medium">Full Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    type="text"
                    className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-slate-600 transition"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm mb-1.5 text-slate-400 font-medium">Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-slate-600 transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1.5 text-slate-400 font-medium">Password</label>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-slate-600 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className={`text-sm px-3 py-2 rounded-lg ${error.includes('successfully') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Processing...
                </span>
              ) : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 text-pink-400 hover:text-pink-300 font-medium hover:underline transition-colors"
              type="button"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
