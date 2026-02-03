import { useState } from "react";
import { api } from "../api";
import { useToast } from "./ui/toast";


export default function CommentNode({ node, postId, reload }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { toast } = useToast();

  const like = async (e) => {
    e.stopPropagation();

    try {
      await api.post("like/", { model: "comment", id: node.id });
      reload();
    } catch (err) {
        if (err.response?.status === 401) {
          toast({
            title: "Login required",
            description: "Please login to like comments.",
            variant: "destructive"
          });
        } else if (err.response?.status === 409) {
          toast({
            title: "Already liked",
            description: "You can like only once."
          });
        } else {
          toast({ title: "Failed to like comment", variant: "destructive" });
        }
      }

  };

  const reply = async () => {
    if (!text.trim()) return;

    try {
      await api.post("comments/", {
        post: postId,
        parent: node.id,
        body: text
      });

      setText("");
      setOpen(false);
      reload();
    } catch (err) {
        if (err.response?.status === 401) {
          toast({
            title: "Login required",
            description: "Please login to reply.",
            variant: "destructive"
          });
        } else {
          toast({ title: "Failed to reply", variant: "destructive" });
        }
      }
  };

  return (
    <div className="mt-6">
      <div className="relative pl-6 border-l-2 border-indigo-100">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black">
                {node.author[0].toUpperCase()}
              </div>
              <span className="font-bold text-slate-800 text-sm">
                {node.author}
              </span>
            </div>
          </div>

          <p className="text-slate-600 text-[15px] mb-4 leading-relaxed font-medium">
            {node.body}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={like}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition text-[11px] font-black uppercase tracking-wide"
            >
              <span>♥</span> Like {node.like_count}
            </button>

            <button
              onClick={() => setOpen(!open)}
              className="text-indigo-600 hover:text-indigo-800 text-[11px] font-black uppercase tracking-widest transition flex items-center gap-1"
            >
              {open ? "Close" : "Reply ↩"}
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-3 ml-2">
            <div className="flex gap-2">
              <input
                autoFocus
                className="flex-1 bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-lg shadow-indigo-100/50"
                placeholder={`Reply to ${node.author}...`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && reply()}
              />
              <button
                onClick={reply}
                className="bg-indigo-600 text-white px-5 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {node.children?.length > 0 && (
          <div className="mt-4">
            {node.children.map(ch => (
              <CommentNode
                key={ch.id}
                node={ch}
                postId={postId}
                reload={reload}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
