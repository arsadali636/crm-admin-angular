import React, { useState } from "react";
import { httpClient } from "../services/ApiService";
import { getCompleteUrlV1 } from "../utils";
import { FiAlertTriangle, FiX } from "react-icons/fi";

interface ProductDeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onSuccess: () => void;
}

export const ProductDeactivateModal: React.FC<ProductDeactivateModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const currentStatus = product.status || "active";
  const isDeactivating = currentStatus === "active";
  const newStatus = isDeactivating ? "inactive" : "active";

  const handleToggleStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      // Reusing the established PUT /v1/product endpoint
      const res = await httpClient.put(getCompleteUrlV1("product"), {
        id: product._id || product.id,
        status: newStatus,
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const errText = await res.text().catch(() => "Failed to update status");
        setError(`Server returned status update error: ${errText || res.statusText}`);
      }
    } catch (err: any) {
      console.error("Error updating product status:", err);
      setError(err?.message || "Network error while updating status.");
    } finally {
      setLoading(false);
    }
  };

  const titleText = isDeactivating
    ? "Deactivate Product Listing?"
    : "Activate Product Listing?";

  const subtitleText = isDeactivating
    ? "This listing will no longer be available as an active product listing on Lottmart."
    : "This listing will be marked as active and visible to buyers on Lottmart.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 p-6 z-10 space-y-5 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <FiX size={16} />
        </button>

        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isDeactivating
                ? "bg-rose-50 text-rose-600 border border-rose-100"
                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
            }`}
          >
            <FiAlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">
              {titleText}
            </h3>
            <p className="text-2xs text-slate-400 font-medium mt-0.5">
              Target SKU:{" "}
              <span className="font-mono font-bold text-slate-600">
                {product.masterDetails?.skuCode || product.skuCode || product.sellerSku || "N/A"}
              </span>
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          {subtitleText}
        </p>

        {/* Product Snapshot Card */}
        <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-150">
          {product.media?.[0] || product.masterDetails?.media?.[0] ? (
            <img
              src={product.media?.[0] || product.masterDetails?.media?.[0]}
              alt="product"
              className="w-10 h-10 rounded-lg object-cover border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-200/60 flex items-center justify-center text-slate-400 font-bold text-xs">
              IMG
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-800 truncate">
              {product.masterDetails?.name || product.name || "Unnamed Product"}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium block">
              Seller: {product.sellerDetails?.businessName || product.sellerName || "N/A"}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={loading}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 ${
              isDeactivating
                ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
                : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
            }`}
          >
            {loading
              ? isDeactivating
                ? "Deactivating..."
                : "Activating..."
              : isDeactivating
              ? "Deactivate Listing"
              : "Activate Listing"}
          </button>
        </div>
      </div>
    </div>
  );
};
