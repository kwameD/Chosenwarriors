import express from "express";
import nodemailer from "nodemailer";
import "dotenv/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readPlatformRecords,
  readPublicPlatformRecords,
  saveContactMessage,
  saveDonation,
  saveEventRegistration,
  saveMediaImage,
  saveMediaVideo,
  savePrayerRequest,
  saveSubscriber,
  saveUser,
  updateMediaImage,
} from "./database.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 4173);
const ministryEmail = process.env.MINISTRY_EMAIL || "chosenwarriorsofficial@gmail.com";
const adminApiKey = process.env.ADMIN_API_KEY || "";
const requestWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const requestLimit = Number(process.env.RATE_LIMIT_MAX || 60);
const requestCounts = new Map();

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "5mb" }));
app.use(securityHeaders);
app.use("/api", rateLimit);

app.get("/api/platform", requireAdmin, async (_request, response) => {
  response.json({ ok: true, ...(await readPlatformRecords()) });
});

app.get("/api/platform/public", async (_request, response) => {
  response.json({ ok: true, ...(await readPublicPlatformRecords()) });
});

app.post("/api/contact", async (request, response) => {
  try {
    const message = normalizeMessage(request.body);
    const record = await saveContactMessage(message);
    const result = await sendMinistryEmail({
      subject: "Website message from Chosen Warriors contact form",
      heading: "New Contact Message",
      fields: {
        Name: message.name || "Website Visitor",
        Email: message.email || "Not provided",
        Message: message.message,
      },
      replyTo: message.email,
    });

    response.json({ ok: true, record, ...result });
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/prayer", async (request, response) => {
  try {
    const message = normalizeMessage(request.body);
    const record = await savePrayerRequest(request.body);
    const result = await sendMinistryEmail({
      subject: "Prayer request from the Chosen Warriors website",
      heading: "New Prayer Request",
      fields: {
        Name: request.body.anonymous ? "Anonymous" : message.name || "Anonymous",
        Email: message.email || "Not provided",
        Confidential: request.body.confidential ? "Yes" : "No",
        Message: message.message,
      },
      replyTo: message.email,
    });

    response.json({ ok: true, record, ...result });
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/members", async (request, response) => {
  try {
    response.json({ ok: true, record: await saveUser(normalizeUser(request.body)) });
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/donations", async (request, response) => {
  try {
    response.json({ ok: true, record: await saveDonation(normalizeDonation(request.body)) });
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/event-registrations", async (request, response) => {
  try {
    response.json({ ok: true, record: await saveEventRegistration(normalizeEventRegistration(request.body)) });
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/subscribers", async (request, response) => {
  try {
    response.json({ ok: true, record: await saveSubscriber(normalizeSubscriber(request.body)) });
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/media/images", requireAdmin, async (request, response) => {
  try {
    response.json({ ok: true, record: await saveMediaImage(normalizeMediaImage(request.body)) });
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message });
  }
});

app.put("/api/media/images/:id", requireAdmin, async (request, response) => {
  try {
    response.json({ ok: true, record: await updateMediaImage(request.params.id, normalizeMediaImage(request.body)) });
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/media/videos", requireAdmin, async (request, response) => {
  try {
    const youtubeId = getYouTubeId(request.body.youtubeUrl || request.body.youtubeId);

    if (!youtubeId) {
      throw new Error("Enter a valid YouTube URL or video ID.");
    }

    response.json({
      ok: true,
      record: await saveMediaVideo({
        title: trimText(request.body.title, 140),
        category: trimText(request.body.category, 80) || "Teaching",
        description: trimText(request.body.description, 500),
        youtubeId,
        url: `https://youtu.be/${youtubeId}`,
      }),
    });
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message });
  }
});

app.use("/api", apiErrorHandler);

if (isProduction) {
  app.use(express.static(resolve(root, "dist")));
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(resolve(root, "dist", "index.html"));
  });
} else {
  const vite = await import("vite");
  const viteServer = await vite.createServer({
    appType: "spa",
    root,
    server: { middlewareMode: true },
  });
  app.use(viteServer.middlewares);
}

app.listen(port, () => {
  console.log(`Chosen Warriors server running at http://127.0.0.1:${port}`);
});

function securityHeaders(_request, response, next) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}

function rateLimit(request, response, next) {
  const now = Date.now();
  const clientKey = request.ip || request.socket.remoteAddress || "unknown";
  const current = requestCounts.get(clientKey);

  if (requestCounts.size > 1_000) {
    for (const [key, entry] of requestCounts) {
      if (now > entry.resetAt) {
        requestCounts.delete(key);
      }
    }
  }

  if (!current || now > current.resetAt) {
    requestCounts.set(clientKey, { count: 1, resetAt: now + requestWindowMs });
    next();
    return;
  }

  current.count += 1;
  if (current.count > requestLimit) {
    response.status(429).json({ ok: false, error: "Too many requests. Please try again shortly." });
    return;
  }

  next();
}

function apiErrorHandler(error, _request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error?.type === "entity.too.large") {
    response.status(413).json({ ok: false, error: "The uploaded payload is too large." });
    return;
  }

  if (error instanceof SyntaxError) {
    response.status(400).json({ ok: false, error: "Request body must be valid JSON." });
    return;
  }

  response.status(500).json({ ok: false, error: "Unexpected server error." });
}

function requireAdmin(request, response, next) {
  if (!adminApiKey && !isProduction) {
    next();
    return;
  }

  const providedKey = request.get("x-admin-api-key") || "";

  if (adminApiKey && providedKey === adminApiKey) {
    next();
    return;
  }

  response.status(401).json({ ok: false, error: "Admin authorization is required." });
}

function normalizeMessage(body = {}) {
  const message = {
    name: trimText(body.name, 120),
    email: trimText(body.email, 254),
    message: trimText(body.message, 4000),
  };

  if (!message.message) {
    throw new Error("Message is required.");
  }

  if (message.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email)) {
    throw new Error("Enter a valid email address.");
  }

  return message;
}

function normalizeMediaImage(body = {}) {
  const image = {
    src: String(body.src || "").trim(),
    alt: trimText(body.alt, 180) || "Chosen Warriors ministry image",
    category: trimText(body.category, 80) || "Ministry",
  };

  if (!image.src) {
    throw new Error("Image data is required.");
  }

  if (!/^data:image\/(avif|gif|jpe?g|png|webp);base64,[a-z0-9+/=]+$/i.test(image.src)) {
    throw new Error("Upload a valid image file.");
  }

  return image;
}

function normalizeUser(body = {}) {
  const user = {
    id: trimText(body.id, 80),
    name: trimText(body.name, 120),
    email: trimText(body.email, 254),
    phone: trimText(body.phone, 40),
    location: trimText(body.location, 120),
    role: trimText(body.role, 40) || "Member",
    verified: body.verified !== false,
    communication: {
      email: Boolean(body.communication?.email ?? body.emailOptIn),
      sms: Boolean(body.communication?.sms ?? body.smsOptIn),
    },
    createdAt: body.createdAt,
  };

  if (!user.name) {
    throw new Error("Name is required.");
  }

  if (!user.email || !isEmail(user.email)) {
    throw new Error("Enter a valid email address.");
  }

  return user;
}

function normalizeDonation(body = {}) {
  const amount = Number(body.amount || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Donation amount must be greater than zero.");
  }

  return {
    id: trimText(body.id, 80),
    userId: trimText(body.userId, 80),
    donorName: trimText(body.donorName || body.name, 120) || "Guest Donor",
    email: trimText(body.email, 254),
    amount,
    fund: trimText(body.fund, 120) || "General Ministry",
    frequency: trimText(body.frequency, 80) || "One-time",
    method: trimText(body.method, 80) || "External checkout",
    status: trimText(body.status, 80) || "Checkout pending",
    createdAt: body.createdAt,
  };
}

function normalizeEventRegistration(body = {}) {
  const registration = {
    id: trimText(body.id, 80),
    userId: trimText(body.userId, 80),
    eventSlug: trimText(body.eventSlug, 160),
    eventTitle: trimText(body.eventTitle, 180),
    name: trimText(body.name, 120),
    email: trimText(body.email, 254),
    phone: trimText(body.phone, 40),
    status: trimText(body.status, 80) || "Confirmed",
    ticketCode: trimText(body.ticketCode, 80),
    createdAt: body.createdAt,
  };

  if (!registration.eventSlug || !registration.eventTitle) {
    throw new Error("Event details are required.");
  }

  if (!registration.name) {
    throw new Error("Name is required.");
  }

  if (!registration.email || !isEmail(registration.email)) {
    throw new Error("Enter a valid email address.");
  }

  return registration;
}

function normalizeSubscriber(body = {}) {
  const subscriber = {
    id: trimText(body.id, 80),
    name: trimText(body.name, 120),
    email: trimText(body.email, 254),
    phone: trimText(body.phone, 40),
    location: trimText(body.location, 120),
    role: trimText(body.role, 40) || "Subscriber",
    createdAt: body.createdAt,
  };

  if (!subscriber.email || !isEmail(subscriber.email)) {
    throw new Error("Enter a valid email address.");
  }

  return subscriber;
}

function trimText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function sendMinistryEmail({ fields, heading, replyTo, subject }) {
  const transporter = createTransporter();
  const text = Object.entries(fields).map(([label, value]) => `${label}: ${value}`).join("\n");
  const htmlRows = Object.entries(fields)
    .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong><br />${escapeHtml(value)}</p>`)
    .join("");

  if (!transporter) {
    console.log(`[email dry-run] ${subject}\n${text}`);
    return { delivery: "dry-run" };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: ministryEmail,
    replyTo: replyTo || undefined,
    subject,
    text,
    html: `<h2>${escapeHtml(heading)}</h2>${htmlRows}`,
  });

  return { delivery: "sent" };
}

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function getYouTubeId(value) {
  const input = String(value || "").trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }
    if (url.searchParams.get("v")) {
      return url.searchParams.get("v");
    }
    const pathParts = url.pathname.split("/").filter(Boolean);
    const embedIndex = pathParts.findIndex((part) => part === "embed" || part === "shorts");
    return embedIndex >= 0 ? pathParts[embedIndex + 1] || "" : "";
  } catch {
    return "";
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br />");
}
