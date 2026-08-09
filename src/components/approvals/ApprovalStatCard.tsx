import React from "react";
import { FiTrendingUp, FiTrendingDown, FiArrowRight } from "react-icons/fi";

interface ApprovalStatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral" | string;
  gradientClass?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const ApprovalStatCard: React.FC<ApprovalStatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendType = "neutral",
  gradientClass = "from-slate-50 to-slate-100/50 border-slate-200/80",
  onClick,
  isActive = false,
}) => {
  const getTrendStyle = () => {
    switch (trendType) {
      case "positive":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/40",
          icon: <FiTrendingUp className="h-3 w-3" />,
        };
      case "negative":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200/40",
          icon: <FiTrendingDown className="h-3 w-3" />,
        };
      default:
        return {
          bg: "bg-slate-55 text-slate-600 border-slate-200/65",
          icon: <FiArrowRight className="h-3 w-3" />,
        };
    }
  };

  const trendStyle = getTrendStyle();

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all duration-350 bg-gradient-to-br ${gradientClass} ${
        onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
      } ${
        isActive 
          ? "ring-2 ring-indigo-600 border-transparent shadow-sm" 
          : "hover:border-slate-350"
      }`}
    >
      {/* Background Accent Glass Glow */}
      <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/20 blur-xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              {value}
            </span>
          </div>
        </div>

        {/* Premium Icon Shell */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-xs border border-white/40 backdrop-blur-xs text-slate-800">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-100/50">
        <span className="text-[10px] font-medium text-slate-500 truncate">
          {description || "Active items in queue"}
        </span>

        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold tracking-tight ${trendStyle.bg}`}
          >
            {trendStyle.icon}
            <span>{trend}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ApprovalStatCard;
