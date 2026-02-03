import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api";
import CommentNode from "./CommentNode";
import { useToast } from "./ui/toast";

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [text, setText] = useState("");
  const { toast } = useToast();

  const load = () => {
    api.get(`posts/${id}/`).then(r => setPost(r.data));
  };

  useEffect(load, [id]);

  const addComment = async () => {
    if (!text.trim()) return;

    try {
      await api.post("comments/", { post: id, body: text });
      setText("");
      load();
    } catch (err) {
        if (err.response?.status === 401) {
          toast({
            title: "Login required",
            description: "Please login to comment.",
            variant: "destructive"
          });
        } else {
          toast({ title: "Failed to comment", variant: "destructive" });
        }
      }

  };

  const likePost = async () => {
    try {
      await api.post("like/", { model: "post", id });
      load();
    } catch (err) {
        if (err.response?.status === 401) {
          toast({
            title: "Login required",
            description: "Please login to like this post.",
            variant: "destructive"
          });
        } else if (err.response?.status === 409) {
          toast({
            title: "Already liked",
            description: "You can like a post only once."
          });
        } else {
          toast({ title: "Failed to like post", variant: "destructive" });
        }
      }
  };

  if (!post)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="bg-white rounded-[32px] p-10 shadow-2xl shadow-slate-300/50 border-4 border-white">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-200 flex items-center justify-center text-white text-2xl font-black">
            {post.author[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              {post.author}
            </h2>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
              Original Poster
            </p>
          </div>
        </div>

        <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium">
          {post.body}
        </p>

        <div className="flex items-center justify-between border-t border-slate-100 pt-8">
          <button
            onClick={likePost}
            className="flex items-center gap-3 px-8 py-3 rounded-full bg-rose-500 text-white font-black shadow-lg shadow-rose-200 hover:scale-105 transition"
          >
            ❤️ Like {post.like_count}
          </button>
        </div>
      </div>

      {/* comment input */}
      <div className="bg-white rounded-2xl p-6 shadow border border-slate-100">
        <input
          className="w-full border rounded-xl px-4 py-3"
          placeholder="Write a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addComment()}
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-800 ml-4 italic">
          Discussion Thread
        </h3>

        {post.comments.map(c => (
          <CommentNode
            key={c.id}
            node={c}
            postId={id}
            reload={load}
          />
        ))}
      </div>
    </div>
  );
}
