import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, CheckCircle2, ArrowRight, Package, Users, ShoppingBag } from "lucide-react";
import { ActionSkeleton } from "./DashboardSkeleton";

interface ActionRequiredSectionProps {
  pendingSellerCount: number;
  pendingProductCount: number;
  pendingOrderCount: number;
  loading: boolean;
}

export const ActionRequiredSection: React.FC<ActionRequiredSectionProps> = ({
  pendingSellerCount,
  pendingProductCount,
  pendingOrderCount,
  loading,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 mb-6">
        <div className="h-5 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionSkeleton />
          <ActionSkeleton />
          <ActionSkeleton />
        </div>
      </div>
    );
  }

  const totalPendingActions = pendingSellerCount + pendingProductCount + pendingOrderCount;

  const actionItems = [
    {
      id: "product_approvals",
      title: `${pendingProductCount} Product ${pendingProductCount === 1 ? "Approval" : "Approvals"}`,
      description: pendingProductCount > 0 ? "Product submissions awaiting catalog review" : "All product approvals complete",
      count: pendingProductCount,
      buttonText: "Review",
      targetRoute: "/approvals",
      icon: Package,
      badgeColor: pendingProductCount > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeText: pendingProductCount > 0 ? "Pending Review" : "Clear",
    },
    {
      id: "seller_approvals",
      title: `${pendingSellerCount} Seller ${pendingSellerCount === 1 ? "Approval" : "Approvals"}`,
      description: pendingSellerCount > 0 ? "Seller onboarding registrations awaiting review" : "All seller onboarding complete",
      count: pendingSellerCount,
      buttonText: "Review",
      targetRoute: "/approvals",
      icon: Users,
      badgeColor: pendingSellerCount > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeText: pendingSellerCount > 0 ? "Pending Review" : "Clear",
    },
    {
      id: "pending_orders",
      title: `${pendingOrderCount} Pending ${pendingOrderCount === 1 ? "Order" : "Orders"}`,
      description: pendingOrderCount > 0 ? "Orders pending fulfillment or status updates" : "No pending orders requiring action",
      count: pendingOrderCount,
      buttonText: "View Orders",
      targetRoute: "/orders",
      icon: ShoppingBag,
      badgeColor: pendingOrderCount > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeText: pendingOrderCount > 0 ? "Needs Attention" : "Clear",
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70">
            <ShieldAlert className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Action Required
              {totalPendingActions > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                  {totalPendingActions} {totalPendingActions === 1 ? "Item" : "Items"}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Operational tasks requiring administrator verification or action
            </p>
          </div>
        </div>

        {totalPendingActions === 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            All operational tasks complete
          </span>
        )}
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actionItems.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                item.count > 0
                  ? "bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/20"
                  : "bg-white border-slate-200 opacity-80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComp className="w-4 h-4 text-slate-600" />
                    <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[11px] font-semibold border rounded-full ${item.badgeColor}`}
                  >
                    {item.badgeText}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{item.description}</p>
              </div>

              <button
                onClick={() => navigate(item.targetRoute)}
                className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  item.count > 0
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span>{item.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
