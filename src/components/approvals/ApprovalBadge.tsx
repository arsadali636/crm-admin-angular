import React from "react";
import { 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle, 
  FiInfo, 
  FiUser, 
  FiBox,
  FiZap
} from "react-icons/fi";

export type BadgeType = 
  | "pending" 
  | "accept" 
  | "reject" 
  | "approved" 
  | "rejected" 
  | "high" 
  | "medium" 
  | "low" 
  | "new" 
  | "updated" 
  | "verified"
  | "seller_onboarding"
  | "product_approval";

interface ApprovalBadgeProps {
  type: BadgeType | string;
  className?: string;
}

export const ApprovalBadge: React.FC<ApprovalBadgeProps> = ({ type, className = "" }) => {
  const normalizedType = type?.toLowerCase().trim();

  // Status badging mapping
  let config = {
    label: type,
    bg: "bg-slate-50 text-slate-700 border-slate-200/60",
    icon: <FiInfo size={11} />,
  };

  switch (normalizedType) {
    case "pending":
      config = {
        label: "Pending Review",
        bg: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
        icon: <FiClock size={11} className="animate-spin [animation-duration:8s]" />,
      };
      break;
    case "accept":
    case "approved":
      config = {
        label: "Approved",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-250/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        icon: <FiCheckCircle size={11} />,
      };
      break;
    case "reject":
    case "rejected":
      config = {
        label: "Rejected",
        bg: "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
        icon: <FiXCircle size={11} />,
      };
      break;
    case "high":
    case "critical":
    case "high priority":
      config = {
        label: "High Priority",
        bg: "bg-red-50 text-red-700 border-red-200/50 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.08)]",
        icon: <FiAlertCircle size={11} className="animate-bounce" />,
      };
      break;
    case "medium":
    case "medium priority":
      config = {
        label: "Medium Priority",
        bg: "bg-orange-50 text-orange-700 border-orange-200/50 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
        icon: <FiAlertCircle size={11} />,
      };
      break;
    case "low":
    case "low priority":
      config = {
        label: "Low Priority",
        bg: "bg-slate-100 text-slate-650 border-slate-200/60 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50",
        icon: <FiInfo size={11} />,
      };
      break;
    case "new":
      config = {
        label: "New",
        bg: "bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
        icon: <FiZap size={11} className="text-blue-550 fill-blue-550" />,
      };
      break;
    case "updated":
      config = {
        label: "Updated",
        bg: "bg-violet-50 text-violet-750 border-violet-200/50 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
        icon: <FiZap size={11} />,
      };
      break;
    case "verified":
      config = {
        label: "Verified",
        bg: "bg-sky-50 text-sky-700 border-sky-200/50 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
        icon: <FiCheckCircle size={11} />,
      };
      break;
    case "seller_onboarding":
    case "seller":
      config = {
        label: "Seller Onboarding",
        bg: "bg-indigo-50 text-indigo-700 border-indigo-200/50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
        icon: <FiUser size={11} />,
      };
      break;
    case "product_approval":
    case "product":
      config = {
        label: "Product Approval",
        bg: "bg-purple-50 text-purple-700 border-purple-200/50 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
        icon: <FiBox size={11} />,
      };
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-tight transition-all duration-300 ${config.bg} ${className}`}
    >
      <span className="flex-shrink-0">{config.icon}</span>
      <span className="truncate">{config.label}</span>
    </span>
  );
};

export default ApprovalBadge;
