import clsx from "clsx";
import { STATUS_LABEL, STATUS_COLOR, PAYMENT_METHODS } from "./Constant";

interface Props {
  status: number;
  size?: "sm" | "mid" | "md";
  type?: string;
}

const OrderStatusTag = ({ status, size = "md", type }: Props) => {
  let label = type === "order" ? STATUS_LABEL[status] : PAYMENT_METHODS[status];
  if (!label && typeof status === "string") {
    label = status;
  }
  const colorClass =
    STATUS_COLOR[status] ||
    STATUS_COLOR[Number(status)] ||
    "bg-gray-100 text-gray-700 border-gray-300";

  if (!label) {
    return (
      <span className="px-2 py-0.5 text-xs rounded-full border bg-gray-100 text-gray-600">
        {String(status || "Unknown")}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium capitalize",
        colorClass,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      {label}
    </span>
  );
};

export default OrderStatusTag;
