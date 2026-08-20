import { useEffect, useState } from "react";
import { httpClient } from "../services/ApiService";
import { getCompleteUrlV1 } from "../utils";
import { ApiResponse, ProductAdminTable } from "../components/AdminTable";
import { Status } from "../types";
import { ProductDetail } from "./ProductDetail";
import { ProductEditModal } from "../components/ProductEditModal";
import CardSkeleton from "../components/CardSkeleton";
import Breadcrumb from "../components/Breadcrumb";
import { FiPlus, FiDownload, FiRefreshCw } from "react-icons/fi";

export interface IFilterType {
  page: number;
  status: Status | null;
  search?: string;
  categoryId?: string;
}

export const Products = () => {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [filters, setFilters] = useState<IFilterType>({
    page: 1,
    status: null,
    search: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [productData, setProductData] = useState<any>({});
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Edit Modal states
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Fetch Categories on mount
  useEffect(() => {
    (async function getCategories() {
      try {
        const res = await httpClient.get(getCompleteUrlV1("category"));
        if (res.ok) {
          const payload = await res.json();
          setCategories(payload.data || []);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    })();
  }, []);

  // Fetch Products based on page, status, search and category filters
  useEffect(() => {
    (async function getMatserProduct() {
      const cleanFilters: Record<string, any> = { page: filters.page };
      if (filters.status) cleanFilters.status = filters.status;
      if (filters.search) cleanFilters.search = filters.search;
      if (filters.categoryId) cleanFilters.categoryId = filters.categoryId;

      try {
        setIsRefreshing(true);
        if (filters.status === Status.Inactive) {
          const cleanFiltersInactive = { ...cleanFilters, status: Status.Inactive };
          const cleanFiltersPending = { ...cleanFilters, status: Status.Pending };

          const [inactiveRes, pendingRes] = await Promise.all([
            httpClient.get(getCompleteUrlV1("product", cleanFiltersInactive)),
            httpClient.get(getCompleteUrlV1("product", cleanFiltersPending)),
          ]);

          const [inactiveJson, pendingJson] = await Promise.all([
            inactiveRes.json(),
            pendingRes.json(),
          ]);

          const mergedData = [
            ...(inactiveJson.data || []),
            ...(pendingJson.data || []),
          ];

          const totalCount = (inactiveJson.pagination?.totalCount || 0) + (pendingJson.pagination?.totalCount || 0);
          const limit = inactiveJson.pagination?.limit || pendingJson.pagination?.limit || 10;
          const totalPages = Math.ceil(totalCount / limit) || 1;

          setResponse({
            type: inactiveJson.type || "success",
            message: inactiveJson.message || "",
            data: mergedData,
            pagination: {
              totalCount,
              page: filters.page,
              limit,
              totalPages,
            },
          });
        } else {
          const master = await httpClient.get(
            getCompleteUrlV1("product", cleanFilters)
          );
          const products = await master.json();
          setResponse(products);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setIsRefreshing(false);
      }
    })();
  }, [filters, refreshTrigger]);

  const handleOpenEdit = (prod: any) => {
    setEditingProduct(prod);
    setOpenEditModal(true);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => !prev);
  };

  const handleExport = () => {
    if (!response?.data?.length) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(response.data, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `lottmart_products_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions Strip */}
      {!openDetail && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs">
          <div>
            <Breadcrumb
              items={[
                { label: "Dashboard", to: "/dashboard" },
                { label: "Products", to: "/products" },
              ]}
            />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
              Products
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Manage and monitor seller product listings across Lottmart.
            </p>
          </div>

          {/* Action Buttons: + Add Product, Export, Refresh */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => alert("Add Product is not currently supported by backend API.")}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Add new product"
            >
              <FiPlus size={15} />
              <span>+ Add Product</span>
            </button>

            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Export Products"
            >
              <FiDownload size={14} className="text-slate-400" />
              <span>Export</span>
            </button>

            <button
              onClick={handleRefresh}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition flex items-center justify-center shadow-2xs cursor-pointer"
              title="Refresh Products"
            >
              <FiRefreshCw size={15} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div>
        {openDetail ? (
          <ProductDetail
            product={productData}
            onEdit={() => handleOpenEdit(productData)}
            onBack={() => setOpenDetail(false)}
            onRefresh={() => setRefreshTrigger((prev) => !prev)}
          />
        ) : (
          <>
            {response !== null ? (
              <ProductAdminTable
                response={response}
                filters={filters}
                categories={categories}
                onPageChange={(num) => {
                  setFilters({ ...filters, page: num });
                }}
                onStatusFilterSelect={(newFilters) => setFilters(newFilters)}
                setOpenDetail={setOpenDetail}
                setProductData={setProductData}
                setRefreshTrigger={setRefreshTrigger}
                onEdit={handleOpenEdit}
              />
            ) : (
              <div className="p-4">
                <div className="bg-white shadow-md rounded-lg overflow-hidden p-4">
                  <CardSkeleton />
                </div>
              </div>
            )}
          </>
        )}

        {openEditModal && (
          <ProductEditModal
            isOpen={openEditModal}
            onClose={() => setOpenEditModal(false)}
            setRefreshTrigger={setRefreshTrigger}
            product={editingProduct}
          />
        )}
      </div>
    </div>
  );
};
