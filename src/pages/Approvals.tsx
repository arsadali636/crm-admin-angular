import { useEffect, useState } from "react";
import { httpClient } from "../services/ApiService";
import { getCompleteUrlV1 } from "../utils";
import { AdminRequestsType, RequestStatus } from "../types";
import SelectField from "../components/SelectField";
import { requestStatusOptions } from "../constants";
import SellerOnboardingCard from "../components/SellerOnboarding";
import ProductApprovalCard from "../components/ProductApproval";
import { Modal } from "../components/ImageModal";
import CardSkeleton from "../components/CardSkeleton";
import Breadcrumb from "../components/Breadcrumb";
import SummaryCard from "../components/SummaryCard";
import ProductDetailView from "../components/ProductDetailView";
import SellerDetailView from "../components/SellerDetailView";

interface Seller {
  businessName: string;
  aadhaarNumber: string;
  gstNumber: string;
  _id: string;
}

interface SellerRequest {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  metadata: Seller;
  status: string;
  type: "seller_onboarding" | "product_approval";
}

interface IInitialFees {
  messengerFee: string;
  connectorFee: string;
  platformFee: string;
}

const initialFees: IInitialFees = {
  messengerFee: "",
  connectorFee: "",
  platformFee: "3",
};

export type RequestType = "accept" | "reject";

export const Approvals = () => {
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Search and local filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Selected detail view request
  const [activeDetail, setActiveDetail] = useState<any>(null);

  // Counts of pending items
  const [pendingCounts, setPendingCounts] = useState({
    products: 0,
    sellers: 0,
  });

  const [filters, setFilters] = useState<{
    status: RequestStatus;
    type: AdminRequestsType;
  }>({
    status: RequestStatus.Pending,
    type: AdminRequestsType.sellerOnboarding,
  });

  const [fees, setFees] = useState(initialFees);
  const [error, setError] = useState("");

  // Fetch pending statistics for products and sellers
  async function getPendingCounts() {
    try {
      const [prodRes, sellRes] = await Promise.all([
        httpClient.get(
          getCompleteUrlV1("request/admin-requests", {
            status: RequestStatus.Pending,
            type: AdminRequestsType.productApproval,
          })
        ),
        httpClient.get(
          getCompleteUrlV1("request/admin-requests", {
            status: RequestStatus.Pending,
            type: AdminRequestsType.sellerOnboarding,
          })
        ),
      ]);
      const prods = await prodRes.json();
      const sellers = await sellRes.json();
      setPendingCounts({
        products: prods.data?.length || 0,
        sellers: sellers.data?.length || 0,
      });
    } catch (err) {
      console.error("Failed to fetch pending counts", err);
    }
  }

  const handleSubmit = async (
    request: any,
    requestType: RequestType,
    customFees?: any,
    rejectionOrChangesData?: {
      reason?: string;
      comment?: string;
      missingFields?: string[];
      requiredDocuments?: string[];
    }
  ) => {
    const selectedRequest = request || activeDetail;
    let data: any = {
      id: selectedRequest?._id,
      status: requestType,
    };
    if (
      requestType === "accept" &&
      selectedRequest.type === "product_approval"
    ) {
      const activeFees = customFees || fees;
      const m = parseInt(activeFees.promoterCommission || activeFees.messengerFee);
      const c = parseInt(activeFees.connectorCommission || activeFees.connectorFee);
      const p = parseInt(activeFees.platformFee);
      if (isNaN(m) || isNaN(c) || isNaN(p)) {
        setError("All fields must be valid numbers");
        return;
      }
      data["metadata"] = {
        promoterCommission: m,
        connectorCommission: c,
        platformFee: p || 3,
      };
    } else if (rejectionOrChangesData) {
      data["reason"] = rejectionOrChangesData.reason || "";
      data["comment"] = rejectionOrChangesData.comment || "";
      data["missingFields"] = rejectionOrChangesData.missingFields || [];
      data["requiredDocuments"] = rejectionOrChangesData.requiredDocuments || [];
    }
    try {
      setLoading(true);
      await httpClient.put(getCompleteUrlV1(`request`), data);
      resetState();
    } catch (err) {
      console.error("Failed to process request", err);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setError("");
    onModalClose();
    setActiveDetail(null);
    getPendingCounts();
    getSellerRequests();
  };

  async function getSellerRequests() {
    setRequests([]);
    setLoading(true);
    try {
      const response = await httpClient.get(
        getCompleteUrlV1("request/admin-requests", filters)
      );

      const [approvalRequests] = await Promise.all([
        response.json(),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ]);
      setRequests(approvalRequests.data || []);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getPendingCounts();
  }, []);

  useEffect(() => {
    getSellerRequests();
  }, [filters]);

  const onConfirm = (request: any, requestType: RequestType) => {
    handleSubmit(request, requestType);
  };

  const handleSellerReqAction = async (
    request: any,
    requestType: RequestType
  ) => {
    const userConfirmed = window.confirm(
      `Are you sure you want to ${requestType} seller - ${request.metadata?.businessName}`
    );
    if (userConfirmed) {
      onConfirm(request, requestType);
    }
  };

  const onModalClose = () => {
    setSelectedRequest(null);
    setFees({ ...initialFees });
  };

  // Perform search and sort locally
  const filteredAndSortedRequests = requests
    .filter((req) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const name = `${req.firstName || ""} ${req.lastName || ""}`.toLowerCase();
      const email = (req.email || "").toLowerCase();
      const businessName = (req.metadata?.businessName || "").toLowerCase();
      return (
        name.includes(query) ||
        email.includes(query) ||
        businessName.includes(query)
      );
    })
    .sort((_a, _b) => {
      // Simple sort mock
      return sortOrder === "newest" ? 1 : -1;
    });

  // If a detail view is active, render it inline
  if (activeDetail) {
    if (activeDetail.type === "product_approval") {
      return (
        <ProductDetailView
          req={activeDetail}
          onBack={() => setActiveDetail(null)}
          handleSubmit={handleSubmit}
          loading={loading}
        />
      );
    } else if (activeDetail.type === "seller_onboarding") {
      return (
        <SellerDetailView
          req={activeDetail}
          onBack={() => setActiveDetail(null)}
          handleSubmit={handleSubmit}
          loading={loading}
        />
      );
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Approvals", to: "/approvals" },
            ]}
          />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Approvals Queue</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review, verify and manage onboarding or product listing requests.
          </p>
        </div>

        <button
          onClick={() => {
            getPendingCounts();
            getSellerRequests();
          }}
          className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 cursor-pointer"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats/Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Pending Products"
          value={pendingCounts.products}
          icon={
            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          trend={pendingCounts.products > 0 ? "Needs Review" : "All Clean"}
          trendType={pendingCounts.products > 0 ? "neutral" : "positive"}
          gradientClass="from-indigo-50/50 to-purple-50/20 border-indigo-100/60"
        />
        <SummaryCard
          title="Pending Sellers"
          value={pendingCounts.sellers}
          icon={
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          trend={pendingCounts.sellers > 0 ? "Needs Review" : "All Clean"}
          trendType={pendingCounts.sellers > 0 ? "neutral" : "positive"}
          gradientClass="from-blue-50/50 to-sky-50/20 border-blue-100/60"
        />
        <SummaryCard
          title="Total Pending"
          value={pendingCounts.products + pendingCounts.sellers}
          icon={
            <svg className="h-5 w-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          trend="Total Queue"
          gradientClass="from-slate-50 to-slate-100/50 border-slate-200/80"
        />
      </div>

      {/* Tabs & Filters Area */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 max-w-fit gap-1 bg-slate-50/80 p-1.5 rounded-xl">
            <button
              onClick={() =>
                setFilters({
                  ...filters,
                  type: AdminRequestsType.sellerOnboarding,
                })
              }
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filters.type === AdminRequestsType.sellerOnboarding
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Seller Onboarding ({pendingCounts.sellers})
            </button>
            <button
              onClick={() =>
                setFilters({
                  ...filters,
                  type: AdminRequestsType.productApproval,
                })
              }
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filters.type === AdminRequestsType.productApproval
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Product Listings ({pendingCounts.products})
            </button>
          </div>

          {/* Search, Sort, Filter Actions */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
            <div className="relative w-full md:max-w-xs">
              <svg className="absolute left-3 top-3 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, business or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 text-xs bg-slate-50/50 rounded-xl border border-slate-200 outline-none focus:border-slate-400 focus:bg-white transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2">
                <span className="text-2xs font-semibold text-slate-400 uppercase">Status:</span>
                <SelectField<RequestStatus>
                  options={requestStatusOptions}
                  value={filters.status}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      status: value,
                    })
                  }
                  placeholder="Select status"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xs font-semibold text-slate-400 uppercase">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="h-10 px-3 text-xs bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Queue List */}
        <div className="pt-5">
          {loading && <CardSkeleton />}
          
          {filteredAndSortedRequests.length === 0 && !loading ? (
            <div className="text-center py-16 px-4 animate-in fade-in duration-300">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-md font-bold text-slate-800">No pending approvals</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Everything has been reviewed successfully. Check back later for new requests.
              </p>
              <button
                onClick={() => {
                  getPendingCounts();
                  getSellerRequests();
                }}
                className="mt-4 inline-flex items-center justify-center h-9 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Check for Requests
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedRequests.map((req) => {
                if (req.type === "seller_onboarding") {
                  return (
                    <SellerOnboardingCard
                      key={req._id}
                      req={req}
                      handleAction={handleSellerReqAction}
                      onViewDetails={(r) => setActiveDetail(r)}
                    />
                  );
                } else if (req.type === "product_approval") {
                  return (
                    <ProductApprovalCard
                      key={req._id}
                      req={req}
                      handleAction={(value) => {
                        setSelectedRequest(value);
                      }}
                      onViewDetails={(r) => setActiveDetail(r)}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Legacy/List Modal for Inline Actions */}
      {Boolean(selectedRequest?._id) && (
        <Modal key={selectedRequest?._id} onClose={onModalClose}>
          <div className="p-6">
            <h3 className="text-md font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Activate Listing - {selectedRequest?.metadata?.masterDetails?.name || "Product"}
            </h3>
            
            {error && (
              <div className="mb-4 rounded-lg bg-rose-50 border border-rose-100 px-4 py-2.5 text-xs text-rose-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-2xs font-semibold text-slate-500 uppercase block mb-1">Messenger Commission (%)</label>
                <input
                  type="number"
                  placeholder="Messenger Fee"
                  value={fees.messengerFee}
                  onChange={(e) => setFees({ ...fees, messengerFee: e.target.value })}
                  className="w-full border rounded-xl border-slate-200 px-3 py-2.5 text-xs focus:border-slate-400 outline-none"
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-500 uppercase block mb-1">Connector Commission (%)</label>
                <input
                  type="number"
                  placeholder="Connector Fee"
                  value={fees.connectorFee}
                  onChange={(e) => setFees({ ...fees, connectorFee: e.target.value })}
                  className="w-full border rounded-xl border-slate-200 px-3 py-2.5 text-xs focus:border-slate-400 outline-none"
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-500 uppercase block mb-1">Platform Margin (%)</label>
                <input
                  type="number"
                  placeholder="Platform Fee"
                  value={fees.platformFee}
                  onChange={(e) => setFees({ ...fees, platformFee: e.target.value })}
                  className="w-full border rounded-xl border-slate-200 px-3 py-2.5 text-xs focus:border-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={onModalClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(selectedRequest, "accept")}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer"
              >
                Complete Activation
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
