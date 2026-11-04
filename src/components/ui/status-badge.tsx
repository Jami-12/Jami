import { Badge } from "./badge";

import {
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  PRODUCT_STATUS_META,
  ROLE_META,
} from "@/lib/constants";
import type { OrderStatus, PaymentStatus, ProductStatus, Role } from "@/types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status];
  return <Badge tone={meta.tone} dot>{meta.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const meta = PAYMENT_STATUS_META[status];
  return <Badge tone={meta.tone} dot>{meta.label}</Badge>;
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const meta = PRODUCT_STATUS_META[status];
  return <Badge tone={meta.tone} dot>{meta.label}</Badge>;
}

export function RoleBadge({ role }: { role: Role }) {
  const meta = ROLE_META[role];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
