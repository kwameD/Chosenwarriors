import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";

export function Prayer() {
  const [status, setStatus] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus("Thank you. Your prayer request has been received, and our team will stand with you in prayer.");
    event.currentTarget.reset();
  };

  return (
    <section id="prayer" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Prayer Page"
          title="We will stand in prayer with you."
          subtitle="Share your request with care and clarity. This form is ready for a future backend."
        />
        <form className="form-card mx-auto w-full max-w-[600px]" aria-label="Prayer request form" onSubmit={handleSubmit}>
          <input className="form-field" placeholder="Name (optional)" aria-label="Name" autoComplete="name" />
          <input className="form-field" placeholder="Email (optional)" aria-label="Email" autoComplete="email" type="email" />
          <textarea className="form-field h-[160px] resize-none py-4" placeholder="Prayer request" aria-label="Prayer request" required />
          <label className="flex items-center gap-3 text-[14px] text-black/65">
            <input type="checkbox" className="h-4 w-4 rounded border-black/20 text-purplePrimary" />
            Submit anonymously
          </label>
          <label className="flex items-center gap-3 text-[14px] text-black/65">
            <input type="checkbox" className="h-4 w-4 rounded border-black/20 text-purplePrimary" />
            Keep this request confidential
          </label>
          <button className="btn btn-primary w-full" type="submit">
            Submit Prayer Request
          </button>
          {status && <p className="rounded-lg bg-softBg p-4 text-[15px] font-semibold text-purplePrimary" role="status">{status}</p>}
        </form>
      </div>
    </section>
  );
}

export function PrayerCta() {
  return (
    <section className="flex min-h-[300px] items-center bg-purplePrimary text-white fade-section">
      <div className="container-custom text-center">
        <HeartHandshake className="mx-auto mb-5 text-goldAccent" size={46} />
        <h2 className="text-[36px] font-bold leading-[44px]">Need prayer today?</h2>
        <p className="mx-auto mt-3 max-w-[600px] text-[18px] leading-8 text-white/80">
          You do not have to carry it alone. We are ready to believe with you.
        </p>
        <Button href="#prayer-requests" variant="white" className="mt-8">
          Request Prayer
        </Button>
      </div>
    </section>
  );
}
