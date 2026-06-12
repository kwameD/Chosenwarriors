import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const databasePath = resolve(process.env.DATABASE_PATH || "data/chosen-warriors.sqlite");

mkdirSync(dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);
database.exec("PRAGMA journal_mode = WAL");
database.exec("PRAGMA foreign_keys = ON");

database.exec(`
  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prayer_requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    anonymous INTEGER NOT NULL DEFAULT 0,
    confidential INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'New',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

`);

export function saveContactMessage(message) {
  const record = {
    id: message.id || createId("message"),
    name: message.name || "Website Visitor",
    email: message.email || "",
    message: message.message,
    status: "New",
    createdAt: message.createdAt || new Date().toISOString(),
  };

  database.prepare(`
    INSERT OR REPLACE INTO contact_messages (id, name, email, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(record.id, record.name, record.email, record.message, record.status, record.createdAt);

  return record;
}

export function savePrayerRequest(request) {
  const record = {
    id: request.id || createId("prayer"),
    name: request.anonymous ? "Anonymous" : request.name || "Anonymous",
    email: request.email || "",
    message: request.message,
    anonymous: Boolean(request.anonymous),
    confidential: Boolean(request.confidential),
    status: "New",
    createdAt: request.createdAt || new Date().toISOString(),
  };

  database.prepare(`
    INSERT OR REPLACE INTO prayer_requests (id, name, email, message, anonymous, confidential, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(record.id, record.name, record.email, record.message, Number(record.anonymous), Number(record.confidential), record.status, record.createdAt);

  return record;
}

export function readPlatformRecords() {
  return {
    contactMessages: database.prepare(`
      SELECT id, name, email, message, status, created_at AS createdAt
      FROM contact_messages
      ORDER BY created_at DESC
    `).all(),
    prayerRequests: database.prepare(`
      SELECT id, name, email, message, anonymous, confidential, status, created_at AS createdAt
      FROM prayer_requests
      ORDER BY created_at DESC
    `).all().map((request) => ({
      ...request,
      anonymous: Boolean(request.anonymous),
      confidential: Boolean(request.confidential),
    })),
  };
}

export function readSiteContent(defaultContent) {
  const record = database.prepare("SELECT value FROM site_content WHERE key = ?").get("editable");

  if (!record?.value) {
    return defaultContent;
  }

  try {
    return JSON.parse(record.value);
  } catch {
    return defaultContent;
  }
}

export function saveSiteContent(content) {
  const updatedAt = new Date().toISOString();

  database.prepare(`
    INSERT OR REPLACE INTO site_content (key, value, updated_at)
    VALUES (?, ?, ?)
  `).run("editable", JSON.stringify(content), updatedAt);

  return { ...content, updatedAt };
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
