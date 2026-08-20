import React, { useEffect, useState, useMemo } from "react";
import { Status } from "../types";
import { IFilterType } from "../pages/Products";
import moment from "moment";
import {
  FiMoreVertical,
  FiSearch,
  FiEye,
  FiEdit2,
  FiCheckCircle,
  FiXCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiCopy,
  FiUser,
  FiBox,
  FiCheck,
  FiMaximize2
} from "react-icons/fi";
import { FaBox, FaFolder } from "react-icons/fa";
import { httpClient } from "../services/ApiService";
import { getCompleteUrlV1 } from "../utils";
import { useNavigate } from "react-router-dom";
import { ProductDeactivateModal } from "./ProductDeactivateModal";
import { ProductQuickViewModal } from "./ProductQuickViewModal";
import { ProductFilterPanel, ProductFilterState } from "./ProductFilterPanel";

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
  availableInventory?: number;
  masterDetails?: MasterDetails;
  categoryDetails?: any;
  productCategoryDetails?: any;
  subCategoryDetails?: any;
  sellerDetails?: any;
  connectorCommission?: number;
  promoterCommission?: number;
  platformFee?: number;
  createdAt?: string;
  updatedAt?: string;
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
        Showing <span className="text-slate-700 font-semibold">{page}</span> of{" "}
        <span className="text-slate-700 font-semibold">{totalPages}</span> pages ({totalCount} total products)
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
  const rawProducts = response?.data || [];
  const pagination = response?.pagination || {
    totalCount: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  // State management
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & Drawers
  const [openFilterPanel, setOpenFilterPanel] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [deactivateProduct, setDeactivateProduct] = useState<any | null>(null);

  // Filter state
  const [extraFilters, setExtraFilters] = useState<ProductFilterState>({});

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

  // 1. Strict filtering: Pending and Rejected belong to Approvals, not Active/Inactive Products list
  const activeInactiveProducts = useMemo(() => {
    return rawProducts.filter((p: any) => p.status === "active" || p.status === "inactive");
  }, [rawProducts]);

  // 2. Client-side Search and Filters
  const filteredProducts = useMemo(() => {
    return activeInactiveProducts.filter((p: any) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const name = (p.masterDetails?.name || p.productName || p.name || "").toLowerCase();
        const sku = (p.masterDetails?.skuCode || p.skuCode || p.sellerSku || "").toLowerCase();
        const seller = (p.sellerDetails?.businessName || p.sellerName || "").toLowerCase();
        
        if (!name.includes(query) && !sku.includes(query) && !seller.includes(query)) {
          return false;
        }
      }

      // Extra Filters
      if (extraFilters.status && p.status !== extraFilters.status) return false;
      if (extraFilters.categoryId && p.categoryDetails?._id !== extraFilters.categoryId) return false;
      if (extraFilters.stockStatus) {
        const inv = p.availableInventory !== undefined ? p.availableInventory : p.stock || 0;
        if (extraFilters.stockStatus === "out_of_stock" && inv > 0) return false;
        if (extraFilters.stockStatus === "in_stock" && inv <= 0) return false;
        if (extraFilters.stockStatus === "low_stock" && (inv <= 0 || inv >= 1000)) return false;
      }
      if (extraFilters.isFeatured) {
        if (extraFilters.isFeatured === "featured" && !p.isFeatured) return false;
        if (extraFilters.isFeatured === "not_featured" && p.isFeatured) return false;
      }

      return true;
    });
  }, [activeInactiveProducts, searchTerm, extraFilters]);

  // 3. Sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortOption) {
      case "oldest":
        return list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      case "price_low_high":
        return list.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
      case "price_high_low":
        return list.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
      case "discount_low_high":
        return list.sort((a, b) => (a.maxDiscount || 0) - (b.maxDiscount || 0));
      case "discount_high_low":
        return list.sort((a, b) => (b.maxDiscount || 0) - (a.maxDiscount || 0));
      case "inventory_low_high":
        return list.sort((a, b) => (a.availableInventory || 0) - (b.availableInventory || 0));
      case "inventory_high_low":
        return list.sort((a, b) => (b.availableInventory || 0) - (a.availableInventory || 0));
      case "recently_updated":
        return list.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      case "newest":
      default:
        return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
  }, [filteredProducts, sortOption]);

  // Load KPI metrics
  const fetchKpiData = async () => {
    try {
      const [totalRes, activeRes, inactiveRes] = await Promise.all([
        httpClient.get(getCompleteUrlV1("product", { limit: 1 })),
        httpClient.get(getCompleteUrlV1("product", { limit: 1, status: Status.Active })),
        httpClient.get(getCompleteUrlV1("product", { limit: 1, status: Status.Inactive })),
      ]);

      const [totalJson, activeJson, inactiveJson] = await Promise.all([
        totalRes.json(),
        activeRes.json(),
        inactiveRes.json(),
      ]);

      setKpiCounts({
        total: totalJson.pagination?.totalCount || 0,
        active: activeJson.pagination?.totalCount || 0,
        inactive: inactiveJson.pagination?.totalCount || 0,
        categories: categories.length,
      });
    } catch (err) {
      console.error("Failed to load KPI stats:", err);
    }
  };

  useEffect(() => {
    fetchKpiData();
  }, [categories, response]);

  const handleCopyLink = (p: Product) => {
    const url = `${window.location.origin}/products`;
    navigator.clipboard.writeText(url);
    setCopiedId(p._id);
    showToast("Product link copied to clipboard!", "info");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetSearchAndFilters = () => {
    setSearchTerm("");
    setExtraFilters({});
    onStatusFilterSelect({ page: 1, status: null });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 border border-slate-800">
          <span
            className={`w-2 h-2 rounded-full ${
              toast.type === "success"
                ? "bg-emerald-500"
                : toast.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
          />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* KPI Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Active & Inactive</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{kpiCounts.total}</h3>
          </div>
        </div>

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
        {/* Filters, Search & Sorting Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center p-5 border-b border-slate-100 bg-slate-50/20">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <FiSearch size={15} />
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 shadow-2xs"
            />
          </div>

          {/* Filter & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* Sorting Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none pl-3.5 pr-9 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-slate-300 shadow-2xs"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="price_low_high">Price: Low → High</option>
                <option value="price_high_low">Price: High → Low</option>
                <option value="discount_low_high">Discount: Low → High</option>
                <option value="discount_high_low">Discount: High → Low</option>
                <option value="inventory_low_high">Inventory: Low → High</option>
                <option value="inventory_high_low">Inventory: High → Low</option>
                <option value="recently_updated">Recently Updated</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <FiChevronDown size={14} />
              </div>
            </div>

            {/* Filter Panel Trigger Button */}
            <button
              onClick={() => setOpenFilterPanel(true)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <FiFilter size={14} className="text-slate-400" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* 11-Column Professional B2B CRM Data Grid Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm font-light border-collapse divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 text-[11px] uppercase font-black tracking-wider text-left">
                <th className="py-3.5 px-5 w-16">Product</th>
                <th className="py-3.5 px-5">SKU</th>
                <th className="py-3.5 px-5">Seller</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Lot Price</th>
                <th className="py-3.5 px-5">Discount</th>
                <th className="py-3.5 px-5">Inventory</th>
                <th className="py-3.5 px-5">Featured</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Updated</th>
                <th className="py-3.5 px-5 w-16 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="text-slate-600 divide-y divide-slate-100 bg-white">
              {(() => {
                if (sortedProducts.length === 0) {
                  return (
                    <tr>
                      <td colSpan={11} className="text-center py-16 px-6">
                        <div className="max-w-md mx-auto space-y-3 flex flex-col items-center">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-300">
                            <FiBox size={24} />
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-slate-800">
                              {searchTerm ? "No matching products found." : "No product listings found."}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {searchTerm
                                ? "Try another product name, SKU or seller."
                                : "Try changing your filters or search criteria."}
                            </p>
                          </div>
                          <button
                            onClick={handleResetSearchAndFilters}
                            className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return sortedProducts.map((p: any, idx: number) => {
                  const title = p.masterDetails?.name || p.productName || p.name || "Unnamed Product";
                  const sku = p.masterDetails?.skuCode || p.skuCode || p.sellerSku || "—";
                  const sellerName = p.sellerDetails?.businessName || p.sellerName || "—";
                  const catMain = p.categoryDetails?.name || p.categoryName || "Uncategorized";
                  const inventoryVal = p.availableInventory !== undefined ? p.availableInventory : p.stock;
                  const isFeatured = !!p.isFeatured;
                  const formattedUpdated = p.updatedAt ? moment(p.updatedAt).format("DD MMM YYYY") : "—";
                  const image = p.media?.[0] || p.masterDetails?.media?.[0];

                  return (
                    <tr
                      key={p._id || idx}
                      onClick={() => {
                        setProductData(p);
                        setOpenDetail(true);
                      }}
                      className="hover:bg-slate-50/70 transition-colors duration-150 relative cursor-pointer"
                    >
                      {/* 1. Product (Thumbnail + Title) */}
                      <td className="py-3.5 px-5 align-middle">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {image ? (
                              <img
                                src={image}
                                alt={title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback for broken image URLs
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <FaBox className="text-slate-300" size={16} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div
                              className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[180px]"
                              title={title}
                            >
                              {title}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block truncate">
                              ID: {String(p._id || p.id).substring(0, 10)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. SKU */}
                      <td className="py-3.5 px-5 align-middle font-mono text-xs font-bold text-slate-700">
                        {sku}
                      </td>

                      {/* 3. Seller */}
                      <td className="py-3.5 px-5 align-middle text-xs font-semibold text-slate-700">
                        <span className="truncate max-w-[140px] block" title={sellerName}>
                          {sellerName}
                        </span>
                      </td>

                      {/* 4. Category */}
                      <td className="py-3.5 px-5 align-middle text-xs font-semibold text-slate-800">
                        <span className="truncate max-w-[150px] block">{catMain}</span>
                      </td>

                      {/* 5. Lot Price */}
                      <td className="py-3.5 px-5 align-middle font-bold text-slate-800 font-mono text-xs whitespace-nowrap">
                        {p.minPrice !== undefined && p.maxPrice !== undefined
                          ? p.minPrice === p.maxPrice
                            ? `₹${p.minPrice}`
                            : `₹${p.minPrice} – ₹${p.maxPrice}`
                          : "—"}
                      </td>

                      {/* 6. Discount */}
                      <td className="py-3.5 px-5 align-middle whitespace-nowrap">
                        {p.minDiscount !== undefined && p.maxDiscount !== undefined ? (
                          p.minDiscount === p.maxDiscount ? (
                            <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                              {p.maxDiscount}% Off
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                              {p.minDiscount}% – {p.maxDiscount}%
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* 7. Inventory (display raw number e.g. 500, NOT 500 Lots per requirement 9 & 32) */}
                      <td className="py-3.5 px-5 align-middle font-bold text-xs text-slate-800">
                        {inventoryVal !== undefined ? inventoryVal : "—"}
                      </td>

                      {/* 8. Featured */}
                      <td className="py-3.5 px-5 align-middle">
                        {isFeatured ? (
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                            Featured
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">No</span>
                        )}
                      </td>

                      {/* 9. Status */}
                      <td className="py-3.5 px-5 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wide border ${
                            p.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          {p.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* 10. Updated */}
                      <td className="py-3.5 px-5 align-middle text-slate-500 text-xs font-medium whitespace-nowrap">
                        {formattedUpdated}
                      </td>

                      {/* 11. Actions */}
                      <td
                        className="py-3.5 px-5 align-middle text-center relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setProductData(p);
                              setOpenDetail(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="View Full Product"
                          >
                            <FiEye size={15} />
                          </button>

                          <button
                            onClick={() => onEdit(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            title="Edit Product"
                          >
                            <FiEdit2 size={15} />
                          </button>

                          <button
                            onClick={() => setActiveMenuId(activeMenuId === p._id ? null : p._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition focus:outline-none cursor-pointer"
                          >
                            <FiMoreVertical size={16} />
                          </button>
                        </div>

                        {/* More Actions Dropdown */}
                        {activeMenuId === p._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-6 mt-1 w-48 bg-white border border-slate-150 rounded-2xl shadow-xl py-1.5 z-20 text-left animate-in fade-in duration-150">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setQuickViewProduct(p);
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition font-medium cursor-pointer"
                              >
                                <FiMaximize2 size={14} className="text-slate-400" />
                                <span>Quick View</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleCopyLink(p);
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition font-medium cursor-pointer"
                              >
                                {copiedId === p._id ? (
                                  <FiCheck size={14} className="text-emerald-500" />
                                ) : (
                                  <FiCopy size={14} className="text-slate-400" />
                                )}
                                <span>{copiedId === p._id ? "Link Copied!" : "Copy Link"}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  if (p.sellerDetails?._id || p.sellerId) {
                                    navigate(`/users`);
                                  } else {
                                    showToast("Seller profile not linked.", "info");
                                  }
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition font-medium cursor-pointer"
                              >
                                <FiUser size={14} className="text-slate-400" />
                                <span>View Seller</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  if (p.masterDetails?._id || p.masterId) {
                                    navigate(`/master-products`);
                                  } else {
                                    showToast("Master Product details viewed on detail page.", "info");
                                  }
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition font-medium cursor-pointer"
                              >
                                <FiBox size={14} className="text-slate-400" />
                                <span>View Master Product</span>
                              </button>

                              <div className="h-px bg-slate-100 my-1" />

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setDeactivateProduct(p);
                                }}
                                className={`flex items-center gap-2.5 w-full px-4 py-2 text-xs transition font-semibold cursor-pointer ${
                                  p.status === "active"
                                    ? "text-rose-600 hover:bg-rose-50"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                              >
                                {p.status === "active" ? (
                                  <>
                                    <FiXCircle size={14} className="text-rose-400" />
                                    <span>Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <FiCheckCircle size={14} className="text-emerald-400" />
                                    <span>Activate</span>
                                  </>
                                )}
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
        <PaginationControl pagination={pagination} onPageChange={onPageChange} />
      </div>

      {/* Quick View Drawer / Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          product={quickViewProduct}
          onViewFull={(prod) => {
            setProductData(prod);
            setOpenDetail(true);
          }}
          onEdit={(prod) => onEdit(prod)}
        />
      )}

      {/* Filter Panel Drawer */}
      <ProductFilterPanel
        isOpen={openFilterPanel}
        onClose={() => setOpenFilterPanel(false)}
        categories={categories}
        currentFilters={extraFilters}
        onApply={(newFilters) => setExtraFilters(newFilters)}
        onReset={() => setExtraFilters({})}
      />

      {/* Deactivate Confirmation Modal */}
      {deactivateProduct && (
        <ProductDeactivateModal
          isOpen={!!deactivateProduct}
          onClose={() => setDeactivateProduct(null)}
          product={deactivateProduct}
          onSuccess={() => {
            showToast(`Product status updated successfully.`, "success");
            setRefreshTrigger((prev) => !prev);
          }}
        />
      )}
    </div>
  );
}
