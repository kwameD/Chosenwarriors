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

  CREATE TABLE IF NOT EXISTS media_images (
    id TEXT PRIMARY KEY,
    src TEXT NOT NULL,
    alt TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS media_videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date_label TEXT NOT NULL,
    created_at TEXT NOT NULL
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

export function saveMediaImage(image) {
  const record = {
    id: image.id || createId("image"),
    src: image.src,
    alt: image.alt || "Chosen Warriors ministry image",
    category: image.category || "Ministry",
    createdAt: image.createdAt || new Date().toISOString(),
    updatedAt: image.updatedAt || "",
  };

  database.prepare(`
    INSERT OR REPLACE INTO media_images (id, src, alt, category, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(record.id, record.src, record.alt, record.category, record.createdAt, record.updatedAt);

  return record;
}

export function updateMediaImage(id, image) {
  const updatedAt = new Date().toISOString();

  database.prepare(`
    UPDATE media_images
    SET src = ?, alt = ?, category = ?, updated_at = ?
    WHERE id = ?
  `).run(image.src, image.alt || "Chosen Warriors ministry image", image.category || "Ministry", updatedAt, id);

  return { id, ...image, updatedAt };
}

export function saveMediaVideo(video) {
  const record = {
    id: video.id || createId("video"),
    title: video.title || "Chosen Warriors Video",
    youtubeId: video.youtubeId,
    url: video.url,
    category: video.category || "Teaching",
    date: video.date || "Admin Upload",
    description: video.description || "A ministry video added by the admin team.",
    createdAt: video.createdAt || new Date().toISOString(),
  };

  database.prepare(`
    INSERT OR REPLACE INTO media_videos (id, title, youtube_id, url, category, description, date_label, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(record.id, record.title, record.youtubeId, record.url, record.category, record.description, record.date, record.createdAt);

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
    mediaImages: database.prepare(`
      SELECT id, src, alt, category, created_at AS createdAt, updated_at AS updatedAt
      FROM media_images
      ORDER BY created_at DESC
    `).all(),
    mediaVideos: database.prepare(`
      SELECT id, title, youtube_id AS youtubeId, url, category, description, date_label AS date, created_at AS createdAt
      FROM media_videos
      ORDER BY created_at DESC
    `).all(),
  };
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
