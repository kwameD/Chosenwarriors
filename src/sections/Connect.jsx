import { MessageCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { connectSocialLinks, socialLinks } from "../config/siteConfig";
import { getExternalLinkProps } from "../utils/links";

export function Connect() {
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
            <Button href={socialLinks.whatsapp} className="mt-6">
              Join WhatsApp
            </Button>
            <div className="mt-8 flex flex-wrap gap-4 text-[14px] font-semibold">
              {connectSocialLinks.map((link) => (
                <a key={link.label} href={link.href} {...getExternalLinkProps(link.href)} className="text-purplePrimary">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <form className="card grid gap-4">
            <input className="form-field" placeholder="Name" />
            <input className="form-field" placeholder="Email" type="email" />
            <textarea className="form-field h-[160px] resize-none py-4" placeholder="Message" />
            <button className="btn btn-primary" type="submit">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
