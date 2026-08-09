import React from "react";
import moment from "moment";
import { FiClock, FiUser, FiCalendar, FiActivity, FiAlertTriangle, FiImage, FiLayers, FiBox, FiDollarSign, FiZap, FiAward, FiCheckCircle, FiPercent } from "react-icons/fi";

interface ApprovalSummaryCardProps {
  req: any;
  validations: { type: "error" | "warning" | "info"; message: string }[];
  riskLevel: "Low" | "Medium" | "High" | "Critical";
}

export const ApprovalSummaryCard: React.FC<ApprovalSummaryCardProps> = ({
  req,
  validations,
  riskLevel,
}) => {
  const metadata = req?.metadata || {};
  const productDetails = metadata.productDetails || {};
  const product = {
    ...metadata,
    ...productDetails,
    masterDetails: productDetails.masterDetails || metadata.masterDetails || {},
    categoryDetails: productDetails.categoryDetails || metadata.categoryDetails || {},
    productCategoryDetails: productDetails.productCategoryDetails || metadata.productCategoryDetails || {},
    subCategoryDetails: productDetails.subCategoryDetails || metadata.subCategoryDetails || {},
    pickupAddress: productDetails.pickupAddress || metadata.pickupAddress || {},
    bestSellerLot: productDetails.bestSellerLot || metadata.bestSellerLot || {},
    lot: productDetails.lot || metadata.lot || [],
    media: productDetails.media || metadata.media || [],
    expiryProofMedia: productDetails.expiryDateProofMedia || productDetails.expiryProofMedia || metadata.expiryDateProofMedia || metadata.expiryProofMedia || metadata.expiryProofUrl,
  };

  const master = product.masterDetails || {};
  const mediaList = (product.media && product.media.length > 0) ? product.media : (master.media || []);
  const lotArray = Array.isArray(product.lot) ? product.lot : [];

  const pendingSince = req.createdAt ? moment(req.createdAt).fromNow() : undefined;
  const submissionDate = req.createdAt
    ? moment(req.createdAt).format("DD MMM YYYY, hh:mm A")
    : undefined;
  const submittedBy = `${req.requester?.firstName || req.firstName || ""} ${req.requester?.lastName || req.lastName || ""}`.trim() || req.seller?.businessName || undefined;
  const email = req.requester?.email || req.email || req.seller?.email || undefined;

  // Inventory count
  const stockVal = Number(product.availableInventory ?? product.stock ?? product.availableLots ?? 0);
  const isStockAvailable = stockVal > 0;

  // Expiry proof
  const hasExpiryProof = !!(product.expiryProofMedia || product.expiryDateProofMedia || product.expiryProofUrl || product.expiryProof);

  // Prices
  const mrpVal = product.mrp !== undefined && product.mrp !== null ? `₹${product.mrp}` : undefined;
  const sellPriceVal = product.minPrice !== undefined && product.minPrice !== null ? `₹${product.minPrice}` : product.sellingPrice ? `₹${product.sellingPrice}` : undefined;

  // Fees
  const platformFee = product.platformFee !== undefined ? `${product.platformFee}%` : undefined;
  const promotionFeeVal = product.promotionFee !== undefined && product.promotionFee !== null ? `${product.promotionFee}%` : undefined;

  // Flags
  const isMasterLinked = !!(master._id || master.skuCode || product.masterId);

  const riskColorMap = {
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    High: "bg-orange-50 text-orange-700 border-orange-200",
    Critical: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse",
  };

  const statusColorMap: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    accept: "bg-emerald-100 text-emerald-800 border-emerald-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    reject: "bg-rose-100 text-rose-800 border-rose-200",
    rejected: "bg-rose-100 text-rose-800 border-rose-200",
  };

  // Group validations by severity
  const criticalAlerts = validations.filter((v) => v.type === "error");
  const warningAlerts = validations.filter((v) => v.type === "warning");
  const infoAlerts = validations.filter((v) => v.type === "info");

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* 1. Header Info Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* Submitted By */}
        {submittedBy && (
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <FiUser size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Submitted By</span>
              <span className="text-xs font-bold text-slate-900 block truncate">{submittedBy}</span>
              {email && <span className="text-[11px] text-slate-400 block truncate">{email}</span>}
            </div>
          </div>
        )}

        {/* Submission Date */}
        {submissionDate && (
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <FiCalendar size={18} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Submission Date</span>
              <span className="text-xs font-bold text-slate-900 block">{submissionDate}</span>
            </div>
          </div>
        )}

        {/* Pending Since */}
        {pendingSince && (
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <FiClock size={18} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pending Since</span>
              <span className="text-xs font-bold text-slate-900 block">{pendingSince}</span>
            </div>
          </div>
        )}

        {/* Status & Risk */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <FiActivity size={18} />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Status:</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase ${statusColorMap[req.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                {req.status || "pending"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Risk:</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${riskColorMap[riskLevel]}`}>
                {riskLevel} Risk
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 20-30 Second Moderation Snapshot Tiles Strip */}
      <div className="border-t border-slate-100 pt-5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-3">
          20-Second Moderation Summary Snapshot
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
          {/* Tile 1: Media Count */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-150">
            <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px] uppercase mb-0.5">
              <FiImage size={13} /> Images
            </div>
            <span className="text-xs font-extrabold text-slate-850 block">{mediaList.length} Uploaded</span>
          </div>

          {/* Tile 2: Expiry Proof */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-150">
            <div className="flex items-center gap-1.5 text-purple-600 font-bold text-[10px] uppercase mb-0.5">
              <FiCheckCircle size={13} /> Expiry Proof
            </div>
            <span className={`text-xs font-extrabold block ${hasExpiryProof ? "text-emerald-700" : "text-amber-600"}`}>
              {hasExpiryProof ? "Uploaded" : "Not Provided"}
            </span>
          </div>

          {/* Tile 3: Lots Count */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-150">
            <div className="flex items-center gap-1.5 text-teal-600 font-bold text-[10px] uppercase mb-0.5">
              <FiLayers size={13} /> Lots
            </div>
            <span className="text-xs font-extrabold text-slate-850 block">{lotArray.length} Lot Pricing</span>
          </div>

          {/* Tile 4: Stock */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-150">
            <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] uppercase mb-0.5">
              <FiBox size={13} /> Inventory
            </div>
            <span className={`text-xs font-extrabold block ${isStockAvailable ? "text-emerald-700" : "text-rose-600"}`}>
              {isStockAvailable ? `${stockVal} Units` : "Out of Stock"}
            </span>
          </div>

          {/* Tile 5: Pricing */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-150">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase mb-0.5">
              <FiDollarSign size={13} /> MRP / Sell Price
            </div>
            <span className="text-xs font-extrabold text-slate-850 block truncate">
              {mrpVal || "—"} / {sellPriceVal || "—"}
            </span>
          </div>

          {/* Tile 6: Platform Fee */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-150">
            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase mb-0.5">
              <FiZap size={13} /> Platform Fee
            </div>
            <span className="text-xs font-extrabold text-slate-850 block">{platformFee || "3% Default"}</span>
          </div>

          {/* Tile 7: Promotion Fee */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-150">
            <div className="flex items-center gap-1.5 text-cyan-600 font-bold text-[10px] uppercase mb-0.5">
              <FiPercent size={13} /> Promotion Fee
            </div>
            <span className="text-xs font-extrabold text-slate-850 block">{promotionFeeVal || "0%"}</span>
          </div>

          {/* Tile 8: Master Linked */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-150">
            <div className="flex items-center gap-1.5 text-purple-600 font-bold text-[10px] uppercase mb-0.5">
              <FiAward size={13} /> Master Linked
            </div>
            <span className={`text-xs font-extrabold block ${isMasterLinked ? "text-purple-700" : "text-slate-500"}`}>
              {isMasterLinked ? "Yes (Linked)" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Severity-Grouped Validation Alerts Section */}
      {validations.length > 0 && (
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
            Validation & Automated Moderation Checks ({validations.length})
          </span>

          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs uppercase tracking-wider">
                <FiAlertTriangle className="text-rose-600 animate-pulse" size={16} />
                Critical Blocker Issues ({criticalAlerts.length})
              </div>
              <ul className="space-y-1.5 pl-6 text-xs text-rose-750 font-semibold list-disc">
                {criticalAlerts.map((item, idx) => (
                  <li key={idx}>{item.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warning Alerts */}
          {warningAlerts.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-850 font-extrabold text-xs uppercase tracking-wider">
                <FiAlertTriangle className="text-amber-600" size={16} />
                Warnings & Notice Items ({warningAlerts.length})
              </div>
              <ul className="space-y-1.5 pl-6 text-xs text-amber-900 font-semibold list-disc">
                {warningAlerts.map((item, idx) => (
                  <li key={idx}>{item.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Info Alerts */}
          {infoAlerts.length > 0 && (
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-850 font-extrabold text-xs uppercase tracking-wider">
                <FiCheckCircle className="text-blue-600" size={16} />
                Information & Recommendations ({infoAlerts.length})
              </div>
              <ul className="space-y-1.5 pl-6 text-xs text-blue-900 font-semibold list-disc">
                {infoAlerts.map((item, idx) => (
                  <li key={idx}>{item.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalSummaryCard;
