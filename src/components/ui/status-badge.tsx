import { Badge } from "./badge";

import {
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  PRODUCT_STATUS_META,
  ROLE_META,
} from "@/lib/constants";
import type { OrderStatus, PaymentStatus, ProductStatus, Role } from "@/types";

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const meta = ORDER_STATUS_META[status];
  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  );
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const meta = PAYMENT_STATUS_META[status];
  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  );
}

export function ProductStatusBadge({
  status,
  className,
}: {
  status: ProductStatus;
  className?: string;
}) {
  const meta = PRODUCT_STATUS_META[status];
  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  );
}

export function RoleBadge({
  role,
  className,
}: {
  role: Role;
  className?: string;
}) {
  const meta = ROLE_META[role];
  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}
