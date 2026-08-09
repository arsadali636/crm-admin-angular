import React, { useState } from "react";
import { FiMapPin, FiMail, FiUser, FiFileText } from "react-icons/fi";
import ApprovalBadge from "./ApprovalBadge";
import ApprovalTimeline from "./ApprovalTimeline";
import ApprovalDocuments from "./ApprovalDocuments";
import ApprovalImageGallery from "./ApprovalImageGallery";
import ApprovalActionGroup from "./ApprovalActionGroup";

const CopyButton: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-1 inline-flex items-center justify-center p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-650 transition cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? (
        <span className="text-[9px] font-bold text-emerald-650">Copied!</span>
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      )}
    </button>
  );
};

interface ApprovalPreviewProps {
  req: any;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges?: () => void;
  onDownloadDocuments?: () => void;
  loading: boolean;
}

export const ApprovalPreview: React.FC<ApprovalPreviewProps> = ({
  req,
  onApprove,
  onReject,
  onRequestChanges,
  onDownloadDocuments,
  loading,
}) => {
  if (!req) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 border border-slate-200 rounded-2xl min-h-[450px]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-400">
          <FiFileText size={22} />
        </div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">No Request Selected</h3>
        <p className="text-[11px] text-slate-450 mt-1 max-w-[200px] leading-relaxed font-semibold">
          Select an approval request from the left queue to view dynamic details instantly.
        </p>
      </div>
    );
  }

  const isSeller = req.type === "seller_onboarding";
  const metadata = req.metadata || {};
  const master = metadata.masterDetails || {};
  const mediaList = master.media || metadata.media || [];

  // Helper check for field presence
  const isFilled = (val: any) => val !== undefined && val !== null && val !== "";

  // Pricing fields mapping
  const showPricing = !isSeller && (isFilled(metadata.mrp) || isFilled(metadata.sellingPrice));
  const discountPercent = metadata.mrp && metadata.sellingPrice 
    ? Math.round(((metadata.mrp - metadata.sellingPrice) / metadata.mrp) * 100)
    : 0;

  // Inventory fields mapping
  const stock = metadata.stock !== undefined ? metadata.stock : metadata.currentStock;
  const showInventory = !isSeller && isFilled(stock);

  // Specifications attributes mapping
  const getSpecifications = () => {
    const specs: { label: string; value: string }[] = [];
    const specKeys = [
      { key: "color", label: "Color" },
      { key: "material", label: "Material" },
      { key: "size", label: "Size" },
      { key: "weight", label: "Weight" },
      { key: "origin", label: "Country of Origin" },
      { key: "ingredients", label: "Ingredients" },
      { key: "fragrance", label: "Fragrance" },
      { key: "packaging", label: "Packaging Type" },
      { key: "hsnCode", label: "HSN Code" },
      { key: "barcode", label: "Barcode (UPC/EAN)" },
      { key: "sellerSku", label: "Seller SKU" },
      { key: "manufacturer", label: "Manufacturer" },
    ];

    specKeys.forEach(({ key, label }) => {
      const val = metadata[key] !== undefined ? metadata[key] : master[key];
      if (isFilled(val)) {
        specs.push({ label, value: String(val) });
      }
    });

    const explicitSpecs = metadata.specifications || metadata.specs || master.specifications || master.specs;
    if (explicitSpecs && typeof explicitSpecs === "object") {
      Object.entries(explicitSpecs).forEach(([k, val]) => {
        if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
          const labelName = k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
          const capitalized = labelName.charAt(0).toUpperCase() + labelName.slice(1);
          if (!specs.some((s) => s.label.toLowerCase() === capitalized.toLowerCase())) {
            specs.push({ label: capitalized, value: String(val) });
          }
        }
      });
    }
    return specs;
  };

  const specifications = getSpecifications();

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Top Banner Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <ApprovalBadge type={req.type} />
            <span className="text-[10px] font-mono text-slate-400 flex items-center">
              ID: {req._id.substring(12)}
              <CopyButton value={req._id} />
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight leading-snug truncate">
            {isSeller ? metadata.businessName : master.name || metadata.name}
          </h2>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
            Submitted: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "N/A"}
          </p>
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          <ApprovalBadge type={req.status} />
        </div>
      </div>

      {/* Action group toolbar */}
      <ApprovalActionGroup
        status={req.status}
        onApprove={onApprove}
        onReject={onReject}
        onRequestChanges={onRequestChanges}
        onDownloadDocuments={onDownloadDocuments}
        loading={loading}
      />

      {/* Product Image Gallery */}
      {!isSeller && mediaList.length > 0 && (
        <ApprovalImageGallery media={mediaList} />
      )}

      {/* Overview Business Details for Seller Onboarding */}
      {isSeller && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Business Overview
          </h3>
          
          <div className="grid grid-cols-1 gap-y-3.5 text-xs">
            {isFilled(metadata.businessName) && (
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Legal Name</span>
                <span className="font-semibold text-slate-755">{metadata.businessName}</span>
              </div>
            )}
            {isFilled(metadata.industry) && (
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Industry Category</span>
                <span className="font-semibold text-slate-755">{metadata.industry}</span>
              </div>
            )}
            {isFilled(metadata.typeOfBusiness) && (
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Type of Business</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(metadata.typeOfBusiness) ? (
                    metadata.typeOfBusiness.map((t: string, i: number) => (
                      <span key={i} className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">
                      {metadata.typeOfBusiness}
                    </span>
                  )}
                </div>
              </div>
            )}
            {isFilled(metadata.businessProfile) && (
              <div className="border-t border-slate-100/60 pt-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Company Profile</span>
                <p className="text-[10px] text-slate-600 bg-slate-50/50 rounded-xl p-3 border border-slate-100/50 leading-relaxed font-semibold">
                  {metadata.businessProfile}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Address & Contact Information */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-800" />
          {isSeller ? "Merchant Contact Details" : "Seller Context Information"}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Contact Person</span>
            <span className="font-semibold text-slate-755 flex items-center gap-1.5">
              <FiUser className="text-slate-450 h-3.5 w-3.5" />
              {req.requester?.firstName || req.firstName || ""} {req.requester?.lastName || req.lastName || ""}
            </span>
          </div>
          
          {(isFilled(req.requester?.email) || isFilled(req.email)) && (
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Registered Email</span>
              <span className="font-semibold text-slate-755 flex items-center gap-1.5 truncate">
                <FiMail className="text-slate-450 h-3.5 w-3.5" />
                {req.requester?.email || req.email}
              </span>
            </div>
          )}

          {isSeller && isFilled(metadata.address) && (
            <div className="sm:col-span-2 border-t border-slate-100/60 pt-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Physical Operating Address</span>
              <span className="font-semibold text-slate-755 flex items-start gap-1.5 leading-relaxed">
                <FiMapPin className="text-slate-450 h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{metadata.address}</span>
              </span>
            </div>
          )}

          {isSeller && isFilled(metadata.landmark) && (
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Landmark</span>
              <span className="font-semibold text-slate-755">{metadata.landmark}</span>
            </div>
          )}

          {isSeller && (isFilled(metadata.latitude) || isFilled(metadata.longitude)) && (
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Coordinates (GPS)</span>
              <span className="font-mono font-bold text-slate-650 bg-slate-50 px-2 py-0.5 border border-slate-150 rounded inline-block mt-0.5 text-[10px]">
                {metadata.latitude || "0.0"}, {metadata.longitude || "0.0"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing and Inventory for Products */}
      {showPricing && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Pricing details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Max Retail Price (MRP)</span>
              <span className="text-sm font-black text-slate-900">₹{metadata.mrp || 0}</span>
            </div>
            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Selling Price</span>
              <span className="text-sm font-black text-slate-900">
                ₹{metadata.sellingPrice || 0}
                {discountPercent > 0 && (
                  <span className="ml-1 text-emerald-650 text-[10px] font-black">-{discountPercent}%</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {showInventory && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Inventory details
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Stock Volume</span>
              <span className="text-xs font-black text-slate-800">{stock} Items</span>
            </div>
            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Lot Volume</span>
              <span className="text-xs font-black text-slate-800">{metadata.lotSize || 1} Items</span>
            </div>
            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">MOQ</span>
              <span className="text-xs font-black text-slate-800">{metadata.moq || 1} Lots</span>
            </div>
          </div>
        </div>
      )}

      {/* Specifications Table */}
      {specifications.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            Attributes & Specifications
          </h3>
          <div className="overflow-hidden border border-slate-150 rounded-xl">
            <table className="min-w-full divide-y divide-slate-150 text-[10px]">
              <tbody className="divide-y divide-slate-100 bg-white">
                {specifications.map((spec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30">
                    <td className="px-3.5 py-2.5 font-bold text-slate-400 uppercase tracking-wider w-1/3 bg-slate-50/30">
                      {spec.label}
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-slate-700">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic Verification Documents */}
      <ApprovalDocuments product={metadata} req={req} />

      {/* Audit Timeline events */}
      <ApprovalTimeline product={metadata} req={req} />

    </div>
  );
};

export default ApprovalPreview;
