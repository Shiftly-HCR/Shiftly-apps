export default function PricingModel() {
  const benefits = [
    {
      icon: "⚡",
      title: "Réactivité face aux imprévus",
      description:
        "Un poste vacant, une urgence de renfort — vous avez une réponse opérationnelle en moins de 24h.",
    },
    {
      icon: "🧭",
      title: "Pilotage simplifié",
      description:
        "Vos indicateurs clés sont visibles, lisibles et actionnables. Moins de temps en back-office, plus de présence terrain.",
    },
    {
      icon: "🔄",
      title: "Continuité de service",
      description:
        "Pics d'activité, congés, saisons — Shiftly garantit la continuité de vos équipes quelle que soit la période.",
    },
    {
      icon: "🏆",
      title: "Qualité opérationnelle",
      description:
        "Des profils évalués, des missions suivies, un accompagnement rigoureux. La qualité de service reste votre priorité — et la nôtre.",
    },
    {
      icon: "⏱️",
      title: "Gain de temps immédiat",
      description:
        "Finies les heures perdues sur les recrutements urgents, les recherches de remplaçants et la gestion administrative.",
    },
    {
      icon: "🤝",
      title: "Un partenaire engagé",
      description:
        "Pas d'outil livré et oublié. Nous assurons un suivi régulier, des ajustements et une vraie relation dans la durée.",
    },
    {
      icon: "📍",
      title: "Proximité locale",
      description:
        "Une antenne près de chez vous, une équipe qui connaît votre territoire et ses réalités de marché.",
    },
    {
      icon: "📈",
      title: "Solution qui vous suit",
      description:
        "Que vous grandissiez, que vous ouvriez un second site ou que vos besoins évoluent — la solution s'adapte.",
    },
  ];

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#fcfaf7]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#782478] mb-4">
            Ce que vous y gagnez
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1a1a1a] leading-[1.15] max-w-4xl mx-auto">
            Des résultats concrets, dès les premières semaines.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-[#e8e2dc] bg-white p-6 shadow-sm transition hover:border-[#782478]/30 hover:shadow-md"
            >
              <div className="mb-4 text-3xl" aria-hidden>
                {benefit.icon}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#1a1a1a] mb-3 leading-snug">
                {benefit.title}
              </h3>
              <p className="text-sm text-[#503342] leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
