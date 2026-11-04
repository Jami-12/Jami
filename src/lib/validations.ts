import { z } from "zod";

import { EXPENSE_CATEGORIES, PAYMENT_METHODS, PRODUCT_STATUSES } from "./constants";

const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(255, "Email is too long")
  .email("Enter a valid email address");

const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

const optionalText = (max: number) => z.string().trim().max(max).optional();

/* ------------------------------ Auth ------------------------------------ */

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(72),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(120),
    email,
    phone: z
      .string()
      .trim()
      .min(6, "Enter a reachable phone number")
      .max(30)
      .optional()
      .or(z.literal("")),
    password,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((value) => value, {
      message: "Please accept the terms to continue",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().max(72).optional().or(z.literal("")),
  newPassword: password,
  confirmPassword: z.string(),
}).refine((values) => values.newPassword === values.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  image: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type ProfileValues = z.infer<typeof profileSchema>;

/* ---------------------------- Addresses --------------------------------- */

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient's full name").max(120),
  phone: z.string().trim().min(6, "Enter a reachable phone number").max(30),
  division: optionalText(120),
  district: z.string().trim().min(2, "District is required").max(120),
  area: optionalText(120),
  addressLine: z.string().trim().min(5, "Enter the full street address").max(1000),
  postalCode: optionalText(20),
  isDefault: z.boolean().optional(),
});

export type AddressValues = z.infer<typeof addressSchema>;

/* ---------------------------- Checkout ---------------------------------- */

export const checkoutSchema = z.object({
  addressId: z.string().uuid("Choose a delivery address"),
  paymentMethod: z.enum(PAYMENT_METHODS as [string, ...string[]]),
  couponCode: z.string().trim().max(50).optional().or(z.literal("")),
  notes: optionalText(2000),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

/* ----------------------------- Reviews ---------------------------------- */

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  comment: z.string().trim().max(3000).optional().or(z.literal("")),
});

export type ReviewValues = z.infer<typeof reviewSchema>;

/* ----------------------------- Catalog ---------------------------------- */

export const productFormSchema = z
  .object({
    title: z.string().trim().min(2, "Title is required").max(200),
    sku: z.string().trim().min(1, "SKU is required").max(80),
    description: z.string().trim().min(10, "Description needs at least 10 characters").max(20000),
    shortDescription: z.string().trim().max(500).optional().or(z.literal("")),
    price: z.coerce.number().min(0.01, "Price must be greater than zero"),
    discountPrice: z.coerce.number().min(0).optional().or(z.literal("")),
    purchasePrice: z.coerce.number().min(0).optional().or(z.literal("")),
    stock: z.coerce.number().int().min(0),
    minimumStockLevel: z.coerce.number().int().min(0).optional(),
    status: z.enum(PRODUCT_STATUSES as [string, ...string[]]),
    isFeatured: z.boolean().optional(),
    categoryId: z.string().uuid("Choose a category"),
    brandId: z.string().uuid().optional().or(z.literal("")),
    brandName: z.string().trim().max(120).optional().or(z.literal("")),
    modelUrl: z.string().trim().max(2000).optional().or(z.literal("")),
    thumbnail: z.string().trim().max(2000).optional().or(z.literal("")),
    slug: z.string().trim().max(220).optional().or(z.literal("")),
  })
  .refine(
    (values) =>
      values.discountPrice === "" ||
      values.discountPrice === undefined ||
      Number(values.discountPrice) < Number(values.price),
    { message: "Discount price must be lower than the price", path: ["discountPrice"] },
  );

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  image: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type CategoryValues = z.infer<typeof categorySchema>;

export const brandSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z.string().trim().max(160).optional().or(z.literal("")),
  logo: z.string().trim().max(2000).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
});

export type BrandValues = z.infer<typeof brandSchema>;

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, "Code is required")
      .max(50)
      .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, dashes and underscores only"),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
    discountPercent: z.coerce.number().min(0.01).max(100).optional().or(z.literal("")),
    discountAmount: z.coerce.number().min(0.01).optional().or(z.literal("")),
    minimumAmount: z.coerce.number().min(0).optional().or(z.literal("")),
    maxDiscount: z.coerce.number().min(0.01).optional().or(z.literal("")),
    usageLimit: z.coerce.number().int().min(1).optional().or(z.literal("")),
    isActive: z.boolean(),
    startDate: z.string().optional().or(z.literal("")),
    endDate: z.string().optional().or(z.literal("")),
  })
  .refine(
    (values) =>
      (values.discountPercent === "" || values.discountPercent === undefined) !==
      (values.discountAmount === "" || values.discountAmount === undefined),
    {
      message: "Provide exactly one of percentage or fixed amount discount",
      path: ["discountPercent"],
    },
  );

export type CouponValues = z.infer<typeof couponSchema>;

export const discountSchema = z.object({
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.coerce.number().min(0.01),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().optional(),
});

export type DiscountValues = z.infer<typeof discountSchema>;

/* --------------------------- Back office -------------------------------- */

export const expenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES as [string, ...string[]]),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  expenseDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  isPaid: z.boolean().optional(),
  receiptUrl: z.string().trim().max(2000).optional().or(z.literal("")),
  status: z.enum(["PENDING", "APPROVED", "CANCELLED"]).optional(),
});

export type ExpenseValues = z.infer<typeof expenseSchema>;

export const investmentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  source: z.string().trim().min(2, "Source is required").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  investmentDate: z.string().optional().or(z.literal("")),
});

export type InvestmentValues = z.infer<typeof investmentSchema>;

export const employeeSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
  phone: z.string().trim().min(6).max(30).optional().or(z.literal("")),
  position: z.string().trim().min(2, "Position is required").max(120),
  department: z.string().trim().max(120).optional().or(z.literal("")),
  monthlySalary: z.coerce.number().positive("Salary must be greater than zero"),
  joiningDate: z.string().min(1, "Joining date is required"),
  isActive: z.boolean().optional(),
});

export type EmployeeValues = z.infer<typeof employeeSchema>;

export const salarySchema = z.object({
  employeeId: z.string().uuid("Choose an employee"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  amount: z.coerce.number().positive().optional().or(z.literal("")),
  bonus: z.coerce.number().min(0).optional().or(z.literal("")),
  deduction: z.coerce.number().min(0).optional().or(z.literal("")),
  paymentDate: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type SalaryValues = z.infer<typeof salarySchema>;

export const createAdminSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email,
  password,
  phone: z.string().trim().min(6).max(30).optional().or(z.literal("")),
});

export type CreateAdminValues = z.infer<typeof createAdminSchema>;
