import React from "react";
import { FiAlignLeft, FiFileText } from "react-icons/fi";

interface ProductDescriptionCardProps {
  product: any;
}

export const ProductDescriptionCard: React.FC<ProductDescriptionCardProps> = ({ product }) => {
  const master = product.masterDetails || {};
  
  const sellerDesc = product.description || product.sellerDescription || product.productDescription;
  const masterDesc = master.description || master.productDescription;

  // Dynamically hide if no description at all
  if (!sellerDesc && !masterDesc) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
        Product Description & Catalog Details
      </h2>

      <div className={`grid grid-cols-1 ${sellerDesc && masterDesc ? "md:grid-cols-2" : ""} gap-6`}>
        {/* Seller Submitted Description */}
        {sellerDesc && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md inline-flex items-center gap-1 border border-indigo-100">
              <FiAlignLeft size={12} />
              Seller Submitted Description
            </span>
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-150 text-xs font-medium text-slate-750 leading-relaxed min-h-[100px] whitespace-pre-line">
              {sellerDesc}
            </div>
          </div>
        )}

        {/* Master Catalog Description */}
        {masterDesc && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md inline-flex items-center gap-1 border border-purple-100">
              <FiFileText size={12} />
              Master Catalog Official Description
            </span>
            <div className="p-4 bg-purple-50/20 rounded-xl border border-purple-100 text-xs font-medium text-slate-750 leading-relaxed min-h-[100px] whitespace-pre-line">
              {masterDesc}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescriptionCard;
