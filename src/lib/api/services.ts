"use client";

import { apiRequest } from "./client";

import type {
  Address,
  AddressInput,
  AnalyticsOverview,
  AuditLog,
  AuditLogListParams,
  AuthResult,
  Banner,
  BannerInput,
  BillFilter,
  Brand,
  BrandInput,
  Cart,
  Category,
  CategoryInput,
  CheckoutInput,
  Coupon,
  CouponInput,
  CouponValidation,
  CreateAdminInput,
  CustomerListParams,
  CustomerSummary,
  DashboardOverview,
  Employee,
  EmployeeInput,
  EmployeeSummary,
  Expense,
  ExpenseInput,
  ExpenseSummary,
  FinancialReport,
  FinancialSummary,
  FinancialTransaction,
  InitiatePaymentResult,
  InventoryItem,
  InventoryLog,
  InventoryOverview,
  Investment,
  InvestmentInput,
  InvestmentSummary,
  Notification,
  Order,
  OrderAnalytics,
  OrderListParams,
  OrderStatus,
  Paginated,
  PaginatedNotifications,
  Payment,
  PaymentAnalytics,
  PaymentProviderStatus,
  Product,
  ProductDiscountDetail,
  ProductDiscountInput,
  ProductImage,
  ProductInput,
  ProductListParams,
  ProductReviews,
  ReceiptData,
  Review,
  ReviewInput,
  RevenueAnalytics,
  SalaryInput,
  SalaryPayment,
  SalarySummary,
  SiteSettings,
  UpdateSelfProfileInput,
  UpdateSettingsInput,
  UpdateUserInput,
  UpdateUserStatusInput,
  UserListParams,
  UserPublic,
  UserResponse,
  WishlistItem,
  Role,
} from "@/types";

function clean<T extends Record<string, unknown>>(input: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

/** Appends a value only when it carries content; blank optional fields are omitted. */
function appendOptional(formData: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null) return;
  const text = typeof value === "string" ? value.trim() : String(value);
  if (text === "") return;
  formData.append(key, text);
}

/**
 * Appends an explicitly nullable value. `undefined` means "leave unchanged",
 * while `null` or a blank string is sent as an empty field so the API clears it.
 */
function appendNullable(formData: FormData, key: string, value: unknown): void {
  if (value === undefined) return;
  const text =
    value === null ? "" : typeof value === "string" ? value.trim() : String(value);
  formData.append(key, text);
}

function appendFile(formData: FormData, key: string, file?: File | null): void {
  if (file) formData.append(key, file);
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export const authApi = {
  login: (input: { email: string; password: string }) =>
    apiRequest<AuthResult>({ method: "POST", url: "/auth/login", data: input }),

  register: (input: { name: string; email: string; password: string; phone?: string }) =>
    apiRequest<AuthResult>({ method: "POST", url: "/auth/register", data: input }),

  me: async () => {
    const result = await apiRequest<{ user: UserPublic }>({ method: "GET", url: "/auth/me" });
    return result.user;
  },

  changePassword: (input: { currentPassword?: string; newPassword: string }) =>
    apiRequest<null>({ method: "PATCH", url: "/auth/change-password", data: input }),
};

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

export const usersApi = {
  me: async () => {
    const result = await apiRequest<{ user: UserResponse }>({ method: "GET", url: "/users/me" });
    return result.user;
  },

  updateMe: async (input: UpdateSelfProfileInput) => {
    const result = await apiRequest<{ user: UserResponse }>({
      method: "PATCH",
      url: "/users/me",
      data: input,
    });
    return result.user;
  },

  list: (params: UserListParams = {}) =>
    apiRequest<Paginated<UserResponse>>({
      method: "GET",
      url: "/users",
      params: clean(params as Record<string, unknown>),
    }),

  get: async (id: string) => {
    const result = await apiRequest<{ user: UserResponse }>({ method: "GET", url: `/users/${id}` });
    return result.user;
  },

  update: async (id: string, input: UpdateUserInput) => {
    const result = await apiRequest<{ user: UserResponse }>({
      method: "PATCH",
      url: `/users/${id}`,
      data: input,
    });
    return result.user;
  },

  createAdmin: async (input: CreateAdminInput) => {
    const result = await apiRequest<{ user: UserResponse }>({
      method: "POST",
      url: "/users/admins",
      data: input,
    });
    return result.user;
  },

  updateRole: async (id: string, role: Role) => {
    const result = await apiRequest<{ user: UserResponse }>({
      method: "PATCH",
      url: `/users/${id}/role`,
      data: { role },
    });
    return result.user;
  },

  updateStatus: async (id: string, input: UpdateUserStatusInput) => {
    const result = await apiRequest<{ user: UserResponse }>({
      method: "PATCH",
      url: `/users/${id}/status`,
      data: input,
    });
    return result.user;
  },

  remove: (id: string) =>
    apiRequest<{ id: string }>({ method: "DELETE", url: `/users/${id}` }),
};

/**
 * Admin-safe customer directory. Read-only and limited to non-privileged
 * fields — role and access-control changes stay in the super-admin user APIs.
 */
export const customersApi = {
  list: (params: CustomerListParams = {}) =>
    apiRequest<Paginated<CustomerSummary>>({
      method: "GET",
      url: "/admin/customers",
      params: clean(params as Record<string, unknown>),
    }),
};

/* -------------------------------------------------------------------------- */
/* Catalog                                                                    */
/* -------------------------------------------------------------------------- */

export const categoriesApi = {
  list: async (search?: string) => {
    const result = await apiRequest<{ items: Category[] }>({
      method: "GET",
      url: "/categories",
      params: clean({ search }),
    });
    return result.items;
  },

  get: async (id: string) => {
    const result = await apiRequest<{ category: Category }>({
      method: "GET",
      url: `/categories/${id}`,
    });
    return result.category;
  },

  create: async (input: CategoryInput, imageFile?: File | null) => {
    const formData = new FormData();
    appendOptional(formData, "name", input.name);
    appendOptional(formData, "slug", input.slug);
    appendOptional(formData, "description", input.description);
    appendOptional(formData, "isActive", input.isActive);
    if (imageFile) {
      appendFile(formData, "image", imageFile);
    } else {
      appendOptional(formData, "image", input.image);
    }

    const result = await apiRequest<{ category: Category }>({
      method: "POST",
      url: "/categories",
      data: formData,
    });
    return result.category;
  },

  update: async (
    id: string,
    input: Partial<CategoryInput>,
    imageFile?: File | null,
  ) => {
    const formData = new FormData();
    appendOptional(formData, "name", input.name);
    appendOptional(formData, "slug", input.slug);
    appendNullable(formData, "description", input.description);
    appendOptional(formData, "isActive", input.isActive);
    if (imageFile) {
      appendFile(formData, "image", imageFile);
    } else {
      appendNullable(formData, "image", input.image);
    }

    const result = await apiRequest<{ category: Category }>({
      method: "PATCH",
      url: `/categories/${id}`,
      data: formData,
    });
    return result.category;
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const result = await apiRequest<{ category: Category }>({
      method: "PATCH",
      url: `/categories/${id}/status`,
      data: { isActive },
    });
    return result.category;
  },

  remove: (id: string) =>
    apiRequest<{ id: string }>({ method: "DELETE", url: `/categories/${id}` }),
};

export const brandsApi = {
  list: async (search?: string) => {
    const result = await apiRequest<{ items: Brand[] }>({
      method: "GET",
      url: "/brands",
      params: clean({ search }),
    });
    return result.items;
  },

  get: async (id: string) => {
    const result = await apiRequest<{ brand: Brand }>({ method: "GET", url: `/brands/${id}` });
    return result.brand;
  },

  create: async (input: BrandInput, logoFile?: File | null) => {
    const formData = new FormData();
    appendOptional(formData, "name", input.name);
    appendOptional(formData, "slug", input.slug);
    appendOptional(formData, "description", input.description);
    appendOptional(formData, "isActive", input.isActive);
    if (logoFile) {
      appendFile(formData, "logo", logoFile);
    } else {
      appendOptional(formData, "logo", input.logo);
    }

    const result = await apiRequest<{ brand: Brand }>({
      method: "POST",
      url: "/brands",
      data: formData,
    });
    return result.brand;
  },

  update: async (
    id: string,
    input: Partial<BrandInput>,
    logoFile?: File | null,
  ) => {
    const formData = new FormData();
    appendOptional(formData, "name", input.name);
    appendOptional(formData, "slug", input.slug);
    appendNullable(formData, "description", input.description);
    appendOptional(formData, "isActive", input.isActive);
    if (logoFile) {
      appendFile(formData, "logo", logoFile);
    } else {
      appendNullable(formData, "logo", input.logo);
    }

    const result = await apiRequest<{ brand: Brand }>({
      method: "PATCH",
      url: `/brands/${id}`,
      data: formData,
    });
    return result.brand;
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const result = await apiRequest<{ brand: Brand }>({
      method: "PATCH",
      url: `/brands/${id}/status`,
      data: { isActive },
    });
    return result.brand;
  },

  remove: (id: string) =>
    apiRequest<{ id: string }>({ method: "DELETE", url: `/brands/${id}` }),
};

export const productsApi = {
  list: (params: ProductListParams = {}) =>
    apiRequest<Paginated<Product>>({
      method: "GET",
      url: "/products",
      params: clean(params as Record<string, unknown>),
    }),

  getBySlug: async (slug: string) => {
    const result = await apiRequest<{ product: Product }>({
      method: "GET",
      url: `/products/slug/${encodeURIComponent(slug)}`,
    });
    return result.product;
  },

  get: async (id: string) => {
    const result = await apiRequest<{ product: Product }>({ method: "GET", url: `/products/${id}` });
    return result.product;
  },

  create: async (input: ProductInput) => {
    const result = await apiRequest<{ product: Product }>({
      method: "POST",
      url: "/products",
      data: input,
    });
    return result.product;
  },

  update: async (id: string, input: Partial<ProductInput>) => {
    const result = await apiRequest<{ product: Product }>({
      method: "PATCH",
      url: `/products/${id}`,
      data: input,
    });
    return result.product;
  },

  updateStatus: async (id: string, status: Product["status"]) => {
    const result = await apiRequest<{ product: Product }>({
      method: "PATCH",
      url: `/products/${id}/status`,
      data: { status },
    });
    return result.product;
  },

  remove: (id: string) =>
    apiRequest<{ id: string }>({ method: "DELETE", url: `/products/${id}` }),
};

export const productImagesApi = {
  list: async (productId: string) => {
    const result = await apiRequest<{ images: ProductImage[] }>({
      method: "GET",
      url: `/products/${productId}/images`,
    });
    return result.images;
  },

  upload: async (
    productId: string,
    files: File[],
    options: { altText?: string; isPrimary?: boolean } = {},
  ) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("images", file);
    }
    if (options.altText) formData.append("altText", options.altText);
    if (options.isPrimary) formData.append("isPrimary", "true");

    const result = await apiRequest<{ images: ProductImage[] }>({
      method: "POST",
      url: `/products/${productId}/images`,
      data: formData,
    });
    return result.images;
  },

  remove: (productId: string, imageId: string) =>
    apiRequest<{ removed: ProductImage; images: ProductImage[] }>({
      method: "DELETE",
      url: `/products/${productId}/images/${imageId}`,
    }),

  setPrimary: (productId: string, imageId: string) =>
    apiRequest<{ image: ProductImage; images: ProductImage[] }>({
      method: "PATCH",
      url: `/products/${productId}/images/${imageId}/primary`,
    }),

  reorder: (productId: string, imageIds: string[]) =>
    apiRequest<{ images: ProductImage[] }>({
      method: "PATCH",
      url: `/products/${productId}/images/reorder`,
      data: { imageIds },
    }),
};

export const productDiscountsApi = {
  get: async (productId: string) => {
    const result = await apiRequest<{ discount: ProductDiscountDetail | null }>({
      method: "GET",
      url: `/products/${productId}/discount`,
    });
    return result.discount;
  },

  create: async (productId: string, input: ProductDiscountInput) => {
    const result = await apiRequest<{ discount: ProductDiscountDetail }>({
      method: "POST",
      url: `/products/${productId}/discount`,
      data: input,
    });
    return result.discount;
  },

  update: async (productId: string, input: Partial<ProductDiscountInput>) => {
    const result = await apiRequest<{ discount: ProductDiscountDetail }>({
      method: "PATCH",
      url: `/products/${productId}/discount`,
      data: input,
    });
    return result.discount;
  },

  remove: (productId: string) =>
    apiRequest<{ productId: string }>({
      method: "DELETE",
      url: `/products/${productId}/discount`,
    }),
};

export const reviewsApi = {
  forProduct: (productId: string, params: { page?: number; limit?: number; rating?: number } = {}) =>
    apiRequest<ProductReviews>({
      method: "GET",
      url: `/products/${productId}/reviews`,
      params: clean(params as Record<string, unknown>),
    }),

  create: async (productId: string, input: ReviewInput) => {
    const result = await apiRequest<{ review: Review }>({
      method: "POST",
      url: `/products/${productId}/reviews`,
      data: input,
    });
    return result.review;
  },

  list: (params: {
    page?: number;
    limit?: number;
    rating?: number;
    productId?: string;
    userId?: string;
    isApproved?: boolean;
  } = {}) =>
    apiRequest<Paginated<Review>>({
      method: "GET",
      url: "/reviews",
      params: clean(params as Record<string, unknown>),
    }),

  update: async (id: string, input: { rating?: number; comment?: string | null; isApproved?: boolean }) => {
    const result = await apiRequest<{ review: Review }>({
      method: "PATCH",
      url: `/reviews/${id}`,
      data: input,
    });
    return result.review;
  },

  remove: (id: string) =>
    apiRequest<{ id: string }>({ method: "DELETE", url: `/reviews/${id}` }),
};

/* -------------------------------------------------------------------------- */
/* Cart & wishlist                                                            */
/* -------------------------------------------------------------------------- */

export const cartApi = {
  get: async () => {
    const result = await apiRequest<{ cart: Cart }>({ method: "GET", url: "/cart" });
    return result.cart;
  },

  add: async (input: { productId: string; quantity: number }) => {
    const result = await apiRequest<{ cart: Cart }>({
      method: "POST",
      url: "/cart/items",
      data: input,
    });
    return result.cart;
  },

  update: async (itemId: string, quantity: number) => {
    const result = await apiRequest<{ cart: Cart }>({
      method: "PATCH",
      url: `/cart/items/${itemId}`,
      data: { quantity },
    });
    return result.cart;
  },

  remove: async (itemId: string) => {
    const result = await apiRequest<{ cart: Cart }>({
      method: "DELETE",
      url: `/cart/items/${itemId}`,
    });
    return result.cart;
  },

  clear: async () => {
    const result = await apiRequest<{ cart: Cart }>({ method: "DELETE", url: "/cart" });
    return result.cart;
  },
};

export const wishlistApi = {
  list: async () => {
    const result = await apiRequest<{ items: WishlistItem[] }>({ method: "GET", url: "/wishlist" });
    return result.items;
  },

  add: async (productId: string) => {
    const result = await apiRequest<{ item: WishlistItem }>({
      method: "POST",
      url: `/wishlist/${productId}`,
    });
    return result.item;
  },

  remove: (productId: string) =>
    apiRequest<{ productId: string }>({ method: "DELETE", url: `/wishlist/${productId}` }),
};

/* -------------------------------------------------------------------------- */
/* Addresses                                                                  */
/* -------------------------------------------------------------------------- */

export const addressesApi = {
  list: async () => {
    const result = await apiRequest<{ items: Address[] }>({ method: "GET", url: "/addresses" });
    return result.items;
  },

  create: async (input: AddressInput) => {
    const result = await apiRequest<{ address: Address }>({
      method: "POST",
      url: "/addresses",
      data: clean(input as unknown as Record<string, unknown>),
    });
    return result.address;
  },

  update: async (id: string, input: Partial<AddressInput>) => {
    const result = await apiRequest<{ address: Address }>({
      method: "PATCH",
      url: `/addresses/${id}`,
      data: clean(input as unknown as Record<string, unknown>),
    });
    return result.address;
  },

  remove: (id: string) =>
    apiRequest<{ id: string }>({ method: "DELETE", url: `/addresses/${id}` }),
};

/* -------------------------------------------------------------------------- */
/* Orders & payments                                                          */
/* -------------------------------------------------------------------------- */

export const ordersApi = {
  checkout: async (input: CheckoutInput) => {
    const result = await apiRequest<{ order: Order }>({
      method: "POST",
      url: "/orders/checkout",
      data: clean(input as unknown as Record<string, unknown>),
    });
    return result.order;
  },

  myOrders: (params: OrderListParams = {}) =>
    apiRequest<Paginated<Order>>({
      method: "GET",
      url: "/orders/my-orders",
      params: clean(params as Record<string, unknown>),
    }),

  adminList: (params: OrderListParams = {}) =>
    apiRequest<Paginated<Order>>({
      method: "GET",
      url: "/admin/orders",
      params: clean(params as Record<string, unknown>),
    }),

  get: async (id: string) => {
    const result = await apiRequest<{ order: Order }>({ method: "GET", url: `/orders/${id}` });
    return result.order;
  },

  receipt: async (id: string) => {
    const result = await apiRequest<{ receipt: ReceiptData }>({
      method: "GET",
      url: `/orders/${id}/receipt`,
    });
    return result.receipt;
  },

  cancel: async (id: string) => {
    const result = await apiRequest<{ order: Order }>({
      method: "POST",
      url: `/orders/${id}/cancel`,
    });
    return result.order;
  },

  updateStatus: async (id: string, status: OrderStatus) => {
    const result = await apiRequest<{ order: Order }>({
      method: "PATCH",
      url: `/admin/orders/${id}/status`,
      data: { status },
    });
    return result.order;
  },

  collectPayment: async (
    id: string,
    input: { note?: string; reference?: string } = {},
  ) => {
    const result = await apiRequest<{ order: Order }>({
      method: "PATCH",
      url: `/admin/orders/${id}/collect-payment`,
      data: clean(input),
    });
    return result.order;
  },
};

export const paymentsApi = {
  providers: async () => {
    const result = await apiRequest<{ providers: PaymentProviderStatus }>({
      method: "GET",
      url: "/payments/providers",
    });
    return result.providers;
  },

  initiate: (input: { orderId: string; method?: string }) =>
    apiRequest<InitiatePaymentResult>({
      method: "POST",
      url: "/payments/initiate",
      data: input,
    }),

  reconcileCard: async (orderId: string) => {
    const result = await apiRequest<{ payment: Payment }>({
      method: "POST",
      url: "/payments/card/reconcile",
      data: { orderId },
    });
    return result.payment;
  },

  get: async (id: string) => {
    const result = await apiRequest<{ payment: Payment }>({
      method: "GET",
      url: `/payments/${id}`,
    });
    return result.payment;
  },

  confirm: async (
    id: string,
    input: { transactionId?: string; providerReference?: string } = {},
  ) => {
    const result = await apiRequest<{ payment: Payment }>({
      method: "POST",
      url: `/payments/${id}/confirm`,
      data: input,
    });
    return result.payment;
  },

  fail: async (id: string, reason?: string) => {
    const result = await apiRequest<{ payment: Payment }>({
      method: "POST",
      url: `/payments/${id}/fail`,
      data: { reason },
    });
    return result.payment;
  },
};

/* -------------------------------------------------------------------------- */
/* Coupons                                                                    */
/* -------------------------------------------------------------------------- */

export const couponsApi = {
  validate: (code: string) =>
    apiRequest<CouponValidation>({
      method: "POST",
      url: "/coupons/validate",
      data: { code },
    }),

  list: async (params: { search?: string; isActive?: boolean } = {}) => {
    const result = await apiRequest<{ items: Coupon[] }>({
      method: "GET",
      url: "/coupons",
      params: clean(params as Record<string, unknown>),
    });
    return result.items;
  },

  get: async (id: string) => {
    const result = await apiRequest<{ coupon: Coupon }>({ method: "GET", url: `/coupons/${id}` });
    return result.coupon;
  },

  create: async (input: CouponInput) => {
    const result = await apiRequest<{ coupon: Coupon }>({
      method: "POST",
      url: "/coupons",
      data: clean(input as unknown as Record<string, unknown>),
    });
    return result.coupon;
  },

  update: async (id: string, input: Partial<CouponInput>) => {
    const result = await apiRequest<{ coupon: Coupon }>({
      method: "PATCH",
      url: `/coupons/${id}`,
      data: clean(input as unknown as Record<string, unknown>),
    });
    return result.coupon;
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const result = await apiRequest<{ coupon: Coupon }>({
      method: "PATCH",
      url: `/coupons/${id}/status`,
      data: { isActive },
    });
    return result.coupon;
  },

  remove: (id: string) =>
    apiRequest<{ id: string }>({ method: "DELETE", url: `/coupons/${id}` }),
};

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

export const notificationsApi = {
  list: (params: { page?: number; limit?: number; isRead?: boolean; type?: string } = {}) =>
    apiRequest<PaginatedNotifications>({
      method: "GET",
      url: "/notifications",
      params: clean(params as Record<string, unknown>),
    }),

  markRead: async (id: string) => {
    const result = await apiRequest<{ notification: Notification }>({
      method: "PATCH",
      url: `/notifications/${id}/read`,
    });
    return result.notification;
  },

  markAllRead: async () => {
    const result = await apiRequest<{ updated: number }>({
      method: "PATCH",
      url: "/notifications/read-all",
    });
    return result.updated;
  },

  remove: (id: string) =>
    apiRequest<null>({ method: "DELETE", url: `/notifications/${id}` }),
};

/* -------------------------------------------------------------------------- */
/* Inventory                                                                  */
/* -------------------------------------------------------------------------- */

export const inventoryApi = {
  overview: async () => {
    const result = await apiRequest<{ overview: InventoryOverview }>({
      method: "GET",
      url: "/inventory/overview",
    });
    return result.overview;
  },

  list: (params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
    lowStockOnly?: boolean;
    sortBy?: "stock" | "stockValue" | "title" | "updatedAt";
    sortOrder?: "asc" | "desc";
  } = {}) =>
    apiRequest<Paginated<InventoryItem>>({
      method: "GET",
      url: "/inventory",
      params: clean(params as Record<string, unknown>),
    }),

  get: async (productId: string) => {
    const result = await apiRequest<{ item: InventoryItem }>({
      method: "GET",
      url: `/inventory/${productId}`,
    });
    return result.item;
  },

  adjust: async (
    productId: string,
    input: { movementType: string; quantity: number; reason?: string },
  ) => {
    const result = await apiRequest<{ item: InventoryItem }>({
      method: "POST",
      url: `/inventory/${productId}/adjust`,
      data: input,
    });
    return result.item;
  },

  logs: (params: {
    page?: number;
    limit?: number;
    productId?: string;
    movementType?: string;
    startDate?: string;
    endDate?: string;
  } = {}) =>
    apiRequest<Paginated<InventoryLog>>({
      method: "GET",
      url: "/inventory/logs",
      params: clean(params as Record<string, unknown>),
    }),
};

/* -------------------------------------------------------------------------- */
/* Analytics & accounting                                                     */
/* -------------------------------------------------------------------------- */

export const analyticsApi = {
  overview: async () => {
    const result = await apiRequest<{ overview: AnalyticsOverview }>({
      method: "GET",
      url: "/analytics/overview",
    });
    return result.overview;
  },

  revenue: async () => {
    const result = await apiRequest<{ revenue: RevenueAnalytics }>({
      method: "GET",
      url: "/analytics/revenue",
    });
    return result.revenue;
  },

  payments: async () => {
    const result = await apiRequest<{ payments: PaymentAnalytics }>({
      method: "GET",
      url: "/analytics/payments",
    });
    return result.payments;
  },

  orders: async () => {
    const result = await apiRequest<{ orders: OrderAnalytics }>({
      method: "GET",
      url: "/analytics/orders",
    });
    return result.orders;
  },
};

export const accountingApi = {
  dashboard: async () => {
    const result = await apiRequest<{ dashboard: DashboardOverview }>({
      method: "GET",
      url: "/accounting/dashboard",
    });
    return result.dashboard;
  },

  summary: async (startDate: string, endDate: string) => {
    const result = await apiRequest<{ summary: FinancialSummary }>({
      method: "GET",
      url: "/accounting/summary",
      params: { startDate, endDate },
    });
    return result.summary;
  },

  report: async (params: {
    startDate: string;
    endDate: string;
    granularity?: "day" | "month";
  }) => {
    const result = await apiRequest<{ report: FinancialReport }>({
      method: "GET",
      url: "/accounting/reports",
      params: clean(params as unknown as Record<string, unknown>),
    });
    return result.report;
  },

  transactions: (params: {
    page?: number;
    limit?: number;
    transactionType?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortOrder?: "asc" | "desc";
  } = {}) =>
    apiRequest<Paginated<FinancialTransaction>>({
      method: "GET",
      url: "/accounting/transactions",
      params: clean(params as Record<string, unknown>),
    }),

  orderProfit: (startDate: string, endDate: string) =>
    apiRequest<{
      summary: FinancialSummary;
      orders: {
        orderId: string;
        orderNumber: string;
        totalAmount: number;
        totalProductCost: number;
        grossProfit: number;
        netProfit: number;
        paidAt: string | null;
      }[];
    }>({
      method: "GET",
      url: "/accounting/reports/orders",
      params: { startDate, endDate },
    }),
};

/* -------------------------------------------------------------------------- */
/* Expenses, investments, employees, salaries                                 */
/* -------------------------------------------------------------------------- */

export const expensesApi = {
  list: (params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    isPaid?: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortOrder?: "asc" | "desc";
  } = {}) =>
    apiRequest<Paginated<Expense>>({
      method: "GET",
      url: "/expenses",
      params: clean(params as Record<string, unknown>),
    }),

  summary: async () => {
    const result = await apiRequest<{ summary: ExpenseSummary }>({
      method: "GET",
      url: "/expenses/summary",
    });
    return result.summary;
  },

  bills: (params: { page?: number; limit?: number; filter?: BillFilter } = {}) =>
    apiRequest<Paginated<Expense>>({
      method: "GET",
      url: "/expenses/bills",
      params: clean(params as Record<string, unknown>),
    }),

  get: async (id: string) => {
    const result = await apiRequest<{ expense: Expense }>({
      method: "GET",
      url: `/expenses/${id}`,
    });
    return result.expense;
  },

  create: async (input: ExpenseInput) => {
    const result = await apiRequest<{ expense: Expense }>({
      method: "POST",
      url: "/expenses",
      data: clean(input as unknown as Record<string, unknown>),
    });
    return result.expense;
  },

  update: async (id: string, input: Partial<ExpenseInput>) => {
    const result = await apiRequest<{ expense: Expense }>({
      method: "PATCH",
      url: `/expenses/${id}`,
      data: clean(input as unknown as Record<string, unknown>),
    });
    return result.expense;
  },

  cancel: async (id: string) => {
    const result = await apiRequest<{ expense: Expense }>({
      method: "DELETE",
      url: `/expenses/${id}`,
    });
    return result.expense;
  },
};

export const investmentsApi = {
  list: (params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortOrder?: "asc" | "desc";
  } = {}) =>
    apiRequest<Paginated<Investment>>({
      method: "GET",
      url: "/investments",
      params: clean(params as Record<string, unknown>),
    }),

  summary: async () => {
    const result = await apiRequest<{ summary: InvestmentSummary }>({
      method: "GET",
      url: "/investments/summary",
    });
    return result.summary;
  },

  get: async (id: string) => {
    const result = await apiRequest<{ investment: Investment }>({
      method: "GET",
      url: `/investments/${id}`,
    });
    return result.investment;
  },

  create: async (input: InvestmentInput) => {
    const result = await apiRequest<{ investment: Investment }>({
      method: "POST",
      url: "/investments",
      data: clean(input as unknown as Record<string, unknown>),
    });
    return result.investment;
  },

  update: async (id: string, input: Partial<InvestmentInput>) => {
    const result = await apiRequest<{ investment: Investment }>({
      method: "PATCH",
      url: `/investments/${id}`,
      data: clean(input as unknown as Record<string, unknown>),
    });
    return result.investment;
  },

  remove: (id: string) => apiRequest<null>({ method: "DELETE", url: `/investments/${id}` }),
};

export const employeesApi = {
  list: (params: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    department?: string;
    search?: string;
    sortOrder?: "asc" | "desc";
  } = {}) =>
    apiRequest<Paginated<Employee>>({
      method: "GET",
      url: "/employees",
      params: clean(params as Record<string, unknown>),
    }),

  summary: async () => {
    const result = await apiRequest<{ summary: EmployeeSummary }>({
      method: "GET",
      url: "/employees/summary",
    });
    return result.summary;
  },

  get: async (id: string) => {
    const result = await apiRequest<{ employee: Employee }>({
      method: "GET",
      url: `/employees/${id}`,
    });
    return result.employee;
  },

  create: async (input: EmployeeInput) => {
    const result = await apiRequest<{ employee: Employee }>({
      method: "POST",
      url: "/employees",
      data: clean(input as unknown as Record<string, unknown>),
    });
    return result.employee;
  },

  update: async (id: string, input: Partial<EmployeeInput>) => {
    const result = await apiRequest<{ employee: Employee }>({
      method: "PATCH",
      url: `/employees/${id}`,
      data: clean(input as unknown as Record<string, unknown>),
    });
    return result.employee;
  },

  deactivate: async (id: string) => {
    const result = await apiRequest<{ employee: Employee }>({
      method: "DELETE",
      url: `/employees/${id}`,
    });
    return result.employee;
  },
};

export const salariesApi = {
  list: (params: {
    page?: number;
    limit?: number;
    employeeId?: string;
    month?: number;
    year?: number;
    status?: string;
    search?: string;
    sortOrder?: "asc" | "desc";
  } = {}) =>
    apiRequest<Paginated<SalaryPayment>>({
      method: "GET",
      url: "/salaries",
      params: clean(params as Record<string, unknown>),
    }),

  summary: async (year: number) => {
    const result = await apiRequest<{ summary: SalarySummary }>({
      method: "GET",
      url: "/salaries/summary",
      params: { year },
    });
    return result.summary;
  },

  create: async (input: SalaryInput) => {
    const result = await apiRequest<{ salary: SalaryPayment }>({
      method: "POST",
      url: "/salaries",
      data: clean(input as unknown as Record<string, unknown>),
    });
    return result.salary;
  },

  pay: async (id: string, paymentDate?: string) => {
    const result = await apiRequest<{ salary: SalaryPayment }>({
      method: "POST",
      url: `/salaries/${id}/pay`,
      data: clean({ paymentDate }),
    });
    return result.salary;
  },

  cancel: async (id: string) => {
    const result = await apiRequest<{ salary: SalaryPayment }>({
      method: "POST",
      url: `/salaries/${id}/cancel`,
    });
    return result.salary;
  },
};

/* -------------------------------------------------------------------------- */
/* Audit                                                                      */
/* -------------------------------------------------------------------------- */

export const auditApi = {
  list: (params: AuditLogListParams = {}) =>
    apiRequest<Paginated<AuditLog>>({
      method: "GET",
      url: "/audit",
      params: clean(params as Record<string, unknown>),
    }),
};

/* -------------------------------------------------------------------------- */
/* Uploads & Banners                                                          */
/* -------------------------------------------------------------------------- */

export const uploadsApi = {
  uploadImage: async (file: File, folder: "avatar" | "product" | "banner" = "avatar") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const result = await apiRequest<{ image: { url: string; publicId: string; bytes: number; mimeType: string }; folder: string }>({
      method: "POST",
      url: "/uploads/image",
      data: formData,
    });
    return result.image;
  },
};

export const bannersApi = {
  listPublic: async (placement?: "HERO" | "PROMO") => {
    const result = await apiRequest<{ banners: Banner[] }>({
      method: "GET",
      url: "/banners",
      params: placement ? { placement } : undefined,
    });
    return result.banners;
  },

  listAdmin: async (placement?: "HERO" | "PROMO") => {
    const result = await apiRequest<{ banners: Banner[] }>({
      method: "GET",
      url: "/banners/admin",
      params: placement ? { placement } : undefined,
    });
    return result.banners;
  },

  get: async (id: string) => {
    const result = await apiRequest<{ banner: Banner }>({
      method: "GET",
      url: `/banners/admin/${id}`,
    });
    return result.banner;
  },

  create: async (input: BannerInput, imageFile?: File | null) => {
    const formData = new FormData();
    appendOptional(formData, "title", input.title);
    appendNullable(formData, "subtitle", input.subtitle);
    appendNullable(formData, "linkUrl", input.linkUrl);
    appendNullable(formData, "publicId", input.publicId);
    appendOptional(formData, "placement", input.placement);
    appendOptional(formData, "isActive", input.isActive);
    appendOptional(formData, "sortOrder", input.sortOrder);
    if (imageFile) {
      appendFile(formData, "image", imageFile);
    } else {
      appendOptional(formData, "imageUrl", input.imageUrl);
    }

    const result = await apiRequest<{ banner: Banner }>({
      method: "POST",
      url: "/banners/admin",
      data: formData,
    });
    return result.banner;
  },

  update: async (
    id: string,
    input: Partial<BannerInput>,
    imageFile?: File | null,
  ) => {
    const formData = new FormData();
    appendOptional(formData, "title", input.title);
    appendNullable(formData, "subtitle", input.subtitle);
    appendNullable(formData, "linkUrl", input.linkUrl);
    appendNullable(formData, "publicId", input.publicId);
    appendOptional(formData, "placement", input.placement);
    appendOptional(formData, "isActive", input.isActive);
    appendOptional(formData, "sortOrder", input.sortOrder);
    if (imageFile) {
      appendFile(formData, "image", imageFile);
    } else {
      appendOptional(formData, "imageUrl", input.imageUrl);
    }

    const result = await apiRequest<{ banner: Banner }>({
      method: "PATCH",
      url: `/banners/admin/${id}`,
      data: formData,
    });
    return result.banner;
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const result = await apiRequest<{ banner: Banner }>({
      method: "PATCH",
      url: `/banners/admin/${id}/status`,
      data: { isActive },
    });
    return result.banner;
  },

  remove: (id: string) =>
    apiRequest<{ banner: Banner }>({
      method: "DELETE",
      url: `/banners/admin/${id}`,
    }),
};

function settingsFormData(input: UpdateSettingsInput): FormData {
  const formData = new FormData();

  if (input.siteName !== undefined) {
    if (input.siteName === null) formData.append("siteName", "");
    else formData.append("siteName", input.siteName);
  }
  if (input.navbarLogoUrl !== undefined) {
    formData.append("navbarLogoUrl", input.navbarLogoUrl ?? "null");
  }
  if (input.navbarLogoPublicId !== undefined) {
    formData.append("navbarLogoPublicId", input.navbarLogoPublicId ?? "");
  }
  if (input.logo) appendFile(formData, "logo", input.logo);

  const toggles: Array<[keyof UpdateSettingsInput, boolean | undefined]> = [
    ["showHero", input.showHero],
    ["showProductFinder", input.showProductFinder],
    ["showMiddleCategories", input.showMiddleCategories],
    ["showCategorySections", input.showCategorySections],
    ["showNewArrivals", input.showNewArrivals],
    ["showBrands", input.showBrands],
    ["showPromoBanners", input.showPromoBanners],
    ["showNewsletter", input.showNewsletter],
  ];

  for (const [key, value] of toggles) {
    if (typeof value === "boolean") formData.append(key, String(value));
  }

  if (input.categorySections) {
    formData.append("categorySections", JSON.stringify(input.categorySections));
  }

  return formData;
}

/**
 * Storefront presentation settings. Reads are public because the storefront
 * needs the logo and section visibility before a visitor signs in; writes are
 * restricted to SUPER_ADMIN on the API.
 */
export const settingsApi = {
  get: async () => {
    const result = await apiRequest<{ settings: SiteSettings }>({
      method: "GET",
      url: "/settings",
    });
    return result.settings;
  },

  update: async (input: UpdateSettingsInput) => {
    const result = await apiRequest<{ settings: SiteSettings }>({
      method: "PATCH",
      url: "/settings",
      data: settingsFormData(input),
    });
    return result.settings;
  },
};
