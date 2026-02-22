import "./App.css";
import CustomNavbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import SearchSection from "./components/SearchSection";
import Properties from "./components/properties";
import ServicesSection from "./components/ServicesSection";
import StatsSection from "./components/StatsSection";
import AboutSection from "./components/AboutSection";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <CustomNavbar />
      <HeroSection />
      <SearchSection />
      <Properties />
      <ServicesSection />
      <StatsSection />
      <AboutSection />
      <CtaSection />
      <Footer />
    </>
  );
}

export default App;
