import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, X, RefreshCw, Upload, Trash2 } from "lucide-react";
import { WalletRedeemRequest } from "../../types";
import { formatIndianCurrency } from "../../utils/utils";
import { uploadImage } from "../../utils";

export interface WalletRedeemActionPayload {
  id: string;
  status: "accept" | "reject";
  reason: string;
  metadata?: {
    utrNumber?: string;
    screenshotUrl?: string;
    paymentMode?: string;
    adminNote?: string;
  };
}

interface WalletRedeemActionModalProps {
  isOpen: boolean;
  request: WalletRedeemRequest | null;
  actionType: "accept" | "reject" | null;
  onClose: () => void;
  onConfirm: (payload: WalletRedeemActionPayload) => Promise<void>;
  isProcessing: boolean;
}

export const WalletRedeemActionModal: React.FC<WalletRedeemActionModalProps> = ({
  isOpen,
  request,
  actionType,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  // Form Field States
  const [paymentMode, setPaymentMode] = useState<string>("upi");
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [adminNote, setAdminNote] = useState<string>("");

  // Screenshot File & Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form defaults when request or actionType changes
  useEffect(() => {
    if (request && isOpen) {
      setFormError(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsUploading(false);

      if (actionType === "accept") {
        const defaultMode =
          request.metadata?.paymentMode ||
          request.metadata?.manualTranferSource ||
          "upi";
        setPaymentMode(defaultMode.toLowerCase());
        setUtrNumber(request.metadata?.utrNumber || "");
        setReason("Manual payout verified by admin");
        setAdminNote(request.metadata?.adminNote || "");
      } else if (actionType === "reject") {
        setReason(request.reason || "");
        setAdminNote(request.metadata?.adminNote || "");
      }
    }
  }, [request, actionType, isOpen]);

  // Handle image selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFormError("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFormError("Image file size must be less than 10MB.");
        return;
      }

      setSelectedFile(file);
      setFormError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (!isOpen || !request || !actionType) return null;

  const requesterName = request.requester
    ? [request.requester.firstName, request.requester.lastName].filter(Boolean).join(" ") || "User"
    : "User";

  const amountFormatted = formatIndianCurrency(request.metadata?.amount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (actionType === "accept") {
      if (!utrNumber.trim()) {
        setFormError("UTR Number is required for payout acceptance.");
        return;
      }
      if (!reason.trim()) {
        setFormError("Acceptance reason is required.");
        return;
      }
    } else if (actionType === "reject") {
      if (!reason.trim()) {
        setFormError("Rejection reason is required.");
        return;
      }
    }

    // Step 1: Upload image if a new screenshot file is selected
    let uploadedScreenshotUrl: string | undefined = request.metadata?.screenshotUrl;

    if (actionType === "accept" && selectedFile) {
      try {
        setIsUploading(true);
        const uploadedUrl = await uploadImage(selectedFile);
        if (!uploadedUrl) {
          setFormError("Failed to upload payment proof screenshot. Please check network and retry.");
          setIsUploading(false);
          return;
        }
        uploadedScreenshotUrl = uploadedUrl;
      } catch (err) {
        setFormError("Error uploading payment proof screenshot.");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // Step 2: Build Payload exactly matching backend contract
    let payload: WalletRedeemActionPayload;

    if (actionType === "accept") {
      payload = {
        id: request._id,
        status: "accept",
        reason: reason.trim(),
        metadata: {
          utrNumber: utrNumber.trim(),
          paymentMode: paymentMode.trim(),
          ...(uploadedScreenshotUrl ? { screenshotUrl: uploadedScreenshotUrl } : {}),
          ...(adminNote.trim() ? { adminNote: adminNote.trim() } : {}),
        },
      };
    } else {
      payload = {
        id: request._id,
        status: "reject",
        reason: reason.trim(),
        metadata: {
          ...(adminNote.trim() ? { adminNote: adminNote.trim() } : {}),
        },
      };
    }

    // Step 3: Trigger API execution (PUT /request)
    await onConfirm(payload);
  };

  const isBusy = isProcessing || isUploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            {actionType === "accept" ? (
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {actionType === "accept" ? "Accept Wallet Redemption" : "Reject Wallet Redemption"}
              </h3>
              <p className="text-xs text-slate-500 font-mono">Request ID: {request._id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Error Banner */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center justify-between">
                <span>{formError}</span>
                <button
                  type="button"
                  onClick={() => setFormError(null)}
                  className="text-rose-500 hover:text-rose-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Read-Only Request Context */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Redemption Request ID:</span>
                <span className="font-mono font-bold text-slate-900">{request._id}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Requester Name:</span>
                <span className="font-bold text-slate-900">{requesterName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Redemption Amount:</span>
                <span className="font-extrabold text-slate-900 text-sm">{amountFormatted}</span>
              </div>
            </div>

            {/* ACCEPT FORM FIELDS */}
            {actionType === "accept" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Payment Mode */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Payment Mode <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      disabled={isBusy}
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold capitalize disabled:bg-slate-100 cursor-pointer"
                    >
                      <option value="upi">UPI Payment</option>
                      <option value="account">Bank Transfer (Account)</option>
                      <option value="bank">Bank Transfer (Bank)</option>
                      <option value="manual">Manual Transfer</option>
                    </select>
                  </div>

                  {/* UTR Number */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      UTR / Txn Reference <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      disabled={isBusy}
                      placeholder="e.g. UTR1234567890"
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Acceptance Reason <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isBusy}
                    placeholder="e.g. Manual payout verified by admin"
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100"
                  />
                </div>

                {/* Payment Screenshot Upload */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Payment Proof Screenshot
                  </label>

                  {previewUrl ? (
                    <div className="relative p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Proof preview"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="overflow-hidden text-xs">
                          <span className="font-semibold text-slate-800 block truncate">
                            {selectedFile ? selectedFile.name : "Payment Proof Screenshot"}
                          </span>
                          {selectedFile && (
                            <span className="text-[10px] text-slate-400 block">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        disabled={isBusy}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 rounded-xl cursor-pointer transition-all">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">
                        Click to select payment screenshot
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, WEBP up to 10MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isBusy}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Admin Note */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Admin Settlement Note (Optional)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    disabled={isBusy}
                    placeholder="e.g. Paid outside system via banking portal"
                    rows={2}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100"
                  />
                </div>
              </>
            )}

            {/* REJECT FORM FIELDS */}
            {actionType === "reject" && (
              <>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Rejection Reason <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isBusy}
                    placeholder="e.g. Bank details not verified / Invalid request"
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:bg-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Admin Note (Optional)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    disabled={isBusy}
                    placeholder="Enter additional audit notes regarding this rejection..."
                    rows={3}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:bg-slate-100"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer ${
                actionType === "accept"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isBusy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isUploading
                  ? "Uploading Proof..."
                  : isProcessing
                  ? "Processing Request..."
                  : actionType === "accept"
                  ? "Confirm Acceptance"
                  : "Confirm Rejection"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
