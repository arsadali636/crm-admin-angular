import React, { useState, useEffect, useMemo } from "react";
import { PromoterCommissionItem } from "../../services/PromoterCommissionService";
import moment from "moment";
import { Calendar, Clock, X, AlertCircle } from "lucide-react";

interface ScheduleCommissionModalProps {
  isOpen: boolean;
  selectedItems: PromoterCommissionItem[];
  onClose: () => void;
  onConfirmSchedule: (payload: {
    commissionIds: string[];
    scheduleType: "today" | "days" | "custom_date";
    days?: number;
    releaseDate?: string;
    note?: string;
  }) => void;
  isProcessing?: boolean;
}

export const ScheduleCommissionModal: React.FC<ScheduleCommissionModalProps> = ({
  isOpen,
  selectedItems,
  onClose,
  onConfirmSchedule,
  isProcessing = false,
}) => {
  const [scheduleOption, setScheduleOption] = useState<"today" | "days" | "custom_date">("today");
  const [daysCount, setDaysCount] = useState<number>(5);
  const [customDate, setCustomDate] = useState<string>(moment().add(1, "days").format("YYYY-MM-DD"));
  const [adminNote, setAdminNote] = useState<string>("Manual release scheduled by Admin.");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScheduleOption("today");
      setDaysCount(5);
      setCustomDate(moment().add(1, "days").format("YYYY-MM-DD"));
      setAdminNote("Manual release scheduled by Admin.");
      setValidationError(null);
    }
  }, [isOpen]);

  // Calculate dynamic release date preview
  const calculatedReleaseDate = useMemo(() => {
    const today = moment();
    if (scheduleOption === "today") {
      return today.format("DD MMM YYYY");
    }
    if (scheduleOption === "days") {
      const validDays = Math.max(1, daysCount || 1);
      return today.clone().add(validDays, "days").format("DD MMM YYYY");
    }
    if (scheduleOption === "custom_date") {
      return customDate ? moment(customDate).format("DD MMM YYYY") : "Select date";
    }
    return today.format("DD MMM YYYY");
  }, [scheduleOption, daysCount, customDate]);

  if (!isOpen || selectedItems.length === 0) return null;

  const isBulk = selectedItems.length > 1;
  const singleItem = selectedItems[0];
  const totalCommissionAmount = selectedItems.reduce((sum, item) => sum + (item.commissionAmount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    let finalReleaseDate = moment().format("YYYY-MM-DD");

    if (scheduleOption === "days") {
      if (!daysCount || daysCount < 1) {
        setValidationError("Please enter a valid positive number of days.");
        return;
      }
      finalReleaseDate = moment().add(daysCount, "days").format("YYYY-MM-DD");
    } else if (scheduleOption === "custom_date") {
      if (!customDate) {
        setValidationError("Please select a valid custom date.");
        return;
      }
      if (moment(customDate).isBefore(moment(), "day")) {
        setValidationError("Custom release date cannot be in the past.");
        return;
      }
      finalReleaseDate = customDate;
    }

    onConfirmSchedule({
      commissionIds: selectedItems.map((item) => item._id),
      scheduleType: scheduleOption,
      days: scheduleOption === "days" ? daysCount : undefined,
      releaseDate: finalReleaseDate,
      note: adminNote,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {isBulk ? `Bulk Schedule (${selectedItems.length} Commissions)` : "Schedule Commission"}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Set scheduled release date for promoter payouts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Read-Only Information Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
            {isBulk ? (
              <div className="grid grid-cols-2 gap-3 font-semibold text-slate-700">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Selected Commissions</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedItems.length} Records</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Total Value</span>
                  <p className="font-extrabold text-blue-600 text-sm mt-0.5">₹{totalCommissionAmount.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Promoter</span>
                  <p className="font-bold text-slate-800 truncate">{singleItem.promoterName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{singleItem.promoterId}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Order ID</span>
                  <p className="font-bold text-slate-800 font-mono">#{singleItem.numericOrderId}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Order Value</span>
                  <p className="font-bold text-slate-700">₹{singleItem.orderValue.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Commission Amount</span>
                  <p className="font-extrabold text-emerald-600 text-xs">₹{singleItem.commissionAmount.toLocaleString("en-IN")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Validation Error Alert */}
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-500 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Schedule Options Radio Group */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Release Schedule Option
            </label>

            <div className="space-y-2">
              {/* Option 1: Release Today */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  scheduleOption === "today"
                    ? "border-blue-500 bg-blue-50/40 text-blue-900 font-semibold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="scheduleOption"
                    value="today"
                    checked={scheduleOption === "today"}
                    onChange={() => setScheduleOption("today")}
                    className="accent-blue-600 cursor-pointer h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold block">Release Today</span>
                    <span className="text-[10px] text-slate-500 font-normal">Release becomes due immediately today</span>
                  </div>
                </div>
              </label>

              {/* Option 2: After X Days */}
              <label
                className={`flex flex-col gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  scheduleOption === "days"
                    ? "border-blue-500 bg-blue-50/40 text-blue-900 font-semibold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="scheduleOption"
                    value="days"
                    checked={scheduleOption === "days"}
                    onChange={() => setScheduleOption("days")}
                    className="accent-blue-600 cursor-pointer h-4 w-4"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold block">After X Days</span>
                    <span className="text-[10px] text-slate-500 font-normal">Release after specified number of days</span>
                  </div>
                </div>

                {scheduleOption === "days" && (
                  <div className="ml-7 pt-1 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-semibold text-slate-600">Release After:</span>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={daysCount}
                      onChange={(e) => setDaysCount(parseInt(e.target.value) || 1)}
                      className="w-20 p-1.5 border border-slate-300 rounded-lg text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-xs font-semibold text-slate-600">Days</span>
                  </div>
                )}
              </label>

              {/* Option 3: Custom Date */}
              <label
                className={`flex flex-col gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  scheduleOption === "custom_date"
                    ? "border-blue-500 bg-blue-50/40 text-blue-900 font-semibold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="scheduleOption"
                    value="custom_date"
                    checked={scheduleOption === "custom_date"}
                    onChange={() => setScheduleOption("custom_date")}
                    className="accent-blue-600 cursor-pointer h-4 w-4"
                  />
                  <div>
                    <span className="text-xs font-bold block">Custom Release Date</span>
                    <span className="text-[10px] text-slate-500 font-normal">Pick a specific future release date</span>
                  </div>
                </div>

                {scheduleOption === "custom_date" && (
                  <div className="ml-7 pt-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="date"
                      min={moment().format("YYYY-MM-DD")}
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer"
                    />
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Dynamic Release Date Preview Card */}
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs font-semibold">
            <span className="text-blue-700 flex items-center gap-1.5">
              <Clock size={14} className="text-blue-600" />
              Dynamic Release Date Preview:
            </span>
            <span className="font-extrabold text-blue-900 text-sm font-mono">{calculatedReleaseDate}</span>
          </div>

          {/* Admin Note Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Admin Note (Optional)
            </label>
            <textarea
              rows={2}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. Manual release scheduled by Admin after return period check."
              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Confirmation Notice for Bulk */}
          {isBulk && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
              ⚠️ You are scheduling <strong>{selectedItems.length}</strong> commissions for release.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-1/2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <span>Scheduling...</span>
              ) : (
                <span>{isBulk ? `Schedule ${selectedItems.length} Commissions` : "Schedule Commission"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
