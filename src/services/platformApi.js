export async function loadPlatformRecords() {
  return request("/api/platform");
}

export async function saveMediaImageRecord(image) {
  return request("/api/media/images", {
    body: JSON.stringify(image),
    method: "POST",
  });
}

export async function updateMediaImageRecord(id, image) {
  return request(`/api/media/images/${id}`, {
    body: JSON.stringify(image),
    method: "PUT",
  });
}

export async function saveMediaVideoRecord(video) {
  return request("/api/media/videos", {
    body: JSON.stringify(video),
    method: "POST",
  });
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
