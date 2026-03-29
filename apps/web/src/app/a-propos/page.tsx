"use client";

import { PublicTopNavigation } from "@/components/layout";
import { Footer } from "@shiftly/ui";
import AboutHero from "@/components/a-propos/AboutHero";
import Mission from "@/components/a-propos/Mission";
import Values from "@/components/a-propos/Values";
import Team from "@/components/a-propos/Team";
import AboutCTA from "@/components/a-propos/AboutCTA";

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf7]">
      <PublicTopNavigation />
      <AboutHero />
      <Mission />
      <Values />
      <Team />
      <AboutCTA />
      <Footer />
    </div>
  );
}
