import express from "express";
import nodemailer from "nodemailer";
import "dotenv/config";
import crypto from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readPlatformRecords,
  readSiteContent,
  saveContactMessage,
  savePrayerRequest,
  saveSiteContent,
} from "./database.js";
import { socialLinks } from "../src/config/siteConfig.js";
import { ministryEvents, siteImages } from "../src/content/siteContent.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 4173);
const ministryEmail = process.env.MINISTRY_EMAIL || "chosenwarriorsofficial@gmail.com";
const defaultContent = {
  siteImages,
  ministryEvents,
  settings: {
    whatsapp: socialLinks.whatsapp,
    zoom: socialLinks.zoom,
    instagram: socialLinks.instagram,
    tiktok: socialLinks.tiktok,
    youtube: socialLinks.youtube,
  },
};
const adminSessions = new Set();

const app = express();

app.use(express.json({ limit: "15mb" }));

app.get("/api/platform", (_request, response) => {
  response.json({ ok: true, ...readPlatformRecords() });
});

app.get("/api/content", (_request, response) => {
  response.json({ ok: true, content: normalizeEditableContent(readSiteContent(defaultContent)) });
});

app.post("/api/admin/login", (request, response) => {
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;

  if (!adminPassword) {
    response.status(503).json({ ok: false, error: "Admin password is not configured. Set ADMIN_PASSWORD in the server environment." });
    return;
  }

  if (String(request.body?.password || "") !== adminPassword) {
    response.status(401).json({ ok: false, error: "Invalid admin password." });
    return;
  }

  const sessionToken = crypto.randomUUID();
  adminSessions.add(sessionToken);
  response.setHeader("Set-Cookie", `cw_admin_session=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${isProduction ? "; Secure" : ""}`);
  response.json({ ok: true });
});

app.put("/api/content", requireAdmin, (request, response) => {
  const content = normalizeEditableContent(request.body?.content);
  response.json({ ok: true, content: saveSiteContent(content) });
});

app.post("/api/contact", async (request, response) => {
  try {
    const message = normalizeMessage(request.body);
    const record = saveContactMessage(message);
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
    const record = savePrayerRequest(request.body);
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

function normalizeMessage(body = {}) {
  const message = {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim(),
    message: String(body.message || "").trim(),
  };

  if (!message.message) {
    throw new Error("Message is required.");
  }

  if (message.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email)) {
    throw new Error("Enter a valid email address.");
  }

  return message;
}

function requireAdmin(request, response, next) {
  const sessionToken = parseCookies(request.headers.cookie).cw_admin_session;

  if (!sessionToken || !adminSessions.has(sessionToken)) {
    response.status(401).json({ ok: false, error: "Admin login required." });
    return;
  }

  next();
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name) {
      cookies[name] = decodeURIComponent(valueParts.join("="));
    }
    return cookies;
  }, {});
}

function normalizeEditableContent(content = {}) {
  return {
    siteImages: {
      ...defaultContent.siteImages,
      ...(content.siteImages || {}),
    },
    ministryEvents: defaultContent.ministryEvents.map((event, index) => ({
      ...event,
      ...(content.ministryEvents?.[index] || {}),
    })),
    settings: {
      ...defaultContent.settings,
      ...(content.settings || {}),
    },
  };
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br />");
}
