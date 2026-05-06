import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ministryName, navigationItems } from "../../config/siteConfig";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-black/5 bg-white/95 backdrop-blur">
      <nav className="container-custom flex h-20 items-center justify-between" aria-label="Primary navigation">
        <a href="#home" className="logo-mark" aria-label={`${ministryName} home`}>
          {ministryName}
        </a>

        <NavigationLinks className="hidden items-center gap-8 text-[16px] font-medium lg:flex" />

        <a href="#connect" className="hidden h-11 items-center rounded-lg bg-purplePrimary px-5 text-sm font-semibold text-white transition hover:bg-purpleHover md:inline-flex">
          Join Us
        </a>

        <button
          className="grid h-11 w-11 place-items-center rounded-lg border border-black/10 lg:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {isMenuOpen && (
        <nav className="border-t border-black/5 bg-white px-5 pb-6 pt-3 shadow-soft lg:hidden" aria-label="Mobile navigation">
          <NavigationLinks className="grid gap-1" linkClassName="rounded-lg px-3 py-3 font-medium hover:bg-softBg" onNavigate={closeMenu} />
        </nav>
      )}
    </header>
  );
}

function NavigationLinks({ className, linkClassName = "transition hover:text-purplePrimary", onNavigate }) {
  return (
    <div className={className}>
      {navigationItems.map((item) => (
        <a key={item.href} href={item.href} onClick={onNavigate} className={linkClassName}>
          {item.label}
        </a>
      ))}
    </div>
  );
}
