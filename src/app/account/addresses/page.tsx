import type { Metadata } from "next";

import { AddressBook } from "@/components/account/address-book";

export const metadata: Metadata = {
  title: "Delivery addresses",
  robots: { index: false, follow: false },
};

export default function AccountAddressesPage() {
  return <AddressBook />;
}
