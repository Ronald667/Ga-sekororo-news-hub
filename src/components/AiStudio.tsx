import React, { useState } from "react";
import { Sparkles, Image as ImageIcon, Upload, Loader2, Download, Check, FileText } from "lucide-react";

interface AiStudioProps {
  onPublishGeneratedStory: (story: { title: string; category: string; body: string; image_url: string }) => void;
}

export const AiStudio: React.FC<AiStudioProps> = ({ onPublishGeneratedStory }) => {
  const [activeSubTab, setActiveSubTab] = useState<"generator" | "analyzer">("generator");

  // Generator state
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [loadingGen, setLoadingGen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Analyzer state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ title: string; category: string; body: string; caption?: string } | null>(null);
  const [published, setPublished] = useState(false);

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoadingGen(true);
    setGeneratedImage(null);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio }),
      });
      const data = await res.json();
      if (data.success && data.image_url) {
        setGeneratedImage(data.image_url);
      } else {
        alert(data.error || "Failed to generate image.");
      }
    } catch (err: any) {
      alert("Error generating image: " + err.message);
    } finally {
      setLoadingGen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!previewUrl) return;

    setLoadingAnalysis(true);
    try {
      const base64Data = previewUrl.split(",")[1];
      const mimeType = selectedFile?.type || "image/jpeg";

      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data, mimeType }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        alert(data.error || "Failed to analyze image.");
      }
    } catch (err: any) {
      alert("Error analyzing image: " + err.message);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handlePublishAnalyzed = () => {
    if (!analysisResult || !previewUrl) return;
    onPublishGeneratedStory({
      title: analysisResult.title || "Community Photo Feature",
      category: analysisResult.category || "Community",
      body: analysisResult.body || "A captured moment in Ga-Sekororo.",
      image_url: previewUrl,
    });
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Sparkles className="w-4 h-4" />
            Gemini AI Powered Studio
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Media & Story Generator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Create custom high-definition illustrations with Gemini Nano Banana or analyze photos with Gemini 4 Argon.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setActiveSubTab("generator")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === "generator"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Create Image
          </button>
          <button
            onClick={() => setActiveSubTab("analyzer")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === "analyzer"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Analyze & Draft
          </button>
        </div>
      </div>

      {activeSubTab === "generator" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              Text to Image (Nano Banana)
            </h3>

            <form onSubmit={handleGenerateImage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Image Prompt
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. A serene sunrise over the Ga-Sekororo valley mountains with agricultural terracing and traditional huts..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={e => setAspectRatio(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="16:9">16:9 (Landscape Banner)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:3">4:3 (Standard Photo)</option>
                  <option value="3:4">3:4 (Portrait)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loadingGen}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingGen ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating with Gemini Nano Banana...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate HD Image
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preview Output */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[420px]">
            {generatedImage ? (
              <div className="w-full space-y-4">
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                  <img src={generatedImage} alt="Generated" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Generated successfully with Gemini Nano Banana 2.1</span>
                  <a
                    href={generatedImage}
                    download="ga-sekororo-ai.png"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white dark:bg-slate-800 rounded-xl text-xs font-medium hover:bg-slate-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 py-12">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Your generated image will appear here</p>
                <p className="text-xs text-slate-400 max-w-sm">Enter a prompt on the left and click generate to create custom visuals powered by Gemini.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Upload Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              Photo Analyzer (Gemini 4 Argon)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Upload Community Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950/50 dark:file:text-emerald-300 hover:file:bg-emerald-100 transition-all cursor-pointer"
                />
              </div>

              {previewUrl && (
                <div className="relative h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <button
                type="button"
                disabled={!previewUrl || loadingAnalysis}
                onClick={handleAnalyzeImage}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingAnalysis ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing with Gemini 4 Argon...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Analyze & Draft Story
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Generated Story Draft</h3>

            {analysisResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {analysisResult.category}
                    </span>
                    <span className="text-xs text-slate-400">Gemini 4 Argon Analysis</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">{analysisResult.title}</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysisResult.body}</p>
                </div>

                <button
                  onClick={handlePublishAnalyzed}
                  disabled={published}
                  className="w-full py-3 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {published ? <Check className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4" />}
                  {published ? "Published to Portal!" : "Publish to News Feed"}
                </button>
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                <p className="text-slate-500 text-sm font-medium">Upload a photo and click analyze to generate an article draft.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
