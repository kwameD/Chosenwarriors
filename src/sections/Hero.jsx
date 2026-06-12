import { Button } from "../components/ui/Button";
import { OptimizedImage } from "../components/ui/OptimizedImage";

export function Hero({ siteImages }) {
  return (
    <section id="home" className="relative min-h-[620px] overflow-hidden bg-darkText md:min-h-[700px]">
      <OptimizedImage
        src={siteImages.hero}
        alt=""
        className="hero-media portrait-safe absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        height="720"
        loading="eager"
        width="1800"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-deepPurple/82 via-deepPurple/58 to-purplePrimary/42" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-deepPurple/65 to-transparent" />
      <div className="hero-orb left-[8%] top-[18%] bg-goldAccent/20" />
      <div className="container-custom relative z-10 flex min-h-[620px] items-center py-20 md:min-h-[700px]">
        <div className="max-w-[720px] text-white">
          <p className="small-label mb-4 bg-white/15 text-goldAccent backdrop-blur">Prayer. Word. Revival.</p>
          <h1 className="hero-title">Raising revivalists for homes, communities, and nations.</h1>
          <p className="mt-4 text-[18px] leading-8 text-[#EAEAEA]">
            Chosen Warriors helps believers grow in prayer, stand on Scripture, serve with compassion, and carry the transforming power of Jesus into everyday life.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Button href="#contact">Join Us</Button>
            <Button href="#prayer-requests" variant="secondary">
              Request Prayer
            </Button>
            <Button href="#events" variant="secondary">
              Join Prayer
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
