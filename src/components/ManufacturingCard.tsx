import React, { useState } from "react";
import moment from "moment";
import { FiCalendar, FiPackage, FiAlertCircle, FiImage, FiMaximize, FiDownload, FiX } from "react-icons/fi";

interface ManufacturingCardProps {
  product: any;
}

export const ManufacturingCard: React.FC<ManufacturingCardProps> = ({ product }) => {
  const [showProofModal, setShowProofModal] = useState(false);

  const formatDate = (val: any) => {
    if (!val) return null;
    const date = moment(val);
    if (!date.isValid()) return null;
    return date.format("DD MMM YYYY");
  };

  const mfgDateVal = product.mfgDate || product.mfg || product.manufacturingDate;
  const expiryDateVal = product.expiryDate || product.expiry || product.expirationDate;
  const batchVal = product.batchNumber || product.batchNo;

  const expiryProofUrl = product.expiryProofMedia || product.expiryProofUrl || product.expiryProof;

  // Calculate Shelf Life if not available
  let shelfLifeVal = product.shelfLife;
  if (!shelfLifeVal && mfgDateVal && expiryDateVal) {
    const mfg = moment(mfgDateVal);
    const exp = moment(expiryDateVal);
    if (mfg.isValid() && exp.isValid()) {
      const diffMonths = exp.diff(mfg, "months");
      shelfLifeVal = diffMonths > 0 ? `${diffMonths} months` : `${exp.diff(mfg, "days")} days`;
    }
  }

  // Warning check
  let warningMessage = "";
  let warningType: "expired" | "expiring_soon" | "none" = "none";

  if (expiryDateVal) {
    const exp = moment(expiryDateVal);
    if (exp.isValid()) {
      const today = moment();
      if (exp.isBefore(today)) {
        warningMessage = "CRITICAL: This product has passed its expiration date!";
        warningType = "expired";
      } else if (exp.diff(today, "months") < 3) {
        warningMessage = `WARNING: Product expires soon (${exp.fromNow()})`;
        warningType = "expiring_soon";
      }
    }
  }

  const mfgDateFormatted = formatDate(mfgDateVal);
  const expiryDateFormatted = formatDate(expiryDateVal);

  // Return null if all fields are empty to dynamically hide empty section
  if (!mfgDateFormatted && !expiryDateFormatted && !shelfLifeVal && !batchVal && !expiryProofUrl) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          Manufacturing & Expiry Verification
        </h2>
        {expiryProofUrl && (
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 flex items-center gap-1">
            <FiImage size={12} /> Proof Image Attached
          </span>
        )}
      </div>

      {warningType !== "none" && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold ${
          warningType === "expired" 
            ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse" 
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}>
          <FiAlertCircle size={16} />
          {warningMessage}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mfgDateFormatted && (
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-150 flex items-start gap-2.5">
            <FiCalendar className="text-slate-400 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Mfg Date</span>
              <span className="text-xs font-bold text-slate-800 block">{mfgDateFormatted}</span>
            </div>
          </div>
        )}

        {expiryDateFormatted && (
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-150 flex items-start gap-2.5">
            <FiCalendar className="text-slate-400 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Expiry Date</span>
              <span className={`text-xs font-bold block ${warningType === "expired" ? "text-rose-600 font-extrabold" : "text-slate-800"}`}>
                {expiryDateFormatted}
              </span>
            </div>
          </div>
        )}

        {shelfLifeVal && (
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-150 flex items-start gap-2.5">
            <FiPackage className="text-slate-400 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Shelf Life</span>
              <span className="text-xs font-bold text-slate-800 block">{shelfLifeVal}</span>
            </div>
          </div>
        )}

        {batchVal && (
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-150 flex items-start gap-2.5">
            <FiPackage className="text-slate-400 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Batch / Lot No.</span>
              <span className="text-xs font-bold font-mono text-slate-800 block truncate">{batchVal}</span>
            </div>
          </div>
        )}
      </div>

      {/* Expiry Proof Attachment Image Section */}
      {expiryProofUrl && (
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
            Uploaded Expiry Proof Document Image
          </span>
          <div className="flex items-center gap-4 bg-purple-50/30 p-3 rounded-xl border border-purple-100">
            <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative group">
              <img src={expiryProofUrl} alt="Expiry Proof" className="h-full w-full object-cover" />
              <button
                onClick={() => setShowProofModal(true)}
                className="absolute inset-0 bg-slate-900/40 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                title="Expand Proof Image"
              >
                <FiMaximize size={16} />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-800 block truncate">Official Expiry Date Label Upload</span>
              <span className="text-[11px] text-slate-400 block truncate mt-0.5">Proof image verified for compliance</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowProofModal(true)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1"
              >
                <FiMaximize size={12} /> Preview
              </button>
              <a
                href={expiryProofUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <FiDownload size={12} /> Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowProofModal(false)}>
          <div className="relative max-w-3xl w-full bg-white rounded-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-800">Expiry Proof Image Lightbox</h3>
              <button onClick={() => setShowProofModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <FiX size={18} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-xl p-2">
              <img src={expiryProofUrl} alt="Expiry Proof Fullscreen" className="max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManufacturingCard;
