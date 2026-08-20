import React, { useState, useEffect } from "react";
import { PromoterCommissionItem } from "../../services/PromoterCommissionService";
import { ShieldAlert, X, AlertCircle } from "lucide-react";

interface HoldCommissionModalProps {
  isOpen: boolean;
  selectedItems: PromoterCommissionItem[];
  onClose: () => void;
  onConfirmHold: (payload: { commissionIds: string[]; reason: string; note?: string }) => void;
  isProcessing?: boolean;
}

const HOLD_REASONS = [
  "Order dispute",
  "Payment verification",
  "Seller issue",
  "Manual review",
  "Other",
];

export const HoldCommissionModal: React.FC<HoldCommissionModalProps> = ({
  isOpen,
  selectedItems,
  onClose,
  onConfirmHold,
  isProcessing = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("Order dispute");
  const [customReason, setCustomReason] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedReason("Order dispute");
      setCustomReason("");
      setValidationError(null);
    }
  }, [isOpen]);

  if (!isOpen || selectedItems.length === 0) return null;

  const isBulk = selectedItems.length > 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const finalReason = selectedReason === "Other" ? customReason.trim() : selectedReason;

    if (!finalReason) {
      setValidationError("Reason for hold is mandatory. Please select or specify a reason.");
      return;
    }

    onConfirmHold({
      commissionIds: selectedItems.map((item) => item._id),
      reason: finalReason,
      note: customReason.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isBulk ? `Hold Selected (${selectedItems.length} Commissions)` : "Hold Commission"}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Place commission on operational hold</p>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-500 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-xs font-medium text-amber-900">
            💡 Placing a commission on <strong>HOLD</strong> preserves its current state. Upon resuming/unholding, it will restore to its exact previous valid state.
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Reason for Hold <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full p-2.5 border border-slate-200 bg-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            >
              {HOLD_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {(selectedReason === "Other" || true) && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Hold Details & Notes {selectedReason === "Other" && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Provide detailed explanation for placing this commission on hold..."
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
              />
            </div>
          )}

          {/* Actions */}
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
              className="w-1/2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? <span>Placing on Hold...</span> : <span>Confirm Hold</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
