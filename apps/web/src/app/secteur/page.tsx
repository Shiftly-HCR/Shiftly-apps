"use client";

import { PublicTopNavigation } from "@/components/layout";
import { Footer } from "@shiftly/ui";
import SecteurHero from "@/components/secteur/SecteurHero";

export default function SecteurPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf7]">
      <PublicTopNavigation />
      <SecteurHero />
      <Footer />
    </div>
  );
}
