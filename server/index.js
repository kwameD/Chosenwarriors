import express from "express";
import nodemailer from "nodemailer";
import "dotenv/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readPlatformRecords,
  saveContactMessage,
  saveMediaImage,
  saveMediaVideo,
  savePrayerRequest,
  updateMediaImage,
} from "./database.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 4173);
const ministryEmail = process.env.MINISTRY_EMAIL || "chosenwarriorsofficial@gmail.com";

const app = express();

app.use(express.json({ limit: "15mb" }));

app.get("/api/platform", (_request, response) => {
  response.json({ ok: true, ...readPlatformRecords() });
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

app.post("/api/media/images", (request, response) => {
  try {
    if (!request.body.src) {
      throw new Error("Image data is required.");
    }

    response.json({ ok: true, record: saveMediaImage(request.body) });
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message });
  }
});

app.put("/api/media/images/:id", (request, response) => {
  try {
    if (!request.body.src) {
      throw new Error("Image data is required.");
    }

    response.json({ ok: true, record: updateMediaImage(request.params.id, request.body) });
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/media/videos", (request, response) => {
  try {
    const youtubeId = getYouTubeId(request.body.youtubeUrl || request.body.youtubeId);

    if (!youtubeId) {
      throw new Error("Enter a valid YouTube URL or video ID.");
    }

    response.json({
      ok: true,
      record: saveMediaVideo({
        ...request.body,
        youtubeId,
        url: `https://youtu.be/${youtubeId}`,
      }),
    });
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
