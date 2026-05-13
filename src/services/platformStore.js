const STORAGE_KEY = "chosen-warriors-platform";

const defaultState = {
  currentUserId: "",
  users: [
    {
      id: "user-admin",
      name: "Ministry Admin",
      email: "admin@chosenwarriors.local",
      phone: "",
      location: "Online",
      role: "Admin",
      verified: true,
      communication: { email: true, sms: true },
      createdAt: "2026-05-01T12:00:00.000Z",
    },
  ],
  donations: [],
  eventRegistrations: [],
  contactMessages: [],
  prayerRequests: [],
  subscribers: [],
  notifications: [],
  events: [],
  mediaImages: [],
  mediaVideos: [],
};

export function readPlatformState() {
  if (typeof window === "undefined") {
    return defaultState;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    writePlatformState(defaultState);
    return defaultState;
  }

  try {
    return { ...defaultState, ...JSON.parse(stored) };
  } catch {
    writePlatformState(defaultState);
    return defaultState;
  }
}

export function writePlatformState(nextState) {
  if (typeof window === "undefined") {
    return nextState;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new CustomEvent("chosen-warriors-platform", { detail: nextState }));
  return nextState;
}

export function subscribeToPlatformStore(callback) {
  const handler = (event) => callback(event.detail || readPlatformState());
  window.addEventListener("chosen-warriors-platform", handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener("chosen-warriors-platform", handler);
    window.removeEventListener("storage", handler);
  };
}

export function createMember(profile) {
  const state = readPlatformState();
  const existingUser = state.users.find((user) => user.email.toLowerCase() === profile.email.toLowerCase());

  if (existingUser) {
    return loginMember(existingUser.email);
  }

  const user = {
    id: createId("user"),
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location || "",
    role: "Member",
    verified: true,
    communication: {
      email: Boolean(profile.emailOptIn),
      sms: Boolean(profile.smsOptIn),
    },
    createdAt: new Date().toISOString(),
  };

  const nextState = {
    ...state,
    currentUserId: user.id,
    users: [...state.users, user],
    subscribers: profile.emailOptIn ? upsertSubscriber(state.subscribers, user) : state.subscribers,
    notifications: [
      createNotification("Welcome email queued", `Welcome email queued for ${user.email}.`, "Email"),
      ...state.notifications,
    ],
  };

  return writePlatformState(nextState);
}

export function loginMember(email) {
  const state = readPlatformState();
  const user = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    throw new Error("No member profile exists for that email.");
  }

  return writePlatformState({
    ...state,
    currentUserId: user.id,
    notifications: [createNotification("Login session started", `${user.name} signed in.`, "Auth"), ...state.notifications],
  });
}

export function logoutMember() {
  const state = readPlatformState();
  return writePlatformState({ ...state, currentUserId: "" });
}

export function updateCurrentMember(profile) {
  const state = readPlatformState();

  return writePlatformState({
    ...state,
    users: state.users.map((user) => {
      if (user.id !== state.currentUserId) {
        return user;
      }

      return {
        ...user,
        ...profile,
        communication: {
          email: Boolean(profile.emailOptIn),
          sms: Boolean(profile.smsOptIn),
        },
      };
    }),
  });
}

export function submitDonationIntent(donation) {
  const state = readPlatformState();
  const user = getCurrentUser(state);
  const record = {
    id: createId("donation"),
    userId: user?.id || "",
    donorName: donation.name || user?.name || "Guest Donor",
    email: donation.email || user?.email || "",
    amount: Number(donation.amount),
    fund: donation.fund,
    frequency: donation.frequency,
    method: donation.method,
    status: "Checkout pending",
    createdAt: new Date().toISOString(),
  };

  return writePlatformState({
    ...state,
    donations: [record, ...state.donations],
    notifications: [
      createNotification("Donation checkout created", `${record.donorName} started a ${record.frequency.toLowerCase()} ${formatCurrency(record.amount)} gift for ${record.fund}.`, "Giving"),
      ...state.notifications,
    ],
  });
}

export function submitEventRegistration(registration) {
  const state = readPlatformState();
  const eventCount = state.eventRegistrations.filter((item) => item.eventSlug === registration.eventSlug && item.status === "Confirmed").length;
  const status = registration.capacity && eventCount >= registration.capacity ? "Waitlist" : "Confirmed";
  const record = {
    id: createId("registration"),
    userId: state.currentUserId,
    eventSlug: registration.eventSlug,
    eventTitle: registration.eventTitle,
    name: registration.name,
    email: registration.email,
    phone: registration.phone || "",
    status,
    ticketCode: createTicketCode(),
    createdAt: new Date().toISOString(),
  };

  return writePlatformState({
    ...state,
    eventRegistrations: [record, ...state.eventRegistrations],
    notifications: [
      createNotification("Event confirmation queued", `${record.name} is ${status.toLowerCase()} for ${record.eventTitle}.`, "Event"),
      ...state.notifications,
    ],
  });
}

export function submitPrayerRequest(request) {
  const state = readPlatformState();
  const record = {
    id: createId("prayer"),
    userId: state.currentUserId,
    name: request.anonymous ? "Anonymous" : request.name || "Anonymous",
    email: request.email || "",
    message: request.message,
    anonymous: Boolean(request.anonymous),
    confidential: Boolean(request.confidential),
    status: "New",
    assignedTo: "",
    createdAt: new Date().toISOString(),
  };

  return writePlatformState({
    ...state,
    prayerRequests: [record, ...state.prayerRequests],
    notifications: [
      createNotification("Prayer team notification queued", "A new prayer request is ready for review.", "Prayer"),
      ...state.notifications,
    ],
  });
}

export function submitContactMessage(message) {
  const state = readPlatformState();
  const record = {
    id: createId("message"),
    name: message.name || "Website Visitor",
    email: message.email || "",
    message: message.message,
    status: "New",
    createdAt: new Date().toISOString(),
  };

  return writePlatformState({
    ...state,
    contactMessages: [record, ...state.contactMessages],
    notifications: [
      createNotification("Contact message notification queued", `${record.name} sent a website message.`, "Email"),
      ...state.notifications,
    ],
  });
}

export function addMediaImage(image) {
  const state = readPlatformState();
  const record = {
    id: createId("image"),
    src: image.src,
    alt: image.alt || "Chosen Warriors ministry image",
    category: image.category || "Ministry",
    createdAt: new Date().toISOString(),
  };

  return writePlatformState({
    ...state,
    mediaImages: [record, ...state.mediaImages],
    notifications: [createNotification("Gallery image uploaded", record.alt, "Media"), ...state.notifications],
  });
}

export function updateMediaImage(id, image) {
  const state = readPlatformState();
  const nextImages = state.mediaImages.map((item) => (item.id === id ? { ...item, ...image, updatedAt: new Date().toISOString() } : item));

  return writePlatformState({
    ...state,
    mediaImages: nextImages,
    notifications: [createNotification("Gallery image changed", image.alt || "A gallery image was updated.", "Media"), ...state.notifications],
  });
}

export function addMediaVideo(video) {
  const state = readPlatformState();
  const youtubeId = getYouTubeId(video.youtubeUrl || video.youtubeId);

  if (!youtubeId) {
    throw new Error("Enter a valid YouTube URL or video ID.");
  }

  const record = {
    id: createId("video"),
    title: video.title || "Chosen Warriors Video",
    youtubeId,
    url: `https://youtu.be/${youtubeId}`,
    category: video.category || "Teaching",
    date: "Admin Upload",
    description: video.description || "A ministry video added by the admin team.",
    createdAt: new Date().toISOString(),
  };

  return writePlatformState({
    ...state,
    mediaVideos: [record, ...state.mediaVideos],
    notifications: [createNotification("YouTube video loaded", record.title, "Media"), ...state.notifications],
  });
}

export function subscribeEmail(email) {
  const state = readPlatformState();
  const subscriber = {
    id: createId("subscriber"),
    name: "",
    email,
    phone: "",
    location: "",
    role: "Subscriber",
    createdAt: new Date().toISOString(),
  };

  return writePlatformState({
    ...state,
    subscribers: upsertSubscriber(state.subscribers, subscriber),
    notifications: [createNotification("Newsletter welcome queued", `Welcome email queued for ${email}.`, "Email"), ...state.notifications],
  });
}

export function updatePrayerStatus(id, status) {
  const state = readPlatformState();
  return writePlatformState({
    ...state,
    prayerRequests: state.prayerRequests.map((request) => (request.id === id ? { ...request, status } : request)),
  });
}

export function getCurrentUser(state = readPlatformState()) {
  return state.users.find((user) => user.id === state.currentUserId) || null;
}

export function exportCsv(rows, columns) {
  const header = columns.map((column) => column.label).join(",");
  const body = rows.map((row) => columns.map((column) => csvCell(row[column.key])).join(",")).join("\n");
  return [header, body].filter(Boolean).join("\n");
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(Number(amount || 0));
}

function createNotification(title, message, channel) {
  return {
    id: createId("notification"),
    title,
    message,
    channel,
    status: "Queued",
    createdAt: new Date().toISOString(),
  };
}

function upsertSubscriber(subscribers, user) {
  const exists = subscribers.some((subscriber) => subscriber.email.toLowerCase() === user.email.toLowerCase());

  if (exists) {
    return subscribers;
  }

  return [
    {
      id: createId("subscriber"),
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      role: user.role,
      createdAt: new Date().toISOString(),
    },
    ...subscribers,
  ];
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function createTicketCode() {
  return `CW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
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

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}
