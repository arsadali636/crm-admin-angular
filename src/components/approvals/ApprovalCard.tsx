import React from "react";
import { FiCheckSquare, FiSquare, FiClock } from "react-icons/fi";
import ApprovalBadge from "./ApprovalBadge";
import moment from "moment";

interface ApprovalCardProps {
  req: any;
  isSelected: boolean;
  isChecked: boolean;
  onCheckChange: (checked: boolean) => void;
  onClick: () => void;
  onViewDetails: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  req,
  isSelected,
  isChecked,
  onCheckChange,
  onClick,
  onViewDetails,
  onApprove,
  onReject,
}) => {
  const isSeller = req.type === "seller_onboarding";
  const metadata = req.metadata || {};
  const master = metadata.masterDetails || {};

  // Formulate waiting time
  const formatWaitingTime = (createdAt: any) => {
    if (!createdAt) return "Unknown";
    const created = moment(createdAt);
    const duration = moment.duration(moment().diff(created));
    if (duration.asDays() >= 1) {
      return `${Math.floor(duration.asDays())}d waiting`;
    }
    if (duration.asHours() >= 1) {
      return `${Math.floor(duration.asHours())}h waiting`;
    }
    return `${Math.floor(duration.asMinutes())}m waiting`;
  };

  const waitingTimeText = formatWaitingTime(req.createdAt);

  // Derive dynamic risk / priority level (mock check matching detail logic)
  const getPriority = () => {
    if (isSeller) {
      // High priority if GST is missing
      return !metadata.gstNumber ? "high" : "medium";
    } else {
      // Product validation alerts
      const mrp = Number(metadata.mrp);
      const sell = Number(metadata.sellingPrice);
      const stock = Number(metadata.stock !== undefined ? metadata.stock : metadata.currentStock);
      if (sell > mrp || stock === 0) return "high";
      return "medium";
    }
  };

  const priorityLevel = getPriority();

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col sm:flex-row items-stretch gap-4 rounded-xl border p-4 transition-all duration-300 shadow-2xs select-none cursor-pointer ${
        isSelected
          ? "bg-slate-50 border-slate-400 ring-1 ring-slate-400"
          : "bg-white border-slate-200/80 hover:border-slate-350 hover:shadow-xs"
      }`}
    >
      {/* Selection Checkbox & Left Icon Area */}
      <div className="flex items-center gap-2.5">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onCheckChange(!isChecked);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-indigo-650 hover:bg-slate-100 transition cursor-pointer"
        >
          {isChecked ? (
            <FiCheckSquare className="h-4.5 w-4.5 text-indigo-650" />
          ) : (
            <FiSquare className="h-4.5 w-4.5 text-slate-300 group-hover:text-slate-400" />
          )}
        </div>

        {/* Thumbnail or Brand Avatar */}
        {isSeller ? (
          <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-700 font-bold text-sm">
            {metadata.businessName ? metadata.businessName.substring(0, 2).toUpperCase() : "SL"}
          </div>
        ) : (
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-150 p-0.5">
            <img
              src={master.media?.[0] || metadata.media?.[0] || "/placeholder-product.png"}
              alt={master.name || "Product"}
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-product.png";
              }}
            />
          </div>
        )}
      </div>

      {/* Center Details Panel */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <ApprovalBadge type={req.type} />
            <span className="text-[10px] font-mono text-slate-450">#{req._id.substring(12)}</span>
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
              <FiClock className="h-3 w-3" />
              {waitingTimeText}
            </span>
          </div>

          <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug truncate">
            {isSeller ? metadata.businessName : master.name || metadata.name}
          </h3>

          <p className="text-[10px] text-slate-450 font-semibold mt-0.5 truncate">
            Owner: {req.requester?.firstName || req.firstName || ""} {req.requester?.lastName || req.lastName || ""}
          </p>
        </div>

        {/* Condensed Info Items */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-500 pt-1 border-t border-slate-100/60">
          {isSeller ? (
            <>
              <div>
                <span className="font-semibold text-slate-400">GST:</span>{" "}
                <span className="font-mono text-slate-750 font-bold">{metadata.gstNumber || "N/A"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">PAN:</span>{" "}
                <span className="font-mono text-slate-750 font-bold">{metadata.panNumber || "N/A"}</span>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="font-semibold text-slate-400">Price:</span>{" "}
                <span className="text-slate-750 font-bold">₹{metadata.sellingPrice || 0}</span>
                <span className="text-[9px] text-slate-400 font-medium"> / MRP: ₹{metadata.mrp || 0}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Lot/MOQ:</span>{" "}
                <span className="text-slate-750 font-bold">{metadata.lotSize || 1}/{metadata.moq || 1}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Badges & Row Actions */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3.5 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
        <div className="flex flex-col items-end gap-1.5">
          <ApprovalBadge type={req.status} />
          {priorityLevel === "high" && <ApprovalBadge type="high" />}
        </div>

        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Review
          </button>
          {req.status === "pending" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
                className="h-7 px-2.5 rounded-lg border border-rose-200 bg-rose-50 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove();
                }}
                className="h-7 px-2.5 rounded-lg bg-slate-900 text-[10px] font-bold text-white hover:bg-slate-800 transition cursor-pointer"
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

export default ApprovalCard;
