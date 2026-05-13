import { useState } from "react";
import { Mail } from "lucide-react";
import { subscribeEmail } from "../services/platformStore";

export function Newsletter() {
  const [status, setStatus] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    subscribeEmail(formData.get("email"));
    setStatus("Welcome. You are signed up for ministry updates.");
    event.currentTarget.reset();
  };

  return (
    <section className="section bg-white fade-section">
      <div className="container-custom">
        <div className="mx-auto w-full max-w-[600px] rounded-lg bg-softBg p-8 text-center shadow-soft md:p-12">
          <Mail className="mx-auto h-10 w-10 text-purplePrimary" />
          <h2 className="mt-4 text-[32px] font-bold leading-10">Stay connected to what God is doing</h2>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" aria-label="Newsletter signup form" onSubmit={handleSubmit}>
            <input className="h-[52px] flex-1 rounded-lg border border-black/10 px-4 outline-none focus:border-purplePrimary" name="email" placeholder="Enter your email" aria-label="Email address" autoComplete="email" type="email" required />
            <button className="btn btn-primary h-[52px]" type="submit">
              Subscribe
            </button>
          </form>
          {status && <p className="mt-4 rounded-lg bg-white p-4 text-[15px] font-semibold text-purplePrimary" role="status">{status}</p>}
        </div>
      </div>
    </section>
  );
}
