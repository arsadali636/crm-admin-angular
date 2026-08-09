import React from "react";
import { FiBox, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

interface InventoryCardProps {
  product: any;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ product }) => {
  const stockVal = Number(
    product.availableInventory !== undefined
      ? product.availableInventory
      : product.stock !== undefined
      ? product.stock
      : product.availableLots !== undefined
      ? product.availableLots
      : 0
  );

  const isInStock = stockVal > 0;
  const stockPercent = Math.min(100, Math.max(5, (stockVal / 100) * 100));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Inventory & Stock Management
        </h2>
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
            isInStock
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {isInStock ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
          {isInStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Quantity */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-150 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isInStock ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
            <FiBox size={20} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Available Inventory</span>
            <span className="text-lg font-black text-slate-900 block">{stockVal} Units</span>
          </div>
        </div>

        {/* Stock Status Bar Indicator */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-150 sm:col-span-2 space-y-2 flex flex-col justify-center">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Inventory Health Status</span>
            <span className={isInStock ? "text-emerald-700" : "text-rose-600"}>
              {isInStock ? (stockVal > 10 ? "Optimal Stock Level" : "Low Stock Alert") : "Replenishment Required"}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                !isInStock
                  ? "bg-rose-500"
                  : stockVal < 10
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${stockPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryCard;
