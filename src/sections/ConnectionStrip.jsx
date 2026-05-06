import { MessageCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { socialLinks } from "../config/site";

export function ConnectionStrip() {
  return (
    <section className="h-auto bg-purplePrimary text-white md:h-[100px]">
      <div className="container-custom flex h-full flex-col items-center justify-between gap-4 py-6 text-center md:flex-row md:py-0 md:text-left">
        <p className="text-[20px] font-semibold leading-7">Connect with our live prayer community and walk with people who will stand with you.</p>
        <Button href={socialLinks.whatsapp} variant="white" className="shrink-0">
          <MessageCircle size={18} />
          Join WhatsApp
        </Button>
      </div>
    </section>
  );
}

