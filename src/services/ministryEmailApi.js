export async function sendContactEmail(message) {
  return sendEmail("/api/contact", message);
}

export async function sendPrayerEmail(request) {
  return sendEmail("/api/prayer", request);
}

async function sendEmail(endpoint, payload) {
  const response = await fetch(endpoint, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || "Unable to send the message right now.");
  }

  return data;
}
