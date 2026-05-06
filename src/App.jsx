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

// This order is the homepage flow; regression tests protect it from accidental rearranges.
const orderedPageSections = [
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
        {orderedPageSections.map((Section) => (
          <Section key={Section.name} />
        ))}
      </main>
      <Footer />
    </>
  );
}
