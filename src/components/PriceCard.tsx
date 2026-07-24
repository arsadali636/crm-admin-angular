import React from "react";

interface PriceCardProps {
  product: any;
}

export const PriceCard: React.FC<PriceCardProps> = ({ product }) => {
  const formatCurrency = (val: any) => {
    if (val === undefined || val === null || isNaN(Number(val))) return "Not Available";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(val));
  };

  const formatPercent = (val: any) => {
    if (val === undefined || val === null || isNaN(Number(val))) return "Not Available";
    return `${val}%`;
  };

  // MRP and Selling Price
  const mrpVal = product.mrp;
  const sellingPriceVal = product.sellingPrice;

  // Calculations
  const lotSizeVal = product.lotSize || 1;
  const lotPriceVal = product.lotPrice || (sellingPriceVal !== undefined && sellingPriceVal !== null ? sellingPriceVal * lotSizeVal : null);

  const discountAmountVal = product.discountAmount || (mrpVal && sellingPriceVal ? mrpVal - sellingPriceVal : null);
  const discountPercentVal = product.discountPercentage || product.discount || (mrpVal && sellingPriceVal && mrpVal > 0 ? Math.round((discountAmountVal! / mrpVal) * 100) : null);

  const taxVal = product.tax || "Not Available";
  const gstVal = product.gst || product.gstPercentage || "Not Available";
  const platformFeeVal = product.platformFee || "Not Available";
  
  // Final Price
  let finalPriceVal = product.finalPrice;
  if (finalPriceVal === undefined || finalPriceVal === null) {
    if (sellingPriceVal !== undefined && sellingPriceVal !== null) {
      const fee = Number(platformFeeVal) || 0;
      finalPriceVal = sellingPriceVal + (sellingPriceVal * (fee / 100));
    } else {
      finalPriceVal = null;
    }
  }

  // Display grid cells for all fields
  const displayFields = [
    { label: "MRP", value: formatCurrency(mrpVal), highlight: false },
    { label: "Selling Price", value: formatCurrency(sellingPriceVal), highlight: true, color: "text-slate-800" },
    { label: "Lot Price (Units: " + lotSizeVal + ")", value: formatCurrency(lotPriceVal), highlight: true, color: "text-emerald-700 font-bold" },
    { label: "Discount %", value: discountPercentVal !== null ? formatPercent(discountPercentVal) : "Not Available", highlight: false },
    { label: "Discount Amount", value: formatCurrency(discountAmountVal), highlight: false },
    { label: "Tax", value: typeof taxVal === "number" ? formatPercent(taxVal) : taxVal, highlight: false },
    { label: "GST Rate", value: typeof gstVal === "number" ? formatPercent(gstVal) : gstVal, highlight: false },
    { label: "Platform Fee %", value: typeof platformFeeVal === "number" ? formatPercent(platformFeeVal) : platformFeeVal, highlight: false },
    { label: "Final Price (incl. fees)", value: formatCurrency(finalPriceVal), highlight: true, color: "text-indigo-700 bg-indigo-50/50" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <h2 className="text-md font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
        Pricing & Commercial Structure
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {displayFields.map((field, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border border-slate-100/80 transition-all duration-200 ${
              field.highlight
                ? field.color + " bg-slate-50 border-slate-200"
                : "bg-slate-50/30 text-slate-600"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {field.label}
            </span>
            <span className={`text-base font-extrabold block truncate ${field.highlight ? "" : "text-slate-700"}`}>
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceCard;
