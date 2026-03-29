import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

export default function ForEstablishments() {
  const leftFeatures = [
    {
      number: "1",
      title: "Démarrage simple, sans friction",
      description:
        "Mise en place rapide, prise en main guidée. Vous êtes opérationnels dès les premières heures.",
    },
    {
      number: "2",
      title: "Paramétrage sur mesure",
      description:
        "La solution se configure selon vos flux, vos postes, vos saisonnalités et vos obligations conventionnelles.",
    },
    {
      number: "3",
      title: "Montée en charge accompagnée",
      description:
        "Que vous ouvriez un second établissement ou que vous passiez à la vitesse supérieure, nous suivons votre croissance.",
    },
    {
      number: "4",
      title: "Évolutions continues",
      description:
        "Notre roadmap est construite avec les retours terrain de nos clients. Vos besoins façonnent la solution.",
    },
  ];

  const rightFeatures = [
    {
      icon: "✨",
      title: "Matching intelligent des profils",
      description:
        "Propositions automatiques selon vos critères métier.",
    },
    {
      icon: "📅",
      title: "Planification dynamique",
      description:
        "Gestion des plannings, remplacements et renforts en temps réel.",
    },
    {
      icon: "📊",
      title: "Tableaux de bord exploitation",
      description:
        "KPIs RH et opérationnels adaptés à votre structure.",
    },
    {
      icon: "💼",
      title: "Gestion administrative externalisée",
      description:
        "Conformité juridique et gestion des transactions sécurisées.",
    },
    {
      icon: "🎯",
      title: "Accès aux profils qualifiés",
      description:
        "Vivier de talents évalués et certifiés secteur HCR.",
    },
  ];

  return (
    <section
      id="modele-economique"
      className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#1e1424]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#cc9933] mb-4">
              Un logiciel évolutif
            </p>

            <h2
              className={`${playfair.className} text-3xl sm:text-4xl lg:text-[2.75rem] font-normal text-[#fcfaf7] leading-[1.15] mb-6`}
            >
              Une solution qui grandit avec votre établissement.
            </h2>

            <p className="text-base sm:text-lg text-[#bdaaa1] leading-relaxed mb-10">
              Shiftly n&apos;est pas un outil figé. Notre solution s&apos;adapte
              à votre niveau de structuration, vos pics d&apos;activité, vos
              contraintes saisonnières et vos ambitions de développement. Elle
              évolue avec vous — pas l&apos;inverse.
            </p>

            <div className="space-y-5">
              {leftFeatures.map((feature) => (
                <div key={feature.number} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#782478] text-[#fcfaf7] font-bold">
                      {feature.number}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#fcfaf7] mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#bdaaa1] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-2xl bg-[#2d1f35] p-6 sm:p-8 ring-1 ring-white/5">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#782478] px-4 py-2 text-xs font-semibold text-[#fcfaf7]">
                <span className="text-sm">✨</span>
                Fonctionnalités disponibles
              </div>

              <div className="space-y-4">
                {rightFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="group rounded-xl border border-white/5 bg-[#1e1424]/50 p-5 transition hover:border-[#782478]/30 hover:bg-[#1e1424]"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-2xl" aria-hidden>
                        {feature.icon}
                      </span>
                      <h3 className="text-base font-bold text-[#fcfaf7]">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[#bdaaa1] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
