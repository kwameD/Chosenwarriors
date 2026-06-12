export const ministryName = "Chosen Warriors";
export const logoImage = "/chosen-warriors-logo.jpg";

// Navigation and contact values used across layout sections.
export const navigationItems = [
  { label: "Home", href: "#home" },
  {
    label: "About",
    href: "#about",
    children: [
      { label: "Mission & Vision", href: "#mission-vision" },
      { label: "Leadership", href: "#leadership" },
      { label: "Foundation", href: "#foundation" },
      { label: "Testimonials", href: "#testimonials" },
    ],
  },
  { label: "Events", href: "#events" },
  {
    label: "Contact",
    href: "#contact",
    children: [{ label: "Prayer Requests", href: "#prayer-requests" }],
  },
];

export const socialLinks = {
  whatsapp: "https://chat.whatsapp.com/KInY0eOLgWM4lWyPuxW6pr",
  zoom: "https://us04web.zoom.us/j/7841667945?pwd=71u-yBX9L8n94s_3ocE9sqSn5PnNqf.1",
  instagram: "https://www.instagram.com/chosenwarriorsofficial/",
  tiktok: "https://www.tiktok.com/@chosenwarriorsofficial",
  youtube: "https://www.youtube.com/@chosenwarriorsofficial",
};

export const connectSocialLinks = [
  { label: "Instagram", href: socialLinks.instagram },
  { label: "YouTube", href: socialLinks.youtube },
  { label: "TikTok", href: socialLinks.tiktok },
  { label: "Zoom", href: socialLinks.zoom },
];

export const footerNavigationLinks = [
  { label: "About", href: "#about" },
  { label: "Events", href: "#events" },
  { label: "Foundation", href: "#foundation" },
  { label: "Contact", href: "#contact" },
  { label: "Prayer Requests", href: "#prayer-requests" },
];

export const footerSocialLinks = [
  { label: "Instagram", href: socialLinks.instagram },
  { label: "YouTube", href: socialLinks.youtube },
  { label: "TikTok", href: socialLinks.tiktok },
  { label: "WhatsApp", href: socialLinks.whatsapp },
];

export const contactEmail = "chosenwarriorsofficial@gmail.com";
