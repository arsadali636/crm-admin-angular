import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { httpClient } from "../services/ApiService";
import { getCompleteUrlV1, uploadImage } from "../utils";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { FiLock, FiPackage, FiPercent, FiGrid, FiCalendar, FiShield, FiTag } from "react-icons/fi";

interface FormValues {
  description: string;
  minPrice: number;
  maxPrice: number;
  minDiscount: number;
  maxDiscount: number;
  mrp: number;
  status: string;
  mfg: string;
  expiry: string;
  promoterCommission: number;
  connectorCommission: number;
  platformFee: number;
  isFeatured: boolean;
  availableInventory: number;
}

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  product: any;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  setRefreshTrigger,
  product,
}) => {
  const [loader, setLoader] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Media and Lot list states
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lots, setLots] = useState<{ quantity: number; price: number; originalPrice: number; _id?: string }[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onChange",
  });

  // Pre-fill form
  useEffect(() => {
    if (product) {
      reset({
        description: product.description || "",
        minPrice: product.minPrice || 0,
        maxPrice: product.maxPrice || 0,
        minDiscount: product.minDiscount || 0,
        maxDiscount: product.maxDiscount || 0,
        mrp: product.mrp || 0,
        status: product.status || "active",
        mfg: product.mfg ? new Date(product.mfg).toISOString().split("T")[0] : "",
        expiry: product.expiry ? new Date(product.expiry).toISOString().split("T")[0] : "",
        promoterCommission: product.promoterCommission || 0,
        connectorCommission: product.connectorCommission || 0,
        platformFee: product.platformFee || 0,
        isFeatured: !!product.isFeatured,
        availableInventory: product.availableInventory !== undefined ? product.availableInventory : product.stock || 0,
      });
      setMediaUrls(product.media || []);
      setLots(product.lot || []);
      setImageFile(null);
      setImagePreview(null);
    }
  }, [product, reset, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddLot = () => {
    setLots((prev) => [...prev, { quantity: 0, price: 0, originalPrice: 0 }]);
  };

  const handleRemoveLot = (index: number) => {
    setLots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLotChange = (index: number, field: "quantity" | "price" | "originalPrice", value: number) => {
    setLots((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setLoader(true);
      setGeneralError(null);

      let updatedMedia = [...mediaUrls];
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          updatedMedia = [uploadedUrl, ...updatedMedia];
        }
      }

      const payload = {
        description: data.description,
        minPrice: Number(data.minPrice),
        maxPrice: Number(data.maxPrice),
        minDiscount: Number(data.minDiscount),
        maxDiscount: Number(data.maxDiscount),
        mrp: Number(data.mrp),
        status: data.status,
        mfg: data.mfg ? new Date(data.mfg).toISOString() : undefined,
        expiry: data.expiry ? new Date(data.expiry).toISOString() : undefined,
        promoterCommission: Number(data.promoterCommission),
        connectorCommission: Number(data.connectorCommission),
        platformFee: Number(data.platformFee),
        isFeatured: data.isFeatured,
        availableInventory: Number(data.availableInventory),
        media: updatedMedia,
        lot: lots.map((l) => ({
          quantity: Number(l.quantity),
          price: Number(l.price),
          originalPrice: Number(l.originalPrice),
          _id: l._id,
        })),
      };

      const response = await httpClient.put(getCompleteUrlV1("product"), {
        id: product._id || product.id,
        ...payload,
      });

      if (response.ok) {
        setRefreshTrigger((prev) => !prev);
        onClose();
      } else {
        const errText = await response.text();
        console.error("Failed to update product", errText);
        setGeneralError("Failed to save product. Please verify fields and try again.");
      }
    } catch (error: any) {
      console.error("Error submitting product:", error);
      setGeneralError(error?.message || "An unexpected error occurred.");
    } finally {
      setLoader(false);
    }
  };

  if (!isOpen || !product) return null;

  const inputClass =
    "w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  const labelClass = "block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1";

  const readOnlyInputClass =
    "w-full px-3 py-2 rounded-xl border border-slate-200/60 bg-slate-100/60 text-slate-500 text-xs font-mono select-none cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden transform transition-all border border-slate-100 flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-black text-slate-800 tracking-tight">
              Edit Product Listing
            </h2>
            <p className="text-2xs text-slate-400 font-medium mt-0.5">
              Modify properties for <span className="font-semibold text-slate-600">{product.masterDetails?.name || product.name || "this product"}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
        >
          {generalError && (
            <div className="p-3.5 bg-red-50 border border-red-200/50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {generalError}
            </div>
          )}

          {/* Section 1: Product Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <FiPackage className="text-blue-500" />
              1. Product Information
            </h3>

            {/* Read-Only System Metadata Section (Requirement 23) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                <FiLock size={12} />
                Read-Only System Metadata
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Product ID</label>
                  <input readOnly value={product._id || product.id} className={readOnlyInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Master ID</label>
                  <input readOnly value={product.masterId || product.masterDetails?._id || "—"} className={readOnlyInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Seller ID</label>
                  <input readOnly value={product.sellerId || product.sellerDetails?._id || "—"} className={readOnlyInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Approved By</label>
                  <input readOnly value={product.approvedBy || "—"} className={readOnlyInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Approved At</label>
                  <input readOnly value={product.approvedAt ? new Date(product.approvedAt).toLocaleDateString() : "—"} className={readOnlyInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Created At</label>
                  <input readOnly value={product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "—"} className={readOnlyInputClass} />
                </div>
              </div>
            </div>

            {/* Editable Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={3}
                placeholder="Product summary description..."
                {...register("description", { required: "Description is required" })}
                className={`${inputClass} resize-none`}
              />
              {errors.description && (
                <p className="text-2xs font-medium text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Section 2: Product Media */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <FiTag className="text-blue-500" />
              2. Product Media
            </h3>

            <div className="flex flex-wrap gap-3 items-center">
              {mediaUrls.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden group shadow-2xs">
                  <img src={url} alt="product" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(idx)}
                    className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}

              {imagePreview && (
                <div className="relative w-20 h-20 rounded-xl border border-blue-200 overflow-hidden group ring-2 ring-blue-500/30 shadow-2xs">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              )}

              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-500 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-blue-500 bg-slate-50/50">
                <FaPlus size={14} />
                <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Upload</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Section 3: Commercial & Pricing */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <FiPercent className="text-blue-500" />
              3. Commercial Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Min Price (₹)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  {...register("minPrice", { required: "Min Price is required", min: 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Max Price (₹)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  {...register("maxPrice", { required: "Max Price is required", min: 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Standard MRP (₹)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  {...register("mrp", { required: "MRP is required", min: 0 })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Min Discount (%)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  {...register("minDiscount", { min: 0, max: 100 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Max Discount (%)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  {...register("maxDiscount", { min: 0, max: 100 })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Lot Pricing (Requirements 24 & 25) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FiGrid className="text-blue-500" />
                4. Lot Pricing Tiers
              </h3>

              <button
                type="button"
                onClick={handleAddLot}
                className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer border border-blue-100"
              >
                <FaPlus size={10} />
                <span>+ Add Lot</span>
              </button>
            </div>

            {lots.length > 0 ? (
              <div className="space-y-3">
                {lots.map((l, index) => {
                  const isBestValue = product.bestSellerLot && Number(l.quantity) === Number(product.bestSellerLot.quantity);

                  return (
                    <div
                      key={index}
                      className={`p-3.5 rounded-2xl border bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs ${
                        isBestValue ? "border-emerald-300 ring-2 ring-emerald-500/10" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-400">Tier #{index + 1}</span>
                        {isBestValue && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-3xs font-extrabold px-2 py-0.5 rounded-md uppercase">
                            BEST VALUE
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 flex-1 w-full sm:w-auto">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block">Quantity (Units)</label>
                          <input
                            type="number"
                            value={l.quantity}
                            onChange={(e) => handleLotChange(index, "quantity", Number(e.target.value))}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800"
                            placeholder="Qty"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block">Price (₹)</label>
                          <input
                            type="number"
                            step="any"
                            value={l.price}
                            onChange={(e) => handleLotChange(index, "price", Number(e.target.value))}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800"
                            placeholder="Price"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block">Original Price (₹)</label>
                          <input
                            type="number"
                            step="any"
                            value={l.originalPrice}
                            onChange={(e) => handleLotChange(index, "originalPrice", Number(e.target.value))}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800"
                            placeholder="Original Price"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveLot(index)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer self-end sm:self-center"
                        title="Remove Lot"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs bg-slate-50">
                No lots specified for this product listing.
              </div>
            )}
          </div>

          {/* Section 5: Inventory & Configuration */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <FiShield className="text-blue-500" />
              5. Inventory & Listing Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className={labelClass}>Product Status</label>
                <select {...register("status")} className={inputClass}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Available Inventory</label>
                <input
                  type="number"
                  placeholder="0"
                  {...register("availableInventory", { required: "Inventory is required", min: 0 })}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  id="isFeaturedEdit"
                  type="checkbox"
                  {...register("isFeatured")}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isFeaturedEdit" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Featured Product
                </label>
              </div>
            </div>
          </div>

          {/* Section 6: Manufacturing & Expiry */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <FiCalendar className="text-blue-500" />
              6. Manufacturing & Expiry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Manufacturing Date</label>
                <input type="date" {...register("mfg")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Expiry Date</label>
                <input type="date" {...register("expiry")} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Section 7: Commission & Fee Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <FiPercent className="text-blue-500" />
              7. Commission & Fee Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Promoter Comm. (%)</label>
                <input type="number" step="any" {...register("promoterCommission")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Connector Comm. (%)</label>
                <input type="number" step="any" {...register("connectorCommission")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Platform Fee (%)</label>
                <input type="number" step="any" {...register("platformFee")} className={inputClass} />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loader}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loader}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            {loader ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;
