import {
  Control,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

interface Size {
  size: string;
  mrp: string;
}

interface Category {
  name: string;
  images: File[] | null;
  slug: string;
  gender: string;
  sizeMrp: Size[];
}

interface IMasterProduct {
  name: string;
  brand: string;
  categoryId: string;
  productCategoryId?: string;
  subCategoryId?: string;
  skuCode: string;
  subCategory?: string;
  productSubCategory?: string;
  mrp: string;
  size: string;
  images: File[] | string | string[] | null;
  description: string;
}

interface CategoryFieldArrayProps {
  control: Control<IMasterProduct>;
  register: UseFormRegister<IMasterProduct>;
  setValue: UseFormSetValue<IMasterProduct>;
  getValues: UseFormGetValues<IMasterProduct>;
}

export interface ICategoryServer {
  _id: string;
  name: string;
  media: string[];
  brand: string;
  skuCode: string;
  active: boolean;
  size: string;
  categoryName: string;
  categoryId: string;
  categoryDetails: { [key: string]: any };
}

interface IMasterProductServer {
  name: string;
  brand: string;
  categoryId: string;
  varients: ICategoryServer[];
}

export interface ICategoryListServer {
  _id: string;
  name: string;
  media: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface IBannerList {
  _id: string;
  contentType: string;
  media: string;
  contentId: string;
}
interface ILotProduct {
  _id: string;
  name: string;
  media: string[];
  lot: Lot[];
  status: Status;
  tags: string[];
  isFeatured: boolean;
  minPrice: number;
  maxPrice: number;
  masterId: string;
  masterDetails: IMasterProduct;
  categoryId: string;
  createdAt_EP: number;
  updatedAt_EP: number;
  expiry: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

interface Lot {
  quantity: number;
  price: number;
  originalPrice: number;
  _id: string;
}

// interface Pagination {
//   totalCount: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

export type {
  Size,
  Category,
  IMasterProduct,
  CategoryFieldArrayProps,
  IMasterProductServer,
  ILotProduct,
};

export enum Status {
  Pending = "pending",
  Active = "active",
  Inactive = "inactive",
}

export enum RequestStatus {
  Pending = "pending",
  Accept = "accept",
  Reject = "reject",
}

export enum AdminRequestsType {
  sellerOnboarding = "seller_onboarding",
  productApproval = "product_approval",
}

export interface IUser {
  _id?: string;
  role: string[];
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  affiliateId?: string;
  createdAt: string;
  status: string;
  seller?: {
    businessName: string;
    address?: string;
    aadhaarNumber: string;
    gstNumber: string;
    pan?: string;
    businessType?: string;
    businessCategory?: string;
    verificationStatus?: string;
  };
  gender?: string;
  dob?: string;
  altPhone?: string;
  state?: string;
  city?: string;
  district?: string;
  pincode?: string;
  wallet?: {
    balance: number;
    locked: number;
    earnings: number;
    withdrawals: number;
    pendingWithdrawals: number;
  };
  orders?: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    returns: number;
    totalPurchase: number;
    ltv: number;
  };
  promoterInfo?: {
    referralCount: number;
    commissionEarned: number;
    campaignsJoined: number;
    performance: string;
  };
  kycStatus?: "verified" | "unverified" | "pending";
  lastLogin?: string;
  notes?: { id: string; text: string; createdAt: string; createdBy: string }[];
  auditLogs?: { action: string; changedBy: string; oldValue: string; newValue: string; timestamp: string; ip: string }[];
}

export interface OrderItem {
  _id: string;
  quantity: number;
  totalAmount: number;
  brand?: string;
  promoterCommission?: number;
  media?: string[];
}

export interface Address {
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isActive: boolean;
}

export interface Order {
  _id: string;
  numericOrderId: number;
  createdAt: string;
  totalAmount: number;
  totalMrpWithQuantity: number;
  totalDiscountPercentage: number;
  totalDiscountWithQuantity?: number;
  paymentMethod: number;
  status: number;
  order_items: OrderItem[];
  address?: Address;
  statusChangeLogs: OrderStatusHistory[];
}

export interface OrderStatusHistory {
  changedBy: string;
  oldStatus: number | string;
  newStatus: number;
  reason: string;
  timestamp: string;
}

export interface Pagination {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductType {
  _id: string;
  totalSale: number;
  volume: number;
  productName: string;
  masterId: string;
}

export type TopAffiliateType = {
  _id: string;
  totalSale: number;
  fName: string;
  lName: string;
  businessName: string;
  affiliateId: string;
  volume: number;
};

export interface IBannerMetadata {
  title: string;
  position: string;
  platform: string;
  status: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt: string;
  views: number;
  clicks: number;
  ctr: string | number;
  priority?: string;
  description?: string;
}

export interface IBannerItem {
  _id: string;
  media: string;
  contentType: string;
  contentId: string;
  contentName: string;
  metadata: IBannerMetadata;
}

