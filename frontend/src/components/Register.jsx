import { useState } from "react";
import axios from "axios";
import { useToast } from "./ui/toast";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const nav = useNavigate();

  const submit = async () => {
    try {
      const res = await axios.post(
        "https://playto-challenge-production.up.railway.app/api/register/",
        { username, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);

      nav("/");
    } catch (e) {
        toast({
            title: "Registration failed",
            description: e.response?.data?.detail,
            variant: "destructive"
        });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-[#1E2145] rounded-[40px] p-12 shadow-2xl shadow-indigo-900/40 text-white border border-indigo-400/20">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-inner">
            <span className="text-[#1E2145] text-3xl font-black italic">P</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Create Account
          </h1>
          <p className="text-indigo-300 text-xs font-bold uppercase mt-2 tracking-widest">
            Join Playto
          </p>
        </div>

        <div className="space-y-6">
          <input
            className="w-full bg-[#2D2B57] border-none rounded-2xl p-4 text-white placeholder-indigo-400 outline-none focus:ring-2 focus:ring-indigo-400 transition"
            placeholder="USERNAME"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="w-full bg-[#2D2B57] border-none rounded-2xl p-4 text-white placeholder-indigo-400 outline-none focus:ring-2 focus:ring-indigo-400 transition"
            placeholder="PASSWORD"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button
            onClick={submit}
            className="w-full bg-white text-[#1E2145] font-black py-4 rounded-2xl hover:bg-indigo-50 transition shadow-xl shadow-white/10 text-sm uppercase tracking-widest"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
