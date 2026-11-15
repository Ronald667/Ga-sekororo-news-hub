import React, { useState, useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { NewsPortal } from "./components/NewsPortal";
import { AiStudio } from "./components/AiStudio";
import { GaSekororoMonument3D } from "./components/GaSekororoMonument3D";
import { AdminStudio } from "./components/AdminStudio";
import { LoginView } from "./components/LoginView";
import { X, ShieldPlus, Sparkles, AlertCircle } from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: "News" | "Sport" | "Drama" | "Community" | "Culture";
  body: string;
  image_url: string;
  author: string;
  created_at: string;
  likes: number;
  comments_count: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("news");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);

  // Auth State
  const [user, setUser] = useState<{ email: string; role: "admin" | "reader" } | null>({
    email: "admin@gasekororo.gov.za",
    role: "admin",
  });

  // Quick Publish Modal state
  const [quickTitle, setQuickTitle] = useState("");
  const [quickCategory, setQuickCategory] = useState<any>("Community");
  const [quickBody, setQuickBody] = useState("");
  const [quickAuthor, setQuickAuthor] = useState("Valley Contributor");

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if (Array.isArray(data)) {
        setArticles(data);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleLike = async (id: string) => {
    try {
      await fetch(`/api/news/${id}/like`, { method: "POST" });
      setArticles(prev =>
        prev.map(a => (a.id === id ? { ...a, likes: a.likes + 1 } : a))
      );
    } catch (err) {
      console.error("Failed to like article:", err);
    }
  };

  const handleQuickPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle || !quickBody) return;

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickTitle,
          category: quickCategory,
          body: quickBody,
          image_url: "https://images.unsplash.com/photo-1541888946425-d0fbb18f064f?auto=format&fit=crop&q=80&w=1000",
          author: quickAuthor,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setArticles(prev => [data.article, ...prev]);
        setIsPublishModalOpen(false);
        setQuickTitle("");
        setQuickBody("");
        setActiveTab("news");
      }
    } catch (err) {
      console.error("Failed to publish quick story:", err);
    }
  };

  const handleAiGeneratedStoryPublish = (story: { title: string; category: string; body: string; image_url: string }) => {
    fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...story,
        author: "Gemini AI Studio",
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setArticles(prev => [data.article, ...prev]);
          setActiveTab("news");
        }
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        user={user}
        onLogout={() => {
          setUser(null);
          setActiveTab("news");
        }}
        onNavigateLogin={() => setActiveTab("login")}
      />

      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "news" && (
              <NewsPortal
                articles={articles}
                onLike={handleLike}
                onNavigateAiStudio={() => setActiveTab("ai-studio")}
              />
            )}
            {activeTab === "ai-studio" && (
              <AiStudio onPublishGeneratedStory={handleAiGeneratedStoryPublish} />
            )}
            {activeTab === "3d-viewer" && <GaSekororoMonument3D />}
            {activeTab === "login" && (
              <LoginView
                onLogin={(role, email) => {
                  setUser({ email, role });
                  setActiveTab(role === "admin" ? "admin" : "news");
                }}
                onNavigateHome={() => setActiveTab("news")}
              />
            )}
            {activeTab === "admin" && (
              user?.role === "admin" ? (
                <AdminStudio
                  onArticlePublished={fetchArticles}
                  onNavigateAiStudio={() => setActiveTab("ai-studio")}
                />
              ) : (
                <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold">Access Denied</h2>
                  <p className="text-slate-500 text-sm">You must be logged in as an administrator to view the /admin dashboard.</p>
                  <button
                    onClick={() => setActiveTab("login")}
                    className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-sm"
                  >
                    Sign In as Admin
                  </button>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Quick Publish Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldPlus className="w-5 h-5 text-emerald-600" />
                Publish New Story
              </h3>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickPublish} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={e => setQuickTitle(e.target.value)}
                  placeholder="Story title..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={quickCategory}
                  onChange={e => setQuickCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="News">News</option>
                  <option value="Community">Community</option>
                  <option value="Sport">Sport</option>
                  <option value="Drama">Drama</option>
                  <option value="Culture">Culture</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Story Body
                </label>
                <textarea
                  rows={4}
                  value={quickBody}
                  onChange={e => setQuickBody(e.target.value)}
                  placeholder="Story details..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-md"
              >
                Publish Now
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
