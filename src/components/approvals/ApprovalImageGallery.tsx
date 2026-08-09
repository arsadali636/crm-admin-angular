import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiMaximize, FiX, FiDownload } from "react-icons/fi";

interface ApprovalImageGalleryProps {
  media: string[];
  title?: string;
}

export const ApprovalImageGallery: React.FC<ApprovalImageGalleryProps> = ({
  media,
  title = "Product Image Gallery",
}) => {
  const mediaList = media && media.length > 0 ? media.filter(Boolean) : [];
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [lightboxActive, setLightboxActive] = useState(false);

  if (mediaList.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  const currentImage = mediaList[activeIndex];

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = currentImage;
    link.download = `media_asset_${activeIndex + 1}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold text-slate-800 tracking-tight">{title}</h3>
        <span className="text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
          Image {activeIndex + 1} of {mediaList.length}
        </span>
      </div>

      {/* Main Image Container */}
      <div className="relative group aspect-square overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
        {activeIndex === 0 && (
          <span className="absolute top-3 left-3 z-10 bg-indigo-650 text-white font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs">
            Primary
          </span>
        )}

        <img
          src={currentImage}
          alt={`Gallery View ${activeIndex + 1}`}
          loading="lazy"
          className={`h-full w-full object-contain select-none transition-transform duration-300 ${
            zoomActive ? "scale-175 cursor-zoom-out" : "scale-100 cursor-zoom-in"
          }`}
          onClick={() => setZoomActive(!zoomActive)}
        />

        {/* Floating Icons */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setLightboxActive(true)}
            title="Fullscreen Preview"
            className="h-8 w-8 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg shadow-2xs transition cursor-pointer flex items-center justify-center"
          >
            <FiMaximize size={13} />
          </button>
          <button
            onClick={() => setZoomActive(!zoomActive)}
            title={zoomActive ? "Zoom Out" : "Zoom In"}
            className="h-8 w-8 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg shadow-2xs transition cursor-pointer flex items-center justify-center"
          >
            {zoomActive ? <FiZoomOut size={13} /> : <FiZoomIn size={13} />}
          </button>
          <button
            onClick={handleDownload}
            title="Download Image"
            className="h-8 w-8 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg shadow-2xs transition cursor-pointer flex items-center justify-center"
          >
            <FiDownload size={13} />
          </button>
        </div>

        {/* Navigation buttons */}
        {mediaList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-205 cursor-pointer flex items-center justify-center"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-205 cursor-pointer flex items-center justify-center"
            >
              <FiChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Slider */}
      {mediaList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {mediaList.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveIndex(idx);
                setZoomActive(false);
              }}
              className={`relative flex-shrink-0 h-12 w-12 overflow-hidden rounded-lg border bg-slate-50 transition cursor-pointer ${
                activeIndex === idx ? "border-indigo-650 scale-95" : "border-slate-150 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={imgUrl} className="h-full w-full object-contain" alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Modal */}
      {lightboxActive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <button
            onClick={() => setLightboxActive(false)}
            className="absolute top-5 right-5 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition cursor-pointer"
          >
            <FiX size={20} />
          </button>

          {mediaList.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-white hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 rounded-full transition cursor-pointer"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-white hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 rounded-full transition cursor-pointer"
              >
                <FiChevronRight size={24} />
              </button>
            </>
          )}

          <div className="max-w-[85vw] max-h-[85vh] flex flex-col items-center gap-4">
            <img
              src={currentImage}
              alt="Fullscreen View"
              className="max-w-full max-h-[75vh] object-contain select-none animate-in zoom-in-95 duration-200"
            />
            <div className="text-white/80 font-bold text-xs tracking-wider uppercase">
              Image {activeIndex + 1} of {mediaList.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalImageGallery;
