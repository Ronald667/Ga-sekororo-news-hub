import React from "react";
import { Newspaper, Sparkles, Box, ShieldPlus, PlusCircle, LogIn, LogOut, User } from "lucide-react";

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPublishModal: () => void;
  user: { email: string; role: "admin" | "reader" } | null;
  onLogout: () => void;
  onNavigateLogin: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPublishModal,
  user,
  onLogout,
  onNavigateLogin,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div 
          onClick={() => setActiveTab("news")}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              Ga-Sekororo Hub
            </h1>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Community & Media Portal
            </span>
          </div>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab("news")}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              activeTab === "news"
                ? "border-emerald-600 text-slate-900 dark:text-white font-semibold"
                : "border-transparent hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            News Portal
          </button>
          <button
            onClick={() => setActiveTab("ai-studio")}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              activeTab === "ai-studio"
                ? "border-emerald-600 text-slate-900 dark:text-white font-semibold"
                : "border-transparent hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            AI Media Studio
          </button>
          <button
            onClick={() => setActiveTab("3d-viewer")}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              activeTab === "3d-viewer"
                ? "border-emerald-600 text-slate-900 dark:text-white font-semibold"
                : "border-transparent hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Box className="w-3.5 h-3.5 text-teal-500" />
            3D Valley Scene
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === "admin"
                  ? "border-emerald-600 text-slate-900 dark:text-white font-semibold"
                  : "border-transparent hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShieldPlus className="w-3.5 h-3.5 text-amber-500" />
              Admin Dashboard
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {user?.role === "admin" && (
            <button
              onClick={onOpenPublishModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Publish Story
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[120px]">{user.email}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {user.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onNavigateLogin}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav sub-bar */}
      <div className="flex md:hidden items-center justify-around px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
        <button onClick={() => setActiveTab("news")} className={activeTab === "news" ? "text-emerald-600 font-bold" : ""}>News</button>
        <button onClick={() => setActiveTab("ai-studio")} className={activeTab === "ai-studio" ? "text-emerald-600 font-bold" : ""}>AI Studio</button>
        <button onClick={() => setActiveTab("3d-viewer")} className={activeTab === "3d-viewer" ? "text-emerald-600 font-bold" : ""}>3D Scene</button>
        {user?.role === "admin" && (
          <button onClick={() => setActiveTab("admin")} className={activeTab === "admin" ? "text-emerald-600 font-bold" : ""}>Admin</button>
        )}
      </div>
    </header>
  );
};
