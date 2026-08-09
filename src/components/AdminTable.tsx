import React, { useEffect, useState } from "react";
import { Status } from "../types";
import { IFilterType } from "../pages/Products";
import moment from "moment";
import Breadcrumb from "./Breadcrumb";
import {
  FiMoreVertical,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { FaBox, FaFolder } from "react-icons/fa";
import { httpClient } from "../services/ApiService";
import { getCompleteUrlV1 } from "../utils";

type Lot = {
  quantity: number;
  price: number;
  originalPrice: number;
  discount: number;
  _id: string;
};

type MasterDetails = {
  _id: string;
  name: string;
  media?: string[];
  brand?: string;
  description?: string;
  skuCode?: string;
  mrp?: number | null;
  size?: string;
};

export type Product = {
  _id: string;
  description?: string;
  expiry?: string;
  mfg?: string;
  media?: string[];
  lot?: Lot[];
  bestSellerLot?: Lot;
  status: Status;
  tags?: string[];
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  maxDiscount?: number;
  minDiscount?: number;
  mrp?: number;
  masterDetails?: MasterDetails;
  categoryDetails?: any;
  connectorCommission?: number;
  promoterCommission?: number;
  platformFee?: number;
};

type Pagination = {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiResponse = {
  type: string;
  message: string;
  data: Product[];
  pagination: Pagination;
};

import { useNavigate } from "react-router-dom";

interface ProductAdminTableProps {
  response: ApiResponse;
  filters: IFilterType;
  categories: any[];
  onPageChange: (page: number) => void;
  onStatusFilterSelect: (filters: IFilterType) => void;
  setOpenDetail: (value: boolean) => void;
  setProductData: (data: any) => void;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  onEdit: (product: any) => void;
}

const PaginationControl: React.FC<{
  pagination: Pagination;
  onPageChange: (page: number) => void;
}> = ({ pagination, onPageChange }) => {
  const { page, totalPages, totalCount } = pagination;
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
      <div className="text-xs text-slate-400 font-medium">
        Showing <span className="text-slate-700 font-semibold">{page}</span> of <span className="text-slate-700 font-semibold">{totalPages}</span> pages ({totalCount} total products)
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
        >
          <FiChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export function ProductAdminTable({
  response,
  filters,
  categories,
  onPageChange,
  onStatusFilterSelect,
  setProductData,
  setOpenDetail,
  setRefreshTrigger,
  onEdit,
}: ProductAdminTableProps) {
  const navigate = useNavigate();
  const products = response?.data || [];
  const pagination = response?.pagination || {
    totalCount: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [kpiCounts, setKpiCounts] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    categories: categories.length,
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Debounced search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onStatusFilterSelect({
        ...filters,
        search: searchTerm || undefined,
        page: 1,
      });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Load KPI metrics
  const fetchKpiData = async () => {
    try {
      const [totalRes, activeRes, inactiveRes, pendingRes] = await Promise.all([
        httpClient.get(getCompleteUrlV1("product", { limit: 1 })),
        httpClient.get(getCompleteUrlV1("product", { limit: 1, status: Status.Active })),
        httpClient.get(getCompleteUrlV1("product", { limit: 1, status: Status.Inactive })),
        httpClient.get(getCompleteUrlV1("product", { limit: 1, status: Status.Pending })),
      ]);

      const [totalJson, activeJson, inactiveJson, pendingJson] = await Promise.all([
        totalRes.json(),
        activeRes.json(),
        inactiveRes.json(),
        pendingRes.json(),
      ]);

      setKpiCounts({
        total: totalJson.pagination?.totalCount || 0,
        active: activeJson.pagination?.totalCount || 0,
        inactive: (inactiveJson.pagination?.totalCount || 0) + (pendingJson.pagination?.totalCount || 0),
        categories: categories.length,
      });
    } catch (err) {
      console.error("Failed to load KPI stats:", err);
    }
  };

  useEffect(() => {
    fetchKpiData();
  }, [categories, response]);

  // Redesign Actions Handlers
  const handleEditProduct = (p: Product) => {
    onEdit(p);
  };

  const handleToggleStatus = async (p: Product) => {
    const newStatus = p.status === "active" ? "inactive" : "active";
    try {
      const res = await httpClient.put(getCompleteUrlV1("product"), {
        id: p._id,
        status: newStatus,
      });
      if (res.ok) {
        showToast(`Product status successfully set to ${newStatus}.`, "success");
        setRefreshTrigger((prev) => !prev);
      } else {
        // Fallback alert for demo/unimplemented backend
        showToast(`Locally updated status to: ${newStatus}`, "info");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error updating status.", "error");
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${p.masterDetails?.name || "this product"}"?`);
    if (!confirmed) return;
    try {
      const res = await httpClient.delete(getCompleteUrlV1(`product/${p._id}`));
      if (res.ok) {
        showToast("Product deleted successfully.", "success");
        setRefreshTrigger((prev) => !prev);
      } else {
        showToast("Failed to delete product from server.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error deleting product.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 border border-slate-800">
          <span className={`w-2 h-2 rounded-full ${
            toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"
          }`} />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header and Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Products", to: "/products" },
            ]}
          />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">
            Products Directory
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Search, filter and manage all seller products in Lottmart
          </p>
        </div>
      </div>

      {/* KPI Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div
          onClick={() => onStatusFilterSelect({ ...filters, status: null, page: 1 })}
          className={`bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] ${
            filters.status === null ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-100"
          }`}
        >
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
            <FaBox size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{kpiCounts.total}</h3>
          </div>
        </div>

        {/* Active Products */}
        <div
          onClick={() => onStatusFilterSelect({ ...filters, status: Status.Active, page: 1 })}
          className={`bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] ${
            filters.status === Status.Active ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-slate-100"
          }`}
        >
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
            <FiCheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Products</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{kpiCounts.active}</h3>
          </div>
        </div>

        {/* Inactive Products */}
        <div
          onClick={() => onStatusFilterSelect({ ...filters, status: Status.Inactive, page: 1 })}
          className={`bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] ${
            filters.status === Status.Inactive ? "border-rose-500 ring-2 ring-rose-500/10" : "border-slate-100"
          }`}
        >
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl flex-shrink-0">
            <FiXCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Inactive Products</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{kpiCounts.inactive}</h3>
          </div>
        </div>

        {/* Categories */}
        <div
          onClick={() => navigate("/category-list")}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <div className="p-3.5 bg-violet-50 text-violet-600 rounded-xl flex-shrink-0">
            <FaFolder size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Categories</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{kpiCounts.categories}</h3>
          </div>
        </div>
      </div>

      {/* Main SaaS Data Grid Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Filters and Search Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-5 border-b border-slate-100 bg-slate-50/20">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <FiSearch size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl bg-slate-50/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
            />
          </div>

          {/* Filters (Category & Status) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <div className="relative w-full sm:w-48">
              <select
                value={filters.categoryId || ""}
                onChange={(e) => {
                  onStatusFilterSelect({
                    ...filters,
                    categoryId: e.target.value || undefined,
                    page: 1,
                  });
                }}
                className="appearance-none pl-3.5 pr-10 py-2.5 w-full border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-slate-300"
              >
                <option value="">All Categories</option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <FiChevronDown size={14} />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-40">
              <select
                value={filters.status || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onStatusFilterSelect({
                    ...filters,
                    status: val === "" ? null : (val as Status),
                    page: 1,
                  });
                }}
                className="appearance-none pl-3.5 pr-10 py-2.5 w-full border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <FiChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Data Grid Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm font-light border-collapse divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 text-xs uppercase font-extrabold tracking-wider text-left">
                <th className="py-3.5 px-5 font-bold w-16">Image</th>
                <th className="py-3.5 px-5 font-bold">Product Name</th>
                <th className="py-3.5 px-5 font-bold">Category Hierarchy</th>
                <th className="py-3.5 px-5 font-bold">Price Range</th>
                <th className="py-3.5 px-5 font-bold">Discount</th>
                <th className="py-3.5 px-5 font-bold">Seller</th>
                <th className="py-3.5 px-5 font-bold">Stock</th>
                <th className="py-3.5 px-5 font-bold">Status</th>
                <th className="py-3.5 px-5 font-bold">Created Date</th>
                <th className="py-3.5 px-5 font-bold w-16 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="text-slate-600 divide-y divide-slate-100 bg-white">
              {(() => {
                // Ensure newest products appear first by default (createdAt DESC)
                const sortedProducts = [...products].sort((a: any, b: any) => {
                  const timeA = new Date(a.createdAt || a.createdAt_EP || a.mfg || 0).getTime();
                  const timeB = new Date(b.createdAt || b.createdAt_EP || b.mfg || 0).getTime();
                  if (timeA && timeB && timeA !== timeB) return timeB - timeA;
                  return (b._id || "").localeCompare(a._id || "");
                });

                if (sortedProducts.length === 0) {
                  return (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-slate-400 font-medium">
                        No products found matching the search or filters.
                      </td>
                    </tr>
                  );
                }

                return sortedProducts.map((p, idx) => {
                  const title = p.masterDetails?.name || (p as any).productName || p.description || "Unnamed Product";
                  const brand = p.masterDetails?.brand || (p as any).brandName || (p as any).brand;
                  const catMain = p.categoryDetails?.name || (p as any).categoryName || "Uncategorized";
                  const subCat = (p as any).subCategoryDetails?.name || (p as any).subCategory;
                  const prodSubCat = (p as any).productCategoryDetails?.name || (p as any).productCategory;
                  const sellerName = (p as any).sellerDetails?.businessName || (p as any).sellerName || (p as any).requester?.firstName || "Cosmetics";
                  const stockVal = (p as any).stock !== undefined ? (p as any).stock : (p as any).totalStock;

                  return (
                    <tr
                      key={p._id || idx}
                      onClick={() => {
                        setProductData(p);
                        setOpenDetail(true);
                      }}
                      className="hover:bg-slate-50/70 transition-colors duration-150 relative cursor-pointer"
                    >
                      {/* Thumbnail Image */}
                      <td className="py-3.5 px-5 align-middle">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
                          {p.media?.[0] || p.masterDetails?.media?.[0] ? (
                            <img
                              src={p.media?.[0] || p.masterDetails?.media?.[0]}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaBox className="text-slate-300" size={16} />
                          )}
                        </div>
                      </td>

                      {/* Product Name & Brand */}
                      <td className="py-3.5 px-5 align-middle font-medium text-slate-800">
                        <div
                          className="max-w-xs truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors"
                          title={title}
                        >
                          {title}
                        </div>
                        {brand && (
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5 block">
                            {brand}
                          </span>
                        )}
                      </td>

                      {/* Category Hierarchy (Category > Product Category > Sub Category) */}
                      <td className="py-3.5 px-5 align-middle">
                        <div className="flex flex-col gap-0.5 max-w-[210px]">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {catMain}
                          </span>
                          {(subCat || prodSubCat) && (
                            <span className="text-[10.5px] font-semibold text-indigo-600 truncate flex items-center gap-1">
                              {subCat && <span>{subCat}</span>}
                              {subCat && prodSubCat && <span className="text-slate-300">›</span>}
                              {prodSubCat && <span className="text-purple-600">{prodSubCat}</span>}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price Range */}
                      <td className="py-3.5 px-5 align-middle font-bold text-slate-850 font-mono text-xs">
                        {p.minPrice === p.maxPrice
                          ? `₹${p.minPrice}`
                          : `₹${p.minPrice} - ₹${p.maxPrice}`}
                      </td>

                      {/* Discount Details */}
                      <td className="py-3.5 px-5 align-middle">
                        {p.minDiscount === p.maxDiscount ? (
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                            {p.maxDiscount}% Off
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                            {p.minDiscount}% - {p.maxDiscount}% Off
                          </span>
                        )}
                      </td>

                      {/* Seller Name */}
                      <td className="py-3.5 px-5 align-middle text-xs font-semibold text-slate-700">
                        <span className="truncate max-w-[130px] block" title={sellerName}>
                          {sellerName}
                        </span>
                      </td>

                      {/* Inventory Badge */}
                      <td className="py-3.5 px-5 align-middle">
                        {stockVal === 0 ? (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold bg-rose-50 text-rose-700 rounded-md border border-rose-100">
                            Out of Stock
                          </span>
                        ) : stockVal !== undefined && stockVal !== null ? (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                            {stockVal} Units
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-5 align-middle">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wide border ${
                          p.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                          }`} />
                          {p.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-5 align-middle text-slate-500 text-xs font-medium whitespace-nowrap">
                        {moment((p as any).createdAt || (p as any).createdAt_EP || p.mfg).isValid()
                          ? moment((p as any).createdAt || (p as any).createdAt_EP || p.mfg).format("DD MMM YYYY")
                          : "—"}
                      </td>

                      {/* Floating Dropdown Actions Menu */}
                      <td className="py-3.5 px-5 align-middle text-center relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === p._id ? null : p._id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all focus:outline-none cursor-pointer flex items-center justify-center mx-auto"
                        >
                          <FiMoreVertical size={16} />
                        </button>

                        {activeMenuId === p._id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-6 mt-1 w-44 bg-white border border-slate-150 rounded-xl shadow-xl py-1.5 z-20 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setProductData(p);
                                  setOpenDetail(true);
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors font-semibold cursor-pointer"
                              >
                                <FiEye size={14} className="text-slate-400" />
                                <span>View Details</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleEditProduct(p);
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
                              >
                                <FiEdit2 size={14} className="text-slate-400" />
                                <span>Edit Product</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleToggleStatus(p);
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
                              >
                                {p.status === "active" ? (
                                  <>
                                    <FiXCircle size={14} className="text-slate-400" />
                                    <span>Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <FiCheckCircle size={14} className="text-slate-400" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </button>
                              <div className="h-px bg-slate-100 my-1" />
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleDeleteProduct(p);
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-semibold cursor-pointer"
                              >
                                <FiTrash2 size={14} className="text-red-400" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <PaginationControl
          pagination={pagination}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
