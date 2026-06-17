import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import PublicBlogs from './pages/PublicBlogs';
import PublicBlog from './pages/PublicBlog';
import Dashboard from './pages/Dashboard';
import './App.css'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('userToken')
  if (!token) {
    return <Navigate to="/auth" replace />
  }
  return children
}

export default function App() {
  const location = useLocation()
  const hideNav = location.pathname === '/dashboard' || location.pathname === '/auth'

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/blogs" element={<PublicBlogs />} />
        <Route path="/blog/:slug" element={<PublicBlog />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}
