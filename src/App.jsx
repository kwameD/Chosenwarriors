import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  CreditCard,
  Database,
  Download,
  ExternalLink,
  HeartHandshake,
  Image as ImageIcon,
  Instagram,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Music2,
  PlayCircle,
  Quote,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  UserCog,
  UserPlus,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { Button } from "./components/ui/Button";
import { OptimizedImage } from "./components/ui/OptimizedImage";
import { SectionHeader } from "./components/ui/SectionHeader";
import { YouTubeEmbed } from "./components/ui/YouTubeEmbed";
import { contactEmail, connectSocialLinks, integrationStatus, ministryName, paymentCheckoutLinks, socialLinks } from "./config/siteConfig";
import {
  communicationSegments,
  coreValues,
  donationFunds,
  featuredMessages,
  galleryImages,
  impactStats,
  leadershipProfiles,
  ministryEvents,
  ministryTimeline,
  paymentMethods,
  siteImages,
  socialHighlights,
  testimonyStories,
} from "./content/siteContent";
import { getExternalLinkProps } from "./utils/links";
import { Hero, Newsletter, Prayer } from "./sections";
import {
  addMediaImage,
  addMediaVideo,
  createMember,
  exportCsv,
  formatCurrency,
  getCurrentUser,
  loginMember,
  logoutMember,
  readPlatformState,
  submitContactMessage,
  submitDonationIntent,
  submitEventRegistration,
  subscribeToPlatformStore,
  updateCurrentMember,
  updateMediaImage,
  updatePrayerStatus,
  writePlatformState,
} from "./services/platformStore";
import { sendContactEmail } from "./services/ministryEmailApi";
import {
  loadPublicPlatformRecords,
  saveDonationRecord,
  saveEventRegistrationRecord,
  saveMediaImageRecord,
  saveMediaVideoRecord,
  saveMemberRecord,
  updateMediaImageRecord,
} from "./services/platformApi";

const routeTitles = {
  home: "Home",
  about: "About",
  media: "Media",
  events: "Events",
  contact: "Contact",
  "mission-vision": "Mission & Vision",
  leadership: "Leadership",
  testimonials: "Testimonials",
  "prayer-requests": "Prayer Requests",
  foundation: "Foundation",
  "media-gallery": "Media Gallery",
  "social-media": "Social Media",
  "give-online": "Give Online",
  "member-portal": "Member Portal",
  admin: "Admin Dashboard",
};

const homeSections = [Hero, MinistryOverview, EventHighlight, MediaPreview, TestimonialPreview, DonationCta, Newsletter];

function getRouteFromHash() {
  const hash = window.location.hash.replace("#", "");
  if (hash.startsWith("event-") && ministryEvents.some((event) => `event-${event.slug}` === hash)) {
    return hash;
  }
  return routeTitles[hash] ? hash : "home";
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromHash);
  const [platformState, setPlatformState] = useState(readPlatformState);

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(getRouteFromHash());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleRouteChange);
    return () => window.removeEventListener("hashchange", handleRouteChange);
  }, []);

  useEffect(() => subscribeToPlatformStore(setPlatformState), []);

  useEffect(() => {
    loadPublicPlatformRecords()
      .then((records) => {
        const state = readPlatformState();
        writePlatformState({
          ...state,
          mediaImages: mergeById(records.mediaImages, state.mediaImages),
          mediaVideos: mergeById(records.mediaVideos, state.mediaVideos),
        });
      })
      .catch(() => {
        // The app remains usable with local storage when the backend is unavailable.
      });
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        {route === "home" ? <HomePage /> : <InteriorPage route={route} platformState={platformState} />}
      </main>
      <Footer />
    </>
  );
}

function HomePage() {
  return homeSections.map((Section) => <Section key={Section.name} />);
}

function mergeById(primary = [], secondary = []) {
  const records = new Map();
  [...secondary, ...primary].forEach((item) => {
    if (item?.id) {
      records.set(item.id, item);
    }
  });
  return [...records.values()];
}

function InteriorPage({ platformState, route }) {
  const pageTitle = routeTitles[route];

  if (route === "about") {
    return (
      <PageShell eyebrow="About Chosen Warriors" title="A ministry built for prayer, discipleship, and transformation.">
        <AboutOverview />
        <MissionVisionContent />
        <FoundationPage compact />
      </PageShell>
    );
  }

  if (route === "media") {
    return (
      <PageShell eyebrow="Media" title="Messages for prayer, surrender, and spiritual momentum.">
        <MediaLibrary platformState={platformState} />
        <MediaGallery platformState={platformState} />
        <SocialMediaPage />
      </PageShell>
    );
  }

  if (route === "events") {
    return (
      <PageShell eyebrow="Events" title="Gather with us online, in prayer, and in service.">
        <EventsPage />
      </PageShell>
    );
  }

  if (route === "contact") {
    return (
      <PageShell eyebrow="Contact" title="Connect with the ministry and take your next step.">
        <ContactPage />
      </PageShell>
    );
  }

  if (route === "mission-vision") {
    return (
      <PageShell eyebrow="Mission & Vision" title="Clear purpose. Faithful action. Lasting impact.">
        <MissionVisionContent />
      </PageShell>
    );
  }

  if (route === "leadership") {
    return (
      <PageShell eyebrow="Leadership" title="Meet the team serving the mission.">
        <LeadershipPage />
      </PageShell>
    );
  }

  if (route === "testimonials") {
    return (
      <PageShell eyebrow="Testimonials" title="Stories of God’s faithfulness.">
        <TestimonialsPage />
      </PageShell>
    );
  }

  if (route === "prayer-requests") {
    return (
      <PageShell eyebrow="Prayer Requests" title="We will stand in prayer with you.">
        <Prayer />
      </PageShell>
    );
  }

  if (route === "foundation") {
    return (
      <PageShell eyebrow="Foundation" title="Chosen to Rescue: compassion made visible.">
        <FoundationPage />
      </PageShell>
    );
  }

  if (route === "media-gallery") {
    return (
      <PageShell eyebrow="Media Gallery" title="Ministry moments, outreach highlights, and community photos.">
        <MediaGallery platformState={platformState} />
      </PageShell>
    );
  }

  if (route === "social-media") {
    return (
      <PageShell eyebrow="Social Media" title="Follow ministry updates across every platform.">
        <SocialMediaPage />
      </PageShell>
    );
  }

  if (route === "give-online") {
    return (
      <PageShell eyebrow="Secure Giving" title="Support the ministry through a safe giving workflow.">
        <GivingPlatformPage platformState={platformState} />
      </PageShell>
    );
  }

  if (route === "member-portal") {
    return (
      <PageShell eyebrow="Member Portal" title="Create a profile, manage registrations, and update communication preferences.">
        <MemberPortalPage platformState={platformState} />
      </PageShell>
    );
  }

  if (route === "admin") {
    return (
      <PageShell eyebrow="Admin Dashboard" title="Manage ministry contacts, events, prayer requests, donations, and communication queues.">
        <AdminDashboardPage platformState={platformState} />
      </PageShell>
    );
  }

  if (route.startsWith("event-")) {
    const event = ministryEvents.find((item) => `event-${item.slug}` === route);

    return (
      <PageShell eyebrow="Event Details" title={event?.title || "Event Details"}>
        <EventDetailPage event={event} platformState={platformState} />
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow={pageTitle} title={pageTitle}>
      <HomePage />
    </PageShell>
  );
}

function PageShell({ children, eyebrow, title }) {
  return (
    <>
      <section className="bg-deepPurple py-16 text-white md:py-20">
        <div className="container-custom">
          <p className="small-label bg-white/10 text-goldAccent">{eyebrow}</p>
          <h1 className="mt-5 max-w-[820px] text-[42px] font-bold leading-[50px] md:text-[56px] md:leading-[64px]">{title}</h1>
        </div>
      </section>
      {children}
    </>
  );
}

function MinistryOverview() {
  const pillars = [
    { icon: ShieldCheck, title: "Mission", text: "Equip believers to boldly proclaim Jesus through prayer, the Word, fasting, and Spirit-led service." },
    { icon: Users, title: "Audience", text: "A community for hungry believers, new disciples, prayer partners, volunteers, and families seeking revival." },
    { icon: HeartHandshake, title: "Impact", text: "Lives strengthened through daily prayer, clear teaching, community support, and practical outreach." },
  ];

  return (
    <section id="ministry-overview" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Ministry Overview"
          title="A trusted place to grow, pray, and serve."
          subtitle={`${ministryName} exists to help people encounter Jesus, mature in faith, and become agents of transformation in their homes and communities.`}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <article key={title} className="card card-hover">
              <Icon className="h-10 w-10 text-purplePrimary" />
              <h3 className="mt-5 text-[24px] font-semibold leading-8">{title}</h3>
              <p className="mt-3 text-[16px] leading-7 text-black/65">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventHighlight() {
  const event = ministryEvents[0];

  return (
    <section id="events" className="section bg-softBg fade-section">
      <div className="container-custom grid items-center gap-10 lg:grid-cols-2">
        <OptimizedImage src={event.image} alt={event.title} className="h-[420px] w-full rounded-lg object-cover shadow-soft" width="640" height="420" />
        <div>
          <p className="small-label text-purplePrimary">Event Highlight</p>
          <h2 className="section-title mt-4">{event.title}</h2>
          <p className="mt-4 flex items-center gap-2 text-[16px] font-semibold text-purplePrimary">
            <Calendar size={18} />
            {event.date} at {event.time}
          </p>
          <p className="mt-4 text-[18px] leading-8 text-black/65">{event.description}</p>
          <Button href="#events" className="mt-8">
            View Events
          </Button>
        </div>
      </div>
    </section>
  );
}

function MediaPreview() {
  const primaryMessage = featuredMessages[0];

  return (
    <section id="media" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader eyebrow="Media Preview" title="Watch messages that stir faith." subtitle="Start with a featured message, then visit the media page for more teaching and ministry moments." />
        <div className="relative mx-auto h-[300px] max-w-[900px] overflow-hidden rounded-lg bg-darkText shadow-soft md:h-[500px]">
          <YouTubeEmbed title={primaryMessage.title} videoId={primaryMessage.youtubeId} />
        </div>
        <div className="mt-8 flex justify-center">
          <Button href="#media" className="gap-2">
            <PlayCircle size={18} />
            Watch Messages
          </Button>
        </div>
      </div>
    </section>
  );
}

function TestimonialPreview() {
  const testimony = testimonyStories[0];

  return (
    <section id="testimonials" className="section bg-softBg fade-section">
      <div className="container-custom">
        <article className="mx-auto max-w-[820px] rounded-lg border border-black/5 bg-white p-8 text-center shadow-soft md:p-12">
          <Quote className="mx-auto text-purplePrimary" size={40} />
          <h2 className="mt-5 text-[34px] font-bold leading-[42px]">Real stories of renewed faith.</h2>
          <p className="mt-5 text-[20px] leading-9 text-black/70">“{testimony.text}”</p>
          <p className="mt-6 text-[14px] font-bold uppercase tracking-widest text-purplePrimary">{testimony.name}</p>
          <Button href="#testimonials" className="mt-8">
            Read Testimonials
          </Button>
        </article>
      </div>
    </section>
  );
}

function DonationCta() {
  return (
    <section id="give" className="section bg-deepPurple text-white fade-section">
      <div className="container-custom grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="small-label bg-white/10 text-goldAccent">Donation CTA</p>
          <h2 className="mt-5 text-[40px] font-bold leading-[48px] md:text-[48px] md:leading-[56px]">Partner with the mission of revival and outreach.</h2>
          <p className="mt-5 max-w-[700px] text-[18px] leading-8 text-white/75">
            Your giving supports prayer gatherings, ministry operations, teaching resources, and compassion outreach through Chosen to Rescue.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
          <Button href="#give-online" variant="white">
            Give Online
          </Button>
          <Button href="#contact" variant="secondary">
            Become a Partner
          </Button>
        </div>
      </div>
    </section>
  );
}

function MissionVisionContent() {
  return (
    <section id="mission-vision" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Mission & Vision"
          title="Built on prayer, Scripture, and visible love."
          subtitle="Chosen Warriors serves believers, families, volunteers, and seekers who want to grow in Jesus and carry revival into everyday life."
        />
        <div className="grid gap-8 md:grid-cols-2">
          <article className="card card-hover">
            <ShieldCheck className="h-10 w-10 text-purplePrimary" />
            <h2 className="mt-5 text-[30px] font-bold leading-9">Mission</h2>
            <p className="mt-4 text-[18px] leading-8 text-black/65">
              To raise revivalists through prayer, the Word, fasting, and practical love so people encounter Jesus and grow in spiritual authority.
            </p>
          </article>
          <article className="card card-hover">
            <HeartHandshake className="h-10 w-10 text-purplePrimary" />
            <h2 className="mt-5 text-[30px] font-bold leading-9">Vision</h2>
            <p className="mt-4 text-[18px] leading-8 text-black/65">
              To see transformed believers bring revival into homes, communities, and nations through faithful discipleship and compassionate outreach.
            </p>
          </article>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {coreValues.map((value) => (
            <article key={value.title} className="rounded-lg border border-black/5 bg-softBg p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
              <h3 className="text-[20px] font-bold leading-7">{value.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-black/65">{value.text}</p>
            </article>
          ))}
        </div>
        <aside className="mt-8 rounded-lg bg-deepPurple p-8 text-white md:p-10">
          <p className="small-label bg-white/10 text-goldAccent">Faith Foundation</p>
          <blockquote className="mt-5 text-[26px] font-semibold leading-9 md:text-[32px] md:leading-10">
            “Go therefore and make disciples of all nations.”
          </blockquote>
          <p className="mt-4 text-white/70">Matthew 28:19 anchors the ministry’s desire to teach, serve, and send people with clarity and compassion.</p>
        </aside>
      </div>
    </section>
  );
}

function AboutOverview() {
  return (
    <section id="about" className="section bg-white fade-section">
      <div className="container-custom grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <OptimizedImage src={siteImages.hero} alt="Chosen Warriors ministry leadership" className="h-[520px] w-full rounded-lg object-cover shadow-soft" width="600" height="520" />
        <div>
          <p className="small-label text-purplePrimary">About the Ministry</p>
          <h2 className="section-title mt-4">A movement helping people encounter Jesus and walk in purpose.</h2>
          <p className="mt-5 text-[18px] leading-8 text-black/65">
            Chosen Warriors exists to strengthen believers through prayer, teaching, fasting, and community. The ministry creates practical pathways for people to grow spiritually, serve faithfully, and find a supportive community.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {impactStats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-softBg p-5">
                <p className="text-[32px] font-extrabold text-purplePrimary">{stat.value}</p>
                <p className="mt-1 text-[14px] font-semibold text-black/65">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LeadershipPage() {
  return (
    <section id="leadership" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader eyebrow="Meet the Leadership" title="Servant leadership with a clear ministry burden." subtitle="Learn who is stewarding the work, the foundation, and the community experience." />
        <div className="grid gap-8 md:grid-cols-2">
          {leadershipProfiles.map((member) => (
            <article key={member.name} className="card card-hover overflow-hidden p-0">
              <div className="overflow-hidden">
                <OptimizedImage src={member.image} alt={member.name} className="h-[340px] w-full object-cover transition duration-300 hover:scale-105" width="560" height="340" />
              </div>
              <div className="p-6">
                <p className="text-[14px] font-bold uppercase tracking-widest text-purplePrimary">{member.role}</p>
                <h2 className="mt-2 text-[28px] font-bold leading-9">{member.name}</h2>
                <p className="mt-4 rounded-lg bg-softBg p-4 text-[16px] font-semibold leading-7 text-darkText">“{member.intro}”</p>
                <p className="mt-4 text-[16px] leading-7 text-black/65">{member.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FoundationPage({ compact = false }) {
  return (
    <section id="foundation" className="section bg-softBg fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Foundation & Outreach"
          title="Chosen to Rescue serves children and families with practical love."
          subtitle="The foundation expression of the ministry focuses on outreach, giving, evangelism, and restoring dignity through compassionate action."
        />
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <OptimizedImage src={siteImages.foundationHero} alt="Chosen to Rescue outreach" className="h-[460px] w-full rounded-lg object-cover shadow-soft" width="600" height="460" />
          <div className="grid gap-5">
            {ministryTimeline.map((item) => (
              <article key={item.title} className="card card-hover">
                <p className="text-[13px] font-bold uppercase tracking-widest text-purplePrimary">{item.year}</p>
                <h3 className="mt-2 text-[24px] font-bold leading-8">{item.title}</h3>
                <p className="mt-3 text-[16px] leading-7 text-black/65">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
        {!compact && (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {impactStats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white p-6 text-center shadow-soft">
                <p className="text-[40px] font-extrabold text-purplePrimary">{stat.value}</p>
                <p className="mt-2 text-[15px] font-semibold text-black/65">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MediaLibrary({ platformState }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const messages = [...(platformState?.mediaVideos || []), ...featuredMessages];
  const categories = ["All", ...new Set(messages.map((message) => message.category))];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredMessages = messages.filter((message) => {
    const matchesCategory = activeCategory === "All" || message.category === activeCategory;
    const matchesQuery = [message.title, message.description, message.category].join(" ").toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
  const featuredMessage = messages[0];

  return (
    <section id="media" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader eyebrow="Sermons & Video Library" title="Teachings, prayer moments, and ministry media in one place." subtitle="Search by title or filter by category to find the message you need." />
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative h-[320px] overflow-hidden rounded-lg bg-darkText shadow-soft md:h-[480px]">
            <YouTubeEmbed title={featuredMessage.title} videoId={featuredMessage.youtubeId} />
          </div>
          <div>
            <p className="small-label text-purplePrimary">Featured Sermon</p>
            <h2 className="mt-4 text-[34px] font-bold leading-[42px]">{featuredMessage.title}</h2>
            <p className="mt-4 text-[18px] leading-8 text-black/65">{featuredMessage.description}</p>
            <Button href={featuredMessage.url} className="mt-8">
              Open on YouTube
              <ExternalLink size={18} />
            </Button>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="relative block md:w-[360px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/40" />
            <input
              className="form-field w-full pl-12"
              placeholder="Search messages"
              aria-label="Search messages"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2" aria-label="Video categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${category === activeCategory ? "bg-purplePrimary text-white" : "bg-softBg text-purplePrimary hover:bg-purplePrimary/10"}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {filteredMessages.map((message) => (
            <article key={message.title} className="card card-hover">
              <div className="relative h-[180px] overflow-hidden rounded-lg bg-darkText">
                <YouTubeEmbed title={message.title} videoId={message.youtubeId} />
              </div>
              <p className="mt-5 text-[13px] font-bold uppercase tracking-widest text-purplePrimary">{message.category} • {message.date}</p>
              <h3 className="mt-2 text-[22px] font-bold leading-8">{message.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-black/65">{message.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MediaGallery({ platformState }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const images = [...(platformState?.mediaImages || []), ...galleryImages];

  return (
    <section id="media-gallery" className="section bg-softBg fade-section">
      <div className="container-custom">
        <SectionHeader eyebrow="Media Gallery" title="Authentic ministry photography and event highlights." subtitle="Browse leadership, prayer, media, and outreach moments from the ministry." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image) => (
            <button key={image.id || `${image.category}-${image.alt}`} type="button" onClick={() => setSelectedImage(image)} className="group overflow-hidden rounded-lg bg-white text-left shadow-soft">
              <OptimizedImage src={image.src} alt={image.alt} className="h-[260px] w-full object-cover transition duration-300 group-hover:scale-105" loading="eager" width="360" height="260" />
              <span className="flex items-center justify-between p-4 text-[14px] font-bold uppercase tracking-widest text-purplePrimary">
                {image.category}
                <ImageIcon size={18} />
              </span>
            </button>
          ))}
        </div>
      </div>
      {selectedImage && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-5" role="dialog" aria-modal="true" aria-label="Image preview">
          <button type="button" className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-lg bg-white text-purplePrimary" onClick={() => setSelectedImage(null)} aria-label="Close image preview">
            <X />
          </button>
          <figure className="max-w-[920px] overflow-hidden rounded-lg bg-white">
            <OptimizedImage src={selectedImage.src} alt={selectedImage.alt} className="max-h-[78vh] w-full object-contain" width="920" height="680" />
            <figcaption className="p-4 text-[15px] font-semibold text-darkText">{selectedImage.alt}</figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

function SocialMediaPage() {
  const platformIcons = {
    Instagram,
    YouTube: Youtube,
    TikTok: Music2,
  };

  return (
    <section id="social-media" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader eyebrow="Social Media" title="Stay connected across the ministry channels." subtitle="Social previews route visitors to official profile homepages and keep the website connected to current ministry communication." />
        <div className="grid gap-6 md:grid-cols-3">
          {socialHighlights.map((item) => {
            const Icon = platformIcons[item.platform] || ExternalLink;
            const link = connectSocialLinks.find((social) => social.label === item.platform)?.href || "#contact";

            return (
              <article key={item.platform} className="card card-hover">
                <Icon className="h-10 w-10 text-purplePrimary" />
                <h3 className="mt-5 text-[24px] font-bold leading-8">{item.platform}</h3>
                <p className="mt-2 text-[16px] font-semibold text-darkText">{item.title}</p>
                <p className="mt-3 text-[15px] leading-7 text-black/65">{item.text}</p>
                <a href={link} {...getExternalLinkProps(link)} className="mt-6 inline-flex items-center gap-2 text-[15px] font-bold text-purplePrimary">
                  Visit Profile <ExternalLink size={16} />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function EventsPage() {
  return (
    <section id="events" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader eyebrow="Upcoming Events" title="Join us live, online, and in the community." subtitle="Each event includes the essential details visitors need to participate or register." />
        <div className="grid gap-6 md:grid-cols-3">
          {ministryEvents.map((event) => (
            <article key={event.title} className="card card-hover overflow-hidden p-0">
              <OptimizedImage src={event.image} alt={event.title} className="h-[220px] w-full object-cover" width="420" height="220" />
              <div className="p-6">
                <h2 className="text-[24px] font-bold leading-8">{event.title}</h2>
                <div className="mt-4 grid gap-2 text-[14px] font-semibold text-black/65">
                  <span className="flex items-center gap-2"><Calendar size={16} className="text-purplePrimary" /> {event.date}</span>
                  <span className="flex items-center gap-2"><Clock size={16} className="text-purplePrimary" /> {event.time}</span>
                  <span className="flex items-center gap-2"><MapPin size={16} className="text-purplePrimary" /> {event.location}</span>
                </div>
                <p className="mt-4 text-[15px] leading-7 text-black/65">{event.description}</p>
                <div className="mt-6 flex flex-col gap-3">
                  <Button href={`#event-${event.slug}`}>View Details</Button>
                  <a href={event.link} {...getExternalLinkProps(event.link)} className="inline-flex h-[48px] items-center justify-center gap-2 rounded-lg border-2 border-purplePrimary px-5 text-[15px] font-bold text-purplePrimary transition hover:bg-purplePrimary hover:text-white">
                    Register <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventDetailPage({ event, platformState }) {
  const currentUser = getCurrentUser(platformState);
  const [status, setStatus] = useState("");

  if (!event) {
    return (
      <section className="section bg-white">
        <div className="container-custom">
          <p>This event could not be found.</p>
          <Button href="#events" className="mt-6">Back to Events</Button>
        </div>
      </section>
    );
  }

  const handleRegistration = (formEvent) => {
    formEvent.preventDefault();
    const formData = new FormData(formEvent.currentTarget);
    const nextState = submitEventRegistration({
      eventSlug: event.slug,
      eventTitle: event.title,
      capacity: event.capacity,
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
    });
    saveEventRegistrationRecord(nextState.eventRegistrations[0]).catch(() => {
      setStatus("Registration confirmed locally, but the database save failed.");
    });
    setStatus("Registration confirmed. A confirmation email has been queued.");
    formEvent.currentTarget.reset();
  };

  return (
    <section className="section bg-white fade-section">
      <div className="container-custom grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <OptimizedImage src={event.image} alt={event.title} className="h-[520px] w-full rounded-lg object-cover shadow-soft" width="620" height="520" />
        <div>
          <p className="small-label text-purplePrimary">Event Details</p>
          <h2 className="section-title mt-4">{event.title}</h2>
          <p className="mt-5 text-[18px] leading-8 text-black/65">{event.description}</p>
          <div className="mt-8 grid gap-4 rounded-lg bg-softBg p-6 text-[16px] font-semibold text-darkText">
            <span className="flex items-center gap-3"><Calendar className="text-purplePrimary" /> {event.date}</span>
            <span className="flex items-center gap-3"><Clock className="text-purplePrimary" /> {event.time}</span>
            <span className="flex items-center gap-3"><MapPin className="text-purplePrimary" /> {event.location}</span>
            {event.password && <span>Password: {event.password}</span>}
          </div>
          <form className="form-card mt-8" aria-label={`${event.title} registration form`} onSubmit={handleRegistration}>
            <input className="form-field" name="name" placeholder="Full name" aria-label="Full name" defaultValue={currentUser?.name || ""} required />
            <input className="form-field" name="email" placeholder="Email" aria-label="Email" type="email" defaultValue={currentUser?.email || ""} required />
            <input className="form-field" name="phone" placeholder="Phone number" aria-label="Phone number" defaultValue={currentUser?.phone || ""} />
            <button className="btn btn-primary" type="submit">Register for Event</button>
            {status && <p className="rounded-lg bg-softBg p-4 text-[15px] font-semibold text-purplePrimary" role="status">{status}</p>}
          </form>
          <Button href="#events" variant="outline" className="mt-4">Back to Events</Button>
        </div>
      </div>
    </section>
  );
}

function TestimonialsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTestimony = testimonyStories[activeIndex];
  const goToPrevious = () => setActiveIndex((current) => (current === 0 ? testimonyStories.length - 1 : current - 1));
  const goToNext = () => setActiveIndex((current) => (current + 1) % testimonyStories.length);

  return (
    <section id="testimonials" className="section bg-softBg fade-section">
      <div className="container-custom">
        <SectionHeader eyebrow="Testimonials" title="Stories that build trust and faith." subtitle="Structured testimonies help visitors understand the human impact of prayer, teaching, and community." />
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <OptimizedImage src={activeTestimony.image} alt={activeTestimony.name} className="h-[520px] w-full rounded-lg object-cover shadow-soft" width="560" height="520" />
          <article className="card">
            <Quote className="h-12 w-12 text-purplePrimary" />
            <p className="mt-6 text-[13px] font-bold uppercase tracking-widest text-purplePrimary">{activeTestimony.date}</p>
            <h2 className="mt-3 text-[34px] font-bold leading-[42px]">{activeTestimony.headline}</h2>
            <p className="mt-5 text-[20px] leading-9 text-black/70">“{activeTestimony.text}”</p>
            <p className="mt-6 text-[16px] font-bold text-darkText">{activeTestimony.name}</p>
            <div className="mt-8 flex gap-3">
              <button type="button" className="grid h-11 w-11 place-items-center rounded-lg border border-black/10 text-purplePrimary transition hover:bg-purplePrimary hover:text-white" onClick={goToPrevious} aria-label="Previous testimonial">
                <ChevronLeft />
              </button>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-lg border border-black/10 text-purplePrimary transition hover:bg-purplePrimary hover:text-white" onClick={goToNext} aria-label="Next testimonial">
                <ChevronRight />
              </button>
            </div>
          </article>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonyStories.map((testimony, index) => (
            <button
              key={testimony.name}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded-lg border p-5 text-left transition hover:-translate-y-1 hover:shadow-soft ${index === activeIndex ? "border-purplePrimary bg-white" : "border-black/5 bg-white/70"}`}
            >
              <p className="font-bold">{testimony.headline}</p>
              <p className="mt-2 text-[14px] text-black/60">{testimony.name}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function GivingPlatformPage({ platformState }) {
  const currentUser = getCurrentUser(platformState);
  const [status, setStatus] = useState("");
  const [selectedAmount, setSelectedAmount] = useState("50");
  const hasExternalCheckout = Boolean(paymentCheckoutLinks.stripe || paymentCheckoutLinks.paypal);

  const handleDonation = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = formData.get("customAmount") || selectedAmount;

    const nextState = submitDonationIntent({
      name: formData.get("name"),
      email: formData.get("email"),
      amount,
      fund: formData.get("fund"),
      frequency: formData.get("frequency"),
      method: formData.get("method"),
    });
    saveDonationRecord(nextState.donations[0]).catch(() => {
      setStatus("Donation intent saved locally, but the database save failed.");
    });

    setStatus(hasExternalCheckout ? "Donation intent saved. Continue to the secure provider checkout to complete the gift." : "Donation intent saved. Add Stripe or PayPal checkout URLs to enable live secure payment collection.");
    event.currentTarget.reset();
    setSelectedAmount("50");
  };

  return (
    <section id="give-online" className="section bg-white fade-section">
      <div className="container-custom grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <form className="form-card" aria-label="Online giving form" onSubmit={handleDonation}>
          <div>
            <p className="small-label text-purplePrimary">Online Giving</p>
            <h2 className="mt-4 text-[34px] font-bold leading-[42px]">Create a secure giving checkout.</h2>
            <p className="mt-3 text-[16px] leading-7 text-black/65">No card or wallet data is stored on this website. Payment details must be handled by a PCI-compliant provider such as Stripe, PayPal Giving, Tithe.ly, or Pushpay.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4" aria-label="Donation amounts">
            {["25", "50", "100", "250"].map((amount) => (
              <button key={amount} type="button" onClick={() => setSelectedAmount(amount)} className={`h-12 rounded-lg border text-[15px] font-bold transition ${selectedAmount === amount ? "bg-purplePrimary text-white" : "border-black/10 bg-white text-darkText hover:bg-softBg"}`}>
                {formatCurrency(amount)}
              </button>
            ))}
          </div>
          <input className="form-field" name="customAmount" placeholder="Custom amount" aria-label="Custom amount" inputMode="decimal" />
          <select className="form-field" name="fund" aria-label="Donation purpose" defaultValue={donationFunds[0]}>
            {donationFunds.map((fund) => <option key={fund}>{fund}</option>)}
          </select>
          <select className="form-field" name="frequency" aria-label="Giving frequency" defaultValue="One-time">
            <option>One-time</option>
            <option>Monthly recurring</option>
            <option>Weekly recurring</option>
          </select>
          <select className="form-field" name="method" aria-label="Payment method" defaultValue={paymentMethods[0]}>
            {paymentMethods.map((method) => <option key={method}>{method}</option>)}
          </select>
          <input className="form-field" name="name" placeholder="Donor name" aria-label="Donor name" defaultValue={currentUser?.name || ""} required />
          <input className="form-field" name="email" placeholder="Email for receipt" aria-label="Email for receipt" type="email" defaultValue={currentUser?.email || ""} required />
          <button className="btn btn-primary" type="submit">
            <CreditCard size={18} />
            Create Secure Checkout
          </button>
          {hasExternalCheckout && (
            <a className="btn btn-outline" href={paymentCheckoutLinks.stripe || paymentCheckoutLinks.paypal} {...getExternalLinkProps(paymentCheckoutLinks.stripe || paymentCheckoutLinks.paypal)}>
              Continue to Payment Provider
            </a>
          )}
          {status && <p className="rounded-lg bg-softBg p-4 text-[15px] font-semibold text-purplePrimary" role="status">{status}</p>}
        </form>

        <aside className="grid gap-5">
          <InfoCard icon={LockKeyhole} title="Security & Compliance" text="SSL, PCI-compliant checkout, encrypted transaction handling, and fraud prevention belong in the connected payment provider. This site records only donation intent metadata." />
          <InfoCard icon={Mail} title="Receipts & Confirmations" text="Donation confirmation and email receipt notifications are queued for the future email provider integration." />
          <InfoCard icon={Database} title="Giving Records" text={`${platformState.donations.length} donation workflow record${platformState.donations.length === 1 ? "" : "s"} currently captured in the local platform store.`} />
        </aside>
      </div>
    </section>
  );
}

function MemberPortalPage({ platformState }) {
  const currentUser = getCurrentUser(platformState);
  const [status, setStatus] = useState("");

  const handleSignup = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextState = createMember({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      location: formData.get("location"),
      emailOptIn: formData.get("emailOptIn") === "on",
      smsOptIn: formData.get("smsOptIn") === "on",
    });
    const member = getCurrentUser(nextState);
    if (member) {
      saveMemberRecord(member).catch(() => {
        setStatus("Profile created locally, but the database save failed.");
      });
    }
    setStatus("Profile created and email verification simulated. You are now signed in.");
    event.currentTarget.reset();
  };

  const handleLogin = (event) => {
    event.preventDefault();
    try {
      loginMember(new FormData(event.currentTarget).get("email"));
      setStatus("Login successful.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextState = updateCurrentMember({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      location: formData.get("location"),
      emailOptIn: formData.get("emailOptIn") === "on",
      smsOptIn: formData.get("smsOptIn") === "on",
    });
    const member = getCurrentUser(nextState);
    if (member) {
      saveMemberRecord(member).catch(() => {
        setStatus("Profile updated locally, but the database save failed.");
      });
    }
    setStatus("Profile updated.");
  };

  const myRegistrations = platformState.eventRegistrations.filter((registration) => registration.userId === currentUser?.id || registration.email === currentUser?.email);
  const myDonations = platformState.donations.filter((donation) => donation.userId === currentUser?.id || donation.email === currentUser?.email);

  return (
    <section id="member-portal" className="section bg-white fade-section">
      <div className="container-custom">
        {status && <p className="mb-6 rounded-lg bg-softBg p-4 text-[15px] font-semibold text-purplePrimary" role="status">{status}</p>}

        {!currentUser ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <form className="form-card" aria-label="Member signup form" onSubmit={handleSignup}>
              <UserPlus className="h-10 w-10 text-purplePrimary" />
              <h2 className="text-[30px] font-bold leading-9">Create your member profile</h2>
              <input className="form-field" name="name" placeholder="Full name" aria-label="Full name" required />
              <input className="form-field" name="email" placeholder="Email" aria-label="Signup email" type="email" required />
              <input className="form-field" name="phone" placeholder="Phone number" aria-label="Phone number" required />
              <input className="form-field" name="location" placeholder="Location (optional)" aria-label="Location" />
              <label className="flex items-center gap-3 text-[14px] font-semibold text-black/70"><input name="emailOptIn" type="checkbox" defaultChecked /> Receive email updates</label>
              <label className="flex items-center gap-3 text-[14px] font-semibold text-black/70"><input name="smsOptIn" type="checkbox" /> Receive SMS alerts</label>
              <button className="btn btn-primary" type="submit">Create Profile</button>
            </form>

            <form className="form-card" aria-label="Member login form" onSubmit={handleLogin}>
              <LogIn className="h-10 w-10 text-purplePrimary" />
              <h2 className="text-[30px] font-bold leading-9">Log in</h2>
              <p className="text-[16px] leading-7 text-black/65">This prototype uses email-only local sessions. Production should use Firebase Auth, Auth0, Clerk, or a secure backend auth service for passwords, resets, and verification.</p>
              <input className="form-field" name="email" placeholder="Email" aria-label="Login email" type="email" required />
              <button className="btn btn-primary" type="submit">Start Session</button>
              <button className="btn btn-outline" type="button" onClick={() => setStatus("Password reset email queued for the future auth provider.")}>Reset Password</button>
            </form>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <form className="form-card" aria-label="Member profile form" onSubmit={handleUpdate}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="small-label text-purplePrimary">{currentUser.role}</p>
                  <h2 className="mt-3 text-[30px] font-bold leading-9">{currentUser.name}</h2>
                  <p className="mt-2 text-[15px] text-black/60">{currentUser.verified ? "Email verified" : "Email verification pending"}</p>
                </div>
                <button className="btn btn-outline" type="button" onClick={() => { logoutMember(); setStatus("Logged out."); }}>
                  <LogOut size={18} /> Log Out
                </button>
              </div>
              <input className="form-field" name="name" aria-label="Full name" defaultValue={currentUser.name} required />
              <input className="form-field" name="email" aria-label="Email" type="email" defaultValue={currentUser.email} required />
              <input className="form-field" name="phone" aria-label="Phone number" defaultValue={currentUser.phone} />
              <input className="form-field" name="location" aria-label="Location" defaultValue={currentUser.location} />
              <label className="flex items-center gap-3 text-[14px] font-semibold text-black/70"><input name="emailOptIn" type="checkbox" defaultChecked={currentUser.communication?.email} /> Subscribe to email updates</label>
              <label className="flex items-center gap-3 text-[14px] font-semibold text-black/70"><input name="smsOptIn" type="checkbox" defaultChecked={currentUser.communication?.sms} /> Subscribe to SMS alerts</label>
              <button className="btn btn-primary" type="submit">Update Profile</button>
            </form>

            <div className="grid gap-6">
              <DashboardPanel title="Upcoming Registrations" emptyText="No event registrations yet." rows={myRegistrations.map((item) => `${item.eventTitle} • ${item.status} • ${item.ticketCode}`)} />
              <DashboardPanel title="Donation Workflows" emptyText="No donation records yet." rows={myDonations.map((item) => `${item.fund} • ${formatCurrency(item.amount)} • ${item.status}`)} />
              <InfoCard icon={Bell} title="Communication Preferences" text={`Email updates are ${currentUser.communication?.email ? "enabled" : "disabled"} and SMS alerts are ${currentUser.communication?.sms ? "enabled" : "disabled"}.`} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function AdminDashboardPage({ platformState }) {
  const [status, setStatus] = useState("");
  const [selectedImageId, setSelectedImageId] = useState("");
  const currentUser = getCurrentUser(platformState);
  const totalDonations = platformState.donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);

  const handleAdminLogin = () => {
    loginMember("admin@chosenwarriors.local");
    setStatus("Signed in as ministry admin.");
  };

  const handleCreateEvent = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newEvent = {
      slug: String(formData.get("title")).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      title: formData.get("title"),
      date: formData.get("date"),
      time: formData.get("time"),
      location: formData.get("location"),
      description: formData.get("description"),
      capacity: Number(formData.get("capacity") || 50),
    };
    writePlatformState({ ...platformState, events: [newEvent, ...platformState.events] });
    setStatus("Admin event draft saved locally.");
    event.currentTarget.reset();
  };

  const handleMediaImageSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const imageFile = formData.get("image");

    if (!(imageFile instanceof File) || !imageFile.size) {
      setStatus("Choose an image file before saving media.");
      return;
    }

    const imagePayload = {
      src: await readImageFile(imageFile),
      alt: formData.get("alt"),
      category: formData.get("category"),
    };

    if (selectedImageId) {
      updateMediaImage(selectedImageId, imagePayload);
      try {
        await updateMediaImageRecord(selectedImageId, imagePayload);
        setStatus("Gallery image changed and saved for the website.");
      } catch {
        setStatus("Gallery image changed locally, but the database save failed.");
      }
    } else {
      const nextState = addMediaImage(imagePayload);
      try {
        await saveMediaImageRecord(nextState.mediaImages[0]);
        setStatus("Gallery image uploaded and saved for the website.");
      } catch {
        setStatus("Gallery image uploaded locally, but the database save failed.");
      }
    }

    setSelectedImageId("");
    form.reset();
  };

  const handleMediaVideoSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const nextState = addMediaVideo({
        title: formData.get("title"),
        youtubeUrl: formData.get("youtubeUrl"),
        category: formData.get("category"),
        description: formData.get("description"),
      });
      saveMediaVideoRecord(nextState.mediaVideos[0]).catch(() => {
        setStatus("YouTube video loaded locally, but the database save failed.");
      });
      setStatus("YouTube video loaded into the media library.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const downloadContacts = () => {
    const csv = exportCsv(platformState.users, [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "location", label: "Location" },
      { key: "role", label: "Role" },
    ]);
    downloadText("chosen-warriors-contacts.csv", csv);
  };

  return (
    <section id="admin" className="section bg-white fade-section">
      <div className="container-custom">
        {status && <p className="mb-6 rounded-lg bg-softBg p-4 text-[15px] font-semibold text-purplePrimary" role="status">{status}</p>}
        {currentUser?.role !== "Admin" ? (
          <div className="card mx-auto max-w-[680px] text-center">
            <LockKeyhole className="mx-auto h-12 w-12 text-purplePrimary" />
            <h2 className="mt-5 text-[32px] font-bold leading-10">Admin access required</h2>
            <p className="mx-auto mt-4 max-w-[540px] text-[16px] leading-7 text-black/65">Use the seeded local admin account to preview administrative workflows. Production should enforce role-based access control on the backend.</p>
            <button className="btn btn-primary mt-8" type="button" onClick={handleAdminLogin}>Preview Admin Dashboard</button>
          </div>
        ) : (
          <div className="grid gap-8">
            <div className="grid gap-5 md:grid-cols-4">
              <MetricCard label="Members" value={platformState.users.length} icon={Users} />
              <MetricCard label="Donation Intent" value={formatCurrency(totalDonations)} icon={CreditCard} />
              <MetricCard label="Registrations" value={platformState.eventRegistrations.length} icon={Calendar} />
              <MetricCard label="Prayer Requests" value={platformState.prayerRequests.length} icon={HeartHandshake} />
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <AdminTable title="CRM Lite Contacts" action={<button className="btn btn-outline" type="button" onClick={downloadContacts}><Download size={18} /> Export CSV</button>}>
                {platformState.users.map((user) => (
                  <AdminRow key={user.id} title={user.name} meta={`${user.role} • ${user.email}`} detail={user.phone || "No phone"} />
                ))}
              </AdminTable>

              <form className="form-card" aria-label="Admin event form" onSubmit={handleCreateEvent}>
                <UserCog className="h-10 w-10 text-purplePrimary" />
                <h2 className="text-[28px] font-bold leading-9">Create event draft</h2>
                <input className="form-field" name="title" placeholder="Event title" aria-label="Event title" required />
                <input className="form-field" name="date" placeholder="Date" aria-label="Date" required />
                <input className="form-field" name="time" placeholder="Time" aria-label="Time" required />
                <input className="form-field" name="location" placeholder="Location" aria-label="Location" required />
                <input className="form-field" name="capacity" placeholder="Capacity" aria-label="Capacity" inputMode="numeric" />
                <textarea className="form-field h-[120px] resize-none py-4" name="description" placeholder="Description" aria-label="Description" required />
                <button className="btn btn-primary" type="submit">Save Draft</button>
              </form>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <AdminTable title="Content Management">
                {[
                  ["Homepage", "Hero, event highlight, donation CTA, newsletter"],
                  ["Events", `${ministryEvents.length + platformState.events.length} published or drafted events`],
                  ["Media", `${featuredMessages.length + platformState.mediaVideos.length} message records and ${galleryImages.length + platformState.mediaImages.length} gallery images`],
                  ["Testimonials", `${testimonyStories.length} testimony records`],
                  ["Donations", `${platformState.donations.length} giving workflow records`],
                ].map(([title, detail]) => (
                  <AdminRow key={title} title={title} meta="Manageable content" detail={detail} />
                ))}
              </AdminTable>

              <AdminTable title="Prayer Team Dashboard">
                {platformState.prayerRequests.length ? platformState.prayerRequests.map((request) => (
                  <div key={request.id} className="rounded-lg border border-black/10 p-4">
                    <p className="font-bold">{request.name}</p>
                    <p className="mt-2 text-[14px] leading-6 text-black/65">{request.message}</p>
                    <div className="mt-4 flex gap-2">
                      {["New", "Prayed For", "Follow Up"].map((statusOption) => (
                        <button key={statusOption} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-bold hover:bg-black hover:text-white" type="button" onClick={() => updatePrayerStatus(request.id, statusOption)}>{statusOption}</button>
                      ))}
                    </div>
                  </div>
                )) : <p className="text-[15px] text-black/60">No prayer requests yet.</p>}
              </AdminTable>

              <AdminTable title="Contact Messages">
                {platformState.contactMessages.length ? platformState.contactMessages.slice(0, 6).map((message) => (
                  <AdminRow key={message.id} title={message.name} meta={message.email || "No email provided"} detail={message.message} />
                )) : <p className="text-[15px] text-black/60">No contact messages yet.</p>}
              </AdminTable>

              <AdminTable title="Communication Queue">
                {platformState.notifications.slice(0, 6).map((notification) => (
                  <AdminRow key={notification.id} title={notification.title} meta={`${notification.channel} • ${notification.status}`} detail={notification.message} />
                ))}
              </AdminTable>

              <AdminTable title="Integration Readiness">
                {Object.entries(integrationStatus).map(([key, value]) => (
                  <AdminRow key={key} title={key} meta="Pending API credentials" detail={value} />
                ))}
              </AdminTable>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <form className="form-card" aria-label="Admin media image form" onSubmit={handleMediaImageSubmit}>
                <ImageIcon className="h-10 w-10 text-purplePrimary" />
                <h2 className="text-[28px] font-bold leading-9">Upload or change pictures</h2>
                <select className="form-field" aria-label="Picture to replace" value={selectedImageId} onChange={(event) => setSelectedImageId(event.target.value)}>
                  <option value="">Add new gallery picture</option>
                  {platformState.mediaImages.map((image) => (
                    <option key={image.id} value={image.id}>{image.alt}</option>
                  ))}
                </select>
                <input className="form-field" name="image" type="file" accept="image/*" aria-label="Picture file" required />
                <input className="form-field" name="alt" placeholder="Image description" aria-label="Image description" required />
                <input className="form-field" name="category" placeholder="Category" aria-label="Image category" defaultValue="Ministry" required />
                <button className="btn btn-primary" type="submit">Save Picture</button>
              </form>

              <form className="form-card" aria-label="Admin YouTube video form" onSubmit={handleMediaVideoSubmit}>
                <Youtube className="h-10 w-10 text-purplePrimary" />
                <h2 className="text-[28px] font-bold leading-9">Load YouTube videos</h2>
                <input className="form-field" name="title" placeholder="Video title" aria-label="Video title" required />
                <input className="form-field" name="youtubeUrl" placeholder="YouTube URL or video ID" aria-label="YouTube URL or video ID" required />
                <input className="form-field" name="category" placeholder="Category" aria-label="Video category" defaultValue="Teaching" required />
                <textarea className="form-field h-[120px] resize-none py-4" name="description" placeholder="Video description" aria-label="Video description" required />
                <button className="btn btn-primary" type="submit">Load Video</button>
              </form>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <AdminTable title="Uploaded Pictures">
                {platformState.mediaImages.length ? platformState.mediaImages.map((image) => (
                  <AdminRow key={image.id} title={image.alt} meta={image.category} detail="Visible in the media gallery." />
                )) : <p className="text-[15px] text-black/60">No admin-uploaded pictures yet.</p>}
              </AdminTable>

              <AdminTable title="Loaded Videos">
                {platformState.mediaVideos.length ? platformState.mediaVideos.map((video) => (
                  <AdminRow key={video.id} title={video.title} meta={video.category} detail={video.url} />
                )) : <p className="text-[15px] text-black/60">No admin-loaded YouTube videos yet.</p>}
              </AdminTable>
            </div>

            <div className="card">
              <h2 className="text-[28px] font-bold leading-9">Communication Segments</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {communicationSegments.map((segment) => <span key={segment} className="rounded-lg border border-black/10 px-4 py-2 text-[14px] font-bold">{segment}</span>)}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function InfoCard({ icon: Icon, text, title }) {
  return (
    <article className="card card-hover">
      <Icon className="h-10 w-10 text-purplePrimary" />
      <h3 className="mt-5 text-[24px] font-bold leading-8">{title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-black/65">{text}</p>
    </article>
  );
}

function DashboardPanel({ emptyText, rows, title }) {
  return (
    <article className="card">
      <h3 className="text-[24px] font-bold leading-8">{title}</h3>
      <div className="mt-4 grid gap-3">
        {rows.length ? rows.map((row) => <p key={row} className="rounded-lg bg-softBg p-4 text-[15px] font-semibold">{row}</p>) : <p className="text-[15px] text-black/60">{emptyText}</p>}
      </div>
    </article>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-black/5 bg-white p-6 shadow-soft">
      <Icon className="h-8 w-8 text-purplePrimary" />
      <p className="mt-5 text-[30px] font-extrabold">{value}</p>
      <p className="mt-1 text-[14px] font-bold uppercase tracking-widest text-black/55">{label}</p>
    </article>
  );
}

function AdminTable({ action, children, title }) {
  return (
    <article className="card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[24px] font-bold leading-8">{title}</h2>
        {action}
      </div>
      <div className="mt-5 grid gap-3">{children}</div>
    </article>
  );
}

function AdminRow({ detail, meta, title }) {
  return (
    <div className="rounded-lg border border-black/10 p-4">
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-[13px] font-semibold uppercase tracking-widest text-black/55">{meta}</p>
      <p className="mt-2 text-[14px] leading-6 text-black/65">{detail}</p>
    </div>
  );
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(new Error("Unable to read the selected image.")));
    reader.readAsDataURL(file);
  });
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ContactPage() {
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;
    const message = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    setIsSending(true);

    try {
      await sendContactEmail(message);
      submitContactMessage(message);
      setStatus("Thanks for reaching out. Your message has been received and emailed to chosenwarriorsofficial@gmail.com.");
      form.reset();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="section bg-white fade-section">
      <div className="container-custom grid gap-8 lg:grid-cols-2">
        <div className="card">
          <Mail className="h-10 w-10 text-purplePrimary" />
          <h2 className="mt-5 text-[30px] font-bold leading-9">We would love to hear from you.</h2>
          <p className="mt-4 text-[18px] leading-8 text-black/65">
            Join the community, send a message, or submit a prayer request. The ministry team is ready to connect.
          </p>
          <div className="mt-8 grid gap-3 text-[15px] font-semibold">
            <a href={`mailto:${contactEmail}`} className="text-purplePrimary">{contactEmail}</a>
            <a href={socialLinks.whatsapp} {...getExternalLinkProps(socialLinks.whatsapp)} className="text-purplePrimary">Join Community</a>
          </div>
        </div>
        <form className="form-card" aria-label="Contact form" onSubmit={handleSubmit}>
          <input className="form-field" name="name" placeholder="Name" aria-label="Name" autoComplete="name" />
          <input className="form-field" name="email" placeholder="Email" aria-label="Email" autoComplete="email" type="email" />
          <textarea className="form-field h-[160px] resize-none py-4" name="message" placeholder="Message" aria-label="Message" required />
          <button className="btn btn-primary" type="submit" disabled={isSending}>{isSending ? "Sending..." : "Send Message"}</button>
          <Button href="#prayer-requests" variant="outline">Submit Prayer Request</Button>
          {status && (
            <p className="rounded-lg bg-softBg p-4 text-[15px] font-semibold text-purplePrimary" role="status">{status}</p>
          )}
        </form>
      </div>
    </section>
  );
}
