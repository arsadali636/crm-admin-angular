import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Breadcrumb from "../components/Breadcrumb";
import { walletStore, WalletSettings as SettingsType } from "../utils/walletStore";
import {
  Settings,
  Save,
  CheckCircle2,
  ShieldAlert,
  Mail,
  MessageSquare,
  Bell,
  Clock,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import { Button } from "../components/Button";
import { SettingsService, SettingItem } from "../services/SettingsService";

interface SettingsFormValues {
  minWithdrawal: number;
  maxWithdrawal: number;
  autoApproval: boolean;
  approvalFlow: "single" | "sequential";
  notifyEmail: boolean;
  notifySms: boolean;
  notifyApp: boolean;
}

export const WalletSettings = () => {
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Backend Setting State (COMMISSION_TRANSFER_DELAY_DAYS) ──
  const [delaySetting, setDelaySetting] = useState<SettingItem | null>(null);
  const [delayValue, setDelayValue] = useState<string>("");
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [settingUnavailable, setSettingUnavailable] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [delaySaveNotice, setDelaySaveNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { register, handleSubmit, reset } = useForm<SettingsFormValues>();

  const fetchDelaySetting = async (isSilent = false) => {
    if (!isSilent) setFetchLoading(true);
    setFetchError(null);
    setSettingUnavailable(false);

    const res = await SettingsService.getSettings();

    if (!res.success) {
      if (!isSilent) setFetchError(res.message || "Failed to fetch settings from backend.");
      setFetchLoading(false);
      return;
    }

    const item = SettingsService.findSettingByKey(res.data, "COMMISSION_TRANSFER_DELAY_DAYS");

    if (!item) {
      if (!isSilent) setSettingUnavailable(true);
      setFetchLoading(false);
      return;
    }

    setDelaySetting(item);
    const initialVal = item.value !== undefined && item.value !== null ? String(item.value) : "";
    setDelayValue(initialVal);
    validateInput(initialVal);
    setFetchLoading(false);
  };

  useEffect(() => {
    // Load local walletStore settings
    const s = walletStore.getSettings();
    reset({
      minWithdrawal: s.minWithdrawal,
      maxWithdrawal: s.maxWithdrawal,
      autoApproval: s.autoApproval,
      approvalFlow: s.approvalFlow,
      notifyEmail: s.notifications.email,
      notifySms: s.notifications.sms,
      notifyApp: s.notifications.app,
    });

    // Fetch dynamic backend settings from GET /api/settings
    fetchDelaySetting();
  }, [reset]);

  const validateInput = (val: string): string | null => {
    if (val === "" || val === null || val === undefined) {
      const err = "Commission transfer delay value is required.";
      setValidationError(err);
      return err;
    }
    const str = String(val).trim();
    if (str === "") {
      const err = "Commission transfer delay value is required.";
      setValidationError(err);
      return err;
    }
    if (str.includes(".")) {
      const err = "Only integer values are allowed. Decimal values are not accepted.";
      setValidationError(err);
      return err;
    }
    if (!/^-?\d+$/.test(str)) {
      const err = "Only valid numeric integer values are allowed.";
      setValidationError(err);
      return err;
    }
    const num = Number(str);
    if (isNaN(num)) {
      const err = "Only valid numeric integer values are allowed.";
      setValidationError(err);
      return err;
    }
    if (num < 0) {
      const err = "Minimum value is 0. Negative values are not allowed.";
      setValidationError(err);
      return err;
    }
    setValidationError(null);
    return null;
  };

  const handleDelayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setDelayValue(rawVal);
    validateInput(rawVal);
    setDelaySaveNotice(null);
  };

  const handleSaveDelaySetting = async () => {
    const err = validateInput(delayValue);
    if (err) return;

    const parsedDays = Number(delayValue.trim());

    setSaveLoading(true);
    setDelaySaveNotice(null);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await SettingsService.updateCommissionTransferDelay(parsedDays);

    if (!res.success) {
      const msg = res.message || "Failed to update commission transfer delay setting.";
      setErrorMsg(msg);
      setDelaySaveNotice({ type: "error", message: msg });
      setSaveLoading(false);
      return;
    }

    const successMsgText = res.message || "Commission transfer delay setting updated successfully.";
    setSuccessMsg(successMsgText);
    setDelaySaveNotice({
      type: "success",
      message: successMsgText,
    });

    // Optimistically update display badge & visualizer
    setDelaySetting((prev) => (prev ? { ...prev, value: parsedDays } : { key: "COMMISSION_TRANSFER_DELAY_DAYS", value: parsedDays }));

    // Re-fetch updated backend settings silently to keep backend as single source of truth
    await fetchDelaySetting(true);

    setSaveLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setDelaySaveNotice(null);
    }, 4000);
  };

  const onSubmit = (data: SettingsFormValues) => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    setTimeout(() => {
      if (Number(data.minWithdrawal) <= 0) {
        setErrorMsg("Minimum withdrawal limit must be greater than 0.");
        setLoading(false);
        return;
      }

      if (Number(data.maxWithdrawal) < Number(data.minWithdrawal)) {
        setErrorMsg("Maximum withdrawal limit cannot be less than minimum limit.");
        setLoading(false);
        return;
      }

      const payload: SettingsType = {
        minWithdrawal: Number(data.minWithdrawal),
        maxWithdrawal: Number(data.maxWithdrawal),
        autoApproval: data.autoApproval,
        approvalFlow: data.approvalFlow,
        notifications: {
          email: data.notifyEmail,
          sms: data.notifySms,
          app: data.notifyApp,
        },
      };

      walletStore.setSettings(payload);
      setSuccessMsg("Wallet configurations updated successfully.");
      setLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 600);
  };

  return (
    <div className="p-3 space-y-6">
      {/* ── Breadcrumb ── */}
      <div className="bg-white rounded-xl px-5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-slate-100 flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Wallet Module", to: "/wallet/dashboard" },
            { label: "Wallet Settings", to: "/wallet/settings" },
          ]}
        />
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2 max-w-2xl">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-2 max-w-2xl">
          <ShieldAlert size={16} className="text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Commission Transfer Delay Setting Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm max-w-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Commission Transfer Delay
            </h3>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
            <ShieldAlert size={12} className="text-blue-600" />
            Backend Sync Active
          </span>
        </div>

        <div className="p-6 space-y-5">
          {fetchLoading ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Fetching settings from GET /api/settings...</p>
            </div>
          ) : fetchError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert size={16} />
                <span>Failed to Fetch Setting</span>
              </div>
              <p className="text-[11px] text-red-600">{fetchError}</p>
              <button
                type="button"
                onClick={() => fetchDelaySetting()}
                className="mt-2 text-xs text-red-700 underline font-semibold hover:text-red-800 flex items-center gap-1"
              >
                <RotateCw size={12} />
                <span>Retry Loading</span>
              </button>
            </div>
          ) : settingUnavailable ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle size={16} className="text-amber-600" />
                <span>Setting Unavailable</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Setting key <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">COMMISSION_TRANSFER_DELAY_DAYS</code> was not returned in the backend response.
              </p>
            </div>
          ) : (
            <>
              {/* Purpose & Current Configured Value */}
              <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Setting Purpose
                    </span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      {delaySetting?.description || "Number of days after delivery before admin can transfer commission."}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Current Configured Value
                    </span>
                    <span className="inline-flex items-center gap-1 mt-0.5 px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-xs">
                      {delaySetting?.value ?? "N/A"} Days
                    </span>
                  </div>
                </div>

                {/* Business Rule Flow Visualizer */}
                <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-slate-500 overflow-x-auto gap-2">
                  <span className="px-2.5 py-1 bg-slate-200/60 rounded-md text-slate-700 font-bold shrink-0">
                    DELIVERED
                  </span>
                  <span className="text-slate-400 font-bold">→</span>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md font-bold shrink-0">
                    Wait {delaySetting?.value ?? 4} Days
                  </span>
                  <span className="text-slate-400 font-bold">→</span>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-bold shrink-0">
                    Commission Eligible
                  </span>
                  <span className="text-slate-400 font-bold">→</span>
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md font-bold shrink-0">
                    Admin Transfer
                  </span>
                </div>
              </div>

              {/* Editable Input Field & Validation */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Commission Transfer Delay (Days)
                </label>
                <div className="relative flex items-center max-w-xs">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={delayValue}
                    onChange={handleDelayInputChange}
                    disabled={saveLoading}
                    placeholder="e.g. 4"
                    className={`w-full p-2.5 pr-14 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all ${
                      validationError
                        ? "border-red-400 bg-red-50/30 text-red-900 focus:ring-red-500/20"
                        : "border-slate-200 bg-slate-50/50 text-slate-800 focus:ring-blue-500/20 focus:border-blue-300"
                    }`}
                  />
                  <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
                    Days
                  </span>
                </div>

                {validationError && (
                  <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
                    <ShieldAlert size={13} className="shrink-0" />
                    <span>{validationError}</span>
                  </p>
                )}
              </div>

              {/* Status Notice */}
              {delaySaveNotice && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    delaySaveNotice.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  {delaySaveNotice.type === "success" ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span className="font-semibold">{delaySaveNotice.message}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end items-center gap-3">
                <Button
                  type="button"
                  onClick={handleSaveDelaySetting}
                  disabled={saveLoading || Boolean(validationError) || delayValue.trim() === ""}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs px-5 py-2.5 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  color="primary"
                >
                  {saveLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>


      {/* ── Settlement Preferences Form ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm max-w-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Settings size={18} className="text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Settlement Preferences</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Threshold Limits */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 pb-1.5 border-b border-slate-50 flex items-center gap-1.5">
              <span>Withdrawal Threshold Limits</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Minimum Withdrawal (₹)
                </label>
                <input
                  type="number"
                  {...register("minWithdrawal", { required: true })}
                  className="w-full p-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Maximum Withdrawal (₹)
                </label>
                <input
                  type="number"
                  {...register("maxWithdrawal", { required: true })}
                  className="w-full p-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Auto Approvals */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-800 pb-1.5 border-b border-slate-50">
              Auto Approvals & Payout Flow
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 bg-slate-50/20 rounded-2xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="autoApproval"
                  {...register("autoApproval")}
                  className="mt-1 cursor-pointer w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="autoApproval" className="block text-xs font-bold text-slate-700 cursor-pointer">
                    Enable Auto-Approvals
                  </label>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Automatically clear settlements that fall below the minimum threshold.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Authorization Workflow
                </label>
                <select
                  {...register("approvalFlow")}
                  className="w-full p-2.5 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none cursor-pointer font-semibold text-slate-600"
                >
                  <option value="single">Single Payout Manager Approval</option>
                  <option value="sequential">Sequential Multi-tier Admin Payout Flow</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification settings */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-800 pb-1.5 border-b border-slate-50">
              Notification Dispatches
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="p-3.5 border border-slate-100 bg-slate-50/20 rounded-2xl flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("notifyEmail")}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Mail size={14} className="text-blue-500" />
                  <span>Email Alerts</span>
                </div>
              </label>

              <label className="p-3.5 border border-slate-100 bg-slate-50/20 rounded-2xl flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("notifySms")}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MessageSquare size={14} className="text-indigo-500" />
                  <span>SMS Alerts</span>
                </div>
              </label>

              <label className="p-3.5 border border-slate-100 bg-slate-50/20 rounded-2xl flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("notifyApp")}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Bell size={14} className="text-violet-500" />
                  <span>App Alerts</span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs px-5 py-2.5 flex items-center gap-1.5"
              color="primary"
            >
              <Save size={14} />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
