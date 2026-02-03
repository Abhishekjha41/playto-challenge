import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Feed from "./components/Feed";
import PostPage from "./components/PostPage";
import Login from "./components/Login";
import Register from "./components/Register";

export default function App() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <nav className="sticky top-0 z-50 bg-[#1E2145] shadow-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg flex items-center justify-center shadow-inner">
              <span className="text-white font-black text-xl">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Playto Community
            </span>
          </Link>

          <div className="flex gap-6 items-center">
            <Link
              to="/"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Post feed
            </Link>

            {username ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[#2D2B57] pl-1 pr-4 py-1 rounded-full border border-indigo-500/30">
                  <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {username[0].toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-bold">
                    {username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="text-sm font-bold px-5 py-1.5 bg-white text-[#1E2145] rounded-full hover:bg-slate-200 transition shadow-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold px-5 py-1.5 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-10 px-6">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:id" element={<PostPage />} />
        </Routes>
      </main>
    </div>
  );
}
