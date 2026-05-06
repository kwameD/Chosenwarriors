import { contactEmail, socialLinks } from "../../config/siteConfig";

const footerLinks = [
  { label: "About", href: "#about" },
  { label: "Media", href: "#media" },
  { label: "Events", href: "#events" },
];

const footerSocialLinks = [
  { label: "Instagram", href: socialLinks.instagram },
  { label: "YouTube", href: socialLinks.youtube },
  { label: "TikTok", href: socialLinks.tiktok },
  { label: "WhatsApp", href: socialLinks.whatsapp },
];

export function Footer() {
  return (
    <footer className="min-h-[300px] bg-darkText text-white">
      <div className="container-custom grid gap-8 py-16 md:grid-cols-4">
        <div>
          <h3 className="text-xl font-extrabold">Chosen Warriors</h3>
          <p className="mt-3 text-[14px] leading-6 text-white/60">A movement raising revivalists through prayer, the Word, and fasting.</p>
        </div>

        <FooterGroup title="Links" links={footerLinks} />
        <FooterGroup title="Social" links={footerSocialLinks} external />

        <div>
          <p className="font-bold">Contact</p>
          <p className="mt-4 text-[14px] text-white/60">{contactEmail}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[14px] text-white/50">
        © {new Date().getFullYear()} Chosen Warriors. All rights reserved.
      </div>
    </footer>
  );
}

function FooterGroup({ title, links, external = false }) {
  return (
    <div>
      <p className="font-bold">{title}</p>
      <div className="mt-4 grid gap-2 text-[14px] text-white/60">
        {links.map((link) => (
          <a key={link.href} href={link.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
