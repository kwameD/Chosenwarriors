import { useState } from "react";
import { PlayCircle } from "lucide-react";

export function YouTubeEmbed({ title, videoId }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  if (isLoaded) {
    return (
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className="group relative h-full w-full overflow-hidden text-left"
      onClick={() => setIsLoaded(true)}
      aria-label={`Play ${title}`}
    >
      <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
      <span className="absolute inset-0 bg-black/45 transition group-hover:bg-black/35" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-purplePrimary shadow-soft transition group-hover:scale-105">
          <PlayCircle size={42} />
        </span>
      </span>
    </button>
  );
}
