import React from "react";

interface SellerOnboardingCardProps {
  req: any;
  handleAction: (id: any, action: "accept" | "reject") => void;
  onViewDetails: (req: any) => void;
}

export const SellerOnboardingCard: React.FC<SellerOnboardingCardProps> = ({
  req,
  handleAction,
  onViewDetails,
}) => {
  if (req.type !== "seller_onboarding") return null;

  const seller = req.metadata || {};
  const logoText = seller.businessName ? seller.businessName.substring(0, 2).toUpperCase() : "SL";

  return (
    <div
      key={req._id}
      className="group relative flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-300"
    >
      <div className="flex flex-1 items-start gap-4">
        {/* Left Brand Initials Logo */}
        <div className="h-16 w-16 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100/60 text-slate-700 font-bold text-lg">
          {logoText}
        </div>

        {/* Center Details */}
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-2xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10">
                Seller Account
              </span>
              <span className="text-2xs font-mono text-slate-400">ID: {req._id.substring(12)}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug truncate">
              {seller.businessName}
            </h3>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-2xs text-slate-500 pt-0.5">
            <div>
              <span className="font-semibold text-slate-400">GST:</span>{" "}
              <span className="font-mono font-bold text-slate-700">{seller.gstNumber || "N/A"}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-400">PAN:</span>{" "}
              <span className="font-mono font-bold text-slate-700">{seller.panNumber || "N/A"}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-400">Owner:</span>{" "}
              <span className="font-bold text-slate-700 truncate inline-block max-w-[150px] align-bottom">
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

export default SellerOnboardingCard;
