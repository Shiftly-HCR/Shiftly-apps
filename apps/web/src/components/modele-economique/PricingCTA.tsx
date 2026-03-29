import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingCTA() {
  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#6b2d9e] via-[#782478] to-[#8b3aa8] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(204, 153, 51, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(120, 36, 120, 0.2) 0%, transparent 50%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#cc9933] mb-6">
          Passons à l&apos;action
        </p>

        <h2
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold text-[#fcfaf7] leading-[1.15] mb-6 sm:mb-8"
        >
          50€/mois. Tout le secteur HCR.
          <br />
          <span className="italic">1 mois offert pour démarrer.</span>
        </h2>

        <p className="text-base sm:text-lg lg:text-xl text-[#fcfaf7]/90 leading-relaxed mb-10 sm:mb-12 max-w-2xl mx-auto">
          En 30 minutes, nous vous montrons comment Shiftly fonctionne pour
          votre type d&apos;établissement — sans jargon, sans engagement, avec
          un professionnel du secteur.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-8">
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#fcfaf7] px-8 py-4 text-base font-semibold text-[#782478] shadow-xl shadow-black/20 transition hover:bg-[#fcfaf7]/95 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fcfaf7]"
          >
            Démarrer avec 1 mois offert
            <ArrowRight
              className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>

        <p className="text-sm text-[#fcfaf7]/70">
          Sans engagement · Réponse sous 24h · Contact humain garanti
        </p>
      </div>
    </section>
  );
}
