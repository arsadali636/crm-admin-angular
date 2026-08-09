import React from "react";
import { useNavigate } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";
import { ProductType } from "../../types";
import { formatIndianCurrency, formatNumberInIN } from "../../utils/utils";
import { TableSkeleton } from "./DashboardSkeleton";
import { SectionErrorState, SectionEmptyState } from "./SectionStateUI";

interface TopProductsTableProps {
  products: ProductType[];
  loading: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  loading,
  error,
  onRetry,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <TableSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Top Products
          </h3>
        </div>
        <SectionErrorState message="Unable to load top products." onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Top Products</h3>
          </div>
          <button
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            onClick={() => navigate("/products")}
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        {!products || products.length === 0 ? (
          <div className="p-4">
            <SectionEmptyState
              title="No Top Products"
              message="No product sales recorded for the selected period."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4 text-center w-12">Rank</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-right">Sales</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  const rankBadgeClass =
                    rank === 1
                      ? "bg-amber-100 text-amber-800 border-amber-300 font-bold"
                      : rank === 2
                      ? "bg-slate-200 text-slate-800 border-slate-300 font-bold"
                      : rank === 3
                      ? "bg-orange-100 text-orange-800 border-orange-300 font-bold"
                      : "bg-slate-100 text-slate-600 border-slate-200 font-medium";

                  return (
                    <tr
                      key={product._id || index}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] border ${rankBadgeClass}`}
                        >
                          #{rank}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`font-semibold ${
                            isTop3 ? "text-slate-900" : "text-slate-700"
                          } truncate max-w-[200px] block`}
                          title={product.productName}
                        >
                          {product.productName || "Unnamed Product"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                        {formatIndianCurrency(product.totalSale)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600 font-medium">
                        {formatNumberInIN(product.volume)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
