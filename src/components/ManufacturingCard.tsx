import React from "react";
import moment from "moment";
import { FiCalendar, FiPackage, FiAlertCircle } from "react-icons/fi";

interface ManufacturingCardProps {
  product: any;
}

export const ManufacturingCard: React.FC<ManufacturingCardProps> = ({ product }) => {
  const getVal = (val: any) => {
    if (val === undefined || val === null || val === "") return "Not Available";
    return val;
  };

  const formatDate = (val: any) => {
    if (!val) return "Not Available";
    const date = moment(val);
    if (!date.isValid()) return "Not Available";
    return date.format("DD MMM YYYY");
  };

  const mfgDateVal = product.mfgDate || product.mfg || product.manufacturingDate;
  const expiryDateVal = product.expiryDate || product.expiry || product.expirationDate;
  const batchVal = product.batchNumber || product.batchNo;

  // Calculate Shelf Life if not available
  let shelfLifeVal = product.shelfLife;
  if ((shelfLifeVal === undefined || shelfLifeVal === null || shelfLifeVal === "") && mfgDateVal && expiryDateVal) {
    const mfg = moment(mfgDateVal);
    const exp = moment(expiryDateVal);
    if (mfg.isValid() && exp.isValid()) {
      const diffMonths = exp.diff(mfg, "months");
      shelfLifeVal = diffMonths > 0 ? `${diffMonths} months` : `${exp.diff(mfg, "days")} days`;
    }
  }

  // Warning check: if product is expired or expiring within 3 months
  let warningMessage = "";
  let warningType: "expired" | "expiring_soon" | "none" = "none";

  if (expiryDateVal) {
    const exp = moment(expiryDateVal);
    if (exp.isValid()) {
      const today = moment();
      if (exp.isBefore(today)) {
        warningMessage = "CRITICAL: This product is expired!";
        warningType = "expired";
      } else if (exp.diff(today, "months") < 3) {
        warningMessage = `WARNING: Product expires soon (${exp.fromNow()})`;
        warningType = "expiring_soon";
      }
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      <h2 className="text-md font-bold text-slate-800 mb-2 pb-3 border-b border-slate-100 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
        Manufacturing & Expiry Details
      </h2>

      {warningType !== "none" && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold ${
          warningType === "expired" 
            ? "bg-rose-50 text-rose-700 border-rose-100 animate-pulse" 
            : "bg-amber-50 text-amber-700 border-amber-100"
        }`}>
          <FiAlertCircle size={15} />
          {warningMessage}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-start gap-2.5">
          <FiCalendar className="text-slate-400 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Mfg Date</span>
            <span className="text-xs font-bold text-slate-700 block">{formatDate(mfgDateVal)}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-start gap-2.5">
          <FiCalendar className="text-slate-400 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Expiry Date</span>
            <span className={`text-xs font-bold block ${warningType === "expired" ? "text-rose-600 font-extrabold" : "text-slate-700"}`}>
              {formatDate(expiryDateVal)}
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-start gap-2.5">
          <FiPackage className="text-slate-400 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Shelf Life</span>
            <span className="text-xs font-bold text-slate-700 block">{getVal(shelfLifeVal)}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-start gap-2.5">
          <FiPackage className="text-slate-400 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Batch Number</span>
            <span className="text-xs font-mono font-bold text-slate-700 block truncate" title={String(getVal(batchVal))}>
              {getVal(batchVal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturingCard;
