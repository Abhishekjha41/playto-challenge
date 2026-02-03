import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import Leaderboard from "./Leaderboard";
import { useToast } from "./ui/toast";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const nav = useNavigate();
  const { toast } = useToast();

  const load = () => {
    api.get("feed/").then(r => setPosts(r.data));
  };

  useEffect(load, []);

  const createPost = async () => {
    if (!text.trim()) return;

    try {
      await api.post("posts/create/", { body: text });
      toast({
        title: "Post created",
        description: "Your post is now visible in the feed."
      });
      setText("");
      load();
    } catch (e) {
      if (e.response?.status === 401) {
        toast({
          title: "Login required",
          description: "Please login to create a post.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Failed to create post",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 items-start">

      <div className="lg:col-span-4 space-y-10 h-[calc(100vh-96px)] overflow-y-auto scroll-hide pr-2">

        {/* CREATE POST */}
        <div className="bg-white rounded-[28px] p-6 shadow border border-slate-100">
          <p className="font-black text-slate-800 mb-3">
            Create a new post
          </p>

          <textarea
            rows={3}
            className="w-full border rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Share something with the community…"
            value={text}
            onChange={e => setText(e.target.value)}
          />

          <div className="flex justify-end mt-3">
            <button
              onClick={createPost}
              className="px-6 py-2 rounded-full bg-indigo-600 text-white font-black text-sm shadow hover:bg-indigo-700 transition"
            >
              Publish
            </button>
          </div>
        </div>

        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
          Community Feed
        </h1>

        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {posts.map((p) => (
            <div
              key={p.id}
              className="break-inside-avoid bg-white border border-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-200">
                  {p.author[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{p.author}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Topic #{p.id}
                  </p>
                </div>
              </div>

              <div
                className="mb-6 cursor-pointer"
                onClick={() => nav(`/post/${p.id}`)}
              >
                <p className="text-slate-700 text-lg leading-relaxed font-medium">
                  {p.body}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-wide">
                  <span>♥</span> {p.like_count}
                </div>

                <button
                  onClick={() => nav(`/post/${p.id}`)}
                  className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-widest group-hover:gap-3 transition-all"
                >
                  Read Thread <span className="text-lg">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="lg:col-span-2 sticky top-24 h-fit">
        <Leaderboard />
      </aside>
    </div>
  );
}
