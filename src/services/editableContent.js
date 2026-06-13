import { socialLinks } from "../config/siteConfig";
import { leadershipProfiles, ministryEvents, siteImages, testimonyStories } from "../content/siteContent";

const CONTENT_KEY = "cw_editable_content";
const CONTENT_EVENT = "cw:content-updated";
const ADMIN_TOKEN_KEY = "cw_admin_token";

export const defaultEditableContent = {
  siteImages,
  siteImageCrops: {
    hero: { cropX: 50, cropY: 18 },
    foundationHero: { cropX: 50, cropY: 18 },
  },
  ministryEvents: ministryEvents.map((event) => ({
    ...event,
    cropX: 50,
    cropY: 18,
  })),
  leadershipProfiles: leadershipProfiles.map((profile) => ({
    ...profile,
    cropX: 50,
    cropY: 18,
  })),
  testimonyStories: testimonyStories.map((testimony) => ({
    ...testimony,
    cropX: 50,
    cropY: 18,
  })),
  settings: {
    featuredEventSlug: "revival-night",
    whatsapp: socialLinks.whatsapp,
    zoom: socialLinks.zoom,
    instagram: socialLinks.instagram,
    tiktok: socialLinks.tiktok,
    youtube: socialLinks.youtube,
  },
};

export function readEditableContent() {
  try {
    const savedContent = JSON.parse(window.localStorage.getItem(CONTENT_KEY) || "{}");
    return normalizeEditableContent(savedContent);
  } catch {
    return defaultEditableContent;
  }
}

export function saveEditableContent(nextContent) {
  const normalizedContent = normalizeEditableContent(nextContent);
  window.localStorage.setItem(CONTENT_KEY, JSON.stringify(normalizedContent));
  window.dispatchEvent(new CustomEvent(CONTENT_EVENT, { detail: normalizedContent }));
  return normalizedContent;
}

export async function loadEditableContent() {
  const data = await request("/api/content");
  const normalizedContent = normalizeEditableContent(data.content);
  window.localStorage.setItem(CONTENT_KEY, JSON.stringify(normalizedContent));
  window.dispatchEvent(new CustomEvent(CONTENT_EVENT, { detail: normalizedContent }));
  return normalizedContent;
}

export async function loginAdmin(password) {
  const data = await request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });

  if (data.adminToken) {
    window.sessionStorage.setItem(ADMIN_TOKEN_KEY, data.adminToken);
  }

  return data;
}

export async function saveEditableContentToServer(nextContent) {
  const data = await request("/api/content", {
    method: "PUT",
    body: JSON.stringify({ content: normalizeEditableContent(nextContent) }),
  });
  return saveEditableContent(data.content);
}

export async function uploadAdminImage(file) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Upload an image file.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Upload an image smaller than 5 MB.");
  }

  const data = await request("/api/uploads", {
    method: "POST",
    body: JSON.stringify({
      contentType: file.type,
      fileName: file.name,
    }),
  });

  const uploadResponse = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Unable to upload the image.");
  }

  return data.publicUrl;
}

export function subscribeToEditableContent(listener) {
  const handleContentUpdate = (event) => listener(event.detail || readEditableContent());
  window.addEventListener(CONTENT_EVENT, handleContentUpdate);
  window.addEventListener("storage", handleContentUpdate);

  return () => {
    window.removeEventListener(CONTENT_EVENT, handleContentUpdate);
    window.removeEventListener("storage", handleContentUpdate);
  };
}

function normalizeEditableContent(content = {}) {
  const normalizedEvents = normalizeEvents(content.ministryEvents);
  const settings = {
    ...defaultEditableContent.settings,
    ...(content.settings || {}),
  };

  if (!normalizedEvents.some((event) => event.slug === settings.featuredEventSlug)) {
    settings.featuredEventSlug = normalizedEvents[0]?.slug || "";
  }

  return {
    siteImages: {
      ...defaultEditableContent.siteImages,
      ...(content.siteImages || {}),
    },
    siteImageCrops: {
      hero: normalizeCrop(content.siteImageCrops?.hero, defaultEditableContent.siteImageCrops.hero),
      foundationHero: normalizeCrop(content.siteImageCrops?.foundationHero, defaultEditableContent.siteImageCrops.foundationHero),
    },
    ministryEvents: normalizedEvents,
    leadershipProfiles: defaultEditableContent.leadershipProfiles.map((profile, index) => ({
      ...profile,
      ...(content.leadershipProfiles?.[index] || {}),
      cropX: clampCrop(content.leadershipProfiles?.[index]?.cropX ?? profile.cropX),
      cropY: clampCrop(content.leadershipProfiles?.[index]?.cropY ?? profile.cropY),
    })),
    testimonyStories: normalizeTestimonies(content.testimonyStories),
    settings,
  };
}

function normalizeEvents(events) {
  if (!Array.isArray(events)) {
    return defaultEditableContent.ministryEvents;
  }

  return events.map((event, index) => {
    const fallback = defaultEditableContent.ministryEvents[index] || {};
    const title = String(event.title || fallback.title || `Ministry Event ${index + 1}`).trim();

    return {
      capacity: Number(event.capacity) || "",
      cropX: clampCrop(event.cropX ?? fallback.cropX),
      cropY: clampCrop(event.cropY ?? fallback.cropY),
      date: String(event.date || fallback.date || "Upcoming").trim(),
      description: String(event.description || fallback.description || "").trim(),
      image: String(event.image || fallback.image || siteImages.hero).trim(),
      link: String(event.link || fallback.link || socialLinks.zoom).trim(),
      location: String(event.location || fallback.location || "Online").trim(),
      password: String(event.password || fallback.password || "").trim(),
      slug: createSlug(event.slug || title, index),
      time: String(event.time || fallback.time || "TBD").trim(),
      title,
    };
  });
}

function normalizeTestimonies(testimonies) {
  if (!Array.isArray(testimonies)) {
    return defaultEditableContent.testimonyStories;
  }

  return testimonies.map((testimony, index) => ({
    date: String(testimony.date || "").trim(),
    headline: String(testimony.headline || `Member testimony ${index + 1}`).trim(),
    image: String(testimony.image || siteImages.hero).trim(),
    name: String(testimony.name || "Community Member").trim(),
    text: String(testimony.text || "").trim(),
    cropX: clampCrop(testimony.cropX),
    cropY: clampCrop(testimony.cropY),
  }));
}

function normalizeCrop(crop = {}, fallback = { cropX: 50, cropY: 18 }) {
  return {
    cropX: clampCrop(crop.cropX ?? fallback.cropX),
    cropY: clampCrop(crop.cropY ?? fallback.cropY),
  };
}

function clampCrop(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.min(Math.max(numberValue, 0), 100) : 50;
}

function createSlug(value, index) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `ministry-event-${index + 1}`;
}

async function request(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAdminAuthHeader(),
      ...options.headers,
    },
    ...options,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || "Unable to update site content.");
  }

  return data;
}

function getAdminAuthHeader() {
  const adminToken = window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
  return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
}
