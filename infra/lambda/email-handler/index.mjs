import tls from "node:tls";

const ministryEmail = process.env.MINISTRY_EMAIL || "chosenwarriorsofficial@gmail.com";
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
  "Access-Control-Allow-Methods": "OPTIONS,POST",
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

    if (path.endsWith("/contact")) {
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

    if (path.endsWith("/prayer")) {
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

    return jsonResponse(404, { ok: false, error: "Email route not found." });
  } catch (error) {
    console.error(error);
    return jsonResponse(400, { ok: false, error: error.message || "Unable to send the message right now." });
  }
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

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: corsHeaders,
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
