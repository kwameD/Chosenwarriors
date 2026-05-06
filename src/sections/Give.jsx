import { Button } from "../components/ui/Button";
import { givingMethods } from "../content/siteContent";

export function Give() {
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
            {givingMethods.map((method) => (
              <div key={method.label} className="rounded-2xl bg-white p-5 shadow-soft">
                <p className="font-bold">{method.label}</p>
                <p className="text-[14px] text-black/60">{method.value}</p>
              </div>
            ))}
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
