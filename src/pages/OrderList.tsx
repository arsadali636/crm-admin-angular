import { useEffect, useState } from "react";
import moment from "moment";
import { getCompleteUrlV1 } from "../utils";
import { httpClient } from "../services/ApiService";
import DebounceSearch from "../components/DebounceSearch";
import CardSkeleton from "../components/CardSkeleton";
import PaginationControl from "../components/PaginationControl";
import { capitalize } from "../utils/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { Order, Pagination } from "../types";
import OrderStatusTag from "../utils/OrderStatusTag";
import { STATUS_LABEL } from "../utils/Constant";
import {
  FaEye,
  FaFileInvoice,
  FaDownload,
  FaRedo,
  FaFilter,
  FaShoppingBag,
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUndoAlt,
  FaChevronDown,
  FaTruck,
} from "react-icons/fa";

export const OrderList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  // Filter States
  const [startDate, setStartDate] = useState(
    moment().subtract(3, "months").startOf("day").toISOString()
  );
  const [endDate, setEndDate] = useState(moment().endOf("day").toISOString());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");


  // Checkbox selection for bulk actions
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [activeDropdownRow, setActiveDropdownRow] = useState<string | null>(null);

  const [pagination, setPagination] = useState<Pagination>({
    totalCount: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const fetchOrders = async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: pagination.limit,
        startDate,
        endDate,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (paymentFilter !== "all") {
        params.paymentMethod = paymentFilter;
      }

      const res = await httpClient.get(getCompleteUrlV1("order", params));
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data || []);
        setFilteredOrders(json.data || []);
        setPagination(json.pagination || { ...pagination, page });
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
    setSelectedOrderIds([]);
  }, [startDate, endDate, statusFilter, paymentFilter]);

  const onPageChange = (page: number) => {
    fetchOrders(page);
    setSelectedOrderIds([]);
  };

  const handleResetFilters = () => {
    setStartDate(moment().subtract(3, "months").startOf("day").toISOString());
    setEndDate(moment().endOf("day").toISOString());
    setStatusFilter("all");
    setPaymentFilter("all");
  };

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map((o) => o._id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds((prev) => [...prev, id]);
    } else {
      setSelectedOrderIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Individual Order status update API call
  const handleUpdateSingleStatus = async (orderId: string, newStatus: number) => {
    try {
      setIsUpdatingId(orderId);
      setActiveDropdownRow(null);
      const payload = {
        id: orderId,
        status: newStatus,
        reason: "Fulfillment updated from CRM Order Listing",
      };

      let res = await httpClient.put(getCompleteUrlV1("order"), payload);
      if (!res.ok) {
        res = await httpClient.put(getCompleteUrlV1(`order/${orderId}`), {
          status: newStatus,
          reason: "Fulfillment updated from CRM Order Listing",
        });
      }

      if (res.ok) {
        fetchOrders(pagination.page);
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("An error occurred while updating the status.");
    } finally {
      setIsUpdatingId(null);
    }
  };

  // Bulk status update action
  const handleBulkStatusUpdate = async (statusId: number) => {
    const confirmMsg = `Are you sure you want to update status of ${selectedOrderIds.length} order(s)?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setIsLoading(true);
      await Promise.all(
        selectedOrderIds.map((id) =>
          httpClient.put(getCompleteUrlV1(`order/${id}`), {
            status: statusId,
            reason: "Bulk status update from CRM Admin",
          })
        )
      );
      fetchOrders(pagination.page);
      setSelectedOrderIds([]);
    } catch (error) {
      console.error("Bulk status update failed:", error);
      alert("Failed to update status on one or more orders.");
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownRow(null);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const pageTotalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 0).length;
  const approvedCount = orders.filter((o) => o.status === 1).length;
  const deliveredCount = orders.filter((o) => o.status === 4).length;
  const cancelledCount = orders.filter((o) => o.status === 3).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Breadcrumb items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Orders" }]} />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">Order Directory</h1>
          <p className="text-sm text-slate-400 font-medium">
            Manage transactions, tracking details, invoice distribution, and fulfillment statuses.
          </p>
        </div>

        {/* Top Buttons */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => fetchOrders(pagination.page)}
            className="p-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition shadow-sm flex items-center justify-center cursor-pointer"
            title="Refresh List"
          >
            <FaRedo size={12} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer border border-slate-200/50"
          >
            <FaUndoAlt size={11} /> Reset Filters
          </button>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {/* Total Orders Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform duration-300">
            <FaShoppingBag size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {isLoading ? "..." : pagination.totalCount}
            </h3>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform duration-300">
            <FaDollarSign size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Page Revenue</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {isLoading ? "..." : `₹${pageTotalRevenue.toLocaleString()}`}
            </h3>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform duration-300">
            <FaClock size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Orders</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {isLoading ? "..." : pendingCount}
            </h3>
          </div>
        </div>

        {/* Approved Orders Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
          <div className="p-3.5 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-105 transition-transform duration-300">
            <FaCheckCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Approved Orders</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {isLoading ? "..." : approvedCount}
            </h3>
          </div>
        </div>

        {/* Delivered Orders Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
          <div className="p-3.5 bg-green-50 text-green-650 rounded-xl group-hover:scale-105 transition-transform duration-300">
            <FaTruck size={17} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delivered Orders</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {isLoading ? "..." : deliveredCount}
            </h3>
          </div>
        </div>

        {/* Cancelled Orders Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-105 transition-transform duration-300">
            <FaTimesCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cancelled Orders</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {isLoading ? "..." : cancelledCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Listing & Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
        {/* Filters and search area */}
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          {/* Left search */}
          <div className="flex-1 max-w-md">
            <DebounceSearch
              products={orders}
              setSearchProduct={setFilteredOrders}
              placeholder="Search order ID, status..."
            />
          </div>

          {/* Filters right */}
          <div className="flex flex-wrap gap-4 items-center justify-end text-xs font-semibold">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <FaFilter size={9} /> Status
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
              >
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_LABEL).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Payment</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
              >
                <option value="all">All Payments</option>
                <option value="1">COD</option>
                <option value="2">ONLINE</option>
                <option value="3">PARTIALLY_PAID</option>
              </select>
            </div>

            {/* Date Pickers */}
            <div className="flex items-center gap-2 border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase">From:</span>
                <input
                  type="date"
                  value={moment(startDate).format("YYYY-MM-DD")}
                  onChange={(e) =>
                    setStartDate(moment(e.target.value).startOf("day").toISOString())
                  }
                  className="bg-transparent text-slate-700 outline-none cursor-pointer"
                />
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase">To:</span>
                <input
                  type="date"
                  value={moment(endDate).format("YYYY-MM-DD")}
                  onChange={(e) =>
                    setEndDate(moment(e.target.value).endOf("day").toISOString())
                  }
                  className="bg-transparent text-slate-700 outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-55/60 text-slate-500 font-semibold">
              <tr className="text-xs uppercase tracking-wider text-left">
                <th className="py-4 px-6 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredOrders.length > 0 &&
                      selectedOrderIds.length === filteredOrders.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 accent-blue-600 focus:ring-0 cursor-pointer h-4 w-4"
                  />
                </th>
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6">Payment Method</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Delivery Address</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={8} className="py-6">
                    <CardSkeleton />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const isSelected = selectedOrderIds.includes(order._id);
                    const isUpdating = isUpdatingId === order._id;
                    return (
                      <tr
                        key={order._id}
                        onClick={() => navigate(`/orders/${order._id}`, { state: { from: location.pathname + location.search } })}
                        className={`hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer ${
                          isSelected ? "bg-blue-50/20" : ""
                        }`}
                      >
                        <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(order._id, e.target.checked)}
                            className="rounded border-slate-300 accent-blue-600 focus:ring-0 cursor-pointer h-4 w-4"
                          />
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-800">
                          #{order.numericOrderId}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-500">
                          {moment(order.createdAt).local().format("DD-MM-YYYY HH:mm")}
                        </td>
                        <td className="py-4 px-6 font-extrabold text-slate-800">
                          ₹{order.totalAmount}
                        </td>
                        <td className="py-4 px-6">
                          <OrderStatusTag status={order.paymentMethod} size="sm" type="payment" />
                        </td>
                        <td className="py-4 px-6">
                          {isUpdating ? (
                            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                              <svg className="animate-spin h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Saving...
                            </span>
                          ) : (
                            <OrderStatusTag status={order.status} size="sm" type="order" />
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400 leading-normal max-w-xs truncate">
                          {order.address ? (
                            <>
                              <span className="font-semibold text-slate-600">
                                {capitalize(order.address.city)}
                              </span>
                              , {capitalize(order.address.state)} {order.address.postalCode}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-4 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {/* Actions Dropdown Toggle */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setActiveDropdownRow(
                                    activeDropdownRow === order._id ? null : order._id
                                  )
                                }
                                className="px-2.5 py-1.5 bg-slate-55 hover:bg-slate-100 text-slate-600 text-2xs font-bold rounded-lg border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                              >
                                Status <FaChevronDown size={8} />
                              </button>

                              {activeDropdownRow === order._id && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-50 text-left">
                                  <button
                                    onClick={() => handleUpdateSingleStatus(order._id, 0)}
                                    className="w-full px-3 py-1.5 text-2xs text-slate-700 hover:bg-slate-50 transition"
                                  >
                                    Pending
                                  </button>
                                  <button
                                    onClick={() => handleUpdateSingleStatus(order._id, 1)}
                                    className="w-full px-3 py-1.5 text-2xs text-slate-700 hover:bg-slate-50 transition"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleUpdateSingleStatus(order._id, 4)}
                                    className="w-full px-3 py-1.5 text-2xs text-slate-700 hover:bg-slate-50 transition"
                                  >
                                    Deliver
                                  </button>
                                  <button
                                    onClick={() => handleUpdateSingleStatus(order._id, 3)}
                                    className="w-full px-3 py-1.5 text-2xs text-rose-600 hover:bg-rose-50 transition font-semibold"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleUpdateSingleStatus(order._id, 5)}
                                    className="w-full px-3 py-1.5 text-2xs text-purple-600 hover:bg-purple-50 transition font-semibold"
                                  >
                                    RTO
                                  </button>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => navigate(`/orders/${order._id}`, { state: { from: location.pathname + location.search } })}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                              title="View Order Details"
                            >
                              <FaEye size={13} />
                            </button>
                            <button
                              onClick={() => window.print()}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                              title="Print Invoice"
                            >
                              <FaFileInvoice size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 italic">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination controls */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <PaginationControl pagination={pagination} onPageChange={onPageChange} />
        </div>
      </div>

      {/* Sticky Bulk Action Toolbar */}
      {selectedOrderIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center justify-between gap-8 z-40 border border-slate-800 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-sm font-semibold tracking-wide">
              {selectedOrderIds.length} Order(s) Selected
            </span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div className="flex items-center gap-3.5">
            <button
              onClick={() => handleBulkStatusUpdate(1)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Approve
            </button>
            <button
              onClick={() => handleBulkStatusUpdate(3)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const csvData = orders
                  .filter((o) => selectedOrderIds.includes(o._id))
                  .map((o) => `${o.numericOrderId},${o.createdAt},${o.totalAmount},${o.status}`)
                  .join("\n");
                const blob = new Blob([`Order ID,Date,Total,Status\n${csvData}`], {
                  type: "text/csv",
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.setAttribute("href", url);
                a.setAttribute("download", "lottmart_bulk_orders.csv");
                a.click();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <FaDownload size={10} /> Export CSV
            </button>
            <button
              onClick={() => setSelectedOrderIds([])}
              className="px-3.5 py-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer font-bold"
            >
              Deselect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Breadcrumb = ({ items }: { items: { label: string; to?: string }[] }) => {
  return (
    <div className="flex items-center gap-2 text-2xs font-semibold text-slate-400 uppercase tracking-widest">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-2">
          {idx > 0 && <span>&gt;</span>}
          {item.to ? (
            <a href={item.to} className="hover:text-slate-600 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-slate-600">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
};
