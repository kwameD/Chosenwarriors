import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  HeartHandshake,
  Image as ImageIcon,
  Instagram,
  Mail,
  MapPin,
  Music2,
  PlayCircle,
  Quote,
  Search,
  ShieldCheck,
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
import { contactEmail, connectSocialLinks, ministryName, socialLinks } from "./config/siteConfig";
import {
  coreValues,
  featuredMessages,
  galleryImages,
  impactStats,
  leadershipProfiles,
  ministryEvents,
  ministryTimeline,
  siteImages,
  socialHighlights,
  testimonyStories,
} from "./content/siteContent";
import { getExternalLinkProps } from "./utils/links";
import { Hero, Newsletter, Prayer } from "./sections";

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

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(getRouteFromHash());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleRouteChange);
    return () => window.removeEventListener("hashchange", handleRouteChange);
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        {route === "home" ? <HomePage /> : <InteriorPage route={route} />}
      </main>
      <Footer />
    </>
  );
}

function HomePage() {
  return homeSections.map((Section) => <Section key={Section.name} />);
}

function InteriorPage({ route }) {
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
        <MediaLibrary />
        <MediaGallery />
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
        <MediaGallery />
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

  if (route.startsWith("event-")) {
    const event = ministryEvents.find((item) => `event-${item.slug}` === route);

    return (
      <PageShell eyebrow="Event Details" title={event?.title || "Event Details"}>
        <EventDetailPage event={event} />
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
          <Button href="#give" variant="white">
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

function MediaLibrary() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const categories = ["All", ...new Set(featuredMessages.map((message) => message.category))];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredMessages = featuredMessages.filter((message) => {
    const matchesCategory = activeCategory === "All" || message.category === activeCategory;
    const matchesQuery = [message.title, message.description, message.category].join(" ").toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
  const featuredMessage = featuredMessages[0];

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

function MediaGallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section id="media-gallery" className="section bg-softBg fade-section">
      <div className="container-custom">
        <SectionHeader eyebrow="Media Gallery" title="Authentic ministry photography and event highlights." subtitle="Browse leadership, prayer, media, and outreach moments from the ministry." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {galleryImages.map((image) => (
            <button key={`${image.category}-${image.alt}`} type="button" onClick={() => setSelectedImage(image)} className="group overflow-hidden rounded-lg bg-white text-left shadow-soft">
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

function EventDetailPage({ event }) {
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
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={event.link}>Register Now</Button>
            <Button href="#events" variant="outline">Back to Events</Button>
          </div>
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

function ContactPage() {
  const [status, setStatus] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus("Thanks for reaching out. Your message has been received and the ministry team will follow up.");
    event.currentTarget.reset();
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
          <input className="form-field" placeholder="Name" aria-label="Name" autoComplete="name" />
          <input className="form-field" placeholder="Email" aria-label="Email" autoComplete="email" type="email" />
          <textarea className="form-field h-[160px] resize-none py-4" placeholder="Message" aria-label="Message" />
          <button className="btn btn-primary" type="submit">Send Message</button>
          <Button href="#prayer-requests" variant="outline">Submit Prayer Request</Button>
          {status && <p className="rounded-lg bg-softBg p-4 text-[15px] font-semibold text-purplePrimary" role="status">{status}</p>}
        </form>
      </div>
    </section>
  );
}
