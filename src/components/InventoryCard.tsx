import React from "react";
import { FiGrid, FiCheckCircle, FiAlertCircle, FiXCircle } from "react-icons/fi";

interface InventoryCardProps {
  product: any;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ product }) => {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "bg-rose-50 text-rose-700 border-rose-100", icon: <FiXCircle /> };
    if (stock < 5) return { label: "Low Stock Warning", color: "bg-amber-50 text-amber-700 border-amber-100", icon: <FiAlertCircle /> };
    return { label: "Active / In Stock", color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <FiCheckCircle /> };
  };

  const getVal = (val: any) => {
    if (val === undefined || val === null || val === "") return "Not Available";
    return val;
  };

  const totalStockVal = product.stock !== undefined ? product.stock : product.currentStock;
  const availableStockVal = product.availableStock !== undefined ? product.availableStock : product.availableInventory;
  const reservedStockVal = product.reservedStock;
  const soldStockVal = product.soldStock !== undefined ? product.soldStock : product.totalSale;

  const stockNumber = Number(totalStockVal) || 0;
  const status = product.stockStatus ? { label: product.stockStatus, color: "bg-slate-100 text-slate-700 border-slate-200", icon: <FiGrid /> } : getStockStatus(stockNumber);

  const warehouseVal = product.warehouse || product.warehouseName || product.warehouseLocation;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <h2 className="text-md font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        Inventory & Stock Levels
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-5">
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Current/Total Stock</span>
          <span className="text-sm font-extrabold text-slate-800 block">
            {totalStockVal !== undefined ? `${totalStockVal} lots` : "Not Available"}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Available Stock</span>
          <span className="text-sm font-extrabold text-slate-800 block">
            {availableStockVal !== undefined ? `${availableStockVal} lots` : "Not Available"}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Reserved Stock</span>
          <span className="text-sm font-extrabold text-slate-800 block">
            {reservedStockVal !== undefined ? `${reservedStockVal} lots` : "Not Available"}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Sold Stock</span>
          <span className="text-sm font-extrabold text-slate-800 block">
            {soldStockVal !== undefined ? `${soldStockVal} lots` : "Not Available"}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Warehouse</span>
          <span className="text-sm font-semibold text-slate-700 block truncate" title={String(getVal(warehouseVal))}>
            {getVal(warehouseVal)}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">Live Inventory Status</span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border ${status.color}`}>
          {status.icon}
          {status.label}
        </span>
      </div>
    </div>
  );
};

export default InventoryCard;
