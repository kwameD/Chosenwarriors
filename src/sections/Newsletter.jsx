import { useState } from "react";
import { Mail } from "lucide-react";
import { sendNewsletterSignup } from "../services/ministryEmailApi";
import { subscribeEmail } from "../services/platformStore";

export function Newsletter() {
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;
    const email = formData.get("email");

    subscribeEmail(email);
    setIsSending(true);

    try {
      await sendNewsletterSignup({ email });
      setStatus("Welcome. You are signed up for ministry updates.");
      form.reset();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="section bg-white fade-section">
      <div className="container-custom">
        <div className="mx-auto w-full max-w-[600px] rounded-lg bg-softBg p-8 text-center shadow-soft md:p-12">
          <Mail className="mx-auto h-10 w-10 text-purplePrimary" />
          <h2 className="mt-4 text-[32px] font-bold leading-10">Stay connected to what God is doing</h2>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" aria-label="Newsletter signup form" onSubmit={handleSubmit}>
            <input className="h-[52px] flex-1 rounded-lg border border-black/10 px-4 outline-none focus:border-purplePrimary" name="email" placeholder="Enter your email" aria-label="Email address" autoComplete="email" type="email" required />
            <button className="btn btn-primary h-[52px]" type="submit" disabled={isSending}>
              {isSending ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          {status && <p className="mt-4 rounded-lg bg-white p-4 text-[15px] font-semibold text-purplePrimary" role="status">{status}</p>}
        </div>
      </div>
    </section>
  );
}
