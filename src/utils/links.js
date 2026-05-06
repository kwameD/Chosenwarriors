export function getExternalLinkProps(href = "") {
  if (!href.startsWith("http")) {
    return {};
  }

  return {
    target: "_blank",
    rel: "noreferrer",
  };
}

