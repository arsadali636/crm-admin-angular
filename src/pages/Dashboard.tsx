import { useEffect, useState, useCallback } from "react";
import { ProductType, TopAffiliateType } from "../types";
import { httpClient } from "../services/ApiService";
import { getCompleteUrlV1 } from "../utils";
import { formatDate } from "../utils/utils";
import { DashboardHeader } from "../components/Dashboard/DashboardHeader";
import { DashboardKpiCards } from "../components/Dashboard/DashboardKpiCards";
import { ActionRequiredSection } from "../components/Dashboard/ActionRequiredSection";
import { OrderPerformanceCard } from "../components/Dashboard/OrderPerformanceCard";
import { MarketplaceSnapshot } from "../components/Dashboard/MarketplaceSnapshot";
import { TopProductsTable } from "../components/Dashboard/TopProductsTable";
import { TopSellersTable } from "../components/Dashboard/TopSellersTable";
import { TopUsersTable } from "../components/Dashboard/TopUsersTable";

const getDefaultDates = () => {
  const today = new Date();
  const endDate = formatDate(today);

  const start = new Date(today);
  start.setMonth(start.getMonth() - 2);
  const startDate = formatDate(start);

  return { startDate, endDate };
};

const Dashboard = () => {
  const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDates();

  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);

  const [topProducts, setTopProducts] = useState<ProductType[]>([]);
  const [topUsers, setTopUsers] = useState<TopAffiliateType[]>([]);
  const [topSellers, setTopSellers] = useState<TopAffiliateType[]>([]);
  const [orderData, setOrderData] = useState<any[]>([]);
  const [pendingSellerData, setPendingSellerData] = useState<any[]>([]);
  const [pendingProductData, setPendingProductData] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Isolated section error states
  const [errors, setErrors] = useState<{
    products: boolean;
    sellers: boolean;
    users: boolean;
    orders: boolean;
    pendingSellers: boolean;
    pendingProducts: boolean;
  }>({
    products: false,
    sellers: false,
    users: false,
    orders: false,
    pendingSellers: false,
    pendingProducts: false,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);

      const [
        productsRes,
        sellersRes,
        usersRes,
        ordersRes,
        pendingSellerRequestsRes,
        pendingProductRequestsRes,
      ] = await Promise.allSettled([
        httpClient.get(
          getCompleteUrlV1("product/top-products", {
            limit: "10",
            startDate,
            endDate,
          })
        ),
        httpClient.get(
          getCompleteUrlV1("product/top-sellers", {
            limit: "10",
            startDate,
            endDate,
            userOrSellerFlag: 1,
          })
        ),
        httpClient.get(
          getCompleteUrlV1("product/top-sellers", {
            limit: "10",
            startDate,
            endDate,
            userOrSellerFlag: 2,
          })
        ),
        httpClient.get(
          getCompleteUrlV1("order", {
            limit: "1000",
            startDate,
            endDate,
          })
        ),
        httpClient.get(
          getCompleteUrlV1("request/admin-requests", {
            status: "pending",
            type: "seller_onboarding",
          })
        ),
        httpClient.get(
          getCompleteUrlV1("request/admin-requests", {
            status: "pending",
            type: "product_approval",
          })
        ),
      ]);

      const newErrors = {
        products: false,
        sellers: false,
        users: false,
        orders: false,
        pendingSellers: false,
        pendingProducts: false,
      };

      // 1. Process Top Products
      if (productsRes.status === "fulfilled" && productsRes.value.ok) {
        try {
          const json = await productsRes.value.json();
          setTopProducts(json.data || []);
        } catch {
          newErrors.products = true;
        }
      } else {
        newErrors.products = true;
      }

      // 2. Process Top Sellers
      if (sellersRes.status === "fulfilled" && sellersRes.value.ok) {
        try {
          const json = await sellersRes.value.json();
          setTopSellers(json.data || []);
        } catch {
          newErrors.sellers = true;
        }
      } else {
        newErrors.sellers = true;
      }

      // 3. Process Top Users
      if (usersRes.status === "fulfilled" && usersRes.value.ok) {
        try {
          const json = await usersRes.value.json();
          setTopUsers(json.data || []);
        } catch {
          newErrors.users = true;
        }
      } else {
        newErrors.users = true;
      }

      // 4. Process Orders
      if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
        try {
          const json = await ordersRes.value.json();
          setOrderData(json.data || []);
        } catch {
          newErrors.orders = true;
        }
      } else {
        newErrors.orders = true;
      }

      // 5. Process Pending Seller Requests
      if (
        pendingSellerRequestsRes.status === "fulfilled" &&
        pendingSellerRequestsRes.value.ok
      ) {
        try {
          const json = await pendingSellerRequestsRes.value.json();
          setPendingSellerData(json.data || []);
        } catch {
          newErrors.pendingSellers = true;
        }
      } else {
        newErrors.pendingSellers = true;
      }

      // 6. Process Pending Product Requests
      if (
        pendingProductRequestsRes.status === "fulfilled" &&
        pendingProductRequestsRes.value.ok
      ) {
        try {
          const json = await pendingProductRequestsRes.value.json();
          setPendingProductData(json.data || []);
        } catch {
          newErrors.pendingProducts = true;
        }
      } else {
        newErrors.pendingProducts = true;
      }

      setErrors(newErrors);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const pendingOrderCount = orderData.filter((item) => item.status === 0).length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 1. Dashboard Header */}
        <DashboardHeader
          startDate={startDate}
          endDate={endDate}
          maxDate={defaultEnd}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onRefresh={fetchDashboardData}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
        />

        {/* 2. Executive KPI Overview Cards */}
        <DashboardKpiCards
          orders={orderData}
          pendingSellerData={pendingSellerData}
          pendingProductData={pendingProductData}
          loading={loading}
        />

        {/* 3. Action Required Operational Section */}
        <ActionRequiredSection
          pendingSellerCount={pendingSellerData.length}
          pendingProductCount={pendingProductData.length}
          pendingOrderCount={pendingOrderCount}
          loading={loading}
        />

        {/* 4. Sales / Order Performance & Marketplace Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrderPerformanceCard orders={orderData} loading={loading} />
          <MarketplaceSnapshot
            topProducts={topProducts}
            topSellers={topSellers}
            orders={orderData}
            loading={loading}
          />
        </div>

        {/* 5. Ranking Tables Grid (Top Products, Top Sellers, Top Users) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TopProductsTable
            products={topProducts}
            loading={loading}
            error={errors.products}
            onRetry={fetchDashboardData}
          />
          <TopSellersTable
            sellers={topSellers}
            loading={loading}
            error={errors.sellers}
            onRetry={fetchDashboardData}
          />
          <TopUsersTable
            users={topUsers}
            loading={loading}
            error={errors.users}
            onRetry={fetchDashboardData}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
