import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useSmartBack } from "../hooks/useSmartBack";

export interface BackButtonProps {
  label?: string;
  fallback?: string;
  className?: string;
  onBeforeBack?: () => boolean | Promise<boolean>;
  onClick?: () => void;
  variant?: "button" | "icon" | "inline";
}

export const BackButton: React.FC<BackButtonProps> = ({
  label,
  fallback = "/dashboard",
  className = "",
  onBeforeBack,
  onClick,
  variant = "icon",
}) => {
  const goBack = useSmartBack();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
      return;
    }
    await goBack({ fallback, onBeforeBack });
  };

  const displayLabel = label ? (label.startsWith("Back") ? label : `Back to ${label}`) : "Back";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={`Navigate back to ${fallback}`}
        className={`inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all duration-150 border border-slate-200/60 shadow-sm cursor-pointer ${className}`}
      >
        <FaArrowLeft size={11} className="text-slate-500 flex-shrink-0" />
        <span className="truncate">{displayLabel}</span>
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={`Navigate back to ${fallback}`}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-[#3644d6] hover:text-[#2c38b8] transition-colors cursor-pointer ${className}`}
      >
        <FaArrowLeft size={11} className="flex-shrink-0" />
        <span>{displayLabel}</span>
      </button>
    );
  }

  // Default "icon" variant: compact icon button, responsive with optional label on md screen
  return (
    <button
      type="button"
      onClick={handleClick}
      title={label ? displayLabel : "Go back"}
      className={`p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 rounded-xl transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${className}`}
    >
      <FaArrowLeft size={13} className="flex-shrink-0" />
      {label && <span className="text-xs font-semibold hidden md:inline pr-1">{label}</span>}
    </button>
  );
};

export default BackButton;
