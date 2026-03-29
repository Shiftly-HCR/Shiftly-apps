"use client";

import { PublicTopNavigation } from "@/components/layout";
import { Footer } from "@shiftly/ui";
import PricingHero from "@/components/modele-economique/PricingHero";
import PricingCard from "@/components/modele-economique/PricingCard";
import WhyShiftly from "@/components/modele-economique/WhyShiftly";
import Comparison from "@/components/modele-economique/Comparison";
import HowItWorks from "@/components/modele-economique/HowItWorks";
import PricingCTA from "@/components/modele-economique/PricingCTA";

export default function ModeleEconomiquePage() {
  return (
    <div className="min-h-screen bg-[#fcfaf7]">
      <PublicTopNavigation />
      <PricingHero />
      <PricingCard />
      <WhyShiftly />
      <Comparison />
      <HowItWorks />
      <PricingCTA />
      <Footer />
    </div>
  );
}
