import Ambassadors from "./Ambassadors";
import FinalCTA from "./FinalCTA";
import { Footer } from "@shiftly/ui";
import ForEstablishments from "./ForEstablishments";
import SolutionForHCR from "./ForFreelancers";
import Hero from "./Hero";
import PricingModel from "./PricingModel";
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
      <PricingModel />
      <Ambassadors />
      <Stats />
      <FinalCTA />
      <Footer />
    </div>
  );
}
