import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

export default function AboutHero() {
  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#fcfaf7]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#782478] mb-6">
            À propos de Shiftly
          </p>

          <h1
            className={`${playfair.className} text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1a1a1a] leading-[1.1] mb-8`}
          >
            La solution RH qui comprend{" "}
            <span className="italic text-[#782478]">vraiment</span> le terrain
            HCR.
          </h1>

          <p className="text-lg sm:text-xl text-[#503342] leading-relaxed max-w-3xl mx-auto">
            Née de l'observation directe des difficultés de recrutement dans
            l'hôtellerie-restauration, Shiftly est une plateforme de mise en
            relation pensée par et pour les professionnels du secteur.
          </p>
        </div>
      </div>
    </section>
  );
}
