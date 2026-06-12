export async function loadPlatformRecords() {
  return request("/api/platform");
}

async function request(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || "Unable to save platform data.");
  }

  return data;
}
