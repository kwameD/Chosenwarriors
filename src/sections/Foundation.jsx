import { HandHeart, PlayCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { OptimizedImage } from "../components/ui/OptimizedImage";
import { SectionHeader } from "../components/ui/SectionHeader";
import { impactImages, siteImages } from "../content/siteContent";

export function Foundation() {
  return (
    <section id="foundation" className="bg-white fade-section">
      <div className="relative flex min-h-[560px] items-center overflow-hidden bg-darkText">
        <OptimizedImage src={siteImages.foundationHero} alt="" className="absolute inset-0 h-full w-full object-cover" width="1800" height="560" />
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
            <OptimizedImage key={image} src={image} alt={`Chosen to Rescue impact ${index + 1}`} className="h-[260px] w-full rounded-xl object-cover shadow-soft" width="400" height="260" />
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
