import React from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Props {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (idx: number) => void;
}

export const ProductImageLightboxModal: React.FC<Props> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
}) => {
  if (!isOpen || !images || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((currentIndex + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full p-4 overflow-hidden shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-800">
            Product Media ({currentIndex + 1} of {images.length})
          </h4>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className="relative flex items-center justify-center min-h-[300px] max-h-[500px] bg-slate-50 rounded-xl overflow-hidden">
          <img
            src={currentImg}
            alt="Product"
            className="max-h-[480px] max-w-full object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 p-2.5 rounded-full bg-white/90 shadow-md text-slate-700 hover:bg-white transition cursor-pointer"
              >
                <FaChevronLeft size={14} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 p-2.5 rounded-full bg-white/90 shadow-md text-slate-700 hover:bg-white transition cursor-pointer"
              >
                <FaChevronRight size={14} />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onSelectIndex(idx)}
                className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition cursor-pointer ${
                  idx === currentIndex ? "border-blue-600 scale-105" : "border-slate-200 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
