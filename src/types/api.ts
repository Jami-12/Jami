/**
 * Types mirroring the Express/Prisma API in `server/`.
 * Keep this file aligned with `server/src/types/*.ts` — the API is authoritative.
 */

/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

export type Role = "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export type AuthProvider = "LOCAL" | "GOOGLE";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "OUT_OF_STOCK";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentMethod = "BKASH" | "NAGAD" | "CARD" | "CASH_ON_DELIVERY";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type NotificationType = "ORDER" | "PAYMENT" | "PRODUCT" | "SYSTEM" | "ACCOUNT";

export type TransactionType = "INCOME" | "EXPENSE" | "INVESTMENT" | "WITHDRAWAL" | "REFUND";

export type ExpenseCategory =
  | "PRODUCT_PURCHASE"
  | "EMPLOYEE_SALARY"
  | "SHOP_RENT"
  | "ELECTRICITY_BILL"
  | "INTERNET_BILL"
  | "WATER_BILL"
  | "GAS_BILL"
  | "TRANSPORT"
  | "DELIVERY"
  | "MARKETING"
  | "ADVERTISING"
  | "MAINTENANCE"
  | "OFFICE_SUPPLIES"
  | "TAX"
  | "OTHER";

export type ExpenseStatus = "PENDING" | "APPROVED" | "CANCELLED";

export type SalaryStatus = "PENDING" | "PAID" | "CANCELLED";

export type InventoryMovementType =
  | "STOCK_IN"
  | "STOCK_OUT"
  | "ADJUSTMENT"
  | "ORDER_SALE"
  | "ORDER_CANCEL"
  | "ORDER_RETURN";

export type BillFilter = "ALL" | "PAID" | "UNPAID" | "UPCOMING" | "OVERDUE";

/* -------------------------------------------------------------------------- */
/* Envelopes & pagination                                                     */
/* -------------------------------------------------------------------------- */

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

/* -------------------------------------------------------------------------- */
/* Auth & users                                                               */
/* -------------------------------------------------------------------------- */

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: string;
}

export interface UserResponse extends UserPublic {
  provider: AuthProvider;
  isActive: boolean;
  deletedAt: string | null;
  orderCount: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: Role;
  status?: UserStatus;
  isActive?: boolean;
  name?: string;
  email?: string;
  search?: string;
  includeDeleted?: boolean;
  sortOrder?: "asc" | "desc";
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateSelfProfileInput {
  name?: string;
  phone?: string | null;
  image?: string | null;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string | null;
  image?: string | null;
}

export interface UpdateUserStatusInput {
  status?: UserStatus;
  isActive?: boolean;
}

/** Read-only admin customer directory. Never exposes roles or access controls. */
export interface CustomerListParams {
  page?: number;
  limit?: number;
  status?: UserStatus;
  search?: string;
  sortOrder?: "asc" | "desc";
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  isActive: boolean;
  orderCount: number;
  paidOrderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Catalog                                                                    */
/* -------------------------------------------------------------------------- */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  isActive?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandInput {
  name: string;
  slug?: string;
  logo?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export interface ProductCategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProductBrandSummary {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  url: string;
  publicId: string | null;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDiscount {
  id: string | null;
  type: DiscountType;
  value: number;
  amount: number;
  startDate: string | null;
  endDate: string | null;
}

export interface Product {
  id: string;
  title: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string | null;
  price: number;
  originalPrice: number;
  discountPrice: number | null;
  discount: ProductDiscount | null;
  sellingPrice: number;
  finalPrice: number;
  purchasePrice: number | null;
  stock: number;
  minimumStockLevel: number;
  soldCount: number;
  status: ProductStatus;
  isFeatured: boolean;
  isArchived: boolean;
  archivedAt: string | null;
  category: ProductCategorySummary;
  brand: ProductBrandSummary | null;
  images: ProductImage[];
  thumbnail: string | null;
  modelUrl: string | null;
  positionX: number;
  positionY: number;
  positionZ: number;
  wallPositionX: number;
  wallPositionY: number;
  wallPositionZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  featured?: boolean;
  inStock?: boolean;
  sortBy?: "createdAt" | "price" | "title" | "soldCount";
  sortOrder?: "asc" | "desc";
}

export interface ProductImageInput {
  url?: string;
  imageUrl?: string;
  publicId?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductInput {
  title: string;
  slug?: string;
  sku: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  discountPrice?: number | null;
  costPrice?: number | null;
  purchasePrice?: number | null;
  stock: number;
  minimumStockLevel?: number;
  status?: ProductStatus;
  isFeatured?: boolean;
  categoryId: string;
  brandId?: string | null;
  brandName?: string | null;
  modelUrl?: string | null;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  scale?: number;
  images?: ProductImageInput[];
  thumbnail?: string | null;
}

export interface ProductDiscountDetail {
  id: string;
  productId: string;
  productName: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "INACTIVE";
  amount: number;
  originalPrice: number;
  finalPrice: number;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDiscountInput {
  discountType: DiscountType;
  discountValue: number;
  startDate?: string;
  endDate: string;
  isActive?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Reviews                                                                    */
/* -------------------------------------------------------------------------- */

export interface ReviewUserSummary {
  id: string;
  name: string;
  image: string | null;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: ReviewUserSummary;
}

export interface ProductReviews {
  items: Review[];
  averageRating: number;
  reviewCount: number;
  meta: PaginationMeta;
}

export interface ReviewInput {
  rating: number;
  comment?: string;
}

/* -------------------------------------------------------------------------- */
/* Cart & wishlist                                                            */
/* -------------------------------------------------------------------------- */

export interface CartProductSummary {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  price: number;
  originalPrice: number;
  sellingPrice: number;
  finalPrice: number;
  discount: ProductDiscount | null;
  stock: number;
  status: ProductStatus;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  discountAmount: number;
  finalUnitPrice: number;
  lineTotal: number;
  product: CartProductSummary;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistProductSummary {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  status: ProductStatus;
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: WishlistProductSummary;
}

/* -------------------------------------------------------------------------- */
/* Addresses                                                                  */
/* -------------------------------------------------------------------------- */

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  division: string | null;
  district: string;
  area: string | null;
  addressLine: string;
  postalCode: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  fullName: string;
  phone: string;
  division?: string;
  district: string;
  area?: string;
  addressLine: string;
  postalCode?: string;
  isDefault?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Orders & payments                                                          */
/* -------------------------------------------------------------------------- */

export interface CheckoutInput {
  addressId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface OrderAddress {
  id: string;
  fullName: string;
  phone: string;
  division: string | null;
  district: string;
  area: string | null;
  addressLine: string;
  postalCode: string | null;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  sku: string | null;
  unitPrice: number;
  originalPrice: number;
  discountAmount: number;
  finalUnitPrice: number;
  purchasePrice: number;
  quantity: number;
  totalPrice: number;
  subtotal: number;
  productCost: number;
  createdAt: string;
}

export interface PaymentSummary {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId: string | null;
  providerReference: string | null;
  paidAt: string | null;
  collectedById: string | null;
  collectedByName: string | null;
  collectedAt: string | null;
  collectionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCouponSummary {
  id: string;
  code: string;
  discountPercent: number | null;
  discountAmount: number | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string | null;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  totalProductCost: number;
  grossProfit: number;
  netProfit: number;
  refundedAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  receiptNumber: string | null;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: OrderCustomer;
  address: OrderAddress | null;
  items: OrderItem[];
  payment: PaymentSummary | null;
  coupon: OrderCouponSummary | null;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  userId?: string;
  search?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaymentProviderStatus {
  bkash: boolean;
  nagad: boolean;
  card: boolean;
  cashOnDelivery: boolean;
  cardPublishableKey: string | null;
  cardCurrency: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId: string | null;
  providerPaymentId: string | null;
  providerReference: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InitiatePaymentResult {
  payment: Payment;
  method: PaymentMethod;
  paymentStatus: PaymentStatus;
  message: string;
  redirectUrl?: string;
  clientSecret?: string;
  providerPaymentId?: string | null;
}

/* -------------------------------------------------------------------------- */
/* Coupons                                                                    */
/* -------------------------------------------------------------------------- */

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountPercent: number | null;
  discountAmount: number | null;
  minimumAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidation {
  coupon: Coupon;
  subtotal: number;
  discountAmount: number;
  totalAfterDiscount: number;
}

export interface CouponInput {
  code: string;
  description?: string;
  discountPercent?: number;
  discountAmount?: number;
  minimumAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedNotifications extends Paginated<Notification> {
  unreadCount: number;
}

/* -------------------------------------------------------------------------- */
/* Inventory                                                                  */
/* -------------------------------------------------------------------------- */

export interface InventoryItem {
  id: string;
  title: string;
  sku: string;
  stock: number;
  minimumStockLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  stockValue: number;
  potentialSellingValue: number;
  status: ProductStatus;
  isLowStock: boolean;
  isOutOfStock: boolean;
  category: { id: string; name: string };
}

export interface InventoryOverview {
  currency: string;
  totalProducts: number;
  totalUnits: number;
  inventoryCostValue: number;
  potentialSellingValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockItems: InventoryItem[];
}

export interface InventoryLog {
  id: string;
  productId: string;
  movementType: InventoryMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdById: string | null;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Analytics                                                                  */
/* -------------------------------------------------------------------------- */

export interface DailySalesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface MonthlySalesPoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsPaymentMethodBreakdown {
  method: PaymentMethod;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  revenue: number;
}

export interface OrderStatusBreakdown {
  status: OrderStatus;
  count: number;
}

export interface RecentOrderSummary {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus | null;
  customerName: string;
  customerEmail: string;
  createdAt: string;
}

export interface LowStockProduct {
  id: string;
  title: string;
  sku: string;
  stock: number;
  status: string;
}

export interface AnalyticsOverview {
  generatedAt: string;
  currency: string;
  revenue: { total: number; averageOrderValue: number };
  totals: {
    orders: number;
    customers: number;
    admins: number;
    superAdmins: number;
    activeUsers: number;
    inactiveUsers: number;
    products: number;
    activeProducts: number;
    productsWithActiveDiscounts: number;
  };
  dailySales: DailySalesPoint[];
  monthlySales: MonthlySalesPoint[];
  paymentMethodBreakdown: AnalyticsPaymentMethodBreakdown[];
  orderStatusBreakdown: OrderStatusBreakdown[];
  recentOrders: RecentOrderSummary[];
  lowStockProducts: LowStockProduct[];
}

export interface RevenueAnalytics {
  currency: string;
  totalRevenue: number;
  averageOrderValue: number;
  completedPaymentCount: number;
  daily: DailySalesPoint[];
  monthly: MonthlySalesPoint[];
}

export interface PaymentAnalytics {
  currency: string;
  totalRevenue: number;
  totalPayments: number;
  byMethod: AnalyticsPaymentMethodBreakdown[];
  byStatus: { status: PaymentStatus; count: number; amount: number }[];
}

export interface OrderAnalytics {
  totalOrders: number;
  byStatus: OrderStatusBreakdown[];
  daily: { date: string; orders: number }[];
  recentOrders: RecentOrderSummary[];
}

export interface ReceiptData {
  receiptNumber: string;
  orderNumber: string;
  issuedAt: string;
  store: {
    name: string;
    address: string;
    phone: string;
    email: string;
    currency: string;
  };
  customer: OrderCustomer;
  shippingAddress: OrderAddress | null;
  items: {
    productName: string;
    productImage: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId: string | null;
    paidAt: string | null;
  } | null;
  totals: {
    subtotal: number;
    discountAmount: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;
  };
}

/* -------------------------------------------------------------------------- */
/* Accounting                                                                 */
/* -------------------------------------------------------------------------- */

export interface FinancialSummary {
  currency: string;
  period: { start: string; end: string };
  revenue: { sales: number; refunds: number; net: number };
  cogs: number;
  grossProfit: number;
  expenses: {
    operating: number;
    productPurchases: number;
    total: number;
  };
  investments: number;
  netProfit: number;
  netProfitMargin: number;
  isProfit: boolean;
  orders: { paidCount: number; itemsSold: number; salesValue: number };
  expenseBreakdown: { category: string; total: number; count: number }[];
}

export interface ReportPoint {
  period: string;
  income: number;
  refunds: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  productPurchases: number;
  investments: number;
  netProfit: number;
}

export interface FinancialReport {
  summary: FinancialSummary;
  granularity: "day" | "month";
  breakdown: ReportPoint[];
}

export interface FinancialTransaction {
  id: string;
  transactionType: TransactionType;
  category: string;
  amount: number;
  date: string;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdById: string | null;
  createdAt: string;
}

export interface PaymentMethodBreakdown {
  method: PaymentMethod;
  total: number;
  count: number;
}

export interface ManagementStats {
  users: {
    total: number;
    customers: number;
    admins: number;
    superAdmins: number;
    active: number;
    inactive: number;
    blocked: number;
    deleted: number;
    newToday: number;
    newThisMonth: number;
  };
  products: {
    total: number;
    active: number;
    inactive: number;
    draft: number;
    outOfStock: number;
    featured: number;
    archived: number;
    withActiveDiscount: number;
  };
  discounts: {
    total: number;
    active: number;
    scheduled: number;
    expired: number;
    inactive: number;
  };
}

export interface DashboardOverview {
  currency: string;
  generatedAt: string;
  today: FinancialSummary;
  thisMonth: FinancialSummary;
  thisYear: FinancialSummary;
  inventory: InventoryOverview;
  employees: EmployeeSummary;
  bills: BillSummary;
  unpaidBills: Expense[];
  paymentMethods: PaymentMethodBreakdown[];
  recentTransactions: FinancialTransaction[];
  management: ManagementStats;
}

/* -------------------------------------------------------------------------- */
/* Expenses, investments, employees, salaries                                 */
/* -------------------------------------------------------------------------- */

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string | null;
  expenseDate: string;
  dueDate: string | null;
  isPaid: boolean;
  paidAt: string | null;
  receiptUrl: string | null;
  status: ExpenseStatus;
  createdById: string;
  approvedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  category: ExpenseCategory;
  amount: number;
  description?: string;
  expenseDate?: string;
  dueDate?: string;
  isPaid?: boolean;
  receiptUrl?: string;
  status?: ExpenseStatus;
}

export interface ExpenseSummary {
  currency: string;
  total: number;
  count: number;
  paid: number;
  unpaid: number;
  byCategory: { category: ExpenseCategory; total: number; count: number }[];
}

export interface BillSummary {
  currency: string;
  unpaidTotal: number;
  unpaidCount: number;
  overdueTotal: number;
  overdueCount: number;
  upcomingTotal: number;
  upcomingCount: number;
  paidThisMonthTotal: number;
}

export interface Investment {
  id: string;
  amount: number;
  source: string;
  description: string | null;
  investmentDate: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentInput {
  amount: number;
  source: string;
  description?: string;
  investmentDate?: string;
}

export interface InvestmentSummary {
  currency: string;
  total: number;
  count: number;
  thisMonth: number;
  thisYear: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string;
  department: string | null;
  monthlySalary: number;
  joiningDate: string;
  isActive: boolean;
  createdById: string | null;
  salaryPaymentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeInput {
  name: string;
  email?: string;
  phone?: string;
  position: string;
  department?: string;
  monthlySalary: number;
  joiningDate: string;
  isActive?: boolean;
}

export interface EmployeeSummary {
  currency: string;
  total: number;
  active: number;
  inactive: number;
  monthlyPayroll: number;
  departments: { department: string | null; count: number }[];
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  employee: {
    id: string;
    name: string;
    position: string;
    department: string | null;
  };
  month: number;
  year: number;
  amount: number;
  bonus: number;
  deduction: number;
  finalAmount: number;
  status: SalaryStatus;
  paymentDate: string | null;
  notes: string | null;
  expenseId: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryInput {
  employeeId: string;
  month: number;
  year: number;
  amount?: number;
  bonus?: number;
  deduction?: number;
  paymentDate?: string;
  notes?: string;
  status?: SalaryStatus;
}

export interface SalarySummary {
  currency: string;
  totalPaid: number;
  totalPending: number;
  paidCount: number;
  pendingCount: number;
  byMonth: { year: number; month: number; total: number }[];
}

/* -------------------------------------------------------------------------- */
/* Audit                                                                      */
/* -------------------------------------------------------------------------- */

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  description: string | null;
  oldData: unknown;
  newData: unknown;
  ipAddress: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  userId?: string;
  search?: string;
  sortOrder?: "asc" | "desc";
}

/* -------------------------------------------------------------------------- */
/* Banners & Uploads                                                          */
/* -------------------------------------------------------------------------- */

export type UploadFolder = "avatar" | "product" | "banner";

export interface UploadedImageResult {
  url: string;
  imageUrl?: string;
  publicId?: string;
  width?: number | null;
  height?: number | null;
  bytes?: number;
  mimeType?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  publicId: string | null;
  linkUrl: string | null;
  placement: "HERO" | "PROMO";
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BannerInput {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  publicId?: string | null;
  linkUrl?: string | null;
  placement?: "HERO" | "PROMO";
  isActive?: boolean;
  sortOrder?: number;
}
