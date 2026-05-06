import { SectionHeader } from "../components/ui/SectionHeader";
import { leadershipProfiles } from "../content/siteContent";

export function About() {
  return (
    <section id="about" className="section fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Connection"
          title="More than a ministry. A movement."
          subtitle="Chosen Warriors equips believers to boldly proclaim Jesus and carry His power for transformation, healing, and salvation."
        />
        <div className="grid gap-8 md:grid-cols-2">
          {leadershipProfiles.map((member) => (
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
