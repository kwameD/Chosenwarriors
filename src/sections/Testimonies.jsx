import { Quote } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { testimonyStories } from "../content/siteContent";

export function Testimonies() {
  return (
    <section id="testimonials" className="section bg-softBg fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Proof of Transformation"
          title="Stories of God’s Faithfulness"
          subtitle="Real testimonies from people impacted through prayer, community, and service."
        />
        <div className="grid justify-items-center gap-6 md:grid-cols-3">
          {testimonyStories.map((testimony) => (
            <article key={testimony.name} className="card card-hover min-h-[220px] w-full md:max-w-[360px]">
              <Quote className="text-purplePrimary" size={30} />
              <p className="mt-5 text-[16px] leading-7 text-black/70">{testimony.text}</p>
              <p className="mt-6 text-[14px] font-bold text-darkText">{testimony.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
