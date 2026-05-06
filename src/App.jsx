import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import {
  About,
  Connect,
  ConnectionStrip,
  Events,
  Foundation,
  Give,
  Hero,
  Media,
  Newsletter,
  Prayer,
  PrayerCta,
  Testimonies,
} from "./sections";

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
