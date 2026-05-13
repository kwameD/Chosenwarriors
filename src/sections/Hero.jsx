import { Button } from "../components/ui/Button";
import { OptimizedImage } from "../components/ui/OptimizedImage";
import { siteImages } from "../content/siteContent";

export function Hero() {
  return (
    <section id="home" className="relative min-h-[680px] overflow-hidden bg-darkText">
      <OptimizedImage
        src={siteImages.hero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        height="720"
        loading="eager"
        width="1800"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="container-custom relative z-10 flex min-h-[680px] items-center py-20">
        <div className="max-w-[700px] text-white">
          <p className="small-label mb-4 bg-white/15 text-goldAccent backdrop-blur">Prayer. Word. Revival.</p>
          <h1 className="hero-title">Raising revivalists for homes, communities, and nations.</h1>
          <p className="mt-4 text-[18px] leading-8 text-[#EAEAEA]">
            Chosen Warriors helps believers grow in prayer, stand on Scripture, serve with compassion, and carry the transforming power of Jesus into everyday life.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Button href="#contact">Join Us</Button>
            <Button href="#media" variant="secondary">
              Watch Sermons
            </Button>
            <Button href="#give" variant="secondary">
              Give Online
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
