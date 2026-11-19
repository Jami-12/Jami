import { FooterBottom } from "./footer-bottom";
import { FooterBrand } from "./footer-brand";
import { FooterLinks } from "./footer-links";

export function Footer() {
  return (
    <footer
      id="contact"
      className="mt-16 border-t border-border bg-muted/30 dark:bg-card/30"
    >
      <div className="container-page py-14 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr] lg:gap-14 xl:gap-20">
          <FooterBrand />
          <FooterLinks />
        </div>
        <FooterBottom />
      </div>
    </footer>
  );
}
