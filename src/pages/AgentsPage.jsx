import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import AgentHeroSection from "../components/Agents/AgentHeroSection";
import AgentStepsSection from "../components/Agents/AgentStepsSection";
import AgentWhySection from "../components/Agents/AgentWhySection";
import AgentTestimonialsSection from "../components/Agents/AgentTestimonialsSection";

export default function AgentsPage() {
    return (
        <>
            <CustomNavbar />
            <AgentHeroSection />
            <AgentStepsSection />
            <AgentWhySection />
            <AgentTestimonialsSection />
            <Footer />
        </>
    );
}
