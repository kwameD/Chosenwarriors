import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  HeartHandshake,
  Mail,
  MapPin,
  Quote,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { Button } from "./components/ui/Button";
import { OptimizedImage } from "./components/ui/OptimizedImage";
import { SectionHeader } from "./components/ui/SectionHeader";
import { contactEmail, ministryName, socialLinks } from "./config/siteConfig";
import {
  coreValues,
  impactStats,
  leadershipProfiles,
  ministryEvents,
  ministryTimeline,
  siteImages,
  testimonyStories,
} from "./content/siteContent";
import {
  loadEditableContent,
  loginAdmin,
  readEditableContent,
  saveEditableContentToServer,
  subscribeToEditableContent,
  uploadAdminImage,
} from "./services/editableContent";
import { getExternalLinkProps } from "./utils/links";
import { Hero, Newsletter, Prayer } from "./sections";
import {
  readPlatformState,
  submitContactMessage,
  subscribeToPlatformStore,
  writePlatformState,
} from "./services/platformStore";
import { sendContactEmail } from "./services/ministryEmailApi";
import { loadPlatformRecords } from "./services/platformApi";

const routeTitles = {
  home: "Home",
  about: "About",
  events: "Events",
  contact: "Contact",
  "mission-vision": "Mission & Vision",
  leadership: "Leadership",
  testimonials: "Testimonials",
  "prayer-requests": "Prayer Requests",
  foundation: "Foundation",
  admin: "Admin",
};

function getRouteFromHash() {
  const hash = window.location.hash.replace("#", "");
  const content = readEditableContent();
  if (hash.startsWith("event-") && content.ministryEvents.some((event) => `event-${event.slug}` === hash)) {
    return hash;
  }
  return routeTitles[hash] ? hash : "home";
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromHash);
  const [platformState, setPlatformState] = useState(readPlatformState);
  const [editableContent, setEditableContent] = useState(readEditableContent);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(getRouteFromHash());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleRouteChange);
    return () => window.removeEventListener("hashchange", handleRouteChange);
  }, []);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      setScrollProgress(Math.min(Math.max(nextProgress, 0), 1));
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, [route]);

  useEffect(() => subscribeToPlatformStore(setPlatformState), []);
  useEffect(() => subscribeToEditableContent(setEditableContent), []);

  useEffect(() => {
    loadEditableContent().catch(() => {
      // Local content remains available if the server is offline.
    });
  }, []);

  useEffect(() => {
    loadPlatformRecords()
      .then((records) => {
        const state = readPlatformState();
        writePlatformState({
          ...state,
          contactMessages: mergeById(records.contactMessages, state.contactMessages),
          prayerRequests: mergeById(records.prayerRequests, state.prayerRequests),
        });
      })
      .catch(() => {
        // The app remains usable with local storage when the backend is unavailable.
      });
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const elements = [...document.querySelectorAll(".fade-section, .card-hover, .section-title")];

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    elements.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [route]);

  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        {route === "home" ? <HomePage content={editableContent} /> : <InteriorPage route={route} platformState={platformState} content={editableContent} />}
      </main>
      <Footer />
    </>
  );
}

function HomePage({ content }) {
  return (
    <>
      <Hero siteImageCrops={content.siteImageCrops} siteImages={content.siteImages} />
      <MinistryOverview />
      <EventHighlight events={content.ministryEvents} featuredEventSlug={content.settings.featuredEventSlug} />
      <TestimonialPreview testimonies={content.testimonyStories} />
      <PartnerCta />
      <Newsletter />
    </>
  );
}

function getCropStyle({ cropX = 50, cropY = 18 } = {}) {
  return { objectPosition: `${cropX}% ${cropY}%` };
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

function InteriorPage({ content, platformState, route }) {
  const pageTitle = routeTitles[route];

  if (route === "about") {
    return (
      <PageShell eyebrow="About Chosen Warriors" title="A ministry built for prayer, discipleship, and transformation.">
        <AboutOverview siteImageCrops={content.siteImageCrops} siteImages={content.siteImages} />
        <MissionVisionContent />
        <FoundationPage siteImageCrops={content.siteImageCrops} siteImages={content.siteImages} compact />
      </PageShell>
    );
  }

  if (route === "events") {
    return (
      <PageShell eyebrow="Events" title="Gather with us online, in prayer, and in service.">
        <EventsPage events={content.ministryEvents} />
      </PageShell>
    );
  }

  if (route === "contact") {
    return (
      <PageShell eyebrow="Contact" title="Connect with the ministry and take your next step.">
        <ContactPage settings={content.settings} />
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
        <LeadershipPage leadershipProfiles={content.leadershipProfiles} />
      </PageShell>
    );
  }

  if (route === "testimonials") {
    return (
      <PageShell eyebrow="Testimonials" title="Stories of God’s faithfulness.">
        <TestimonialsPage testimonies={content.testimonyStories} />
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
        <FoundationPage siteImageCrops={content.siteImageCrops} siteImages={content.siteImages} />
      </PageShell>
    );
  }

  if (route.startsWith("event-")) {
    const event = content.ministryEvents.find((item) => `event-${item.slug}` === route);

    return (
      <PageShell eyebrow="Event Details" title={event?.title || "Event Details"}>
        <EventDetailPage event={event} platformState={platformState} />
      </PageShell>
    );
  }

  if (route === "admin") {
    return (
      <PageShell eyebrow="Admin" title="Update ministry content safely.">
        <AdminPage content={content} />
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
      <section className="page-hero py-16 text-white md:py-20">
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
    { icon: HeartHandshake, title: "Impact", text: "Lives strengthened through clear teaching, community support, and practical care." },
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
            <article key={title} className="card card-hover color-pop-card">
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

function EventHighlight({ events, featuredEventSlug }) {
  const event = events.find((item) => item.slug === featuredEventSlug) || events.find((item) => item.slug !== "daily-prayer-meeting") || events[0];

  return (
    <section id="events" className="section bg-softBg fade-section">
      <div className="container-custom grid items-center gap-10 lg:grid-cols-2">
        <OptimizedImage src={event.image} alt={event.title} className="h-[420px] w-full rounded-lg object-cover shadow-soft" style={getCropStyle(event)} width="640" height="420" />
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

function TestimonialPreview({ testimonies = testimonyStories }) {
  const testimony = testimonies[0];

  if (!testimony) {
    return null;
  }

  return (
    <section id="testimonials" className="section bg-softBg fade-section">
      <div className="container-custom">
        <article className="color-pop-card mx-auto max-w-[820px] rounded-lg bg-white p-8 text-center shadow-soft md:p-12">
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

function PartnerCta() {
  return (
    <section id="partner" className="joy-band section text-white fade-section">
      <div className="container-custom grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="small-label bg-white/10 text-goldAccent">Partner With Us</p>
          <h2 className="mt-5 text-[40px] font-bold leading-[48px] md:text-[48px] md:leading-[56px]">Take your next step in prayer, service, and community.</h2>
          <p className="mt-5 max-w-[700px] text-[18px] leading-8 text-white/75">
            Whether you are joining a gathering, serving with the team, or asking for pastoral support, we would love to walk with you.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
          <Button href="#contact" variant="white">
            Connect With Us
          </Button>
          <Button href="#events" variant="secondary">
            View Gatherings
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
            <article key={value.title} className="rounded-lg border border-purplePrimary/10 bg-white/80 p-5 transition hover:-translate-y-1 hover:bg-warmGold hover:shadow-soft">
              <h3 className="text-[20px] font-bold leading-7">{value.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-black/65">{value.text}</p>
            </article>
          ))}
        </div>
        <aside className="joy-band mt-8 rounded-lg p-8 text-white md:p-10">
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

function AboutOverview({ siteImageCrops = {}, siteImages: editableSiteImages = siteImages }) {
  const heroCrop = siteImageCrops.hero || { cropX: 50, cropY: 18 };

  return (
    <section id="about" className="section bg-white fade-section">
      <div className="container-custom grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <OptimizedImage src={editableSiteImages.hero} alt="Chosen Warriors ministry leadership" className="h-[520px] w-full rounded-lg object-cover shadow-soft" style={getCropStyle(heroCrop)} width="600" height="520" />
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

function LeadershipPage({ leadershipProfiles: editableLeadershipProfiles = leadershipProfiles }) {
  return (
    <section id="leadership" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader eyebrow="Meet the Leadership" title="Servant leadership with a clear ministry burden." subtitle="Learn who is stewarding the work, the foundation, and the community experience." />
        <div className="grid gap-8 md:grid-cols-2">
          {editableLeadershipProfiles.map((member) => (
            <article key={member.name} className="card card-hover overflow-hidden p-0">
              <div className="overflow-hidden">
                <OptimizedImage
                  src={member.image}
                  alt={member.name}
                  className="h-[340px] w-full object-cover transition duration-300 hover:scale-105"
                  style={getCropStyle(member)}
                  width="560"
                  height="340"
                />
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

function FoundationPage({ compact = false, siteImageCrops = {}, siteImages: editableSiteImages = siteImages }) {
  const foundationCrop = siteImageCrops.foundationHero || { cropX: 50, cropY: 18 };

  return (
    <section id="foundation" className="section bg-softBg fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Foundation & Outreach"
          title="Chosen to Rescue serves children and families with practical love."
          subtitle="The foundation expression of the ministry focuses on outreach, mentorship, evangelism, and restoring dignity through compassionate action."
        />
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <OptimizedImage src={editableSiteImages.foundationHero} alt="Chosen to Rescue outreach" className="h-[460px] w-full rounded-lg object-cover shadow-soft" style={getCropStyle(foundationCrop)} width="600" height="460" />
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

function EventsPage({ events }) {
  return (
    <section id="events" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader eyebrow="Upcoming Events" title="Join us live, online, and in the community." subtitle="Each event includes the essential details visitors need to participate or register." />
        <div className="grid gap-6 md:grid-cols-3">
          {events.map((event) => (
            <article key={event.title} className="card card-hover overflow-hidden p-0">
              <OptimizedImage src={event.image} alt={event.title} className="h-[220px] w-full object-cover" style={getCropStyle(event)} width="420" height="220" />
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
                    Join <ArrowRight size={16} />
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
        <OptimizedImage src={event.image} alt={event.title} className="h-[520px] w-full rounded-lg object-cover shadow-soft" style={getCropStyle(event)} width="620" height="520" />
        <div>
          <p className="small-label text-purplePrimary">Event Details</p>
          <h2 className="section-title mt-4">{event.title}</h2>
          <div className="mt-8 grid gap-4 rounded-lg bg-softBg p-6 text-[16px] font-semibold text-darkText">
            <span className="flex items-center gap-3"><Calendar className="text-purplePrimary" /> {event.date}</span>
            <span className="flex items-center gap-3"><Clock className="text-purplePrimary" /> {event.time}</span>
            <span className="flex items-center gap-3"><MapPin className="text-purplePrimary" /> {event.location}</span>
            <span className="text-[16px] font-medium leading-7 text-black/65">{event.description}</span>
          </div>
          <Button href="#events" variant="outline" className="mt-4">Back to Events</Button>
        </div>
      </div>
    </section>
  );
}

function TestimonialsPage({ testimonies = testimonyStories }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTestimony = testimonies[activeIndex] || testimonies[0];
  const goToPrevious = () => setActiveIndex((current) => (current === 0 ? testimonies.length - 1 : current - 1));
  const goToNext = () => setActiveIndex((current) => (current + 1) % testimonies.length);

  useEffect(() => {
    setActiveIndex((current) => (current >= testimonies.length ? 0 : current));
  }, [testimonies.length]);

  if (!activeTestimony) {
    return (
      <section id="testimonials" className="section bg-softBg fade-section">
        <div className="container-custom">
          <SectionHeader eyebrow="Testimonials" title="Stories that build trust and faith." subtitle="New member testimonies will appear here soon." />
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="section bg-softBg fade-section">
      <div className="container-custom">
        <SectionHeader eyebrow="Testimonials" title="Stories that build trust and faith." subtitle="Structured testimonies help visitors understand the human impact of prayer, teaching, and community." />
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <OptimizedImage src={activeTestimony.image} alt={activeTestimony.name} className="h-[520px] w-full rounded-lg object-cover shadow-soft" style={getCropStyle(activeTestimony)} width="560" height="520" />
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
          {testimonies.map((testimony, index) => (
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

function AdminPage({ content }) {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(() => window.sessionStorage.getItem("cw_admin_unlocked") === "true");
  const [draftContent, setDraftContent] = useState(content);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState("");

  useEffect(() => {
    setDraftContent(content);
  }, [content]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await loginAdmin(password);
      window.sessionStorage.setItem("cw_admin_unlocked", "true");
      setIsUnlocked(true);
      setStatus("Admin console unlocked.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (field, value) => {
    setDraftContent((current) => ({
      ...current,
      siteImages: {
        ...current.siteImages,
        [field]: value,
      },
    }));
  };

  const handleSiteImageCropChange = (imageKey, field, value) => {
    setDraftContent((current) => ({
      ...current,
      siteImageCrops: {
        ...current.siteImageCrops,
        [imageKey]: {
          ...current.siteImageCrops[imageKey],
          [field]: value,
        },
      },
    }));
  };

  const handleEventChange = (eventIndex, field, value) => {
    setDraftContent((current) => ({
      ...current,
      ministryEvents: current.ministryEvents.map((event, index) => (index === eventIndex ? { ...event, [field]: value } : event)),
    }));
  };

  const handleLeadershipChange = (profileIndex, field, value) => {
    setDraftContent((current) => ({
      ...current,
      leadershipProfiles: current.leadershipProfiles.map((profile, index) => (index === profileIndex ? { ...profile, [field]: value } : profile)),
    }));
  };

  const handleTestimonyChange = (testimonyIndex, field, value) => {
    setDraftContent((current) => ({
      ...current,
      testimonyStories: current.testimonyStories.map((testimony, index) => (index === testimonyIndex ? { ...testimony, [field]: value } : testimony)),
    }));
  };

  const handleAddTestimony = () => {
    setDraftContent((current) => ({
      ...current,
      testimonyStories: [
        ...current.testimonyStories,
        {
          cropX: 50,
          cropY: 18,
          date: new Date().getFullYear().toString(),
          headline: "New testimony",
          image: current.siteImages.hero,
          name: "Community Member",
          text: "Share how God has moved through this ministry.",
        },
      ],
    }));
  };

  const handleDeleteTestimony = (testimonyIndex) => {
    setDraftContent((current) => ({
      ...current,
      testimonyStories: current.testimonyStories.filter((_, index) => index !== testimonyIndex),
    }));
  };

  const handleSettingChange = (field, value) => {
    setDraftContent((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [field]: value,
      },
    }));
  };

  const handleImageUpload = async (imageId, file, onUploaded) => {
    if (!file) {
      return;
    }

    setUploadingImageId(imageId);
    setStatus("");

    try {
      const imageUrl = await uploadAdminImage(file);
      onUploaded(imageUrl);
      setStatus("Image uploaded. Save updates to publish it on the site.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setUploadingImageId("");
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await saveEditableContentToServer(draftContent);
      setStatus("Updates saved. Public pages now use the new content.");
    } catch (error) {
      setStatus(error.message);
      if (error.message.toLowerCase().includes("admin")) {
        window.sessionStorage.removeItem("cw_admin_unlocked");
        window.sessionStorage.removeItem("cw_admin_token");
        setIsUnlocked(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isUnlocked) {
    return (
      <section id="admin" className="section bg-white fade-section">
        <div className="container-custom max-w-[680px]">
          <form className="form-card" aria-label="Admin login form" onSubmit={handleLogin}>
            <h2 className="text-[30px] font-bold leading-9">Admin access</h2>
            <p className="text-[16px] leading-7 text-black/65">
              Enter the admin password to update images, event dates, and ministry configuration. Set <code>ADMIN_PASSWORD</code> in production.
            </p>
            <input className="form-field" type="password" name="password" placeholder="Admin password" aria-label="Admin password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button className="btn btn-primary" type="submit" disabled={isSaving}>{isSaving ? "Unlocking..." : "Unlock Admin"}</button>
            {status && <p className="rounded-lg bg-softBg p-4 text-[15px] font-semibold text-purplePrimary" role="status">{status}</p>}
          </form>
        </div>
      </section>
    );
  }

  return (
    <section id="admin" className="section bg-white fade-section">
      <div className="container-custom">
        <form className="grid gap-8" aria-label="Admin content editor" onSubmit={handleSave}>
          <div className="card">
            <h2 className="text-[30px] font-bold leading-9">Pictures</h2>
            <p className="mt-2 text-[15px] leading-7 text-black/60">Upload pictures from your desktop or mobile device, preview them here, then save updates to publish them.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <AdminImageUpload
                cropX={draftContent.siteImageCrops.hero.cropX}
                cropY={draftContent.siteImageCrops.hero.cropY}
                id="site-hero-image"
                imageUrl={draftContent.siteImages.hero}
                isUploading={uploadingImageId === "site-hero-image"}
                label="Home and about image"
                onCropChange={(field, value) => handleSiteImageCropChange("hero", field, value)}
                onUpload={(file) => handleImageUpload("site-hero-image", file, (imageUrl) => handleImageChange("hero", imageUrl))}
              />
              <AdminImageUpload
                cropX={draftContent.siteImageCrops.foundationHero.cropX}
                cropY={draftContent.siteImageCrops.foundationHero.cropY}
                id="foundation-image"
                imageUrl={draftContent.siteImages.foundationHero}
                isUploading={uploadingImageId === "foundation-image"}
                label="Foundation image"
                onCropChange={(field, value) => handleSiteImageCropChange("foundationHero", field, value)}
                onUpload={(file) => handleImageUpload("foundation-image", file, (imageUrl) => handleImageChange("foundationHero", imageUrl))}
              />
            </div>
          </div>

          <div className="grid gap-6">
            <h2 className="text-[30px] font-bold leading-9">Leadership</h2>
            {draftContent.leadershipProfiles.map((profile, index) => (
              <article key={profile.name} className="card">
                <h3 className="text-[24px] font-bold leading-8">{profile.name}</h3>
                <div className="mt-5 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
                  <AdminImageUpload
                    cropX={profile.cropX}
                    cropY={profile.cropY}
                    id={`leadership-image-${index}`}
                    imageUrl={profile.image}
                    isUploading={uploadingImageId === `leadership-image-${index}`}
                    label={`${profile.name} image`}
                    onCropChange={(field, value) => handleLeadershipChange(index, field, value)}
                    onUpload={(file) => handleImageUpload(`leadership-image-${index}`, file, (imageUrl) => handleLeadershipChange(index, "image", imageUrl))}
                  />
                  <div className="grid gap-4">
                    <AdminField label="Name" value={profile.name} onChange={(value) => handleLeadershipChange(index, "name", value)} />
                    <AdminField label="Role" value={profile.role} onChange={(value) => handleLeadershipChange(index, "role", value)} />
                    <label className="grid gap-2 text-[14px] font-semibold">
                      Intro quote
                      <textarea className="form-field h-[100px] resize-none py-4" value={profile.intro} onChange={(event) => handleLeadershipChange(index, "intro", event.target.value)} />
                    </label>
                    <label className="grid gap-2 text-[14px] font-semibold">
                      Bio
                      <textarea className="form-field h-[140px] resize-none py-4" value={profile.bio} onChange={(event) => handleLeadershipChange(index, "bio", event.target.value)} />
                    </label>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[30px] font-bold leading-9">Testimonials</h2>
                <p className="mt-2 text-[15px] leading-7 text-black/60">Add member testimonies, adjust their pictures, or remove stories that should no longer show on the site.</p>
              </div>
              <button className="btn btn-outline" type="button" onClick={handleAddTestimony}>Add Testimony</button>
            </div>
            {draftContent.testimonyStories.length === 0 && (
              <div className="card">
                <p className="text-[16px] leading-7 text-black/65">No testimonies are currently published. Add one when you are ready to share a member story.</p>
              </div>
            )}
            {draftContent.testimonyStories.map((testimony, index) => (
              <article key={`${testimony.name}-${index}`} className="card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-[24px] font-bold leading-8">{testimony.headline || "Member testimony"}</h3>
                    <p className="mt-1 text-[14px] font-semibold text-purplePrimary">{testimony.name}</p>
                  </div>
                  <button className="btn btn-outline" type="button" onClick={() => handleDeleteTestimony(index)}>Delete</button>
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
                  <AdminImageUpload
                    cropX={testimony.cropX}
                    cropY={testimony.cropY}
                    id={`testimony-image-${index}`}
                    imageUrl={testimony.image}
                    isUploading={uploadingImageId === `testimony-image-${index}`}
                    label={`${testimony.name || "Member"} image`}
                    onCropChange={(field, value) => handleTestimonyChange(index, field, value)}
                    onUpload={(file) => handleImageUpload(`testimony-image-${index}`, file, (imageUrl) => handleTestimonyChange(index, "image", imageUrl))}
                  />
                  <div className="grid gap-4">
                    <AdminField label="Member name" value={testimony.name} onChange={(value) => handleTestimonyChange(index, "name", value)} />
                    <AdminField label="Headline" value={testimony.headline} onChange={(value) => handleTestimonyChange(index, "headline", value)} />
                    <AdminField label="Date" value={testimony.date} onChange={(value) => handleTestimonyChange(index, "date", value)} />
                    <label className="grid gap-2 text-[14px] font-semibold">
                      Testimony
                      <textarea className="form-field h-[150px] resize-none py-4" value={testimony.text} onChange={(event) => handleTestimonyChange(index, "text", event.target.value)} />
                    </label>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-6">
            <h2 className="text-[30px] font-bold leading-9">Events</h2>
            <label className="card grid gap-2 text-[14px] font-semibold">
              Home page event highlight
              <select className="form-field" value={draftContent.settings.featuredEventSlug} onChange={(event) => handleSettingChange("featuredEventSlug", event.target.value)}>
                {draftContent.ministryEvents.map((event) => (
                  <option key={event.slug} value={event.slug}>{event.title}</option>
                ))}
              </select>
            </label>
            {draftContent.ministryEvents.map((event, index) => (
              <article key={event.slug} className="card">
                <h3 className="text-[24px] font-bold leading-8">{event.title}</h3>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <AdminField label="Title" value={event.title} onChange={(value) => handleEventChange(index, "title", value)} />
                  <AdminField label="Date" value={event.date} onChange={(value) => handleEventChange(index, "date", value)} />
                  <AdminField label="Time" value={event.time} onChange={(value) => handleEventChange(index, "time", value)} />
                  <AdminField label="Location" value={event.location} onChange={(value) => handleEventChange(index, "location", value)} />
                  <AdminImageUpload
                    cropX={event.cropX}
                    cropY={event.cropY}
                    id={`event-image-${event.slug}`}
                    imageUrl={event.image}
                    isUploading={uploadingImageId === `event-image-${event.slug}`}
                    label="Event image"
                    onCropChange={(field, value) => handleEventChange(index, field, value)}
                    onUpload={(file) => handleImageUpload(`event-image-${event.slug}`, file, (imageUrl) => handleEventChange(index, "image", imageUrl))}
                  />
                  <AdminField label="Registration link" value={event.link || ""} onChange={(value) => handleEventChange(index, "link", value)} />
                  <AdminField label="Meeting password" value={event.password || ""} onChange={(value) => handleEventChange(index, "password", value)} />
                  <AdminField label="Capacity" value={String(event.capacity || "")} onChange={(value) => handleEventChange(index, "capacity", Number(value) || "")} />
                </div>
                <label className="mt-4 grid gap-2 text-[14px] font-semibold">
                  Description
                  <textarea className="form-field h-[120px] resize-none py-4" value={event.description} onChange={(inputEvent) => handleEventChange(index, "description", inputEvent.target.value)} />
                </label>
              </article>
            ))}
          </div>

          <div className="card">
            <h2 className="text-[30px] font-bold leading-9">Configuration</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Object.entries(draftContent.settings).map(([field, value]) => (
                <AdminField key={field} label={field} value={value} onChange={(nextValue) => handleSettingChange(field, nextValue)} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button className="btn btn-primary" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Updates"}</button>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => {
                window.sessionStorage.removeItem("cw_admin_unlocked");
                window.sessionStorage.removeItem("cw_admin_token");
                setIsUnlocked(false);
                setStatus("Admin console locked.");
              }}
            >
              Lock Admin
            </button>
            {status && <p className="rounded-lg bg-softBg p-4 text-[15px] font-semibold text-purplePrimary" role="status">{status}</p>}
          </div>
        </form>
      </div>
    </section>
  );
}

function AdminField({ label, onChange, value }) {
  return (
    <label className="grid gap-2 text-[14px] font-semibold">
      {label}
      <input className="form-field" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function AdminImageUpload({ cropX = 50, cropY = 18, id, imageUrl, isUploading, label, onCropChange, onUpload }) {
  return (
    <div className="grid gap-3 text-[14px] font-semibold">
      <span>{label}</span>
      <div className="overflow-hidden rounded-lg border border-black/10 bg-softBg">
        <OptimizedImage src={imageUrl} alt="" className="h-[180px] w-full object-cover" style={{ objectPosition: `${cropX}% ${cropY}%` }} width="360" height="180" />
      </div>
      <label className="inline-flex min-h-[52px] cursor-pointer items-center justify-center rounded-lg border-2 border-purplePrimary bg-white px-4 text-center text-purplePrimary transition hover:bg-purplePrimary hover:text-white">
        {isUploading ? "Uploading..." : "Choose Picture"}
        <input
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={isUploading}
          onChange={(event) => {
            onUpload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      {onCropChange && (
        <div className="grid gap-3 rounded-lg bg-softBg p-4">
          <label className="grid gap-2 text-[13px] font-semibold">
            Horizontal crop: {cropX}%
            <input type="range" min="0" max="100" value={cropX} onChange={(event) => onCropChange("cropX", Number(event.target.value))} />
          </label>
          <label className="grid gap-2 text-[13px] font-semibold">
            Vertical crop: {cropY}%
            <input type="range" min="0" max="100" value={cropY} onChange={(event) => onCropChange("cropY", Number(event.target.value))} />
          </label>
        </div>
      )}
      <p className="text-[12px] font-medium leading-5 text-black/55">JPG, PNG, or WebP under 5 MB.</p>
    </div>
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

function ContactPage({ settings = socialLinks }) {
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

    submitContactMessage(message);
    setIsSending(true);

    try {
      await sendContactEmail(message);
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
            <a href={settings.whatsapp} {...getExternalLinkProps(settings.whatsapp)} className="text-purplePrimary">Join Community</a>
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
