import React, { useState } from "react";
import moment from "moment";
import { RequestType } from "../pages/Approvals";
import { Modal } from "./ImageModal";

// Reusable Components Imports
import ApprovalSummaryCard from "./ApprovalSummaryCard";
import ProductGallery from "./ProductGallery";
import PriceCard from "./PriceCard";
import InventoryCard from "./InventoryCard";
import LotInformationCard from "./LotInformationCard";
import ManufacturingCard from "./ManufacturingCard";
import SellerCard from "./SellerCard";
import DocumentsCard from "./DocumentsCard";
import TimelineCard from "./TimelineCard";
import ApprovalActions from "./ApprovalActions";

import { FiArrowLeft } from "react-icons/fi";

interface ProductDetailViewProps {
  req: any;
  onBack: () => void;
  handleSubmit: (request: any, actionType: RequestType, fees?: any, rejectionOrChangesData?: any) => Promise<void>;
  loading: boolean;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  req,
  onBack,
  handleSubmit,
  loading,
}) => {
  const product = req?.metadata || {};
  const master = product.masterDetails || {};
  const mediaList = master.media || product.media || [];

  // Modals visibility states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);

  // Form input states
  const [error, setError] = useState("");
  const [fees, setFees] = useState({
    messengerFee: "",
    connectorFee: "",
    platformFee: "3", // default 3%
  });

  const [rejectReason, setRejectReason] = useState("");
  const [rejectDescription, setRejectDescription] = useState("");
  const [rejectAttachment, setRejectAttachment] = useState("");

  const [changesComment, setChangesComment] = useState("");
  const [selectedMissingFields, setSelectedMissingFields] = useState<string[]>([]);
  const [selectedRequiredDocs, setSelectedRequiredDocs] = useState<string[]>([]);

  // Pre-configured validation options for checkboxes
  const validationFields = [
    "Product Description",
    "HSN Code",
    "Barcode",
    "Lot Weight / Dimensions",
    "Expiry Date",
    "Manufacturing Date",
    "Short Description",
    "Seller SKU",
  ];

  const validationDocs = [
    "GST Identification Certificate",
    "PAN Card Copy",
    "Trade License Document",
    "FSSAI License Certificate",
    "Drug License",
    "Import License Certificate",
    "Manufacturing Certificate",
    "Expiry Label Image",
  ];

  // Automated Verification Checks
  const runValidationCheck = () => {
    const checks: { type: "error" | "warning"; message: string }[] = [];

    // 1. Missing Images
    if (mediaList.length === 0) {
      checks.push({ type: "error", message: "Missing Images: Upload at least one media asset." });
    }

    // 2. Missing Description
    const desc = product.description || master.description;
    if (!desc || desc.trim().length < 10) {
      checks.push({ type: "warning", message: "Missing Description: Listing details are incomplete." });
    }

    // 3. Expired Product
    const expiryDateVal = product.expiryDate || product.expiry || product.expirationDate;
    if (expiryDateVal) {
      const exp = moment(expiryDateVal);
      if (exp.isValid() && exp.isBefore(moment())) {
        checks.push({ type: "error", message: "Expired Product: Product expiration date has passed." });
      }
    }

    // 4. Invalid MRP
    const mrpVal = Number(product.mrp);
    const sellPriceVal = Number(product.sellingPrice);
    if (isNaN(mrpVal) || mrpVal <= 0) {
      checks.push({ type: "error", message: "Invalid MRP: List price must be greater than zero." });
    } else if (sellPriceVal > mrpVal) {
      checks.push({ type: "error", message: "Invalid MRP: Selling price cannot exceed MRP." });
    }

    // 5. Zero Stock
    const stockVal = Number(product.stock !== undefined ? product.stock : product.currentStock);
    if (isNaN(stockVal) || stockVal <= 0) {
      checks.push({ type: "error", message: "Zero Stock: Available stock lots must be positive." });
    }

    // 6. Missing Documents
    const sellerDetails = product.sellerDetails || req.sellerDetails || req.seller || {};
    const hasGst = product.gstNumber || sellerDetails.gstNumber || sellerDetails.gst;
    const hasPan = sellerDetails.pan || sellerDetails.panNumber;
    if (!hasGst) {
      checks.push({ type: "error", message: "Missing Documents: GST registration has not been verified." });
    }
    if (!hasPan) {
      checks.push({ type: "error", message: "Missing Documents: PAN registration has not been verified." });
    }

    return checks;
  };

  const validationAlerts = runValidationCheck();

  // Compute Risk Level dynamically
  const getRiskLevel = (): "Low" | "Medium" | "High" | "Critical" => {
    const errorCount = validationAlerts.filter((c) => c.type === "error").length;
    const warningCount = validationAlerts.filter((c) => c.type === "warning").length;

    // Check critical blockers
    const isExpired = validationAlerts.some((c) => c.message.includes("Expired Product"));
    const isInvalidPricing = validationAlerts.some((c) => c.message.includes("Invalid MRP"));

    if (isExpired || isInvalidPricing || errorCount >= 3) return "Critical";
    if (errorCount > 0) return "High";
    if (warningCount > 0) return "Medium";
    return "Low";
  };

  const riskLevel = getRiskLevel();

  // Dynamic Product Specifications Table
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
      { key: "shortDescription", label: "Short Description" },
      { key: "sellerSku", label: "Seller SKU" },
      { key: "manufacturer", label: "Manufacturer" },
    ];

    specKeys.forEach(({ key, label }) => {
      const val = product[key] !== undefined ? product[key] : master[key];
      if (val !== undefined && val !== null && val !== "") {
        specs.push({ label, value: String(val) });
      }
    });

    const explicitSpecs = product.specifications || product.specs || master.specifications || master.specs;
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

  // General Information Fields Check
  const getGeneralInfo = () => {
    const info = [
      { label: "Product Name", value: master.name || product.name || "Not Available" },
      { label: "Master Product SKU", value: master.skuCode || product.skuCode || "Not Available" },
      { label: "Seller SKU", value: product.sellerSku || "Not Available" },
      { label: "Brand", value: product.brandName || master.brand || "Not Available" },
      { label: "Manufacturer", value: product.manufacturer || master.manufacturer || "Not Available" },
      { label: "Category", value: master.categoryId?.name || product.categoryName || "Not Available" },
      { label: "Sub Category", value: product.subCategory || master.subCategory || "Not Available" },
      { label: "Product Sub Category", value: product.productSubCategory || master.productSubCategory || "Not Available" },
      { label: "HSN Code", value: product.hsnCode || "Not Available" },
      { label: "Barcode (UPC/EAN)", value: product.barcode || "Not Available" },
      { label: "Product Description", value: product.description || master.description || "Not Available", fullWidth: true },
      { label: "Short Description", value: product.shortDescription || "Not Available", fullWidth: true },
    ];
    return info;
  };

  const generalInfo = getGeneralInfo();

  // Decision submits
  const submitApproval = async () => {
    setError("");
    const m = parseInt(fees.messengerFee);
    const c = parseInt(fees.connectorFee);
    const p = parseInt(fees.platformFee);

    if (isNaN(m) || isNaN(c) || isNaN(p)) {
      setError("All commission fields must be valid numbers");
      return;
    }

    const payloadFees = {
      promoterCommission: m,
      connectorCommission: c,
      platformFee: p,
    };

    await handleSubmit(req, "accept", payloadFees);
    setShowApproveModal(false);
  };

  const submitRejection = async () => {
    setError("");
    if (!rejectReason.trim()) {
      setError("Please specify a rejection reason.");
      return;
    }

    const payload = {
      reason: rejectReason,
      comment: rejectDescription,
      commentAttachment: rejectAttachment,
    };

    await handleSubmit(req, "reject", null, payload);
    setShowRejectModal(false);
  };

  const submitRequestChanges = async () => {
    setError("");
    if (!changesComment.trim()) {
      setError("Please provide change request comments.");
      return;
    }

    const payload = {
      reason: "Request Changes",
      comment: changesComment,
      missingFields: selectedMissingFields,
      requiredDocuments: selectedRequiredDocs,
    };

    await handleSubmit(req, "reject", null, payload);
    setShowChangesModal(false);
  };

  const handleDownloadAllDocs = () => {
    const urls: string[] = [];
    const scanUrls = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      for (const [, val] of Object.entries(obj)) {
        if (typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://"))) {
          if (/\.(pdf|png|jpg|jpeg)$/i.test(val.split("?")[0])) {
            urls.push(val);
          }
        } else if (typeof val === "object") {
          scanUrls(val);
        }
      }
    };
    scanUrls(product);
    scanUrls(req.seller);

    if (urls.length === 0) {
      alert("No downloadable files found on this request.");
      return;
    }

    urls.forEach((url, index) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = `Document_${index + 1}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 400);
    });
  };

  const handleCheckboxToggle = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-in fade-in duration-300">
      {/* Dynamic Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="group flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-650 transition hover:bg-slate-50 hover:text-slate-900 shadow-sm cursor-pointer"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-0.5" size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Approvals Portal
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-350" />
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200/40">
                Pending Product Listing
              </span>
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
              {master.name || "Product Workspace"}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Full-width Summary banner */}
        <ApprovalSummaryCard req={req} validations={validationAlerts} riskLevel={riskLevel} />

        {/* 2-column workspace layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main content column (left 70%) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Visual Assets Gallery */}
            <ProductGallery media={mediaList} />

            {/* General Information Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h2 className="text-md font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                General Product Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                {generalInfo.map((field, idx) => (
                  <div key={idx} className={field.fullWidth ? "md:col-span-2" : ""}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {field.label}
                    </span>
                    {field.fullWidth ? (
                      <p className="text-xs text-slate-650 leading-relaxed bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                        {field.value}
                      </p>
                    ) : (
                      <span className="text-xs font-semibold text-slate-700 block truncate" title={String(field.value)}>
                        {field.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Details */}
            <PriceCard product={product} />

            {/* Inventory Levels */}
            <InventoryCard product={product} />

            {/* Lot Information */}
            <LotInformationCard product={product} />

            {/* Manufacturing Card */}
            <ManufacturingCard product={product} />

            {/* Dynamic Product Specifications Card */}
            {specifications.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h2 className="text-md font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Product Specifications & Attributes
                </h2>
                <div className="overflow-hidden border border-slate-150 rounded-xl">
                  <table className="min-w-full divide-y divide-slate-150 text-xs">
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {specifications.map((spec, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30">
                          <td className="px-5 py-3 font-bold text-slate-400 uppercase tracking-wider w-1/3 bg-slate-50/30">
                            {spec.label}
                          </td>
                          <td className="px-5 py-3 font-semibold text-slate-700">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Seller Information */}
            <SellerCard req={req} />

            {/* Verification Documents */}
            <DocumentsCard product={product} req={req} />

            {/* Audit Timeline logs */}
            <TimelineCard product={product} req={req} />

          </div>

          {/* Sticky Sidebar controller (right 30%) */}
          <div className="lg:col-span-1">
            <ApprovalActions
              status={req.status}
              onApprove={() => setShowApproveModal(true)}
              onReject={() => setShowRejectModal(true)}
              onRequestChanges={() => setShowChangesModal(true)}
              onViewSeller={() => alert("Redirecting to Seller KYC Details...")}
              onDownloadDocuments={handleDownloadAllDocs}
              loading={loading}
              validationCount={validationAlerts.filter((c) => c.type === "error").length}
            />
          </div>
        </div>
      </div>

      {/* APPROVAL COMMISSION MODAL */}
      {showApproveModal && (
        <Modal onClose={() => setShowApproveModal(false)}>
          <div className="w-[450px] max-w-full space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Approve Listing & Set Margins
            </h3>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-xs font-bold">
                {error}
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Messenger Commission (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={fees.messengerFee}
                  onChange={(e) => setFees({ ...fees, messengerFee: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:bg-white focus:border-slate-400 outline-none transition"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Connector Commission (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={fees.connectorFee}
                  onChange={(e) => setFees({ ...fees, connectorFee: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:bg-white focus:border-slate-400 outline-none transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Platform Margin / Fee (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={fees.platformFee}
                  onChange={(e) => setFees({ ...fees, platformFee: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:bg-white focus:border-slate-400 outline-none transition"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100 justify-end">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-650 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={submitApproval}
                disabled={loading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer transition disabled:opacity-50"
              >
                Complete Approval
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECTION WORKFLOW MODAL */}
      {showRejectModal && (
        <Modal onClose={() => setShowRejectModal(false)}>
          <div className="w-[480px] max-w-full space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
              Reject Listing Request
            </h3>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-xs font-bold">
                {error}
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rejection Reason</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:bg-white focus:border-slate-400 outline-none transition cursor-pointer"
                >
                  <option value="">Select rejection reason...</option>
                  <option value="Pricing mismatch">Pricing / MRP mismatch</option>
                  <option value="Poor image quality">Poor image quality / watermarked</option>
                  <option value="Regulatory license expired">Regulatory license expired</option>
                  <option value="Incomplete document upload">Incomplete document upload</option>
                  <option value="Other">Other (specify below)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Detailed Description</label>
                <textarea
                  placeholder="Explain exactly why the listing is being rejected..."
                  rows={3}
                  value={rejectDescription}
                  onChange={(e) => setRejectDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:bg-white focus:border-slate-400 outline-none transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Attachment (Optional File Url)</label>
                <input
                  type="text"
                  placeholder="https://example.com/audit-report.pdf"
                  value={rejectAttachment}
                  onChange={(e) => setRejectAttachment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:bg-white focus:border-slate-400 outline-none transition"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-650 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                disabled={loading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer transition disabled:opacity-50"
              >
                Reject Listing
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REQUEST CHANGES MODAL */}
      {showChangesModal && (
        <Modal onClose={() => setShowChangesModal(false)}>
          <div className="w-[520px] max-w-full space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              Request Information Changes
            </h3>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-xs font-bold">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Feedback / Comments</label>
                <textarea
                  placeholder="Specify clear instructions for the seller to rectify..."
                  rows={2.5}
                  value={changesComment}
                  onChange={(e) => setChangesComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs focus:bg-white focus:border-slate-400 outline-none transition"
                />
              </div>

              {/* Missing Fields Checklist */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Check Missing Fields to Rectify</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-2xs">
                  {validationFields.map((field) => (
                    <label key={field} className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedMissingFields.includes(field)}
                        onChange={() => handleCheckboxToggle(selectedMissingFields, setSelectedMissingFields, field)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{field}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Check Required Documents to Upload</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-2xs">
                  {validationDocs.map((doc) => (
                    <label key={doc} className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedRequiredDocs.includes(doc)}
                        onChange={() => handleCheckboxToggle(selectedRequiredDocs, setSelectedRequiredDocs, doc)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{doc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100 justify-end">
              <button
                onClick={() => setShowChangesModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-650 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={submitRequestChanges}
                disabled={loading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs cursor-pointer transition disabled:opacity-50"
              >
                Send Request to Seller
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProductDetailView;
