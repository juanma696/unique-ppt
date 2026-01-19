import { Loader2, ImageIcon } from "lucide-react";
import { LAYOUTS } from "@/constants";

export function SlideRenderer({ slide, imgSrc }) {
  const Title = ({ className }) => (
    <h2 className={`font-bold leading-tight ${className}`}>{slide.title}</h2>
  );

  const Content = ({ className, bulletColor = "text-teal-500" }) => (
    <div className={`space-y-4 ${className}`}>
      {slide.content.map((p, i) => (
        <div key={i} className="flex gap-4">
          <span className={`${bulletColor} font-bold mt-1 text-lg`}>•</span>
          <p className="opacity-90 leading-relaxed font-light">{p}</p>
        </div>
      ))}
    </div>
  );

  const BgImage = ({ className = "" }) =>
    imgSrc ? (
      <img
        src={imgSrc}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
        alt="bg"
      />
    ) : (
      <div
        className={`absolute inset-0 bg-slate-100 flex items-center justify-center ${className}`}
      >
        {slide.status === "generating" ? (
          <div className="flex flex-col items-center gap-2 text-teal-500">
            <Loader2 className="w-12 h-12 animate-spin" />
            <span className="text-xs font-mono tracking-widest uppercase">
              Rendering...
            </span>
          </div>
        ) : (
          <ImageIcon className="text-slate-300 w-24 h-24 opacity-50" />
        )}
      </div>
    );

  const layouts = {
    [LAYOUTS.COVER.id]: (
      <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-16 overflow-hidden bg-slate-900">
        <BgImage className="opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="relative z-10 max-w-5xl animate-fade-in-up flex flex-col items-center">
          <span className="text-teal-400 font-mono tracking-[0.3em] text-sm uppercase mb-8 block bg-white/10 px-4 py-1 rounded-full backdrop-blur-sm border border-white/10">
            Presentation
          </span>
          <Title className="text-6xl md:text-7xl text-white drop-shadow-lg mb-12 tracking-tight" />
          <div className="h-1.5 w-32 bg-teal-500 rounded-full mb-10 shadow-[0_0_20px_rgba(20,184,166,0.5)]"></div>
          <Content
            className="text-2xl text-slate-100 font-light drop-shadow-md"
            bulletColor="text-teal-400"
          />
        </div>
      </div>
    ),
    [LAYOUTS.SPLIT_RIGHT.id]: (
      <div className="relative w-full h-full flex bg-white">
        <div className="w-1/2 h-full p-16 flex flex-col justify-center z-10 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-[100px] -z-10"></div>
          <Title className="text-5xl text-teal-800 mb-10 tracking-tight" />
          <Content className="text-xl text-slate-600" />
        </div>
        <div className="w-1/2 h-full relative p-4">
          <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl">
            <BgImage />
          </div>
        </div>
      </div>
    ),
    [LAYOUTS.SPLIT_LEFT.id]: (
      <div className="relative w-full h-full flex flex-row-reverse bg-white">
        <div className="w-1/2 h-full p-16 flex flex-col justify-center z-10 relative">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-50 rounded-tr-[100px] -z-10"></div>
          <Title className="text-5xl text-teal-800 mb-10 tracking-tight" />
          <Content className="text-xl text-slate-600" />
        </div>
        <div className="w-1/2 h-full relative p-4">
          <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl">
            <BgImage />
          </div>
        </div>
      </div>
    ),
    [LAYOUTS.GLASS.id]: (
      <div className="relative w-full h-full p-12 flex items-center justify-start">
        <BgImage />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
        <div className="relative z-10 w-5/12 bg-white/80 backdrop-blur-xl border border-white/40 p-10 rounded-3xl shadow-xl ml-8 ring-1 ring-black/5">
          <Title className="text-4xl text-slate-900 mb-8 border-b border-slate-200/50 pb-6" />
          <Content
            className="text-slate-700 text-lg"
            bulletColor="text-teal-500"
          />
        </div>
      </div>
    ),
    [LAYOUTS.MINIMAL.id]: (
      <div className="relative w-full h-full bg-white text-slate-900 flex p-16">
        <div className="flex-1 flex flex-col justify-center pr-16">
          <div className="w-12 h-1 bg-teal-500 mb-8"></div>
          <Title className="text-5xl text-slate-900 mb-10 font-black tracking-tighter" />
          <Content
            className="text-xl text-slate-500 font-normal"
            bulletColor="text-slate-900"
          />
        </div>
        <div className="w-5/12 relative h-full rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-slate-50">
          <BgImage />
        </div>
      </div>
    ),
  };

  return (
    <div className="w-full h-full overflow-hidden bg-white shadow-2xl relative select-none font-sans">
      {layouts[slide.layout || "cover"]}
    </div>
  );
}
