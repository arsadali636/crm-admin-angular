import React from "react";
import { FiGrid, FiChevronDown, FiFolder, FiTag } from "react-icons/fi";

interface CategoryHierarchyCardProps {
  product: any;
}

export const CategoryHierarchyCard: React.FC<CategoryHierarchyCardProps> = ({ product }) => {
  const master = product.masterDetails || {};
  
  // Category Details
  const cat = product.categoryDetails || master.categoryId || {};
  const prodCat = product.productCategoryDetails || product.productCategory || {};
  const subCat = product.subCategoryDetails || product.subCategory || master.subCategory || {};

  const catName = cat.name || product.categoryName;
  const prodCatName = prodCat.name || (typeof prodCat === "string" ? prodCat : undefined);
  const subCatName = subCat.name || (typeof subCat === "string" ? subCat : undefined);

  // If no category info is available, return null to dynamically hide empty section
  if (!catName && !prodCatName && !subCatName) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
          Category Hierarchy & Navigation
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
          Visual Tree
        </span>
      </h2>

      {/* Visual Hierarchy Flow */}
      <div className="space-y-3 pt-1">
        {/* Level 1: Primary Category */}
        {catName && (
          <div className="flex items-center gap-3.5 p-3.5 bg-indigo-50/40 border border-indigo-100/80 rounded-xl transition hover:border-indigo-200">
            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs overflow-hidden">
              {cat.media || cat.image ? (
                <img src={cat.media || cat.image} alt={catName} className="h-full w-full object-cover" />
              ) : (
                <FiFolder size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-600 block">Level 1 • Main Category</span>
              <h3 className="text-xs font-bold text-slate-900 truncate">{catName}</h3>
              {cat.description && (
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{cat.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Arrow Connector */}
        {catName && (prodCatName || subCatName) && (
          <div className="flex items-center justify-start pl-6 text-slate-300">
            <FiChevronDown size={18} className="animate-bounce" />
          </div>
        )}

        {/* Level 2: Product Category */}
        {prodCatName && (
          <div className="flex items-center gap-3.5 p-3.5 bg-purple-50/40 border border-purple-100/80 rounded-xl transition hover:border-purple-200 ml-4">
            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-base shadow-xs overflow-hidden">
              {prodCat.media || prodCat.image ? (
                <img src={prodCat.media || prodCat.image} alt={prodCatName} className="h-full w-full object-cover" />
              ) : (
                <FiGrid size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-600 block">Level 2 • Product Category</span>
              <h3 className="text-xs font-bold text-slate-900 truncate">{prodCatName}</h3>
              {prodCat.description && (
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{prodCat.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Arrow Connector */}
        {prodCatName && subCatName && (
          <div className="flex items-center justify-start pl-10 text-slate-300">
            <FiChevronDown size={18} className="animate-bounce" />
          </div>
        )}

        {/* Level 3: Sub Category */}
        {subCatName && (
          <div className="flex items-center gap-3.5 p-3.5 bg-blue-50/40 border border-blue-100/80 rounded-xl transition hover:border-blue-200 ml-8">
            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs overflow-hidden">
              {subCat.media || subCat.image ? (
                <img src={subCat.media || subCat.image} alt={subCatName} className="h-full w-full object-cover" />
              ) : (
                <FiTag size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600 block">Level 3 • Sub Category</span>
              <h3 className="text-xs font-bold text-slate-900 truncate">{subCatName}</h3>
              {subCat.description && (
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{subCat.description}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryHierarchyCard;
