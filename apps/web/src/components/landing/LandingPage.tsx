import HCRExpertise from "./HCRExpertise";
import FinalCTA from "./FinalCTA";
import { Footer } from "@shiftly/ui";
import ForEstablishments from "./ForEstablishments";
import SolutionForHCR from "./ForFreelancers";
import Hero from "./Hero";
import Benefits from "./Benefits";
import ProblemSolution from "./ProblemSolution";
import Stats from "./Stats";
import { PublicTopNavigation } from "@/components/layout";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf7]">
      <PublicTopNavigation />
      <Hero />
      <ProblemSolution />
      <SolutionForHCR />
      <ForEstablishments />
      <Benefits />
      <HCRExpertise />
      <FinalCTA />
      <Footer />
    </div>
  );
}
