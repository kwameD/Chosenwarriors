import { Mail } from "lucide-react";

export function Newsletter() {
  return (
    <section className="section bg-white fade-section">
      <div className="container-custom">
        <div className="mx-auto w-full max-w-[600px] rounded-2xl bg-softBg p-8 text-center shadow-soft md:p-12">
          <Mail className="mx-auto h-10 w-10 text-purplePrimary" />
          <h2 className="mt-4 text-[32px] font-bold leading-10">Stay connected to what God is doing</h2>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" aria-label="Newsletter signup form">
            <input className="h-[52px] flex-1 rounded-lg border border-black/10 px-4 outline-none focus:border-purplePrimary" placeholder="Enter your email" aria-label="Email address" autoComplete="email" type="email" />
            <button className="btn btn-primary h-[52px]" type="submit">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
