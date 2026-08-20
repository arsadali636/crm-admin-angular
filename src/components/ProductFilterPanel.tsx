import React, { useState, useEffect } from "react";
import { FiX, FiFilter, FiRotateCcw } from "react-icons/fi";

export interface ProductFilterState {
  status?: string;
  categoryId?: string;
  productCategoryId?: string;
  subCategoryId?: string;
  sellerId?: string;
  stockStatus?: string;
  isFeatured?: string;
  minPrice?: string;
  maxPrice?: string;
  minDiscount?: string;
  maxDiscount?: string;
  createdDate?: string;
  updatedDate?: string;
}

interface ProductFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  currentFilters: ProductFilterState;
  onApply: (filters: ProductFilterState) => void;
  onReset: () => void;
}

export const ProductFilterPanel: React.FC<ProductFilterPanelProps> = ({
  isOpen,
  onClose,
  categories,
  currentFilters,
  onApply,
  onReset,
}) => {
  const [filters, setFilters] = useState<ProductFilterState>(currentFilters);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof ProductFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    onReset();
    onClose();
  };

  const inputClass =
    "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  const labelClass = "block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto z-10 flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FiFilter size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Filter Products</h2>
              <p className="text-2xs text-slate-400 font-medium">Refine product listings view</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Filter Fields */}
        <div className="p-5 space-y-4 flex-1">
          {/* Status */}
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={filters.status || ""}
              onChange={(e) => handleChange("status", e.target.value)}
              className={inputClass}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={filters.categoryId || ""}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              className={inputClass}
            >
              <option value="">All Categories</option>
              {categories.map((c: any) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Category & Sub Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Product Category</label>
              <input
                type="text"
                placeholder="e.g. Vegetable & Fruits"
                value={filters.productCategoryId || ""}
                onChange={(e) => handleChange("productCategoryId", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sub Category</label>
              <input
                type="text"
                placeholder="e.g. Fresh Fruits"
                value={filters.subCategoryId || ""}
                onChange={(e) => handleChange("subCategoryId", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Seller & Stock Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Seller Name / ID</label>
              <input
                type="text"
                placeholder="Search seller..."
                value={filters.sellerId || ""}
                onChange={(e) => handleChange("sellerId", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Stock Status</label>
              <select
                value={filters.stockStatus || ""}
                onChange={(e) => handleChange("stockStatus", e.target.value)}
                className={inputClass}
              >
                <option value="">All Stock Levels</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock Warning</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Featured */}
          <div>
            <label className={labelClass}>Featured Status</label>
            <select
              value={filters.isFeatured || ""}
              onChange={(e) => handleChange("isFeatured", e.target.value)}
              className={inputClass}
            >
              <option value="">All Products</option>
              <option value="featured">Featured Only</option>
              <option value="not_featured">Not Featured</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className={labelClass}>Price Range (₹)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice || ""}
                onChange={(e) => handleChange("minPrice", e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice || ""}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Discount Range */}
          <div>
            <label className={labelClass}>Discount Range (%)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Discount %"
                value={filters.minDiscount || ""}
                onChange={(e) => handleChange("minDiscount", e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Max Discount %"
                value={filters.maxDiscount || ""}
                onChange={(e) => handleChange("maxDiscount", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Created Date</label>
              <input
                type="date"
                value={filters.createdDate || ""}
                onChange={(e) => handleChange("createdDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Updated Date</label>
              <input
                type="date"
                value={filters.updatedDate || ""}
                onChange={(e) => handleChange("updatedDate", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 sticky bottom-0 flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FiRotateCcw size={13} />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
