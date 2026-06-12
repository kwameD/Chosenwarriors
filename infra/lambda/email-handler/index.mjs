import tls from "node:tls";
import crypto from "node:crypto";

const ministryEmail = process.env.MINISTRY_EMAIL || "chosenwarriorsofficial@gmail.com";
const region = process.env.AWS_REGION || "us-east-1";
const siteContentTable = process.env.SITE_CONTENT_TABLE;
const adminPassword = process.env.ADMIN_PASSWORD;
const smtpConfig = {
  from: process.env.SMTP_FROM || process.env.SMTP_USER,
  host: process.env.SMTP_HOST,
  pass: process.env.SMTP_PASS,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE !== "false",
  user: process.env.SMTP_USER,
};

const corsHeaders = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS,POST,PUT",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

export async function handler(event) {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return jsonResponse(204, {});
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const path = event.rawPath || "";
    const method = event.requestContext?.http?.method || "";

    if (method === "GET" && path.endsWith("/content")) {
      return jsonResponse(200, { ok: true, content: await readSiteContent() });
    }

    if (method === "POST" && path.endsWith("/admin/login")) {
      if (!adminPassword) {
        return jsonResponse(503, { ok: false, error: "Admin password is not configured. Set admin_password in Terraform." });
      }

      if (String(body.password || "") !== adminPassword) {
        return jsonResponse(401, { ok: false, error: "Invalid admin password." });
      }

      return jsonResponse(200, { ok: true }, { "Set-Cookie": `cw_admin_session=${createAdminToken()}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400` });
    }

    if (method === "PUT" && path.endsWith("/content")) {
      if (!isAdminRequest(event)) {
        return jsonResponse(401, { ok: false, error: "Admin login required." });
      }

      const content = normalizeEditableContent(body.content);
      await saveSiteContent(content);
      return jsonResponse(200, { ok: true, content });
    }

    if (method === "POST" && path.endsWith("/contact")) {
      const message = normalizeMessage(body);
      await sendMinistryEmail({
        subject: "Website message from Chosen Warriors contact form",
        heading: "New Contact Message",
        fields: {
          Name: message.name || "Website Visitor",
          Email: message.email || "Not provided",
          Message: message.message,
        },
        replyTo: message.email,
      });

      return jsonResponse(200, { ok: true, delivery: "sent" });
    }

    if (method === "POST" && path.endsWith("/prayer")) {
      const message = normalizeMessage(body);
      await sendMinistryEmail({
        subject: "Prayer request from the Chosen Warriors website",
        heading: "New Prayer Request",
        fields: {
          Name: body.anonymous ? "Anonymous" : message.name || "Anonymous",
          Email: message.email || "Not provided",
          Confidential: body.confidential ? "Yes" : "No",
          Message: message.message,
        },
        replyTo: message.email,
      });

      return jsonResponse(200, { ok: true, delivery: "sent" });
    }

    return jsonResponse(404, { ok: false, error: "API route not found." });
  } catch (error) {
    console.error(error);
    return jsonResponse(400, { ok: false, error: error.message || "Unable to send the message right now." });
  }
}

function normalizeEditableContent(content = {}) {
  const siteImages = content.siteImages && typeof content.siteImages === "object" ? content.siteImages : {};
  const ministryEvents = Array.isArray(content.ministryEvents) ? content.ministryEvents : [];
  const settings = content.settings && typeof content.settings === "object" ? content.settings : {};

  return {
    siteImages,
    ministryEvents: ministryEvents.map((event) => ({
      ...event,
      capacity: Number(event.capacity) || "",
      date: String(event.date || "").trim(),
      description: String(event.description || "").trim(),
      image: String(event.image || "").trim(),
      link: String(event.link || "").trim(),
      location: String(event.location || "").trim(),
      password: String(event.password || "").trim(),
      slug: String(event.slug || "").trim(),
      time: String(event.time || "").trim(),
      title: String(event.title || "").trim(),
    })),
    settings,
  };
}

function createAdminToken() {
  const issuedAt = String(Date.now());
  const signature = crypto.createHmac("sha256", adminPassword).update(issuedAt).digest("hex");
  return `${issuedAt}.${signature}`;
}

function isAdminRequest(event) {
  const cookieHeader = event.headers?.cookie || event.headers?.Cookie || "";
  const cookies = cookieHeader.split(";").reduce((record, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name) {
      record[name] = valueParts.join("=");
    }
    return record;
  }, {});

  const [issuedAt, signature] = String(cookies.cw_admin_session || "").split(".");
  const expectedSignature = issuedAt ? crypto.createHmac("sha256", adminPassword || "").update(issuedAt).digest("hex") : "";
  const tokenAge = Date.now() - Number(issuedAt);
  const signatureBuffer = Buffer.from(signature || "");
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  return Boolean(
    adminPassword
      && issuedAt
      && signature
      && tokenAge >= 0
      && tokenAge <= 86_400_000
      && signatureBuffer.length === expectedSignatureBuffer.length
      && crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer),
  );
}

async function readSiteContent() {
  if (!siteContentTable) {
    return {};
  }

  const response = await dynamodbRequest("DynamoDB_20120810.GetItem", {
    TableName: siteContentTable,
    Key: {
      content_key: { S: "editable" },
    },
  });

  const value = response.Item?.content_json?.S;
  return value ? JSON.parse(value) : {};
}

async function saveSiteContent(content) {
  if (!siteContentTable) {
    throw new Error("Site content storage is not configured.");
  }

  await dynamodbRequest("DynamoDB_20120810.PutItem", {
    TableName: siteContentTable,
    Item: {
      content_key: { S: "editable" },
      content_json: { S: JSON.stringify(content) },
      updated_at: { S: new Date().toISOString() },
    },
  });
}

async function dynamodbRequest(target, body) {
  const service = "dynamodb";
  const host = `${service}.${region}.amazonaws.com`;
  const payload = JSON.stringify(body);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const headers = {
    "content-type": "application/x-amz-json-1.0",
    host,
    "x-amz-date": amzDate,
    "x-amz-target": target,
  };

  if (process.env.AWS_SESSION_TOKEN) {
    headers["x-amz-security-token"] = process.env.AWS_SESSION_TOKEN;
  }

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((key) => `${key}:${headers[key]}\n`)
    .join("");
  const canonicalRequest = ["POST", "/", "", canonicalHeaders, signedHeaders, sha256(payload)].join("\n");
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256(canonicalRequest)].join("\n");
  const signature = hmac(getSigningKey(dateStamp, region, service), stringToSign, "hex");

  headers.authorization = `AWS4-HMAC-SHA256 Credential=${process.env.AWS_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`https://${host}/`, {
    method: "POST",
    headers,
    body: payload,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.__type || "Unable to update site content.");
  }

  return data;
}

function getSigningKey(dateStamp, signingRegion, service) {
  const dateKey = hmac(`AWS4${process.env.AWS_SECRET_ACCESS_KEY}`, dateStamp);
  const dateRegionKey = hmac(dateKey, signingRegion);
  const dateRegionServiceKey = hmac(dateRegionKey, service);
  return hmac(dateRegionServiceKey, "aws4_request");
}

function hmac(key, value, encoding) {
  return crypto.createHmac("sha256", key).update(value).digest(encoding);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

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
  if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass || !smtpConfig.from) {
    throw new Error("Email service is not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM.");
  }

  if (!smtpConfig.secure) {
    throw new Error("This email function expects secure SMTP. Use SMTP_PORT=465 and SMTP_SECURE=true.");
  }

  const text = Object.entries(fields).map(([label, value]) => `${label}: ${value}`).join("\n");
  const htmlRows = Object.entries(fields)
    .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong><br />${escapeHtml(value)}</p>`)
    .join("");

  const message = [
    `From: ${smtpConfig.from}`,
    `To: ${ministryEmail}`,
    `Subject: ${encodeHeader(subject)}`,
    replyTo ? `Reply-To: ${replyTo}` : "",
    "MIME-Version: 1.0",
    'Content-Type: multipart/alternative; boundary="cw-boundary"',
    "",
    "--cw-boundary",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    text,
    "--cw-boundary",
    "Content-Type: text/html; charset=UTF-8",
    "",
    `<h2>${escapeHtml(heading)}</h2>${htmlRows}`,
    "--cw-boundary--",
    "",
  ].filter(Boolean).join("\r\n");

  await sendSmtpMessage({ message, recipient: ministryEmail, sender: extractEmailAddress(smtpConfig.from) });
}

function sendSmtpMessage({ message, recipient, sender }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host: smtpConfig.host,
        port: smtpConfig.port,
        servername: smtpConfig.host,
      },
      () => runSmtpSession(socket, { message, recipient, sender }).then(resolve, reject),
    );

    socket.setTimeout(15000, () => {
      socket.destroy();
      reject(new Error("SMTP connection timed out."));
    });

    socket.on("error", reject);
  });
}

async function runSmtpSession(socket, { message, recipient, sender }) {
  await expectCode(socket, 220);
  await command(socket, `EHLO ${smtpConfig.host}`, 250);
  await command(socket, "AUTH LOGIN", 334);
  await command(socket, Buffer.from(smtpConfig.user).toString("base64"), 334);
  await command(socket, Buffer.from(smtpConfig.pass).toString("base64"), 235);
  await command(socket, `MAIL FROM:<${sender}>`, 250);
  await command(socket, `RCPT TO:<${recipient}>`, 250);
  await command(socket, "DATA", 354);
  await command(socket, `${message.replace(/\r?\n\./g, "\r\n..")}\r\n.`, 250);
  await command(socket, "QUIT", 221);
  socket.end();
}

function command(socket, value, expectedCode) {
  socket.write(`${value}\r\n`);
  return expectCode(socket, expectedCode);
}

function expectCode(socket, expectedCode) {
  return new Promise((resolve, reject) => {
    let response = "";

    const handleData = (chunk) => {
      response += chunk.toString("utf8");
      const lines = response.trimEnd().split(/\r?\n/);
      const lastLine = lines[lines.length - 1] || "";

      if (!/^\d{3} /.test(lastLine)) {
        return;
      }

      socket.off("data", handleData);

      if (lastLine.startsWith(String(expectedCode))) {
        resolve(response);
      } else {
        reject(new Error(`SMTP error: ${response.trim()}`));
      }
    };

    socket.on("data", handleData);
  });
}

function jsonResponse(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...corsHeaders, ...extraHeaders },
    body: statusCode === 204 ? "" : JSON.stringify(payload),
  };
}

function encodeHeader(value) {
  return `=?UTF-8?B?${Buffer.from(value).toString("base64")}?=`;
}

function extractEmailAddress(value) {
  const match = String(value).match(/<([^>]+)>/);
  return match?.[1] || value;
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
