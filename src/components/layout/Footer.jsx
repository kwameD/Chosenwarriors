import { contactEmail, footerNavigationLinks, footerSocialLinks, ministryName } from "../../config/siteConfig";
import { getExternalLinkProps } from "../../utils/links";

export function Footer() {
  return (
    <footer className="min-h-[300px] bg-darkText text-white">
      <div className="container-custom grid gap-8 py-16 md:grid-cols-4">
        <div>
          <h3 className="text-xl font-extrabold">{ministryName}</h3>
          <p className="mt-3 text-[14px] leading-6 text-white/60">A movement raising revivalists through prayer, the Word, and fasting.</p>
        </div>

        <FooterGroup title="Links" links={footerNavigationLinks} />
        <FooterGroup title="Social" links={footerSocialLinks} />

        <div>
          <p className="font-bold">Contact</p>
          <p className="mt-4 text-[14px] text-white/60">{contactEmail}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[14px] text-white/50">
        © {new Date().getFullYear()} {ministryName}. All rights reserved.
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }) {
  return (
    <div>
      <p className="font-bold">{title}</p>
      <div className="mt-4 grid gap-2 text-[14px] text-white/60">
        {links.map((link) => (
          <a key={link.href} href={link.href} {...getExternalLinkProps(link.href)}>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
