const STORAGE_KEY = "chosen-warriors-platform";

const defaultState = {
  currentUserId: "",
  users: [],
  eventRegistrations: [],
  contactMessages: [],
  prayerRequests: [],
  subscribers: [],
  notifications: [],
  events: [],
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

export function getCurrentUser(state = readPlatformState()) {
  return state.users.find((user) => user.id === state.currentUserId) || null;
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
