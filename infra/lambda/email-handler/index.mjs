import crypto from "node:crypto";

const ministryEmail = process.env.MINISTRY_EMAIL || "chosenwarriorsofficial@gmail.com";
const region = process.env.AWS_REGION || "us-east-1";
const sesFromEmail = process.env.SES_FROM_EMAIL || ministryEmail;
const siteContentTable = process.env.SITE_CONTENT_TABLE;
const adminPassword = process.env.ADMIN_PASSWORD;

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
  const response = await signedAwsRequest({
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/x-amz-json-1.0",
      "x-amz-target": target,
    },
    method: "POST",
    service: "dynamodb",
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
  const text = Object.entries(fields).map(([label, value]) => `${label}: ${value}`).join("\n");
  const htmlRows = Object.entries(fields)
    .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong><br />${escapeHtml(value)}</p>`)
    .join("");
  const payload = new URLSearchParams({
    Action: "SendEmail",
    Source: `Chosen Warriors <${sesFromEmail}>`,
    "Destination.ToAddresses.member.1": ministryEmail,
    "Message.Subject.Data": subject,
    "Message.Subject.Charset": "UTF-8",
    "Message.Body.Text.Data": text,
    "Message.Body.Text.Charset": "UTF-8",
    "Message.Body.Html.Data": `<h2>${escapeHtml(heading)}</h2>${htmlRows}`,
    "Message.Body.Html.Charset": "UTF-8",
    Version: "2010-12-01",
  });

  if (replyTo) {
    payload.set("ReplyToAddresses.member.1", replyTo);
  }

  const response = await signedAwsRequest({
    body: payload.toString(),
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    method: "POST",
    service: "email",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SES error: ${errorText}`);
  }
}

function jsonResponse(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...corsHeaders, ...extraHeaders },
    body: statusCode === 204 ? "" : JSON.stringify(payload),
  };
}

async function signedAwsRequest({ body, headers = {}, method, service }) {
  const host = `${service}.${region}.amazonaws.com`;
  const payload = body || "";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const requestHeaders = {
    ...headers,
    host,
    "x-amz-date": amzDate,
  };

  if (process.env.AWS_SESSION_TOKEN) {
    requestHeaders["x-amz-security-token"] = process.env.AWS_SESSION_TOKEN;
  }

  const signedHeaders = Object.keys(requestHeaders).sort().join(";");
  const canonicalHeaders = Object.keys(requestHeaders)
    .sort()
    .map((key) => `${key}:${requestHeaders[key]}\n`)
    .join("");
  const canonicalRequest = [method, "/", "", canonicalHeaders, signedHeaders, sha256(payload)].join("\n");
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256(canonicalRequest)].join("\n");
  const signature = hmac(getSigningKey(dateStamp, region, service), stringToSign, "hex");

  requestHeaders.authorization = `AWS4-HMAC-SHA256 Credential=${process.env.AWS_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return fetch(`https://${host}/`, {
    method,
    headers: requestHeaders,
    body: payload,
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
