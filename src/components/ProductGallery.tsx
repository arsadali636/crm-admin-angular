import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiMaximize, FiX } from "react-icons/fi";

interface ProductGalleryProps {
  media: string[];
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ media }) => {
  const mediaList = media && media.length > 0 ? media : ["/placeholder-product.png"];
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [lightboxActive, setLightboxActive] = useState(false);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  const currentImage = mediaList[activeIndex];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-slate-800">Product Image Gallery</h3>
        <span className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
          Image {activeIndex + 1} of {mediaList.length}
        </span>
      </div>

      {/* Main Image Container */}
      <div className="relative group aspect-square overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
        {/* Primary Image Badge */}
        {activeIndex === 0 && (
          <span className="absolute top-3 left-3 z-10 bg-indigo-600 text-white font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs">
            Primary Image
          </span>
        )}

        {/* Gallery Image */}
        <img
          src={currentImage}
          alt={`Product View ${activeIndex + 1}`}
          loading="lazy"
          className={`h-full w-full object-contain select-none transition-transform duration-300 ${
            zoomActive ? "scale-175 cursor-zoom-out" : "scale-100 cursor-zoom-in"
          }`}
          onClick={() => setZoomActive(!zoomActive)}
        />

        {/* Floating Icons */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setLightboxActive(true)}
            title="Fullscreen Preview"
            className="p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center"
          >
            <FiMaximize size={15} />
          </button>
          <button
            onClick={() => setZoomActive(!zoomActive)}
            title={zoomActive ? "Zoom Out" : "Zoom In"}
            className="p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center"
          >
            {zoomActive ? <FiZoomOut size={15} /> : <FiZoomIn size={15} />}
          </button>
        </div>

        {/* Left/Right controls (only show if multiple images) */}
        {mediaList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            >
              <FiChevronRight size={18} />
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
              className={`relative flex-shrink-0 h-16 w-16 overflow-hidden rounded-lg border-2 bg-slate-50 transition cursor-pointer ${
                activeIndex === idx ? "border-indigo-600 scale-95" : "border-slate-100 opacity-60 hover:opacity-100"
              }`}
            >
              {idx === 0 && (
                <span className="absolute top-0.5 left-0.5 bg-indigo-600 text-white text-[6px] font-bold px-1 rounded-sm">
                  PRI
                </span>
              )}
              <img src={imgUrl} className="h-full w-full object-contain" alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Modal */}
      {lightboxActive && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          {/* Close trigger */}
          <button
            onClick={() => setLightboxActive(false)}
            className="absolute top-5 right-5 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition cursor-pointer"
          >
            <FiX size={20} />
          </button>

          {/* Lightbox Controls */}
          {mediaList.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-white hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 rounded-full transition cursor-pointer"
              >
                <FiChevronLeft size={30} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-white hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 rounded-full transition cursor-pointer"
              >
                <FiChevronRight size={30} />
              </button>
            </>
          )}

          {/* Image */}
          <div className="max-w-[85vw] max-h-[85vh] flex flex-col items-center gap-4">
            <img
              src={currentImage}
              alt="Fullscreen Product View"
              className="max-w-full max-h-[75vh] object-contain select-none animate-in zoom-in-95 duration-200"
            />
            <div className="text-white/80 font-semibold text-xs tracking-wider">
              IMAGE {activeIndex + 1} OF {mediaList.length} {activeIndex === 0 && " | PRIMARY IMAGE"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
