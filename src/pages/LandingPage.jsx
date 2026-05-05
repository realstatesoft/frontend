import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import CustomNavbar from "../components/Landing/Navbar";
import HeroSection from "../components/Landing/HeroSection";

// Lazy load components below the fold for faster initial render
const SearchSection = lazy(() => import("../components/Landing/SearchSection"));
const Properties = lazy(() => import("../components/Landing/properties"));
const ServicesSection = lazy(() => import("../components/Landing/ServicesSection"));
const StatsSection = lazy(() => import("../components/Landing/StatsSection"));
const AboutSection = lazy(() => import("../components/Landing/AboutSection"));
const CtaSection = lazy(() => import("../components/Landing/CtaSection"));
const Footer = lazy(() => import("../components/Landing/Footer"));

export default function HomePage() {
  return (
    <>
      <CustomNavbar />
      <HeroSection />
      {/* Suspense fallback can be empty or a simple spinner. 
          Using an empty div to prevent layout shifts or flashing while loading. */}
      <Suspense fallback={<div style={{ minHeight: '50vh' }}></div>}>
        <SearchSection />
        <Properties />
        <ServicesSection />
        <StatsSection />
        <AboutSection />
        <CtaSection />
        <Footer />
      </Suspense>
    </>
  );
}