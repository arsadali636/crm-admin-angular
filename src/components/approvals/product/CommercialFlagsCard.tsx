import React from "react";
import { FiCheck, FiX, FiZap, FiAward, FiDollarSign, FiMapPin, FiLink, FiPercent } from "react-icons/fi";

interface CommercialFlagsCardProps {
  product: any;
  req: any;
}

export const CommercialFlagsCard: React.FC<CommercialFlagsCardProps> = ({ product, req }) => {
  const master = product.masterDetails || {};
  const pickup = product.pickupAddress;

  const flags = [
    {
      label: "Featured Listing",
      active: !!(product.isFeatured || product.featured),
      icon: FiZap,
      activeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Created By Promoter",
      active: !!(product.createdByPromoter || req.createdByPromoter || product.promoterId),
      icon: FiAward,
      activeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      label: "Promotion Enabled",
      active: !!(product.promotionFee || product.isPromotionActive),
      icon: FiPercent,
      activeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Connector Enabled",
      active: !!(product.connectorCommission || product.isConnectorActive),
      icon: FiDollarSign,
      activeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Platform Fee Enabled",
      active: !!(product.platformFee !== undefined && product.platformFee !== null),
      icon: FiDollarSign,
      activeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      label: "Master Product Linked",
      active: !!(master._id || master.skuCode),
      icon: FiLink,
      activeColor: "bg-teal-50 text-teal-700 border-teal-200",
    },
    {
      label: "Pickup Address Configured",
      active: !!(pickup && (pickup.address1 || pickup.city)),
      icon: FiMapPin,
      activeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
        Listing System & Commercial Flags
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {flags.map((flag, idx) => {
          const Icon = flag.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition ${
                flag.active
                  ? flag.activeColor
                  : "bg-slate-50/50 text-slate-400 border-slate-100 opacity-60"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${flag.active ? "bg-white/80" : "bg-slate-100"}`}>
                <Icon size={14} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate">{flag.label}</span>
                <span className="text-[10px] font-semibold flex items-center gap-1">
                  {flag.active ? (
                    <>
                      <FiCheck size={11} className="text-emerald-600" /> Enabled
                    </>
                  ) : (
                    <>
                      <FiX size={11} className="text-slate-400" /> Disabled
                    </>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommercialFlagsCard;
