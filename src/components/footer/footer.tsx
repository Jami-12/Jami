import { FooterBottom } from "./footer-bottom";
import { FooterBrand } from "./footer-brand";
import { FooterLinks } from "./footer-links";

export function Footer() {
  return (
    <footer
      id="contact"
      className="mt-16 scroll-mt-24 border-t border-border bg-[#E9ECE4]/60 dark:bg-[#12202A]"
    >
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_2fr] lg:gap-16">
          <FooterBrand />
          <FooterLinks />
        </div>
        <FooterBottom />
      </div>
    </footer>
  );
}
