const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function loadPublicPlatformRecords() {
  return request("/api/platform/public");
}

export async function saveMediaImageRecord(image) {
  return adminRequest("/api/media/images", {
    body: JSON.stringify(image),
    method: "POST",
  });
}

export async function updateMediaImageRecord(id, image) {
  return adminRequest(`/api/media/images/${id}`, {
    body: JSON.stringify(image),
    method: "PUT",
  });
}

export async function saveMediaVideoRecord(video) {
  return adminRequest("/api/media/videos", {
    body: JSON.stringify(video),
    method: "POST",
  });
}

export async function saveMemberRecord(member) {
  return request("/api/members", {
    body: JSON.stringify(member),
    method: "POST",
  });
}

export async function saveDonationRecord(donation) {
  return request("/api/donations", {
    body: JSON.stringify(donation),
    method: "POST",
  });
}

export async function saveEventRegistrationRecord(registration) {
  return request("/api/event-registrations", {
    body: JSON.stringify(registration),
    method: "POST",
  });
}

export async function saveSubscriberRecord(subscriber) {
  return request("/api/subscribers", {
    body: JSON.stringify(subscriber),
    method: "POST",
  });
}

async function adminRequest(endpoint, options = {}) {
  return request(endpoint, options);
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || "Unable to save platform data.");
  }

  return data;
}
