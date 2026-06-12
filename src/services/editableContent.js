import { socialLinks } from "../config/siteConfig";
import { leadershipProfiles, ministryEvents, siteImages } from "../content/siteContent";

const CONTENT_KEY = "cw_editable_content";
const CONTENT_EVENT = "cw:content-updated";
const ADMIN_TOKEN_KEY = "cw_admin_token";

export const defaultEditableContent = {
  siteImages,
  ministryEvents,
  leadershipProfiles: leadershipProfiles.map((profile) => ({
    ...profile,
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
  return {
    siteImages: {
      ...defaultEditableContent.siteImages,
      ...(content.siteImages || {}),
    },
    ministryEvents: defaultEditableContent.ministryEvents.map((event, index) => ({
      ...event,
      ...(content.ministryEvents?.[index] || {}),
    })),
    leadershipProfiles: defaultEditableContent.leadershipProfiles.map((profile, index) => ({
      ...profile,
      ...(content.leadershipProfiles?.[index] || {}),
      cropX: clampCrop(content.leadershipProfiles?.[index]?.cropX ?? profile.cropX),
      cropY: clampCrop(content.leadershipProfiles?.[index]?.cropY ?? profile.cropY),
    })),
    settings: {
      ...defaultEditableContent.settings,
      ...(content.settings || {}),
    },
  };
}

function clampCrop(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.min(Math.max(numberValue, 0), 100) : 50;
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
