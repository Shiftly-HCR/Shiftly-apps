import { Users, Calendar, Scale, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SolutionForHCR() {
  const features = [
    {
      icon: Users,
      title: "Gestion des ressources humaines",
      description:
        "Recrutement, pré-sélection des profils, suivi des disponibilités, gestion administrative. Nous sécurisons vos équipes à chaque étape.",
    },
    {
      icon: Calendar,
      title: "Pilotage opérationnel",
      description:
        "Planification, suivi des missions, gestion des remplacements et des renforts. Tout est centralisé, visible, actionnable.",
    },
    {
      icon: Scale,
      title: "Conformité juridique et paie",
      description:
        "Contrats, déclarations, gestion des transactions — nous intégrons un service externalisé dédié pour assurer chaque aspect réglementaire.",
    },
    {
      icon: TrendingUp,
      title: "Suivi et reporting",
      description:
        "Tableaux de bord adaptés aux directeurs et responsables d'exploitation. Pilotez vos indicateurs RH et opérationnels en un coup d'œil.",
    },
  ];

  return (
    <section
      id="etablissements"
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#fcfaf7]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-32">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#782478] mb-4">
              Ce que nous faisons
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1a1a1a] leading-[1.15] mb-6">
              Une solution pensée pour le terrain HCR.
            </h2>

            <p className="text-base sm:text-lg text-[#503342] leading-relaxed mb-8">
              Shiftly ne se limite pas à un outil de gestion. Nous accompagnons
              les établissements dans leurs réalités quotidiennes : staffing,
              pic d&apos;activité, gestion des plannings, enjeux RH, continuité
              de service. Du coup de feu à la saison haute, nous sommes là.
            </p>

            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#782478] px-6 py-3 text-base font-semibold text-[#fcfaf7] shadow-lg shadow-[#782478]/25 transition hover:bg-[#5c1c5c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#782478]"
            >
              Parler à un expert métier
              <ArrowRight
                className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-[#e8e2dc] bg-white p-6 sm:p-7 shadow-sm transition hover:border-[#782478]/30 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#782478]/5">
                  <feature.icon
                    className="h-6 w-6 text-[#782478]"
                    aria-hidden
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-[#503342] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
