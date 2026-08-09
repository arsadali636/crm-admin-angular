import React from "react";
import { RequestType } from "../pages/Approvals";

interface ProductApprovalCardProps {
  req: any;
  handleAction: (req: any, type: RequestType) => void;
  onViewDetails: (req: any) => void;
}

export const ProductApprovalCard: React.FC<ProductApprovalCardProps> = ({
  req,
  handleAction,
  onViewDetails,
}) => {
  if (req.type !== "product_approval") return null;

  const product = req?.metadata || {};
  const master = product.masterDetails || {};
  const mediaUrl = master.media?.[0] || "/placeholder-product.png";

  const discountPercent = product.mrp && product.sellingPrice 
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
    : 0;

  return (
    <div
      key={req._id}
      className="group relative flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-300"
    >
      <div className="flex flex-1 items-start gap-4">
        {/* Left Aspect Image */}
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100/60 p-1">
          <img
            src={mediaUrl}
            alt={master.name || "Product"}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        {/* Center Text Details */}
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-2xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
                {master.categoryId?.name || "Product"}
              </span>
              <span className="text-2xs font-mono text-slate-400">ID: {req._id.substring(12)}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug truncate">
              {master.name}
            </h3>
          </div>

          {/* Info grid of pricing, inventory details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-2xs text-slate-500 pt-0.5">
            <div>
              <span className="font-semibold text-slate-400">MRP:</span>{" "}
              <span className="font-bold text-slate-700">₹{product.mrp || 0}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-400">Sell Price:</span>{" "}
              <span className="font-bold text-slate-700">₹{product.sellingPrice || 0}</span>
              {discountPercent > 0 && (
                <span className="ml-1 text-indigo-600 font-bold">-{discountPercent}%</span>
              )}
            </div>
            <div>
              <span className="font-semibold text-slate-400">Lot/MOQ:</span>{" "}
              <span className="font-bold text-slate-700">{product.lotSize || 1} / {product.moq || 1}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-400">Seller:</span>{" "}
              <span className="font-bold text-slate-700 truncate inline-block max-w-[100px] align-bottom">
                {req.requester?.firstName || req.firstName || ""} {req.requester?.lastName || req.lastName || ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Actions & Badges */}
      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 text-3xs font-semibold uppercase tracking-wider text-amber-800 border border-amber-200/50">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(req)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-2xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
          >
            Details
          </button>
          
          {req.status === "pending" && (
            <>
              <button
                onClick={() => handleAction(req, "reject")}
                className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-2xs font-semibold text-rose-700 transition hover:bg-rose-100 cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={() => handleAction(req, "accept")}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-2xs font-semibold text-white transition hover:bg-slate-800 cursor-pointer"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductApprovalCard;
