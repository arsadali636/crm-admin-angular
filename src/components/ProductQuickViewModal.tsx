import React from "react";
import moment from "moment";
import { FiX, FiEye, FiEdit3, FiPackage } from "react-icons/fi";

interface ProductQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onViewFull: (product: any) => void;
  onEdit: (product: any) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  isOpen,
  onClose,
  product,
  onViewFull,
  onEdit,
}) => {
  if (!isOpen || !product) return null;

  const title = product.masterDetails?.name || product.name || "Unnamed Product";
  const sku = product.masterDetails?.skuCode || product.skuCode || product.sellerSku || "N/A";
  const seller = product.sellerDetails?.businessName || product.sellerName || "N/A";
  const category = product.categoryDetails?.name || product.categoryName || "Uncategorized";
  const mrp = product.mrp || product.masterDetails?.mrp;
  const minPrice = product.minPrice;
  const maxPrice = product.maxPrice;
  const minDiscount = product.minDiscount;
  const maxDiscount = product.maxDiscount;
  const inventory = product.availableInventory !== undefined ? product.availableInventory : product.stock;
  const status = product.status || "inactive";
  const isFeatured = !!product.isFeatured;
  const updatedAt = product.updatedAt ? moment(product.updatedAt).format("DD MMM YYYY") : "—";
  const image = product.media?.[0] || product.masterDetails?.media?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 z-10 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-blue-600 bg-blue-50 border border-blue-100/50 px-2.5 py-0.5 rounded-lg">
              Quick View
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-2xs font-extrabold border capitalize tracking-wider ${
                status === "active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {status}
            </span>
            {isFeatured && (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg text-3xs font-extrabold uppercase">
                Featured
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          {/* Thumbnail */}
          <div className="sm:col-span-5 h-44 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center relative">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-contain p-2" />
            ) : (
              <div className="flex flex-col items-center text-slate-300">
                <FiPackage size={36} />
                <span className="text-3xs font-semibold mt-1">No Image Available</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="sm:col-span-7 space-y-3">
            <div>
              <h3 className="text-base font-black text-slate-800 leading-snug line-clamp-2">
                {title}
              </h3>
              <p className="text-2xs text-slate-400 font-medium mt-0.5">
                SKU: <span className="font-mono font-bold text-slate-700">{sku}</span>
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Seller:</span>
                <span className="font-bold text-slate-800 truncate max-w-[150px]">{seller}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Category:</span>
                <span className="font-bold text-slate-800 truncate max-w-[150px]">{category}</span>
              </div>

              {mrp !== undefined && mrp !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">MRP:</span>
                  <span className="font-bold text-slate-800">₹{mrp}</span>
                </div>
              )}

              {minPrice !== undefined && maxPrice !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Lot Price Range:</span>
                  <span className="font-bold text-emerald-600">₹{minPrice} – ₹{maxPrice}</span>
                </div>
              )}

              {minDiscount !== undefined && maxDiscount !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Discount Range:</span>
                  <span className="font-bold text-blue-600">{minDiscount}% – {maxDiscount}%</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Available Inventory:</span>
                <span className="font-bold text-slate-800">{inventory !== undefined ? inventory : "—"}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Updated Date:</span>
                <span className="font-semibold text-slate-700">{updatedAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
          >
            <FiEdit3 size={14} />
            <span>Edit Product</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onViewFull(product);
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
          >
            <FiEye size={14} />
            <span>View Full Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};
