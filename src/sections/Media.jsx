import { PlayCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { YouTubeEmbed } from "../components/ui/YouTubeEmbed";
import { featuredMessages } from "../content/siteContent";

const primaryMessage = featuredMessages[0];

export function Media() {
  return (
    <section id="media" className="section bg-white fade-section">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Transformation"
          title="Experience the Move of God"
          subtitle="A featured message for prayer, surrender, and spiritual momentum."
        />
        <div className="relative h-[320px] overflow-hidden rounded-lg bg-darkText shadow-soft md:h-[600px]">
          <YouTubeEmbed title={primaryMessage.title} videoId={primaryMessage.youtubeId} />
        </div>
        <div className="mt-8 flex justify-center">
          <Button href={primaryMessage.url} className="gap-2">
            <PlayCircle size={18} />
            Open YouTube Page
          </Button>
        </div>
      </div>
    </section>
  );
}
