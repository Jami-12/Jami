import { FooterBottom } from "./footer-bottom";
import { FooterBrand } from "./footer-brand";
import { FooterLinks } from "./footer-links";

export function Footer() {
  return (
    <footer
      id="contact"
      className="mt-12 border-t border-border bg-background"
    >
      <div className="container-page py-8 sm:py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
          <FooterBrand />
          <FooterLinks />
        </div>
        <FooterBottom />
      </div>
    </footer>
  );
}
