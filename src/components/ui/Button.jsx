const isExternalUrl = (href = "") => href.startsWith("http");

export function Button({ href, children, variant = "primary", className = "" }) {
  const external = isExternalUrl(href);

  return (
    <a
      href={href}
      className={`btn btn-${variant} ${className}`}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

