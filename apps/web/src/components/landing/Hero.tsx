import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-[#fcfaf7]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 75% 45%, rgba(120, 36, 120, 0.18), transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-12 lg:gap-16 items-center">
          <div className="space-y-8 lg:space-y-10">
            <h1
              className="text-4xl sm:text-5xl lg:text-[3.35rem] xl:text-6xl leading-[1.08] tracking-tight text-[#1a1a1a] font-bold"
            >
              <span className="block">La solution qui</span>
              <span className="block text-[#782478] italic font-normal">
                s&apos;adapte
              </span>
              <span className="block">à votre</span>
              <span className="block">exploitation.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#503342] leading-relaxed max-w-xl">
              Shiftly accompagne les groupes hôteliers et de restauration dans
              la gestion humaine et opérationnelle : recrutement, organisation
              et pilotage, avec une approche adaptée à chaque site.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#782478] px-8 py-4 text-lg font-semibold text-[#fcfaf7] shadow-lg shadow-[#782478]/25 transition hover:bg-[#5c1c5c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#782478]"
              >
                Demander une démo
                <ArrowRight
                  className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <Link
                href="#etablissements"
                className="text-base font-medium text-[#1a1a1a] underline decoration-[#1a1a1a] underline-offset-4 transition hover:text-[#782478] hover:decoration-[#782478]"
              >
                Découvrir la solution
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none lg:mx-0 min-h-[420px] sm:min-h-[480px]">
            <div
              className="relative z-10 rounded-2xl bg-[#1e1424] p-6 sm:p-8 shadow-2xl shadow-black/20 ring-1 ring-white/5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#bdaaa1]">
                Établissement accompagné
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-[#fcfaf7] leading-tight">
                Hôtel Le Méridien Lyon
              </h2>
              <p className="mt-2 text-sm text-[#bdaaa1]">
                Directeur d&apos;exploitation — Lyon 2e
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                <div>
                  <p className="text-xl sm:text-2xl text-[#fcfaf7]">12h</p>
                  <p className="mt-1 text-xs text-[#bdaaa1]">Délai moyen</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl text-[#fcfaf7]">98%</p>
                  <p className="mt-1 text-xs text-[#bdaaa1]">
                    Missions honorées
                  </p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl text-[#fcfaf7]">3 ans</p>
                  <p className="mt-1 text-xs text-[#bdaaa1]">Partenariat</p>
                </div>
              </div>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#4c114f] px-4 py-2 text-sm text-[#fcfaf7]">
                <span
                  className="relative flex h-2 w-2"
                  aria-hidden
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Suivi actif en cours
              </div>
            </div>

            {/* Purple stat card overlap */}
            <div
              className="absolute -bottom-2 right-0 z-20 w-[46%] max-w-[200px] rounded-2xl bg-[#782478] p-5 sm:p-6 shadow-xl shadow-[#782478]/40"
            >
              <p className="text-4xl sm:text-5xl font-bold leading-none text-[#fcfaf7]">
                10
              </p>
              <p className="mt-2 text-xs sm:text-sm font-sans font-medium text-[#fcfaf7]/90">
                Antennes locales
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
