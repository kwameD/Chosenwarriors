import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { logoImage, ministryName, navigationItems } from "../../config/siteConfig";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(() => document.cookie.includes("cw_cookie_consent=accepted"));
  const [activeHash, setActiveHash] = useState(() => window.location.hash || "#home");

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || "#home");

    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const acceptCookies = () => {
    document.cookie = "cw_cookie_consent=accepted; max-age=31536000; path=/; SameSite=Lax";
    setHasAcceptedCookies(true);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 shadow-[0_8px_30px_rgba(26,26,26,0.04)] backdrop-blur transition-shadow duration-300">
      <nav className="container-custom flex h-20 items-center justify-between" aria-label="Primary navigation">
        <a href="#home" className="logo-mark" aria-label={`${ministryName} home`}>
          <img src={logoImage} alt="" className="h-12 w-auto" />
        </a>

        <NavigationLinks activeHash={activeHash} className="hidden items-center gap-2 text-[15px] font-semibold lg:flex" />

        <a href="#contact" className="hidden h-11 items-center rounded-lg bg-purplePrimary px-5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-purpleHover hover:shadow-lg hover:shadow-purplePrimary/20 md:inline-flex">
          Join Us
        </a>

        <button
          className="grid h-11 w-11 place-items-center rounded-lg border border-black/10 transition hover:-translate-y-0.5 hover:border-purplePrimary hover:text-purplePrimary lg:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {isMenuOpen && (
        <nav className="mobile-menu-enter border-t border-black/5 bg-white px-5 pb-6 pt-3 shadow-soft lg:hidden" aria-label="Mobile navigation">
          <MobileNavigationLinks activeHash={activeHash} onNavigate={closeMenu} />
        </nav>
      )}

      {!hasAcceptedCookies && (
        <div className="border-t border-black/10 bg-black text-white">
          <div className="container-custom flex flex-col gap-3 py-3 text-[13px] leading-6 sm:flex-row sm:items-center sm:justify-between">
            <p>We use cookies to remember site preferences and improve the Chosen Warriors experience.</p>
            <button type="button" className="h-9 rounded-lg bg-white px-4 text-sm font-bold text-black transition hover:bg-white/85" onClick={acceptCookies}>
              Accept
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileNavigationLinks({ activeHash, onNavigate }) {
  return (
    <div className="grid gap-2">
      {navigationItems.map((item) => {
        const isActive = item.href === activeHash || item.children?.some((child) => child.href === activeHash);

        return (
          <div key={item.href} className="grid gap-1">
            <a
              href={item.href}
              onClick={onNavigate}
              className={`rounded-lg px-3 py-3 font-semibold transition hover:bg-softBg hover:text-purplePrimary ${isActive ? "bg-purplePrimary/10 text-purplePrimary" : ""}`}
              aria-current={item.href === activeHash ? "page" : undefined}
            >
              {item.label}
            </a>
            {item.children?.length && (
              <div className="grid gap-1 pl-4">
                {item.children.map((child) => (
                  <a
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    className={`rounded-lg px-3 py-2 text-sm font-medium text-black/70 transition hover:bg-softBg hover:text-purplePrimary ${child.href === activeHash ? "bg-purplePrimary/10 text-purplePrimary" : ""}`}
                    aria-current={child.href === activeHash ? "page" : undefined}
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
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
              <div className="menu-panel left-0 top-full hidden min-w-[210px] pt-2 group-hover:absolute group-hover:grid group-focus-within:absolute group-focus-within:grid">
                <div className="grid rounded-lg border border-black/5 bg-white p-2 shadow-soft">
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
