import React, { useState } from "react";
import { X, Heart, MessageSquare, Share2, Volume2, Check, Clock, User } from "lucide-react";
import { getRelativeTimeString } from "../utils/time";

interface Article {
  id: string;
  title: string;
  category: string;
  body: string;
  image_url: string;
  author: string;
  created_at: string;
  likes: number;
  comments_count: number;
}

interface StoryModalProps {
  article: Article | null;
  onClose: () => void;
  onLike: (id: string) => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ article, onClose, onLike }) => {
  if (!article) return null;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likes);
  const [copied, setCopied] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      onLike(article.id);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadAloud = () => {
    if ("speechSynthesis" in window) {
      if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(`${article.title}. By ${article.author}. ${article.body}`);
        utterance.onend = () => setIsReading(false);
        utterance.onerror = () => setIsReading(false);
        window.speechSynthesis.speak(utterance);
        setIsReading(true);
      }
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header image */}
        <div className="relative h-72 w-full overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button
            onClick={() => {
              if (isReading && "speechSynthesis" in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-2">
              <span>{article.category}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-normal text-slate-300">
                <Clock className="w-3.5 h-3.5" />
                {getRelativeTimeString(article.created_at)}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
              {article.title}
            </h2>
          </div>
        </div>

        {/* Article Content */}
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                {article.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{article.author}</p>
                <p className="text-xs text-slate-500">Ga-Sekororo Correspondent</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReadAloud}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isReading 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Volume2 className="w-4 h-4" />
                {isReading ? "Stop Reading" : "Listen"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                {copied ? "Copied" : "Share"}
              </button>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-base space-y-4">
            <p className="font-medium text-lg text-slate-900 dark:text-white leading-relaxed">
              {article.body}
            </p>
            <p>
              The community elders and local leadership continue to spearhead sustainable growth initiatives throughout the Ga-Sekororo valley, ensuring that traditional values and modern development walk hand in hand.
            </p>
          </div>

          {/* Engagement Footer */}
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  liked 
                    ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                <span>{likeCount} Likes</span>
              </button>

              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <MessageSquare className="w-4 h-4" />
                <span>{article.comments_count} Comments</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (isReading && "speechSynthesis" in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
