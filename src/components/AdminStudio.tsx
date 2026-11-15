import React, { useState } from "react";
import { ShieldPlus, Sparkles, Upload, Check, Loader2, Code, Copy, Database } from "lucide-react";

interface AdminStudioProps {
  onArticlePublished: () => void;
  onNavigateAiStudio: () => void;
}

export const AdminStudio: React.FC<AdminStudioProps> = ({ onArticlePublished, onNavigateAiStudio }) => {
  const [activeSubTab, setActiveSubTab] = useState<"publish" | "sql">("publish");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"News" | "Sport" | "Drama" | "Community" | "Culture">("News");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("Chief Community Editor");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1541888946425-d0fbb18f064f?auto=format&fit=crop&q=80&w=1000");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [copiedSql, setCopiedSql] = useState(false);

  const supabaseSqlScript = `-- 1. Create profiles table linked to Supabase auth.users
create table public.profiles (
  id uuid not null references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'reader' check (role in ('reader', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- 3. Function & trigger to auto-create profile on new user signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'reader');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const publishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      alert("Please provide both a title and story body.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          body,
          image_url: imageUrl,
          author,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Story published successfully to Ga-Sekororo Portal!");
        setTitle("");
        setBody("");
        onArticlePublished();
      } else {
        alert(data.error || "Failed to publish article.");
      }
    } catch (err: any) {
      alert("Error publishing: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            <ShieldPlus className="w-3.5 h-3.5" />
            Protected Admin Dashboard
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ga-Sekororo Editorial & DB Control</h1>
          <p className="text-slate-300 text-sm">Manage breaking news, Supabase RLS policies, and administrator permissions.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("publish")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeSubTab === "publish" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Publish Content
          </button>
          <button
            onClick={() => setActiveSubTab("sql")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === "sql" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Supabase SQL Script
          </button>
        </div>
      </div>

      {activeSubTab === "sql" ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Supabase SQL Editor Script</h3>
              <p className="text-xs text-slate-500">Run this script in your Supabase SQL Editor to configure profiles and RLS policies.</p>
            </div>
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors shadow"
            >
              {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedSql ? "Copied SQL!" : "Copy SQL Script"}
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {supabaseSqlScript}
          </pre>
        </div>
      ) : (
        <div className="space-y-6">
          {successMessage && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-semibold">{successMessage}</p>
            </div>
          )}

          <form onSubmit={publishArticle} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Article Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. New Youth Skills Center Opens..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="News">News</option>
                  <option value="Community">Community</option>
                  <option value="Sport">Sport</option>
                  <option value="Drama">Drama</option>
                  <option value="Culture">Culture</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Author Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Story Body
              </label>
              <textarea
                rows={6}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write full story details..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldPlus className="w-5 h-5" />}
              Publish Story (Admin RLS Verified)
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
