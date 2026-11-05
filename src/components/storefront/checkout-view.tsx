"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Plus,
  ShieldCheck,
  Smartphone,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { StripePaymentDialog } from "@/components/payments/stripe-payment-dialog";
import {
  FormField,
  Input,
  Label,
  Textarea,
} from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  addressesApi,
  couponsApi,
  ordersApi,
  paymentsApi,
} from "@/lib/api/services";
import {
  FREE_SHIPPING_THRESHOLD,
  PAYMENT_METHOD_META,
  SHIPPING_FLAT_RATE,
} from "@/lib/constants";
import { cn, formatCurrency, getErrorMessage } from "@/lib/utils";
import { addressSchema, type AddressValues } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth-store";
import { cartSubtotal, useCartStore } from "@/stores/cart-store";
import type {
  CouponValidation,
  PaymentMethod,
  PaymentProviderStatus,
  PaymentStatus,
} from "@/types";

function computeCouponDiscount(coupon: CouponValidation["coupon"] | null, subtotal: number): number {
  if (!coupon) return 0;
  let discount = 0;
  if (coupon.discountPercent !== null) {
    discount = (subtotal * coupon.discountPercent) / 100;
  } else if (coupon.discountAmount !== null) {
    discount = coupon.discountAmount;
  }
  if (coupon.maxDiscount !== null) discount = Math.min(discount, coupon.maxDiscount);
  return Math.min(discount, subtotal);
}

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  icon: typeof Banknote;
  providerKey: keyof Pick<PaymentProviderStatus, "cashOnDelivery" | "bkash" | "nagad" | "card">;
}[] = [
  { value: "CASH_ON_DELIVERY", icon: Banknote, providerKey: "cashOnDelivery" },
  { value: "BKASH", icon: Smartphone, providerKey: "bkash" },
  { value: "NAGAD", icon: Smartphone, providerKey: "nagad" },
  { value: "CARD", icon: CreditCard, providerKey: "card" },
];

function CheckoutGate() {
  return (
    <div className="mx-auto max-w-lg py-8">
      <Card className="p-8 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold">Sign in to check out</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Checkout is linked to your customer account so we can track delivery,
          payments and returns.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/login?next=%2Fcheckout">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register?next=%2Fcheckout">Create an account</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function AddressFormDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (addressId: string) => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      division: "",
      district: "",
      area: "",
      addressLine: "",
      postalCode: "",
      isDefault: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: AddressValues) =>
      addressesApi.create({
        fullName: values.fullName,
        phone: values.phone,
        division: values.division || undefined,
        district: values.district,
        area: values.area || undefined,
        addressLine: values.addressLine,
        postalCode: values.postalCode || undefined,
        isDefault: values.isDefault,
      }),
    onSuccess: (address) => {
      void queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Delivery address saved");
      reset();
      onCreated(address.id);
      onClose();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not save this address")),
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add a delivery address"
      description="We use this exactly as provided by the courier."
      size="lg"
    >
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="grid gap-4 sm:grid-cols-2"
      >
        <FormField label="Recipient name" htmlFor="checkout-full-name" required error={errors.fullName?.message}>
          <Input id="checkout-full-name" autoComplete="name" {...register("fullName")} invalid={Boolean(errors.fullName)} />
        </FormField>
        <FormField label="Phone" htmlFor="checkout-phone" required error={errors.phone?.message}>
          <Input id="checkout-phone" autoComplete="tel" {...register("phone")} invalid={Boolean(errors.phone)} />
        </FormField>
        <FormField label="District" htmlFor="checkout-district" required error={errors.district?.message}>
          <Input id="checkout-district" autoComplete="address-level2" {...register("district")} invalid={Boolean(errors.district)} />
        </FormField>
        <FormField label="Division" htmlFor="checkout-division" error={errors.division?.message}>
          <Input id="checkout-division" autoComplete="address-level1" {...register("division")} />
        </FormField>
        <FormField label="Area" htmlFor="checkout-area" error={errors.area?.message}>
          <Input id="checkout-area" autoComplete="address-level3" {...register("area")} />
        </FormField>
        <FormField label="Postal code" htmlFor="checkout-postal" error={errors.postalCode?.message}>
          <Input id="checkout-postal" autoComplete="postal-code" {...register("postalCode")} />
        </FormField>
        <FormField
          label="Street address"
          htmlFor="checkout-address-line"
          required
          error={errors.addressLine?.message}
          className="sm:col-span-2"
        >
          <Textarea id="checkout-address-line" rows={3} autoComplete="street-address" {...register("addressLine")} invalid={Boolean(errors.addressLine)} />
        </FormField>
        <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2">
          <input
            type="checkbox"
            {...register("isDefault")}
            className="h-4 w-4 rounded border-border text-primary-700 focus:ring-primary-400"
          />
          Make this my default delivery address
        </label>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Save address
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const resetCart = useCartStore((state) => state.reset);
  const queryClient = useQueryClient();

  const [selectedAddress, setSelectedAddress] = React.useState<string>("");
  const [addressDialogOpen, setAddressDialogOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [couponCode, setCouponCode] = React.useState("");
  const [coupon, setCoupon] = React.useState<CouponValidation | null>(null);
  const [notes, setNotes] = React.useState("");
  const [placing, setPlacing] = React.useState(false);
  const [cardSession, setCardSession] = React.useState<{ orderId: string; clientSecret: string } | null>(null);
  const [lastOrderId, setLastOrderId] = React.useState<string | null>(null);

  const isCustomer = user?.role === "CUSTOMER";

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: addressesApi.list,
    enabled: isCustomer,
    staleTime: 30_000,
  });

  const providersQuery = useQuery({
    queryKey: ["payment-providers"],
    queryFn: paymentsApi.providers,
    staleTime: 60_000,
  });

  const providers = providersQuery.data;

  React.useEffect(() => {
    if (!addressesQuery.data) return;
    const existing = addressesQuery.data.find((address) => address.id === selectedAddress);
    if (existing) return;
    const preferred = addressesQuery.data.find((address) => address.isDefault) ?? addressesQuery.data[0];
    if (preferred) setSelectedAddress(preferred.id);
  }, [addressesQuery.data, selectedAddress]);

  React.useEffect(() => {
    if (!providers) return;
    const available = PAYMENT_OPTIONS.find((option) => option.value === paymentMethod);
    if (available && !providers[available.providerKey]) {
      setPaymentMethod("CASH_ON_DELIVERY");
    }
  }, [providers, paymentMethod]);

  const subtotal = cartSubtotal(items);
  const discount = computeCouponDiscount(coupon?.coupon ?? null, subtotal);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping =
    discountedSubtotal === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FLAT_RATE;
  const total = discountedSubtotal + shipping;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const couponMutation = useMutation({
    mutationFn: (code: string) => couponsApi.validate(code),
    onSuccess: (result) => {
      setCoupon(result);
      toast.success(`Coupon ${result.coupon.code} applied`);
    },
    onError: (error) => {
      setCoupon(null);
      toast.error(getErrorMessage(error, "This coupon could not be applied"));
    },
  });

  const goToOrder = React.useCallback(
    (orderId: string, status: PaymentStatus | "PENDING") => {
      router.push(`/dashboard/orders/${orderId}?paymentStatus=${status}`);
    },
    [router],
  );

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error("Choose a delivery address before placing the order.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your bag is empty.");
      return;
    }

    const selectedOption = PAYMENT_OPTIONS.find((option) => option.value === paymentMethod);
    if (providers && selectedOption && !providers[selectedOption.providerKey]) {
      toast.error("That payment method is not available right now. Choose another.");
      return;
    }

    setPlacing(true);

    let order;
    try {
      order = await ordersApi.checkout({
        addressId: selectedAddress,
        paymentMethod,
        couponCode: coupon?.coupon.code,
        notes: notes.trim() || undefined,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not place this order"));
      setPlacing(false);
      return;
    }

    resetCart();
    setLastOrderId(order.id);
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });

    if (paymentMethod === "CASH_ON_DELIVERY") {
      toast.success("Order placed. Pay the courier when it arrives.");
      goToOrder(order.id, "PENDING");
      return;
    }

    try {
      const initiation = await paymentsApi.initiate({ orderId: order.id });

      if (paymentMethod === "CARD") {
        if (initiation.clientSecret) {
          setCardSession({ orderId: order.id, clientSecret: initiation.clientSecret });
        } else {
          toast.info(initiation.message || "Your card payment is already processing.");
          goToOrder(order.id, initiation.paymentStatus);
        }
        return;
      }

      if (initiation.redirectUrl) {
        window.location.assign(initiation.redirectUrl);
        return;
      }

      toast.error(
        initiation.message ||
          "The payment provider did not return a checkout link. Retry from your order page.",
      );
      goToOrder(order.id, initiation.paymentStatus);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Your order was placed, but the payment could not be started. Retry from your order page.",
        ),
      );
      goToOrder(order.id, "PENDING");
    } finally {
      setPlacing(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) return <CheckoutGate />;
  if (!isCustomer) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Checkout is for customer accounts"
        description="You are signed in with a staff account. Use a customer account to place orders, or manage orders from the admin console."
        action={
          <Button asChild>
            <Link href="/admin/orders">Open order management</Link>
          </Button>
        }
      />
    );
  }

  if (items.length === 0 && !cardSession) {
    return (
      <EmptyState
        icon={Truck}
        title="Your bag is empty"
        description="Add at least one object before continuing to checkout."
        action={
          <Button asChild>
            <Link href="/products">Explore the collection</Link>
          </Button>
        }
      />
    );
  }

  const addresses = addressesQuery.data ?? [];
  const cardAvailable = Boolean(providers?.card && providers.cardPublishableKey);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-start">
      <div className="space-y-6">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <MapPin className="h-4 w-4 text-primary-500 dark:text-accent-300" aria-hidden="true" />
                Delivery address
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose where the courier should deliver this order.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setAddressDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add
            </Button>
          </div>

          {addressesQuery.isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 p-5 text-center">
              <p className="text-sm font-semibold">No delivery address yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add one to continue. You can save more addresses from your account later.
              </p>
              <Button size="sm" className="mt-3" onClick={() => setAddressDialogOpen(true)}>
                Add delivery address
              </Button>
            </div>
          ) : (
            <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label="Delivery address">
              {addresses.map((address) => {
                const active = selectedAddress === address.id;
                return (
                  <button
                    key={address.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedAddress(address.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 text-left transition",
                      active
                        ? "border-primary-400 bg-primary-50/60 ring-2 ring-accent-300/40 dark:border-accent-400 dark:bg-primary-900/40"
                        : "border-border bg-card hover:border-primary-300",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        active
                          ? "border-primary-600 bg-primary-600 text-white dark:border-accent-300 dark:bg-accent-300 dark:text-[#082f49]"
                          : "border-border",
                      )}
                      aria-hidden="true"
                    >
                      {active ? <Check className="h-2.5 w-2.5" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold">{address.fullName}</span>
                        {address.isDefault ? <Badge tone="info">Default</Badge> : null}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {address.addressLine}
                        {address.area ? `, ${address.area}` : ""}, {address.district}
                        {address.division ? `, ${address.division}` : ""}
                        {address.postalCode ? ` · ${address.postalCode}` : ""}
                      </span>
                      <span className="mt-1 block text-xs font-semibold">{address.phone}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <CreditCard className="h-4 w-4 text-primary-500 dark:text-accent-300" aria-hidden="true" />
            Payment method
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Provider availability is reported by the store payment gateway.
          </p>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
            {PAYMENT_OPTIONS.map((option) => {
              const meta = PAYMENT_METHOD_META[option.value];
              const Icon = option.icon;
              const enabled = providers
                ? option.value === "CARD"
                  ? cardAvailable
                  : Boolean(providers[option.providerKey])
                : option.value === "CASH_ON_DELIVERY";
              const active = paymentMethod === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={!enabled}
                  onClick={() => setPaymentMethod(option.value)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-55",
                    active
                      ? "border-primary-400 bg-primary-50/60 ring-2 ring-accent-300/40 dark:border-accent-400 dark:bg-primary-900/40"
                      : "border-border bg-card hover:border-primary-300",
                  )}
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{meta.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
                      {enabled ? meta.description : "Not configured by the store yet."}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {providersQuery.isLoading ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Checking provider availability…
            </p>
          ) : null}
          {providersQuery.isError ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              Could not reach the payment provider status endpoint. Cash on delivery remains available.
            </p>
          ) : null}
          {providers && !cardAvailable && providers.card ? (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Card payments are enabled on the server but no publishable key is
              available to the browser, so card checkout is hidden.
            </p>
          ) : null}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Tag className="h-4 w-4 text-primary-500 dark:text-accent-300" aria-hidden="true" />
            Coupon & order notes
          </h2>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="coupon-code">Coupon code</Label>
              <Input
                id="coupon-code"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                placeholder="STUDIO10"
                autoComplete="off"
                disabled={Boolean(coupon)}
              />
            </div>
            {coupon ? (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCoupon(null);
                    setCouponCode("");
                  }}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  loading={couponMutation.isPending}
                  disabled={couponCode.trim().length < 2}
                  onClick={() => couponMutation.mutate(couponCode.trim())}
                >
                  Apply coupon
                </Button>
              </div>
            )}
          </div>

          {coupon ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {coupon.coupon.code} applied · saving {formatCurrency(computeCouponDiscount(coupon.coupon, subtotal))}
            </p>
          ) : null}

          <div className="mt-4">
            <Label htmlFor="order-notes">Delivery notes (optional)</Label>
            <Textarea
              id="order-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Landmark, preferred delivery window, gift note…"
            />
          </div>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Order summary
            </h2>
            <Link href="/cart" className="text-xs font-semibold text-primary-600 hover:underline dark:text-accent-300">
              Edit bag
            </Link>
          </div>

          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <SmartImage src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug">{item.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <Price amount={item.price * item.quantity} size="xs" className="shrink-0" />
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Subtotal · {count} item{count === 1 ? "" : "s"}</dt>
              <dd><Price amount={subtotal} size="sm" /></dd>
            </div>
            {discount > 0 ? (
              <div className="flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400">
                <dt>Coupon discount</dt>
                <dd className="font-semibold tabular-nums">−{formatCurrency(discount)}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-semibold tabular-nums">
                {shipping === 0 ? "Free" : formatCurrency(shipping)}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm font-bold">Total</span>
            <Price amount={total} size="lg" />
          </div>

          <Button size="lg" className="mt-5 w-full" onClick={() => void placeOrder()} loading={placing}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {paymentMethod === "CASH_ON_DELIVERY" ? "Place order" : "Place order & pay"}
          </Button>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            The server recalculates stock, discounts and shipping before creating
            the order. Totals shown here are an estimate in your display currency.
          </p>

          <div className="mt-4 flex justify-center gap-4 border-t border-border pt-4 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Secure
            </span>
            <span className="inline-flex items-center gap-1">
              <Truck className="h-3 w-3" aria-hidden="true" /> Tracked delivery
            </span>
          </div>
        </Card>

        <Button asChild variant="ghost" size="sm" className="w-full">
          <Link href="/cart">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to bag
          </Link>
        </Button>
      </aside>

      <div className="lg:col-span-2">
        <AddressFormDialog
          open={addressDialogOpen}
          onClose={() => setAddressDialogOpen(false)}
          onCreated={setSelectedAddress}
        />
      </div>

      {cardSession && providers?.cardPublishableKey ? (
        <StripePaymentDialog
          open={Boolean(cardSession)}
          onClose={() => {
            setCardSession(null);
            if (lastOrderId) goToOrder(lastOrderId, "PENDING");
          }}
          orderId={cardSession.orderId}
          clientSecret={cardSession.clientSecret}
          publishableKey={providers.cardPublishableKey}
          onResolved={(status) => {
            setCardSession(null);
            goToOrder(cardSession.orderId, status);
          }}
        />
      ) : null}
    </div>
  );
}
