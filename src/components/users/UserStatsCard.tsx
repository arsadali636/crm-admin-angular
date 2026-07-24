import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

type UserStatsCardProps = {
  title: string;
  count: number | string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  isActive: boolean;
  onClick: () => void;
  gradientClass: string;
  iconBgClass: string;
  iconColorClass: string;
};

export const UserStatsCard: React.FC<UserStatsCardProps> = ({
  title,
  count,
  icon: Icon,
  trend,
  subtitle,
  isActive,
  onClick,
  gradientClass,
  iconBgClass,
  iconColorClass,
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-2xl cursor-pointer select-none p-5
        transition-all duration-300 border
        ${
          isActive
            ? `${gradientClass} text-white shadow-lg border-transparent ring-2 ring-indigo-500/20`
            : "bg-white hover:bg-slate-50/50 border-slate-100 shadow-sm hover:shadow-md"
        }
      `}
    >
      {/* Top indicator stripe for inactive card */}
      {!isActive && (
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradientClass.replace("bg-gradient-to-br ", "")}`} />
      )}

      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isActive ? "text-white/70" : "text-slate-400"
            }`}
          >
            {title}
          </span>
          <h3
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isActive ? "text-white" : "text-slate-900"
            }`}
          >
            {count}
          </h3>

          {/* Trend Section */}
          {(trend || subtitle) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {trend && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : trend.isPositive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {trend.isPositive ? (
                    <TrendingUp size={10} strokeWidth={2.5} />
                  ) : (
                    <TrendingDown size={10} strokeWidth={2.5} />
                  )}
                  {trend.value}%
                </span>
              )}
              {subtitle && (
                <span
                  className={`text-[10px] ${
                    isActive ? "text-white/60" : "text-slate-400"
                  }`}
                >
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon container */}
        <div
          className={`
            p-3 rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110
            ${isActive ? "bg-white/20 text-white" : `${iconBgClass} ${iconColorClass}`}
          `}
        >
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
};
