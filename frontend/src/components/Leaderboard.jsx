import { useEffect, useState } from "react";
import { api } from "../api";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("leaderboard/").then(r => setRows(r.data));
  }, []);

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-300/50 border border-white">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏆</span>
          <h3 className="text-xl font-black text-slate-800">Top 5 Users (24h)</h3>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-11">Playto Community Challenge</p>
      </div>

      <div className="space-y-6">
        <h4 className="text-2xl font-black text-slate-800 mb-4">Leaderboard</h4>
        {rows.map((r, i) => (
          <div key={r.user__id} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 ${i === 0 ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                {i + 1}
              </div>
              <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition">{r.user__username}</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="font-black text-slate-900">{r.total_karma}</span>
               <span className="bg-[#2D2B57] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Karma</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}