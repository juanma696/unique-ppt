import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Loader2,
} from "lucide-react";
import { SlideRenderer } from "./SlideRenderer";
import { dbUtils } from "@/utils";

export function PreviewSection({
  slides,
  setSlides,
  previewIndex,
  setPreviewIndex,
  stage,
  setStage,
  handleExport,
  regenerateSlideImage,
  isDark,
}) {
  const [currentImg, setCurrentImg] = useState(null);
  const activeSlide = slides[previewIndex];

  useEffect(() => {
    if (activeSlide?.hasImage) {
      dbUtils.get(`slide-${activeSlide.id}`).then((img) => {
        setCurrentImg(img);
      });
    } else {
      setCurrentImg(null);
    }
  }, [activeSlide, activeSlide?.lastUpdated]);

  const cardBg = isDark ? "bg-slate-900" : "bg-white";
  const borderColor = isDark ? "border-slate-700" : "border-slate-200";
  const textColor = isDark ? "text-slate-100" : "text-slate-700";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const hoverBg = isDark ? "hover:bg-slate-800" : "hover:bg-slate-50";
  const activeBg = isDark
    ? "bg-teal-900/30 border-teal-500"
    : "bg-teal-50 border-teal-500";
  const previewBg = isDark ? "bg-slate-800" : "bg-slate-100";
  const btnBg = isDark
    ? "bg-slate-800 border-slate-700 text-slate-300"
    : "bg-white border-slate-200 text-slate-600";
  const btnHover = isDark
    ? "hover:border-teal-500 hover:text-teal-400 hover:bg-teal-900/30"
    : "hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50";

  return (
    <div className="flex h-[calc(100vh-140px)] gap-8 pt-6 animate-fade-in max-w-[1600px] mx-auto">
      <div className="w-72 flex flex-col gap-4">
        <div
          className={`${cardBg} p-4 rounded-2xl border ${borderColor} h-full flex flex-col shadow-sm`}
        >
          <h3
            className={`font-bold ${textColor} mb-4 text-xs uppercase tracking-wider flex justify-between items-center px-2`}
          >
            <span>幻灯片列表</span>
            <span
              className={`${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"} px-2 py-0.5 rounded-full text-[10px] font-bold`}
            >
              {slides.length}页
            </span>
          </h3>
          <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
            {slides.map((s, i) => (
              <div
                key={i}
                onClick={() => setPreviewIndex(i)}
                className={`p-3 rounded-xl cursor-pointer transition-all border-l-4 group ${
                  previewIndex === i
                    ? activeBg + " shadow-sm"
                    : `border-transparent ${hoverBg}`
                }`}
              >
                <div
                  className={`text-xs ${textSecondary} font-bold mb-1.5 flex justify-between items-center`}
                >
                  <span className={previewIndex === i ? "text-teal-500" : ""}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.status === "generating" && (
                    <Loader2 size={12} className="animate-spin text-teal-500" />
                  )}
                </div>
                <div
                  className={`truncate text-sm font-medium ${previewIndex === i ? (isDark ? "text-teal-300" : "text-teal-900") : `${textSecondary} group-hover:${textColor}`}`}
                >
                  {s.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setStage("input");
            setSlides([]);
          }}
          className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border ${borderColor} ${textSecondary} hover:text-rose-500 ${isDark ? "hover:bg-rose-900/20 hover:border-rose-700" : "hover:bg-rose-50 hover:border-rose-200"} transition-all font-medium text-sm`}
        >
          <RefreshCw size={16} /> 新建项目
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div
          className={`flex justify-between items-center ${cardBg} p-4 rounded-2xl border ${borderColor} shadow-sm`}
        >
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
              className={`p-2 ${hoverBg} rounded-lg ${textSecondary} transition-colors disabled:opacity-30`}
              disabled={previewIndex === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <span
              className={`px-4 py-1 ${isDark ? "bg-slate-800" : "bg-slate-100"} rounded-lg font-mono ${textSecondary} text-sm font-medium`}
            >
              {previewIndex + 1} / {slides.length}
            </span>
            <button
              onClick={() =>
                setPreviewIndex(Math.min(slides.length - 1, previewIndex + 1))
              }
              className={`p-2 ${hoverBg} rounded-lg ${textSecondary} transition-colors disabled:opacity-30`}
              disabled={previewIndex === slides.length - 1}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => regenerateSlideImage(previewIndex)}
              disabled={activeSlide.status === "generating"}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                activeSlide.status === "generating"
                  ? `opacity-50 cursor-wait ${isDark ? "bg-slate-800 border-slate-700 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"}`
                  : `${btnBg} ${btnHover}`
              }`}
            >
              {activeSlide.status === "generating" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}{" "}
              重新生成
            </button>
            <div
              className={`h-8 w-px ${isDark ? "bg-slate-700" : "bg-slate-200"} mx-2`}
            ></div>
            <button
              onClick={handleExport}
              disabled={stage === "exporting"}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
            >
              {stage === "exporting" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Download size={18} />
              )}{" "}
              导出 PPTX
            </button>
          </div>
        </div>

        <div
          className={`flex-1 ${previewBg} rounded-2xl border ${borderColor} overflow-hidden relative shadow-inner flex items-center justify-center p-12`}
        >
          <div
            className={`aspect-video w-full max-w-5xl ${cardBg} shadow-2xl rounded-lg overflow-hidden ring-1 ${isDark ? "ring-white/5" : "ring-black/5"} transition-transform duration-500`}
          >
            {activeSlide && (
              <SlideRenderer slide={activeSlide} imgSrc={currentImg} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
