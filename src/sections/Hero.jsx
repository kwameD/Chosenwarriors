import { Button } from "../components/ui/Button";
import { OptimizedImage } from "../components/ui/OptimizedImage";
import { siteImages } from "../content/siteContent";

export function Hero() {
  return (
    <section id="home" className="relative h-[720px] overflow-hidden bg-darkText">
      <OptimizedImage
        src={siteImages.hero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
        height="720"
        loading="eager"
        width="1800"
      />
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
