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
  About,
  Media,
  Prayer,
  PrayerCta,
  Testimonies,
  Events,
  Give,
  Connect,
  Foundation,
  Newsletter,
];

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        {orderedPageSections.map((Section) => (
          <Section key={Section.name} />
        ))}
      </main>
      <Footer />
    </>
  );
}
