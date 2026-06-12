import { Calendar, ChevronRight } from "lucide-react";
import { OptimizedImage } from "../components/ui/OptimizedImage";
import { SectionHeader } from "../components/ui/SectionHeader";
import { ministryEvents } from "../content/siteContent";
import { getExternalLinkProps } from "../utils/links";

export function Events() {
  return (
    <section id="events" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader eyebrow="Engagement" title="Upcoming Events" subtitle="Join us live, online, and in the community." />
        <div className="grid justify-items-center gap-8 md:grid-cols-3">
          {ministryEvents.map((event) => (
            <EventCard key={event.title} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EventCard({ event }) {
  return (
    <article className="event-card card-hover h-[300px]">
      <OptimizedImage src={event.image} alt={event.title} className="portrait-safe h-[150px] w-full object-cover" width="380" height="150" />
      <div className="p-5">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-purplePrimary">
          <Calendar size={16} />
          {event.date}
        </div>
        <h3 className="mt-2 text-[20px] font-semibold leading-7">{event.title}</h3>
        {event.password && <p className="mt-2 text-[14px] font-semibold text-black/60">Password: {event.password}</p>}
        <a href={event.link || "#contact"} {...getExternalLinkProps(event.link)} className="mt-3 inline-flex items-center gap-1 text-[14px] font-bold text-purplePrimary">
          View <ChevronRight size={16} />
        </a>
      </div>
    </article>
  );
}
