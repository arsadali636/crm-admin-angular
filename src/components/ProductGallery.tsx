import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiMaximize, FiDownload, FiX, FiImage } from "react-icons/fi";

interface ProductGalleryProps {
  media: string[];
  masterMedia?: string[];
  expiryProof?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ media, masterMedia = [], expiryProof }) => {
  // Combine all available images into a categorized media list
  const galleryItems: { url: string; category: "Primary" | "Gallery" | "Master" | "Expiry Proof" }[] = [];

  const visited = new Set();

  if (media && media.length > 0) {
    media.forEach((url, idx) => {
      if (url && typeof url === "string" && !visited.has(url)) {
        visited.add(url);
        galleryItems.push({
          url,
          category: idx === 0 ? "Primary" : "Gallery",
        });
      }
    });
  }

  if (masterMedia && masterMedia.length > 0) {
    masterMedia.forEach((url) => {
      if (url && typeof url === "string" && !visited.has(url)) {
        visited.add(url);
        galleryItems.push({
          url,
          category: "Master",
        });
      }
    });
  }

  if (expiryProof && typeof expiryProof === "string" && !visited.has(expiryProof)) {
    visited.add(expiryProof);
    galleryItems.push({
      url: expiryProof,
      category: "Expiry Proof",
    });
  }

  // Fallback placeholder
  if (galleryItems.length === 0) {
    galleryItems.push({
      url: "/placeholder-product.png",
      category: "Primary",
    });
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [lightboxActive, setLightboxActive] = useState(false);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1));
  };

  const currentItem = galleryItems[activeIndex] || galleryItems[0];

  const categoryBadgeColors = {
    Primary: "bg-indigo-600 text-white",
    Gallery: "bg-blue-600 text-white",
    Master: "bg-purple-600 text-white",
    "Expiry Proof": "bg-amber-600 text-white",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
          <h3 className="text-sm font-bold text-slate-800">Enterprise Media & Product Asset Gallery</h3>
        </div>
        <span className="text-xs text-indigo-700 font-extrabold bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
          <FiImage size={13} />
          {activeIndex + 1} of {galleryItems.length} Assets
        </span>
      </div>

      {/* Main Image Container */}
      <div className="relative group aspect-video sm:aspect-square overflow-hidden rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center">
        {/* Asset Category Badge */}
        <span className={`absolute top-3 left-3 z-10 font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs ${categoryBadgeColors[currentItem.category]}`}>
          {currentItem.category} Asset
        </span>

        {/* Display Image */}
        <img
          src={currentItem.url}
          alt={`Product Media ${activeIndex + 1}`}
          loading="lazy"
          className={`h-full w-full object-contain select-none transition-transform duration-300 ${
            zoomActive ? "scale-175 cursor-zoom-out" : "scale-100 cursor-zoom-in"
          }`}
          onClick={() => setZoomActive(!zoomActive)}
        />

        {/* Floating Controls Overlay */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={() => setLightboxActive(true)}
            title="Fullscreen Lightbox"
            className="p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center"
          >
            <FiMaximize size={15} />
          </button>

          <a
            href={currentItem.url}
            target="_blank"
            rel="noreferrer"
            download
            title="Download Original Asset"
            className="p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center"
          >
            <FiDownload size={15} />
          </a>

          <button
            onClick={() => setZoomActive(!zoomActive)}
            title={zoomActive ? "Zoom Out" : "Zoom In"}
            className="p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center"
          >
            {zoomActive ? <FiZoomOut size={15} /> : <FiZoomIn size={15} />}
          </button>
        </div>

        {/* Prev / Next controls */}
        {galleryItems.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer z-10"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer z-10"
            >
              <FiChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {galleryItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {galleryItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveIndex(idx);
                setZoomActive(false);
              }}
              className={`relative h-16 w-16 flex-shrink-0 rounded-xl border-2 overflow-hidden transition cursor-pointer bg-slate-50 ${
                idx === activeIndex
                  ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                  : "border-slate-200 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={item.url} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
              <span className={`absolute bottom-0 inset-x-0 text-[8px] font-extrabold uppercase py-0.2 text-center truncate ${categoryBadgeColors[item.category]}`}>
                {item.category.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxActive && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxActive(false)}
        >
          <div className="relative max-w-4xl w-full bg-white rounded-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded ${categoryBadgeColors[currentItem.category]}`}>
                {currentItem.category} Media Fullscreen
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={currentItem.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <FiDownload size={13} /> Download
                </a>
                <button onClick={() => setLightboxActive(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg">
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="max-h-[80vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-xl p-3">
              <img src={currentItem.url} alt="Lightbox Full View" className="max-h-[75vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
