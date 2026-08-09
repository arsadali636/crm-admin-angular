import React, { useState } from "react";
import { FiGrid, FiChevronDown, FiFolder, FiTag, FiCopy, FiCheckCircle, FiLayers } from "react-icons/fi";

interface MasterProductCategoryCardProps {
  product: any;
}

export const MasterProductCategoryCard: React.FC<MasterProductCategoryCardProps> = ({ product }) => {
  const master = product.masterDetails || {};
  const [copied, setCopied] = useState(false);

  // Category Details: 1.Category Main -> 2.Sub-Category (Fresh Fruits) -> 3.Product Sub-Category (Vegetable & Fruits)
  const cat = product.categoryDetails || master.categoryId || {};
  const subCat = product.subCategoryDetails || product.subCategory || master.subCategory || {}; // Fresh Fruits
  const prodSubCat = product.productCategoryDetails || product.productCategory || {}; // Vegetable & Fruits

  const catName = cat.name || product.categoryName;
  const subCatName = subCat.name || (typeof subCat === "string" ? subCat : undefined);
  const prodSubCatName = prodSubCat.name || (typeof prodSubCat === "string" ? prodSubCat : undefined);

  // Master product info
  const masterTitle = master.name || product.productName || product.name;
  const masterSku = master.skuCode || product.skuCode;
  const masterSize = master.size || product.size;
  const masterMrp = master.mrp || product.mrp;
  const masterBrand = master.brand || product.brandName || product.brand;
  const masterDescription = master.description || product.description;

  const masterImage = (master.media && master.media[0]) || master.image || (product.media && product.media[0]) || "/placeholder-product.png";

  const handleCopySku = () => {
    if (masterSku) {
      navigator.clipboard.writeText(masterSku);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // If no category and no master product info, return null
  if (!catName && !subCatName && !prodSubCatName && !masterTitle) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Main Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-full bg-violet-600 shadow-xs" />
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            Master Product Reference & Category Classification
          </h2>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100 flex items-center gap-1">
          <FiLayers size={12} /> Complete Catalog Flow
        </span>
      </div>

      {/* ── 1. MASTER PRODUCT DETAILS BLOCK ── */}
      {masterTitle && (
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-150 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FiCheckCircle size={13} className="text-emerald-600" /> Linked Master Product Catalog Reference
            </span>
            <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
              Master Catalog
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Master Image */}
            <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-white border border-slate-200 p-1 overflow-hidden">
              <img src={masterImage} alt={masterTitle} className="h-full w-full object-contain" />
            </div>

            {/* Master Key Attributes */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Master Product Title</span>
                <h3 className="text-xs font-black text-slate-900 truncate">{masterTitle}</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {masterSku && (
                  <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Master SKU</span>
                    <span className="font-mono font-bold text-slate-900 flex items-center gap-1 mt-0.5 text-2xs">
                      {masterSku}
                      <button onClick={handleCopySku} className="text-slate-400 hover:text-indigo-600 cursor-pointer" title="Copy SKU">
                        {copied ? <span className="text-[9px] text-emerald-600">Copied</span> : <FiCopy size={11} />}
                      </button>
                    </span>
                  </div>
                )}

                {masterSize && (
                  <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Size / Pack</span>
                    <span className="font-bold text-slate-900 block mt-0.5 text-xs">{masterSize}</span>
                  </div>
                )}

                {masterMrp !== undefined && masterMrp !== null && (
                  <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Master MRP</span>
                    <span className="font-extrabold text-slate-900 block mt-0.5 text-xs">₹{masterMrp}</span>
                  </div>
                )}

                {masterBrand && (
                  <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Brand</span>
                    <span className="font-semibold text-slate-800 block mt-0.5 text-xs">{masterBrand}</span>
                  </div>
                )}
              </div>

              {masterDescription && (
                <div className="pt-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Master Description</span>
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed font-medium line-clamp-2">
                    {masterDescription}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 2. VISUAL 3-LEVEL CATEGORY HIERARCHY FLOW ── */}
      {(catName || subCatName || prodSubCatName) && (
        <div className="space-y-3 pt-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
            Category Classification Sequence & Navigation Tree
          </span>

          <div className="space-y-3">
            {/* Level 1: Category Main */}
            {catName && (
              <div className="flex items-center gap-3.5 p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl transition hover:border-indigo-200">
                <div className="h-11 w-11 flex-shrink-0 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs overflow-hidden">
                  {cat.media || cat.image ? (
                    <img src={cat.media || cat.image} alt={catName} className="h-full w-full object-cover" />
                  ) : (
                    <FiFolder size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-600 block">Category Main</span>
                    <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Category Main</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 truncate mt-0.5">{catName}</h3>
                  {cat.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{cat.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Arrow Connector */}
            {catName && (subCatName || prodSubCatName) && (
              <div className="flex items-center justify-start pl-6 text-slate-300">
                <FiChevronDown size={18} className="animate-bounce" />
              </div>
            )}

            {/* Level 2: Product Category (Fresh Fruits) */}
            {subCatName && (
              <div className="flex items-center gap-3.5 p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl transition hover:border-purple-200 ml-4">
                <div className="h-11 w-11 flex-shrink-0 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-base shadow-xs overflow-hidden">
                  {subCat.media || subCat.image ? (
                    <img src={subCat.media || subCat.image} alt={subCatName} className="h-full w-full object-cover" />
                  ) : (
                    <FiGrid size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-600 block">Product Category</span>
                    <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Product Category</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 truncate mt-0.5">{subCatName}</h3>
                  {subCat.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{subCat.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Arrow Connector */}
            {subCatName && prodSubCatName && (
              <div className="flex items-center justify-start pl-10 text-slate-300">
                <FiChevronDown size={18} className="animate-bounce" />
              </div>
            )}

            {/* Level 3: Sub-Category (Vegetable & Fruits) */}
            {prodSubCatName && (
              <div className="flex items-center gap-3.5 p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl transition hover:border-blue-200 ml-8">
                <div className="h-11 w-11 flex-shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs overflow-hidden">
                  {prodSubCat.media || prodSubCat.image ? (
                    <img src={prodSubCat.media || prodSubCat.image} alt={prodSubCatName} className="h-full w-full object-cover" />
                  ) : (
                    <FiTag size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600 block">Sub-Category</span>
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Sub-Category</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 truncate mt-0.5">{prodSubCatName}</h3>
                  {prodSubCat.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{prodSubCat.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterProductCategoryCard;
