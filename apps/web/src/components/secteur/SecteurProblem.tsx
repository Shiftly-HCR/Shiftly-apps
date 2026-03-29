import { Clock, RefreshCw, Unplug } from "lucide-react";

export default function SecteurProblem() {
  const problems = [
    {
      icon: Clock,
      title: "Très chronophage",
      description:
        "Des heures passées à trier des profils inadaptés, à relancer des candidats absents, à gérer des no-shows en dernière minute.",
    },
    {
      icon: RefreshCw,
      title: "Turn-over constant",
      description:
        "Une rotation permanente qui désorganise les brigades, dégrade la qualité de service et épuise les équipes en place.",
    },
    {
      icon: Unplug,
      title: "Solutions déconnectées du terrain",
      description:
        "Les plateformes généralistes ne connaissent pas la réalité d'un service de restaurant ou d'une réception d'hôtel à 7h du matin.",
    },
  ];

  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#1e1424]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#cc9933] mb-6">
            Le constat terrain
          </p>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fcfaf7] leading-[1.15] mb-12"
          >
            L&apos;instabilité des équipes fragilise tout le secteur HCR.
          </h2>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/5 bg-[#2d1f35] p-6 sm:p-8 text-center transition hover:border-white/10"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
                  <problem.icon className="h-7 w-7 text-[#cc9933]" aria-hidden />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#fcfaf7] mb-3">
                  {problem.title}
                </h3>
                <p className="text-sm sm:text-base text-[#bdaaa1] leading-relaxed">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <p
              className="text-lg sm:text-xl text-[#bdaaa1]/70 italic"
            >
              Et si vous aviez un allié qui connaît vraiment votre métier ?
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#fcfaf7]">
              Shiftly est né pour{" "}
              <span className="text-[#782478]">répondre à ces enjeux</span> —
              secteur par secteur.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
