import { Check } from "lucide-react";

export default function HCRExpertise() {
  const leftChecks = [
    "Compréhension des rythmes d'exploitation HCR",
    "Maîtrise des conventions collectives sectorielles",
    "Réseau de profils qualifiés et évalués",
    "Réactivité adaptée aux imprévus terrain",
    "Connaissance des enjeux de saisonnalité",
  ];

  const sectors = [
    {
      icon: "🏨",
      title: "Hôtellerie",
      description:
        "Réception, housekeeping, service, F&B — nous maîtrisons les postes, les standards et les exigences de l'hôtellerie indépendante comme des groupes.",
      bgColor: "bg-white",
      textColor: "text-[#1a1a1a]",
      descColor: "text-[#503342]",
    },
    {
      icon: "🍽️",
      title: "Restauration",
      description:
        "Brigade de cuisine, service en salle, bar, événementiel — nous connaissons les réalités d'un service de midi et les enjeux d'une ouverture.",
      bgColor: "bg-[#1e1424]",
      textColor: "text-[#fcfaf7]",
      descColor: "text-[#bdaaa1]",
    },
    {
      icon: "📊",
      title: "RH & exploitation",
      description:
        "Planning, gestion des absences, turn-over, pics saisonniers — nous apportons structure et fluidité à vos processus RH.",
      bgColor: "bg-[#1e1424]",
      textColor: "text-[#fcfaf7]",
      descColor: "text-[#bdaaa1]",
    },
    {
      icon: "😊",
      title: "Groupes & chaînes",
      description:
        "Multi-sites, standardisation, remontées d'indicateurs consolidés — notre solution s'adapte aux logiques de groupe comme aux établissements indépendants.",
      bgColor: "bg-white",
      textColor: "text-[#1a1a1a]",
      descColor: "text-[#503342]",
    },
  ];

  return (
    <section
      id="ambassadeurs"
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#f5f1ed]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] gap-12 lg:gap-16">
          <div className="lg:sticky lg:top-32 self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#782478] mb-4">
              Notre savoir-faire
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1a1a1a] leading-[1.15] mb-6">
              Une expertise construite sur le terrain.
            </h2>

            <p className="text-base sm:text-lg text-[#503342] leading-relaxed mb-8">
              Nous comprenons ce que représente un coup de feu, une saison
              haute, un poste vacant le samedi soir. Ce n&apos;est pas un
              problème RH abstrait — c&apos;est votre service, votre réputation,
              votre équipe.
            </p>

            <div className="space-y-3">
              {leftChecks.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
                >
                  <Check
                    className="h-5 w-5 flex-shrink-0 text-[#782478] mt-0.5"
                    aria-hidden
                  />
                  <p className="text-sm sm:text-base font-medium text-[#1a1a1a]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {sectors.map((sector, index) => (
              <div
                key={index}
                className={`rounded-2xl ${sector.bgColor} p-6 shadow-sm transition hover:shadow-md ${
                  sector.bgColor === "bg-[#1e1424]"
                    ? "ring-1 ring-white/5"
                    : "border border-[#e8e2dc]"
                }`}
              >
                <div className="mb-4 text-3xl" aria-hidden>
                  {sector.icon}
                </div>
                <h3
                  className={`text-lg sm:text-xl font-bold ${sector.textColor} mb-3`}
                >
                  {sector.title}
                </h3>
                <p
                  className={`text-sm sm:text-base ${sector.descColor} leading-relaxed`}
                >
                  {sector.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
