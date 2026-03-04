import { Routes, Route } from "react-router-dom";
import CustomNavbar from "../components/Landing/Navbar";
import HeroSection from "../components/Landing/HeroSection";
import SearchSection from "../components/Landing/SearchSection";
import Properties from "../components/Landing/properties";
import ServicesSection from "../components/Landing/ServicesSection";
import StatsSection from "../components/Landing/StatsSection";
import AboutSection from "../components/Landing/AboutSection";
import CtaSection from "../components/Landing/CtaSection";
import Footer from "../components/Landing/Footer";


export default function HomePage() {
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