import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { logoImage, ministryName, navigationItems } from "../../config/siteConfig";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState(() => window.location.hash || "#home");

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || "#home");

    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-black/5 bg-white/95 backdrop-blur">
      <nav className="container-custom flex h-20 items-center justify-between" aria-label="Primary navigation">
        <a href="#home" className="logo-mark" aria-label={`${ministryName} home`}>
          <img src={logoImage} alt="" className="h-12 w-auto" />
        </a>

        <NavigationLinks activeHash={activeHash} className="hidden items-center gap-2 text-[15px] font-semibold lg:flex" />

        <a href="#contact" className="hidden h-11 items-center rounded-lg bg-purplePrimary px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-purpleHover md:inline-flex">
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
          <NavigationLinks activeHash={activeHash} className="grid gap-1" linkClassName="rounded-lg px-3 py-3 font-medium hover:bg-softBg" onNavigate={closeMenu} />
        </nav>
      )}
    </header>
  );
}

function NavigationLinks({ activeHash, className, linkClassName = "rounded-lg px-3 py-2 transition hover:bg-softBg hover:text-purplePrimary", onNavigate }) {
  return (
    <div className={className}>
      {navigationItems.map((item) => {
        const isActive = item.href === activeHash || item.children?.some((child) => child.href === activeHash);

        if (item.children?.length) {
          return (
            <div key={item.href} className="group relative">
              <a
                href={item.href}
                onClick={onNavigate}
                className={`${linkClassName} inline-flex w-full items-center justify-between gap-1 ${isActive ? "bg-purplePrimary/10 text-purplePrimary" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
                <ChevronDown size={16} className="transition group-hover:rotate-180" />
              </a>
              <div className="left-0 top-full hidden min-w-[210px] rounded-lg border border-black/5 bg-white p-2 shadow-soft group-hover:absolute group-hover:grid group-focus-within:absolute group-focus-within:grid lg:mt-2">
                {item.children.map((child) => (
                  <a
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    className={`rounded-md px-3 py-2 text-sm transition hover:bg-softBg hover:text-purplePrimary ${child.href === activeHash ? "bg-purplePrimary/10 text-purplePrimary" : ""}`}
                    aria-current={child.href === activeHash ? "page" : undefined}
                  >
                    {child.label}
                  </a>
                ))}
              </div>
              <div className="grid pl-4 lg:hidden">
                {item.children.map((child) => (
                  <a
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    className={`rounded-lg px-3 py-2 text-sm font-medium text-black/70 hover:bg-softBg hover:text-purplePrimary ${child.href === activeHash ? "bg-purplePrimary/10 text-purplePrimary" : ""}`}
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            </div>
          );
        }

        return (
          <a
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`${linkClassName} ${isActive ? "bg-purplePrimary/10 text-purplePrimary" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );
}
