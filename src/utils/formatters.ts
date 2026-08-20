import moment from "moment";

/**
 * Safe currency formatter:
 * - Numeric 0 -> "₹0"
 * - null/undefined/NaN -> "—"
 * - Numeric > 0 -> "₹X,XXX"
 */
export const formatCurrency = (val: any): string => {
  if (val === 0 || val === "0") return "₹0";
  if (val === null || val === undefined || val === "") return "—";
  const num = Number(val);
  if (isNaN(num)) return "—";
  return `₹${num.toLocaleString("en-IN")}`;
};

/**
 * Safe date-time formatter using moment
 */
export const formatDateTime = (val: string | number | null | undefined): string => {
  if (!val) return "—";
  const m = moment(val);
  if (!m.isValid()) return "—";
  return m.local().format("DD MMM YYYY [at] hh:mm A");
};

/**
 * Safe date-only formatter using moment
 */
export const formatDateOnly = (val: string | number | null | undefined): string => {
  if (!val) return "—";
  const m = moment(val);
  if (!m.isValid()) return "—";
  return m.local().format("DD MMM YYYY");
};

/**
 * Copy text to clipboard with simple fallback
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};
