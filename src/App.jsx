import { useState } from "react";
import {
  Calendar,
  ChevronRight,
  HandHeart,
  HeartHandshake,
  Mail,
  Menu,
  MessageCircle,
  PlayCircle,
  Quote,
  X,
} from "lucide-react";
import { events, testimonies, media, team } from "./data";

const navItems = ["Home", "About", "Media", "Prayer", "Testimonies", "Events", "Give", "Connect", "Foundation"];

const impactImages = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=900&q=80",
];

function Button({ href, children, variant = "primary", className = "" }) {
  return (
    <a href={href} className={`btn btn-${variant} ${className}`}>
      {children}
    </a>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-black/5 bg-white/95 backdrop-blur">
      <nav className="container-custom flex h-20 items-center justify-between">
        <a href="#home" className="logo-mark" aria-label="Chosen Warriors home">
          Chosen Warriors
        </a>

        <div className="hidden items-center gap-8 text-[16px] font-medium lg:flex">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-purplePrimary">
              {item}
            </a>
          ))}
        </div>

        <a href="#connect" className="hidden h-11 items-center rounded-lg bg-purplePrimary px-5 text-sm font-semibold text-white transition hover:bg-purpleHover md:inline-flex">
          Join Us
        </a>

        <button className="grid h-11 w-11 place-items-center rounded-lg border border-black/10 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-black/5 bg-white px-5 pb-6 pt-3 shadow-soft lg:hidden">
          <div className="grid gap-1">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-medium hover:bg-softBg">
                {item}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="relative h-[720px] overflow-hidden bg-[url('https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="container-custom relative z-10 pt-[160px]">
        <div className="max-w-[600px] text-white">
          <p className="small-label mb-4 bg-white/15 text-white backdrop-blur">Digital Ministry Platform</p>
          <h1 className="hero-title">You Were Chosen for More</h1>
          <p className="mt-4 text-[18px] leading-8 text-[#EAEAEA]">
            Raising revivalists through prayer, the Word, and fasting.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button href="#connect">Join the Movement</Button>
            <Button href="#prayer" variant="secondary">
              Submit Prayer Request
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConnectionStrip() {
  return (
    <section className="h-auto bg-purplePrimary text-white md:h-[100px]">
      <div className="container-custom flex h-full flex-col items-center justify-between gap-4 py-6 text-center md:flex-row md:py-0 md:text-left">
        <p className="text-[20px] font-semibold leading-7">Connect with our live prayer community and walk with people who will stand with you.</p>
        <Button href="https://wa.me/YOURNUMBER" variant="white" className="shrink-0">
          <MessageCircle size={18} />
          Join WhatsApp
        </Button>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto mb-12 max-w-[760px] text-center">
      {eyebrow && <p className="small-label mb-4 text-purplePrimary">{eyebrow}</p>}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="mt-4 text-[18px] leading-8 text-black/65">{subtitle}</p>}
    </div>
  );
}

function About() {
  return (
    <section id="about" className="section fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Connection"
          title="More than a ministry. A movement."
          subtitle="Chosen Warriors equips believers to boldly proclaim Jesus and carry His power for transformation, healing, and salvation."
        />
        <div className="grid gap-8 md:grid-cols-2">
          {team.map((member) => (
            <article key={member.name} className="card card-hover flex flex-col gap-6 sm:flex-row">
              <img src={member.image} alt={member.name} className="h-48 rounded-xl object-cover sm:h-40 sm:w-40" />
              <div>
                <h3 className="text-[28px] font-semibold leading-9">{member.name}</h3>
                <p className="text-[14px] font-bold uppercase tracking-widest text-purplePrimary">{member.role}</p>
                <p className="mt-3 text-[16px] leading-7 text-black/65">{member.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Media() {
  return (
    <section id="media" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Transformation"
          title="Experience the Move of God"
          subtitle="A featured message for prayer, surrender, and spiritual momentum."
        />
        <div className="relative h-[320px] overflow-hidden rounded-2xl bg-darkText shadow-soft md:h-[600px]">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${media[0].youtubeId}`}
            title={media[0].title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

function Testimonies() {
  return (
    <section id="testimonies" className="section bg-softBg fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Proof of Transformation"
          title="Stories of God’s Faithfulness"
          subtitle="Real testimonies from people impacted through prayer, community, and service."
        />
        <div className="grid justify-items-center gap-6 md:grid-cols-3">
          {testimonies.map((t) => (
            <article key={t.name} className="card card-hover min-h-[220px] w-full md:max-w-[360px]">
              <Quote className="text-purplePrimary" size={30} />
              <p className="mt-5 text-[16px] leading-7 text-black/70">{t.text}</p>
              <p className="mt-6 text-[14px] font-bold text-darkText">{t.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Prayer() {
  return (
    <section id="prayer" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Prayer Page"
          title="We will stand in prayer with you."
          subtitle="Share your request with care and clarity. This form is ready for a future backend."
        />
        <form className="form-card mx-auto w-full max-w-[600px]">
          <input className="form-field" placeholder="Name (optional)" />
          <input className="form-field" placeholder="Email (optional)" type="email" />
          <textarea className="form-field h-[160px] resize-none py-4" placeholder="Prayer request" />
          <label className="flex items-center gap-3 text-[14px] text-black/65">
            <input type="checkbox" className="h-4 w-4 rounded border-black/20 text-purplePrimary" />
            Keep this request confidential
          </label>
          <button className="btn btn-primary w-full" type="submit">
            Submit Prayer Request
          </button>
        </form>
      </div>
    </section>
  );
}

function PrayerCta() {
  return (
    <section className="flex min-h-[300px] items-center bg-purplePrimary text-white fade-section">
      <div className="container-custom text-center">
        <HeartHandshake className="mx-auto mb-5 text-goldAccent" size={46} />
        <h2 className="text-[36px] font-bold leading-[44px]">Need prayer today?</h2>
        <p className="mx-auto mt-3 max-w-[600px] text-[18px] leading-8 text-white/80">
          You do not have to carry it alone. We are ready to believe with you.
        </p>
        <Button href="#prayer" variant="white" className="mt-8">
          Request Prayer
        </Button>
      </div>
    </section>
  );
}

function EventCard({ event, large = false }) {
  return (
    <article className={`event-card card-hover ${large ? "h-[300px]" : "h-auto md:h-[260px]"}`}>
      <img src={event.image} alt={event.title} className={`${large ? "h-[150px]" : "h-[140px]"} w-full object-cover`} />
      <div className="p-5">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-purplePrimary">
          <Calendar size={16} />
          {event.date}
        </div>
        <h3 className="mt-2 text-[20px] font-semibold leading-7">{event.title}</h3>
        <a href="#connect" className="mt-3 inline-flex items-center gap-1 text-[14px] font-bold text-purplePrimary">
          View <ChevronRight size={16} />
        </a>
      </div>
    </article>
  );
}

function Events() {
  return (
    <section id="events" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Engagement"
          title="Upcoming Events"
          subtitle="Join us live, online, and in the community."
        />
        <div className="grid justify-items-center gap-8 md:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.title} event={event} large />
          ))}
        </div>
      </div>
    </section>
  );
}

function Give() {
  return (
    <section id="give" className="section bg-softBg fade-section">
      <div className="container-custom grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="small-label text-purplePrimary">Partner in the Mission</p>
          <h2 className="section-title mt-4">Help us reach nations and transform lives.</h2>
          <p className="mt-5 text-[18px] leading-8 text-black/65">
            Your partnership supports ministry work, outreach, prayer gatherings, and Chosen to Rescue foundation projects.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-soft">
              <p className="font-bold">Zelle</p>
              <p className="text-[14px] text-black/60">your-email@example.com</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-soft">
              <p className="font-bold">Cash App</p>
              <p className="text-[14px] text-black/60">$ChosenWarriors</p>
            </div>
          </div>
          <Button href="#connect" className="mt-8">
            Become a Partner
          </Button>
        </div>
        <img
          src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1100&q=80"
          alt="Hands giving support"
          className="h-[420px] w-full rounded-2xl object-cover shadow-soft"
        />
      </div>
    </section>
  );
}

function Connect() {
  return (
    <section id="connect" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Stay Connected"
          title="Take your next step"
          subtitle="Join the WhatsApp group, follow us online, or send us a message."
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="card card-hover">
            <MessageCircle className="h-10 w-10 text-purplePrimary" />
            <h3 className="mt-4 text-[28px] font-semibold leading-9">Join our WhatsApp community</h3>
            <p className="mt-3 text-[18px] leading-8 text-black/65">Prayer reminders, daily meetings, announcements, and community support.</p>
            <Button href="https://wa.me/YOURNUMBER" className="mt-6">
              Join WhatsApp
            </Button>
            <div className="mt-8 flex flex-wrap gap-4 text-[14px] font-semibold">
              <a href="#" className="text-purplePrimary">Instagram</a>
              <a href="#" className="text-purplePrimary">Facebook</a>
              <a href="#" className="text-purplePrimary">YouTube</a>
              <a href="#" className="text-purplePrimary">TikTok</a>
            </div>
          </div>

          <form className="card grid gap-4">
            <input className="form-field" placeholder="Name" />
            <input className="form-field" placeholder="Email" type="email" />
            <textarea className="form-field h-[160px] resize-none py-4" placeholder="Message" />
            <button className="btn btn-primary" type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Foundation() {
  return (
    <section id="foundation" className="bg-white fade-section">
      <div className="relative flex min-h-[560px] items-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50" />
        <div className="container-custom relative z-10 text-white">
          <div className="max-w-[620px]">
            <p className="small-label bg-white/15 text-goldAccent backdrop-blur">Foundation</p>
            <h2 className="mt-5 text-[56px] font-bold leading-[64px]">Chosen to Rescue</h2>
            <p className="mt-4 text-[18px] leading-8 text-white/85">
              Demonstrating the love of Christ to children in need through giving, outreach, and evangelism.
            </p>
            <Button href="#give" className="mt-8">
              Give to the Foundation
            </Button>
          </div>
        </div>
      </div>
      <div className="container-custom py-24">
        <SectionHeader
          eyebrow="Impact Grid"
          title="Rescue that people can feel."
          subtitle="Every outreach touchpoint is designed to restore dignity, share hope, and invite commitment."
        />
        <div className="grid gap-8 md:grid-cols-3">
          {impactImages.map((image, index) => (
            <img key={image} src={image} alt={`Chosen to Rescue impact ${index + 1}`} className="h-[260px] w-full rounded-xl object-cover shadow-soft" />
          ))}
        </div>
        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <HandHeart className="h-12 w-12 text-purplePrimary" />
            <h3 className="mt-4 text-[28px] font-semibold leading-9">Our Mission</h3>
            <p className="mt-4 text-[18px] leading-8 text-black/65">
              We meet immediate needs while sharing the message of Jesus Christ in a tangible way.
            </p>
          </div>
          <div className="card">
            <PlayCircle className="text-goldAccent" size={40} />
            <p className="mt-4 text-[20px] font-semibold leading-8">
              Connection becomes transformation when love becomes visible.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="section bg-white fade-section">
      <div className="container-custom">
        <div className="mx-auto w-full max-w-[600px] rounded-2xl bg-softBg p-8 text-center shadow-soft md:p-12">
          <Mail className="mx-auto h-10 w-10 text-purplePrimary" />
          <h2 className="mt-4 text-[32px] font-bold leading-10">Stay connected to what God is doing</h2>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input className="h-[52px] flex-1 rounded-lg border border-black/10 px-4 outline-none focus:border-purplePrimary" placeholder="Enter your email" type="email" />
            <button className="btn btn-primary h-[52px]" type="submit">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="min-h-[300px] bg-darkText text-white">
      <div className="container-custom grid gap-8 py-16 md:grid-cols-4">
        <div>
          <h3 className="text-xl font-extrabold">Chosen Warriors</h3>
          <p className="mt-3 text-[14px] leading-6 text-white/60">A movement raising revivalists through prayer, the Word, and fasting.</p>
        </div>
        <div>
          <p className="font-bold">Links</p>
          <div className="mt-4 grid gap-2 text-[14px] text-white/60">
            <a href="#about">About</a>
            <a href="#media">Media</a>
            <a href="#events">Events</a>
          </div>
        </div>
        <div>
          <p className="font-bold">Social</p>
          <div className="mt-4 grid gap-2 text-[14px] text-white/60">
            <a href="#">Instagram</a>
            <a href="#">YouTube</a>
            <a href="#">Facebook</a>
          </div>
        </div>
        <div>
          <p className="font-bold">Contact</p>
          <p className="mt-4 text-[14px] text-white/60">chosenwarriors@example.com</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[14px] text-white/50">
        © {new Date().getFullYear()} Chosen Warriors. All rights reserved.
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <ConnectionStrip />
      <Media />
      <Testimonies />
      <PrayerCta />
      <Events />
      <Give />
      <Newsletter />
      <About />
      <Prayer />
      <Connect />
      <Foundation />
      <Footer />
    </>
  );
}
