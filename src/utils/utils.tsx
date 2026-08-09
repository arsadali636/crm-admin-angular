export const capitalize = (value?: string) => (
  console.log("string", value),
  value ? value?.charAt(0)?.toUpperCase() + value?.slice(1) : ""
);

export const formatDate = (date?: Date | string): string => {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};

export const formatIndianCurrency = (amount?: number | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumberInIN = (num?: number | null): string => {
  if (num === undefined || num === null || isNaN(num)) return "0";
  return new Intl.NumberFormat("en-IN").format(num);
};

export const maskBankAccount = (accountNumber?: string | null): string => {
  if (!accountNumber) return "";
  const cleaned = String(accountNumber).trim().replace(/\s+/g, "");
  if (cleaned.length <= 4) return "•••• " + cleaned;
  const last4 = cleaned.slice(-4);
  return "•••• •••• " + last4;
};


