export interface StaticNotification {
  id: string;
  module: "user" | "seller" | "product" | "order" | "wallet" | "promoter" | "connector" | "deals" | "system";
  eventType: string;
  title: string;
  description: string;
  entityId?: string;
  entityName?: string;
  createdTime: string; // relative display string or timestamp
  readStatus: "read" | "unread";
  priority: "low" | "medium" | "high";
  redirectUrl: string;
}

export const STATIC_NOTIFICATIONS: StaticNotification[] = [
  {
    id: "NOTIF-001",
    module: "seller",
    eventType: "SELLER_REGISTRATION",
    title: "New Seller Registered",
    description: "ABC Traders completed their enterprise seller registration and requires profile verification.",
    entityId: "W-382910",
    entityName: "ABC Traders",
    createdTime: "2 mins ago",
    readStatus: "unread",
    priority: "high",
    redirectUrl: "/approvals?type=seller_onboarding"
  },
  {
    id: "NOTIF-002",
    module: "product",
    eventType: "PRODUCT_APPROVAL_PENDING",
    title: "Product Approval Pending",
    description: "New listing 'Super Widget 3000' is waiting for category manager approval.",
    entityId: "PROD-847291",
    entityName: "Super Widget 3000",
    createdTime: "10 mins ago",
    readStatus: "unread",
    priority: "medium",
    redirectUrl: "/approvals?type=product_approval"
  },
  {
    id: "NOTIF-003",
    module: "order",
    eventType: "NEW_ORDER",
    title: "New Order Placed",
    description: "Order #ORD-984382 received for an amount of ₹24,500.",
    entityId: "ORD-984382",
    entityName: "#ORD-984382",
    createdTime: "1 hr ago",
    readStatus: "unread",
    priority: "high",
    redirectUrl: "/orders"
  },
  {
    id: "NOTIF-004",
    module: "wallet",
    eventType: "WITHDRAWAL_REQUEST",
    title: "Withdrawal Request Received",
    description: "Amit Kumar requested a payout of ₹15,000 to SBI Bank.",
    entityId: "WDR-382903",
    entityName: "Amit Kumar",
    createdTime: "2 hrs ago",
    readStatus: "unread",
    priority: "medium",
    redirectUrl: "/wallet/withdrawals?tab=Pending"
  },
  {
    id: "NOTIF-005",
    module: "user",
    eventType: "USER_REGISTERED",
    title: "New User Registered",
    description: "Vikram Malhotra joined Lottmart as a standard promoter via referral code 'PROMO88'.",
    entityId: "W-294821",
    entityName: "Vikram Malhotra",
    createdTime: "3 hrs ago",
    readStatus: "read",
    priority: "low",
    redirectUrl: "/users?userId=W-294821"
  },
  {
    id: "NOTIF-006",
    module: "promoter",
    eventType: "COMMISSION_GENERATED",
    title: "Commission Generated",
    description: "Commission of ₹1,200 generated on referral checkout ORD-984322.",
    entityId: "ORD-984322",
    entityName: "Priya Nair",
    createdTime: "5 hrs ago",
    readStatus: "read",
    priority: "low",
    redirectUrl: "/wallet/dashboard"
  },
  {
    id: "NOTIF-007",
    module: "deals",
    eventType: "DEAL_CREATED",
    title: "New Flash Deal Created",
    description: "Deal 'Monsoon Electronics Sale' has been scheduled to start on July 26th.",
    entityId: "DEAL-5029",
    entityName: "Monsoon Electronics Sale",
    createdTime: "1 day ago",
    readStatus: "read",
    priority: "medium",
    redirectUrl: "/master-product-list"
  },
  {
    id: "NOTIF-008",
    module: "system",
    eventType: "CRITICAL_ERROR",
    title: "API Sync Failure",
    description: "Failed background job: Logistics webhook delivery retries exhausted for third-party courier APIs.",
    entityId: "JOB-9921",
    entityName: "Logistics Delivery Webhook",
    createdTime: "1 day ago",
    readStatus: "unread",
    priority: "high",
    redirectUrl: "/dashboard"
  },
  {
    id: "NOTIF-009",
    module: "connector",
    eventType: "CONNECTOR_JOINED_DEAL",
    title: "Connector Joined Deal",
    description: "Suresh Gupta joined Deal 'Monsoon Electronics Sale' as primary vendor partner.",
    entityId: "DEAL-5029",
    entityName: "Suresh Gupta",
    createdTime: "2 days ago",
    readStatus: "read",
    priority: "low",
    redirectUrl: "/master-product-list"
  },
  {
    id: "NOTIF-010",
    module: "seller",
    eventType: "SELLER_REJECTED",
    title: "Seller Registration Rejected",
    description: "Star Enterprises onboarding request rejected due to missing GSTIN certification.",
    entityId: "W-889021",
    entityName: "Star Enterprises",
    createdTime: "3 days ago",
    readStatus: "read",
    priority: "medium",
    redirectUrl: "/approvals"
  },
  {
    id: "NOTIF-011",
    module: "order",
    eventType: "ORDER_CANCELLED",
    title: "Order Cancelled by Buyer",
    description: "Order #ORD-381029 has been cancelled. Automated refund processing triggered.",
    entityId: "ORD-381029",
    entityName: "#ORD-381029",
    createdTime: "4 days ago",
    readStatus: "read",
    priority: "high",
    redirectUrl: "/orders"
  },
  {
    id: "NOTIF-012",
    module: "wallet",
    eventType: "RECHARGE_SUCCESS",
    title: "Wallet Recharge Completed",
    description: "Auto-recharge of ₹50,000 approved for seller Ramesh Sharma.",
    entityId: "W-382910",
    entityName: "Ramesh Sharma",
    createdTime: "5 days ago",
    readStatus: "read",
    priority: "low",
    redirectUrl: "/wallet/transactions"
  }
];
