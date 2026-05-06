import { getExternalLinkProps } from "../../utils/links";

export function Button({ href, children, variant = "primary", className = "" }) {
  return (
    <a
      href={href}
      className={`btn btn-${variant} ${className}`}
      {...getExternalLinkProps(href)}
    >
      {children}
    </a>
  );
}
