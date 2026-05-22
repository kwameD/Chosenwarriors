import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import pg from "pg";

const { Pool } = pg;
const usePostgres = Boolean(process.env.DATABASE_URL || process.env.PGHOST);

let postgresPool;
let sqliteDatabase;

if (usePostgres) {
  postgresPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  await initializePostgres();
} else {
  const databasePath = resolve(process.env.DATABASE_PATH || "data/chosen-warriors.sqlite");

  mkdirSync(dirname(databasePath), { recursive: true });
  sqliteDatabase = new DatabaseSync(databasePath);
  sqliteDatabase.exec("PRAGMA journal_mode = WAL");
  sqliteDatabase.exec("PRAGMA foreign_keys = ON");
  initializeSqlite();
}

export async function saveContactMessage(message) {
  const record = {
    id: message.id || createId("message"),
    name: message.name || "Website Visitor",
    email: message.email || "",
    message: message.message,
    status: "New",
    createdAt: message.createdAt || new Date().toISOString(),
  };

  if (usePostgres) {
    await postgresPool.query(
      `
        INSERT INTO contact_messages (id, name, email, message, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          message = EXCLUDED.message,
          status = EXCLUDED.status,
          created_at = EXCLUDED.created_at
      `,
      [record.id, record.name, record.email, record.message, record.status, record.createdAt],
    );
    return record;
  }

  sqliteDatabase.prepare(`
    INSERT OR REPLACE INTO contact_messages (id, name, email, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(record.id, record.name, record.email, record.message, record.status, record.createdAt);

  return record;
}

export async function savePrayerRequest(request) {
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

  if (usePostgres) {
    await postgresPool.query(
      `
        INSERT INTO prayer_requests (id, name, email, message, anonymous, confidential, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          message = EXCLUDED.message,
          anonymous = EXCLUDED.anonymous,
          confidential = EXCLUDED.confidential,
          status = EXCLUDED.status,
          created_at = EXCLUDED.created_at
      `,
      [record.id, record.name, record.email, record.message, record.anonymous, record.confidential, record.status, record.createdAt],
    );
    return record;
  }

  sqliteDatabase.prepare(`
    INSERT OR REPLACE INTO prayer_requests (id, name, email, message, anonymous, confidential, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(record.id, record.name, record.email, record.message, Number(record.anonymous), Number(record.confidential), record.status, record.createdAt);

  return record;
}

export async function saveMediaImage(image) {
  const record = {
    id: image.id || createId("image"),
    src: image.src,
    alt: image.alt || "Chosen Warriors ministry image",
    category: image.category || "Ministry",
    createdAt: image.createdAt || new Date().toISOString(),
    updatedAt: image.updatedAt || "",
  };

  if (usePostgres) {
    await postgresPool.query(
      `
        INSERT INTO media_images (id, src, alt, category, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          src = EXCLUDED.src,
          alt = EXCLUDED.alt,
          category = EXCLUDED.category,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at
      `,
      [record.id, record.src, record.alt, record.category, record.createdAt, record.updatedAt || null],
    );
    return record;
  }

  sqliteDatabase.prepare(`
    INSERT OR REPLACE INTO media_images (id, src, alt, category, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(record.id, record.src, record.alt, record.category, record.createdAt, record.updatedAt);

  return record;
}

export async function updateMediaImage(id, image) {
  const updatedAt = new Date().toISOString();
  const record = {
    id,
    src: image.src,
    alt: image.alt || "Chosen Warriors ministry image",
    category: image.category || "Ministry",
    updatedAt,
  };

  if (usePostgres) {
    await postgresPool.query(
      `
        UPDATE media_images
        SET src = $1, alt = $2, category = $3, updated_at = $4
        WHERE id = $5
      `,
      [record.src, record.alt, record.category, record.updatedAt, record.id],
    );
    return record;
  }

  sqliteDatabase.prepare(`
    UPDATE media_images
    SET src = ?, alt = ?, category = ?, updated_at = ?
    WHERE id = ?
  `).run(record.src, record.alt, record.category, record.updatedAt, record.id);

  return record;
}

export async function saveMediaVideo(video) {
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

  if (usePostgres) {
    await postgresPool.query(
      `
        INSERT INTO media_videos (id, title, youtube_id, url, category, description, date_label, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          youtube_id = EXCLUDED.youtube_id,
          url = EXCLUDED.url,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          date_label = EXCLUDED.date_label,
          created_at = EXCLUDED.created_at
      `,
      [record.id, record.title, record.youtubeId, record.url, record.category, record.description, record.date, record.createdAt],
    );
    return record;
  }

  sqliteDatabase.prepare(`
    INSERT OR REPLACE INTO media_videos (id, title, youtube_id, url, category, description, date_label, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(record.id, record.title, record.youtubeId, record.url, record.category, record.description, record.date, record.createdAt);

  return record;
}

export async function saveUser(user) {
  const record = {
    id: user.id || createId("user"),
    name: user.name || "Ministry Member",
    email: user.email || "",
    phone: user.phone || "",
    location: user.location || "",
    role: user.role || "Member",
    verified: user.verified ?? true,
    communication: {
      email: Boolean(user.communication?.email ?? user.emailOptIn),
      sms: Boolean(user.communication?.sms ?? user.smsOptIn),
    },
    createdAt: user.createdAt || new Date().toISOString(),
  };

  if (usePostgres) {
    await postgresPool.query(
      `
        INSERT INTO users (id, name, email, phone, location, role, verified, communication_email, communication_sms, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          location = EXCLUDED.location,
          role = EXCLUDED.role,
          verified = EXCLUDED.verified,
          communication_email = EXCLUDED.communication_email,
          communication_sms = EXCLUDED.communication_sms
      `,
      [record.id, record.name, record.email, record.phone, record.location, record.role, record.verified, record.communication.email, record.communication.sms, record.createdAt],
    );
    return record;
  }

  sqliteDatabase.prepare(`
    INSERT INTO users (id, name, email, phone, location, role, verified, communication_email, communication_sms, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      phone = excluded.phone,
      location = excluded.location,
      role = excluded.role,
      verified = excluded.verified,
      communication_email = excluded.communication_email,
      communication_sms = excluded.communication_sms
  `).run(record.id, record.name, record.email, record.phone, record.location, record.role, Number(record.verified), Number(record.communication.email), Number(record.communication.sms), record.createdAt);

  return record;
}

export async function saveDonation(donation) {
  const record = {
    id: donation.id || createId("donation"),
    userId: donation.userId || "",
    donorName: donation.donorName || donation.name || "Guest Donor",
    email: donation.email || "",
    amount: Number(donation.amount || 0),
    fund: donation.fund || "General Ministry",
    frequency: donation.frequency || "One-time",
    method: donation.method || "External checkout",
    status: donation.status || "Checkout pending",
    createdAt: donation.createdAt || new Date().toISOString(),
  };

  if (usePostgres) {
    await postgresPool.query(
      `
        INSERT INTO donations (id, user_id, donor_name, email, amount, fund, frequency, method, status, created_at)
        VALUES ($1, NULLIF($2, ''), $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `,
      [record.id, record.userId, record.donorName, record.email, record.amount, record.fund, record.frequency, record.method, record.status, record.createdAt],
    );
    return record;
  }

  sqliteDatabase.prepare(`
    INSERT OR IGNORE INTO donations (id, user_id, donor_name, email, amount, fund, frequency, method, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(record.id, record.userId, record.donorName, record.email, record.amount, record.fund, record.frequency, record.method, record.status, record.createdAt);

  return record;
}

export async function saveEventRegistration(registration) {
  const record = {
    id: registration.id || createId("registration"),
    userId: registration.userId || "",
    eventSlug: registration.eventSlug || "",
    eventTitle: registration.eventTitle || "",
    name: registration.name || "Guest",
    email: registration.email || "",
    phone: registration.phone || "",
    status: registration.status || "Confirmed",
    ticketCode: registration.ticketCode || createTicketCode(),
    createdAt: registration.createdAt || new Date().toISOString(),
  };

  if (usePostgres) {
    await postgresPool.query(
      `
        INSERT INTO event_registrations (id, user_id, event_slug, event_title, name, email, phone, status, ticket_code, created_at)
        VALUES ($1, NULLIF($2, ''), $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `,
      [record.id, record.userId, record.eventSlug, record.eventTitle, record.name, record.email, record.phone, record.status, record.ticketCode, record.createdAt],
    );
    return record;
  }

  sqliteDatabase.prepare(`
    INSERT OR IGNORE INTO event_registrations (id, user_id, event_slug, event_title, name, email, phone, status, ticket_code, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(record.id, record.userId, record.eventSlug, record.eventTitle, record.name, record.email, record.phone, record.status, record.ticketCode, record.createdAt);

  return record;
}

export async function saveSubscriber(subscriber) {
  const record = {
    id: subscriber.id || createId("subscriber"),
    name: subscriber.name || "",
    email: subscriber.email || "",
    phone: subscriber.phone || "",
    location: subscriber.location || "",
    role: subscriber.role || "Subscriber",
    createdAt: subscriber.createdAt || new Date().toISOString(),
  };

  if (usePostgres) {
    await postgresPool.query(
      `
        INSERT INTO subscribers (id, name, email, phone, location, role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          location = EXCLUDED.location,
          role = EXCLUDED.role
      `,
      [record.id, record.name, record.email, record.phone, record.location, record.role, record.createdAt],
    );
    return record;
  }

  sqliteDatabase.prepare(`
    INSERT INTO subscribers (id, name, email, phone, location, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      phone = excluded.phone,
      location = excluded.location,
      role = excluded.role
  `).run(record.id, record.name, record.email, record.phone, record.location, record.role, record.createdAt);

  return record;
}

export async function readPlatformRecords() {
  if (usePostgres) {
    const [contactMessages, prayerRequests, mediaImages, mediaVideos, users, donations, eventRegistrations, subscribers, notifications] = await Promise.all([
      queryRows("SELECT id, name, email, message, status, created_at AS \"createdAt\" FROM contact_messages ORDER BY created_at DESC"),
      queryRows("SELECT id, name, email, message, anonymous, confidential, status, created_at AS \"createdAt\" FROM prayer_requests ORDER BY created_at DESC"),
      queryRows("SELECT id, src, alt, category, created_at AS \"createdAt\", updated_at AS \"updatedAt\" FROM media_images ORDER BY created_at DESC"),
      queryRows("SELECT id, title, youtube_id AS \"youtubeId\", url, category, description, date_label AS date, created_at AS \"createdAt\" FROM media_videos ORDER BY created_at DESC"),
      queryRows("SELECT id, name, email, phone, location, role, verified, communication_email AS \"emailOptIn\", communication_sms AS \"smsOptIn\", created_at AS \"createdAt\" FROM users ORDER BY created_at DESC"),
      queryRows("SELECT id, user_id AS \"userId\", donor_name AS \"donorName\", email, amount, fund, frequency, method, status, created_at AS \"createdAt\" FROM donations ORDER BY created_at DESC"),
      queryRows("SELECT id, user_id AS \"userId\", event_slug AS \"eventSlug\", event_title AS \"eventTitle\", name, email, phone, status, ticket_code AS \"ticketCode\", created_at AS \"createdAt\" FROM event_registrations ORDER BY created_at DESC"),
      queryRows("SELECT id, name, email, phone, location, role, created_at AS \"createdAt\" FROM subscribers ORDER BY created_at DESC"),
      queryRows("SELECT id, title, message, channel, status, created_at AS \"createdAt\" FROM notifications ORDER BY created_at DESC"),
    ]);

    return {
      contactMessages,
      prayerRequests,
      mediaImages,
      mediaVideos,
      users: users.map(toClientUser),
      donations,
      eventRegistrations,
      subscribers,
      notifications,
    };
  }

  return {
    contactMessages: sqliteDatabase.prepare(`
      SELECT id, name, email, message, status, created_at AS createdAt
      FROM contact_messages
      ORDER BY created_at DESC
    `).all(),
    prayerRequests: sqliteDatabase.prepare(`
      SELECT id, name, email, message, anonymous, confidential, status, created_at AS createdAt
      FROM prayer_requests
      ORDER BY created_at DESC
    `).all().map(toBooleanFlags),
    mediaImages: sqliteDatabase.prepare(`
      SELECT id, src, alt, category, created_at AS createdAt, updated_at AS updatedAt
      FROM media_images
      ORDER BY created_at DESC
    `).all(),
    mediaVideos: sqliteDatabase.prepare(`
      SELECT id, title, youtube_id AS youtubeId, url, category, description, date_label AS date, created_at AS createdAt
      FROM media_videos
      ORDER BY created_at DESC
    `).all(),
    users: sqliteDatabase.prepare(`
      SELECT id, name, email, phone, location, role, verified, communication_email AS emailOptIn, communication_sms AS smsOptIn, created_at AS createdAt
      FROM users
      ORDER BY created_at DESC
    `).all().map(toClientUser),
    donations: sqliteDatabase.prepare(`
      SELECT id, user_id AS userId, donor_name AS donorName, email, amount, fund, frequency, method, status, created_at AS createdAt
      FROM donations
      ORDER BY created_at DESC
    `).all(),
    eventRegistrations: sqliteDatabase.prepare(`
      SELECT id, user_id AS userId, event_slug AS eventSlug, event_title AS eventTitle, name, email, phone, status, ticket_code AS ticketCode, created_at AS createdAt
      FROM event_registrations
      ORDER BY created_at DESC
    `).all(),
    subscribers: sqliteDatabase.prepare(`
      SELECT id, name, email, phone, location, role, created_at AS createdAt
      FROM subscribers
      ORDER BY created_at DESC
    `).all(),
    notifications: sqliteDatabase.prepare(`
      SELECT id, title, message, channel, status, created_at AS createdAt
      FROM notifications
      ORDER BY created_at DESC
    `).all(),
  };
}

export async function readPublicPlatformRecords() {
  if (usePostgres) {
    const [mediaImages, mediaVideos] = await Promise.all([
      queryRows("SELECT id, src, alt, category, created_at AS \"createdAt\", updated_at AS \"updatedAt\" FROM media_images ORDER BY created_at DESC"),
      queryRows("SELECT id, title, youtube_id AS \"youtubeId\", url, category, description, date_label AS date, created_at AS \"createdAt\" FROM media_videos ORDER BY created_at DESC"),
    ]);

    return { mediaImages, mediaVideos };
  }

  return {
    mediaImages: sqliteDatabase.prepare(`
      SELECT id, src, alt, category, created_at AS createdAt, updated_at AS updatedAt
      FROM media_images
      ORDER BY created_at DESC
    `).all(),
    mediaVideos: sqliteDatabase.prepare(`
      SELECT id, title, youtube_id AS youtubeId, url, category, description, date_label AS date, created_at AS createdAt
      FROM media_videos
      ORDER BY created_at DESC
    `).all(),
  };
}

async function queryRows(sql, params = []) {
  const result = await postgresPool.query(sql, params);
  return result.rows;
}

function initializeSqlite() {
  sqliteDatabase.exec(`
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

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      location TEXT,
      role TEXT NOT NULL DEFAULT 'Member',
      verified INTEGER NOT NULL DEFAULT 1,
      communication_email INTEGER NOT NULL DEFAULT 0,
      communication_sms INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      donor_name TEXT NOT NULL,
      email TEXT,
      amount REAL NOT NULL,
      fund TEXT NOT NULL,
      frequency TEXT NOT NULL,
      method TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_registrations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      event_slug TEXT NOT NULL,
      event_title TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      status TEXT NOT NULL,
      ticket_code TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      location TEXT,
      role TEXT NOT NULL DEFAULT 'Subscriber',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      channel TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  seedAdminUserSqlite();
}

async function initializePostgres() {
  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New',
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prayer_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      message TEXT NOT NULL,
      anonymous BOOLEAN NOT NULL DEFAULT false,
      confidential BOOLEAN NOT NULL DEFAULT false,
      status TEXT NOT NULL DEFAULT 'New',
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media_images (
      id TEXT PRIMARY KEY,
      src TEXT NOT NULL,
      alt TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS media_videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      youtube_id TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      date_label TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      location TEXT,
      role TEXT NOT NULL DEFAULT 'Member',
      verified BOOLEAN NOT NULL DEFAULT true,
      communication_email BOOLEAN NOT NULL DEFAULT false,
      communication_sms BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      donor_name TEXT NOT NULL,
      email TEXT,
      amount NUMERIC(12, 2) NOT NULL,
      fund TEXT NOT NULL,
      frequency TEXT NOT NULL,
      method TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_registrations (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      event_slug TEXT NOT NULL,
      event_title TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      status TEXT NOT NULL,
      ticket_code TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      location TEXT,
      role TEXT NOT NULL DEFAULT 'Subscriber',
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      channel TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_media_videos_created_at ON media_videos (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_media_images_created_at ON media_images (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests (created_at DESC);
  `);

  await seedAdminUserPostgres();
}

async function seedAdminUserPostgres() {
  await postgresPool.query(
    `
      INSERT INTO users (id, name, email, phone, location, role, verified, communication_email, communication_sms, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, true, true, true, $7)
      ON CONFLICT (email) DO NOTHING
    `,
    ["user-admin", "Ministry Admin", "admin@chosenwarriors.local", "", "Online", "Admin", "2026-05-01T12:00:00.000Z"],
  );
}

function seedAdminUserSqlite() {
  sqliteDatabase.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, phone, location, role, verified, communication_email, communication_sms, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run("user-admin", "Ministry Admin", "admin@chosenwarriors.local", "", "Online", "Admin", 1, 1, 1, "2026-05-01T12:00:00.000Z");
}

function toBooleanFlags(request) {
  return {
    ...request,
    anonymous: Boolean(request.anonymous),
    confidential: Boolean(request.confidential),
  };
}

function toClientUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    location: user.location || "",
    role: user.role,
    verified: Boolean(user.verified),
    communication: {
      email: Boolean(user.emailOptIn),
      sms: Boolean(user.smsOptIn),
    },
    createdAt: user.createdAt,
  };
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function createTicketCode() {
  return `CW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
