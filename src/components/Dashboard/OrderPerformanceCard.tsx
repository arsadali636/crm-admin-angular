import React from "react";
import { CheckCircle2, Clock, PackageCheck } from "lucide-react";
import { formatNumberInIN } from "../../utils/utils";
import { CardSkeleton } from "./DashboardSkeleton";

interface OrderPerformanceCardProps {
  orders: any[];
  loading: boolean;
}

export const OrderPerformanceCard: React.FC<OrderPerformanceCardProps> = ({
  orders,
  loading,
}) => {
  if (loading) {
    return <CardSkeleton />;
  }

  const totalCount = orders?.length || 0;
  const pendingCount = orders?.filter((item) => item.status === 0)?.length || 0;
  const approvedCount = orders?.filter((item) => item.status === 1)?.length || 0;
  const otherCount = Math.max(0, totalCount - (pendingCount + approvedCount));

  const approvedPercent = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  const pendingPercent = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;
  const otherPercent = totalCount > 0 ? Math.max(0, 100 - (approvedPercent + pendingPercent)) : 0;

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Order Performance</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Total: {formatNumberInIN(totalCount)}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="mb-5">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
            <span>Fulfillment Progress</span>
            <span>{approvedPercent}% Approved</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${approvedPercent}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Approved: ${approvedCount} (${approvedPercent}%)`}
            ></div>
            <div
              style={{ width: `${pendingPercent}%` }}
              className="bg-amber-400 transition-all duration-500"
              title={`Pending: ${pendingCount} (${pendingPercent}%)`}
            ></div>
            <div
              style={{ width: `${otherPercent}%` }}
              className="bg-slate-300 transition-all duration-500"
              title={`Other: ${otherCount} (${otherPercent}%)`}
            ></div>
          </div>
        </div>

        {/* Status Breakdown Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Approved */}
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col items-center">
            <div className="flex items-center gap-1 text-emerald-700 text-xs font-medium mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved</span>
            </div>
            <span className="text-lg font-bold text-slate-900">
              {formatNumberInIN(approvedCount)}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">{approvedPercent}%</span>
          </div>

          {/* Pending */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-700 text-xs font-medium mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending</span>
            </div>
            <span className="text-lg font-bold text-slate-900">
              {formatNumberInIN(pendingCount)}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">{pendingPercent}%</span>
          </div>

          {/* Other / Processing */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
            <div className="flex items-center gap-1 text-slate-600 text-xs font-medium mb-1">
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Other</span>
            </div>
            <span className="text-lg font-bold text-slate-900">
              {formatNumberInIN(otherCount)}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">{otherPercent}%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        Derived from active order records in selected range
      </div>
    </div>
  );
};
