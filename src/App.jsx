import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { About } from "./sections/About";
import { Connect } from "./sections/Connect";
import { ConnectionStrip } from "./sections/ConnectionStrip";
import { Events } from "./sections/Events";
import { Foundation } from "./sections/Foundation";
import { Give } from "./sections/Give";
import { Hero } from "./sections/Hero";
import { Media } from "./sections/Media";
import { Newsletter } from "./sections/Newsletter";
import { Prayer, PrayerCta } from "./sections/Prayer";
import { Testimonies } from "./sections/Testimonies";

const pageSections = [
  Hero,
  ConnectionStrip,
  Media,
  Testimonies,
  PrayerCta,
  Events,
  Give,
  Newsletter,
  About,
  Prayer,
  Connect,
  Foundation,
];

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        {pageSections.map((Section) => (
          <Section key={Section.name} />
        ))}
      </main>
      <Footer />
    </>
  );
}

