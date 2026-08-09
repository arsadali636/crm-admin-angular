import React from "react";
import { FiPercent, FiStar } from "react-icons/fi";

interface PriceCardProps {
  product: any;
}

export const PriceCard: React.FC<PriceCardProps> = ({ product }) => {
  const formatCurrency = (val: any) => {
    if (val === undefined || val === null || isNaN(Number(val))) return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(val));
  };

  const formatPercent = (val: any) => {
    if (val === undefined || val === null || isNaN(Number(val))) return null;
    return `${val}%`;
  };

  const bestLot = product.bestSellerLot || {};
  const mrpVal = product.mrp;
  const minPriceVal = product.minPrice || product.minimumPrice || product.sellingPrice;
  const maxPriceVal = product.maxPrice || product.maximumPrice || product.mrp;

  const minDiscountVal = product.minDiscount !== undefined ? product.minDiscount : product.discountPercentage;
  const maxDiscountVal = product.maxDiscount !== undefined ? product.maxDiscount : undefined;

  const promotionFeeVal = product.promotionFee;
  const platformFeeVal = product.platformFee;
  const connectorCommissionVal = product.connectorCommission;
  const promoterCommissionVal = product.promoterCommission;

  // Display grid items only for fields that have valid values
  const primaryPrices = [
    { label: "Maximum Retail Price (MRP)", value: formatCurrency(mrpVal), color: "bg-slate-50 text-slate-800 border-slate-200" },
    { label: "Minimum Selling Price", value: formatCurrency(minPriceVal), color: "bg-emerald-50 text-emerald-800 border-emerald-200 font-black" },
    { label: "Maximum Selling Price", value: formatCurrency(maxPriceVal), color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  ].filter(p => p.value !== null);

  const discounts = [
    { label: "Minimum Discount %", value: formatPercent(minDiscountVal) },
    { label: "Maximum Discount %", value: formatPercent(maxDiscountVal) },
  ].filter(d => d.value !== null);

  const commercialFees = [
    { label: "Platform Fee %", value: formatPercent(platformFeeVal), badge: "System" },
    { label: "Promotion Fee %", value: formatPercent(promotionFeeVal), badge: "Marketing" },
    { label: "Connector Commission %", value: formatPercent(connectorCommissionVal), badge: "Affiliate" },
    { label: "Promoter Commission %", value: formatPercent(promoterCommissionVal), badge: "Promoter" },
  ].filter(f => f.value !== null);

  // Best seller lot summary info
  const bestSellerPrice = bestLot.price ? formatCurrency(bestLot.price) : null;
  const bestSellerQty = bestLot.quantity ? `${bestLot.quantity} units` : null;
  const bestSellerDiscount = bestLot.discount !== undefined ? formatPercent(bestLot.discount) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Pricing & Commercial Dashboard
        </h2>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
          API Driven Structure
        </span>
      </div>

      {/* Primary Selling Price Tiles */}
      {primaryPrices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {primaryPrices.map((field, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${field.color}`}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-70 mb-1">
                {field.label}
              </span>
              <span className="text-lg font-black block truncate">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Commercial Commissions & Fee Breakdown */}
      {commercialFees.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Commercial Fees & Margin Rules
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {commercialFees.map((fee, idx) => (
              <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-150">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">{fee.label}</span>
                  <span className="text-[9px] font-extrabold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{fee.badge}</span>
                </div>
                <span className="text-sm font-extrabold text-slate-850 block">{fee.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discounts & Best Seller Lot Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {discounts.length > 0 && (
          <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block flex items-center gap-1">
              <FiPercent size={13} /> Tiered Discount Range
            </span>
            <div className="flex gap-4 text-xs">
              {discounts.map((d, idx) => (
                <div key={idx}>
                  <span className="text-[10px] text-slate-500 font-semibold block">{d.label}</span>
                  <span className="text-sm font-extrabold text-purple-800 block">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(bestSellerPrice || bestSellerQty) && (
          <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block flex items-center gap-1">
              <FiStar size={13} className="fill-amber-400 text-amber-500" /> Best Seller Configuration
            </span>
            <div className="flex gap-4 text-xs">
              {bestSellerPrice && (
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Best Seller Lot Price</span>
                  <span className="text-sm font-black text-slate-900 block">{bestSellerPrice}</span>
                </div>
              )}
              {bestSellerQty && (
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Lot Pack Size</span>
                  <span className="text-sm font-extrabold text-slate-800 block">{bestSellerQty}</span>
                </div>
              )}
              {bestSellerDiscount && (
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Config Discount</span>
                  <span className="text-sm font-extrabold text-indigo-700 block">{bestSellerDiscount} Off</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceCard;
