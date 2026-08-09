import React from "react";
import { Award, Store, DollarSign, Sparkles } from "lucide-react";
import { ProductType, TopAffiliateType } from "../../types";
import { formatIndianCurrency } from "../../utils/utils";
import { CardSkeleton } from "./DashboardSkeleton";

interface MarketplaceSnapshotProps {
  topProducts: ProductType[];
  topSellers: TopAffiliateType[];
  orders: any[];
  loading: boolean;
}

export const MarketplaceSnapshot: React.FC<MarketplaceSnapshotProps> = ({
  topProducts,
  topSellers,
  orders,
  loading,
}) => {
  if (loading) {
    return <CardSkeleton />;
  }

  // Real calculations only
  const topProduct = topProducts && topProducts.length > 0 ? topProducts[0] : null;
  const topSeller = topSellers && topSellers.length > 0 ? topSellers[0] : null;

  const totalSales = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  // Don't render snapshot if no real data is available at all
  if (!topProduct && !topSeller && totalOrders === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Marketplace Snapshot</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            Realtime Analytics
          </span>
        </div>

        <div className="space-y-3">
          {/* Top Product */}
          {topProduct && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                    Top Product
                  </span>
                  <span
                    className="text-sm font-bold text-slate-900 truncate block"
                    title={topProduct.productName}
                  >
                    {topProduct.productName || "N/A"}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-blue-700 block">
                  {formatIndianCurrency(topProduct.totalSale)}
                </span>
                <span className="text-[10px] text-slate-500">
                  {topProduct.volume ? `${topProduct.volume} units` : ""}
                </span>
              </div>
            </div>
          )}

          {/* Top Seller */}
          {topSeller && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                    Top Seller
                  </span>
                  <span
                    className="text-sm font-bold text-slate-900 truncate block"
                    title={topSeller.businessName || topSeller.fName || "N/A"}
                  >
                    {topSeller.businessName || topSeller.fName || "N/A"}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-blue-700 block">
                  {formatIndianCurrency(topSeller.totalSale)}
                </span>
                <span className="text-[10px] text-slate-500">
                  {topSeller.volume ? `${topSeller.volume} items` : ""}
                </span>
              </div>
            </div>
          )}

          {/* Average Order Value */}
          {totalOrders > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                    Avg. Order Value
                  </span>
                  <span className="text-xs text-slate-500">Total Sales / Total Orders</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-emerald-700 block">
                  {formatIndianCurrency(avgOrderValue)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        Computed strictly from current API responses
      </div>
    </div>
  );
};
