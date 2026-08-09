import React from "react";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  UserCheck,
  PackageCheck,
} from "lucide-react";
import { formatIndianCurrency, formatNumberInIN } from "../../utils/utils";
import { KpiSkeleton } from "./DashboardSkeleton";

interface DashboardKpiCardsProps {
  orders: any[];
  pendingSellerData: any[];
  pendingProductData: any[];
  loading: boolean;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  orders,
  pendingSellerData,
  pendingProductData,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
    );
  }

  const totalSales = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((item) => item.status === 0).length;
  const approvedOrders = orders.filter((item) => item.status === 1).length;
  const pendingSellers = pendingSellerData.length;
  const pendingProducts = pendingProductData.length;

  const cards = [
    {
      title: "Total Sales",
      value: formatIndianCurrency(totalSales),
      description: "Gross revenue in selected range",
      icon: TrendingUp,
      accentColor: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-100",
      badge: null,
    },
    {
      title: "Total Orders",
      value: formatNumberInIN(totalOrders),
      description: "Total order count in range",
      icon: ShoppingBag,
      accentColor: "text-indigo-600",
      bgColor: "bg-indigo-50 border-indigo-100",
      badge: null,
    },
    {
      title: "Pending Orders",
      value: formatNumberInIN(pendingOrders),
      description: "Orders awaiting fulfillment",
      icon: Clock,
      accentColor: "text-amber-600",
      bgColor: "bg-amber-50 border-amber-100",
      badge: pendingOrders > 0 ? { text: "Needs Action", type: "warning" } : null,
    },
    {
      title: "Approved Orders",
      value: formatNumberInIN(approvedOrders),
      description: "Successfully processed orders",
      icon: CheckCircle2,
      accentColor: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-100",
      badge: { text: "Verified", type: "success" },
    },
    {
      title: "Pending Sellers",
      value: formatNumberInIN(pendingSellers),
      description: "Onboarding applications",
      icon: UserCheck,
      accentColor: "text-amber-600",
      bgColor: "bg-amber-50 border-amber-100",
      badge: pendingSellers > 0 ? { text: "Review Req.", type: "warning" } : null,
    },
    {
      title: "Pending Products",
      value: formatNumberInIN(pendingProducts),
      description: "Catalog approval queue",
      icon: PackageCheck,
      accentColor: "text-amber-600",
      bgColor: "bg-amber-50 border-amber-100",
      badge: pendingProducts > 0 ? { text: "Review Req.", type: "warning" } : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
                  {card.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${card.bgColor}`}
                >
                  <IconComponent className={`w-5 h-5 ${card.accentColor}`} />
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {card.value}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 truncate">{card.description}</span>
              {card.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                    card.badge.type === "warning"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {card.badge.text}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
