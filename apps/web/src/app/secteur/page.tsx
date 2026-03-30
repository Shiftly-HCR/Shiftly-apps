"use client";

import { PublicTopNavigation } from "@/components/layout";
import { Footer } from "@shiftly/ui";
import SecteurHero from "@/components/secteur/SecteurHero";
import SecteurProblem from "@/components/secteur/SecteurProblem";

export default function SecteurPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf7]">
      <PublicTopNavigation />
      <SecteurHero />
      <SecteurProblem />
      <Footer />
    </div>
  );
}
