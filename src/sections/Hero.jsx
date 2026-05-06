import { Button } from "../components/ui/Button";

export function Hero() {
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

