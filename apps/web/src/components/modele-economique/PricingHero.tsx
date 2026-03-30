export default function PricingHero() {
  const features = [
    "100% profils locaux & vérifiés",
    "Annonces illimitées",
    "Aucun coût par recrutement",
    "Sans engagement",
  ];

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#fcfaf7]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#782478] mb-6">
            Tarifs & avantages
          </p>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold text-[#1a1a1a] leading-[1.15] mb-6"
          >
            Un abonnement.{" "}
            <span className="italic text-[#782478]">Tout inclus.</span>
            <br />
            Sans mauvaise surprise.
          </h1>

          <p className="text-base sm:text-lg text-[#503342] leading-relaxed max-w-3xl mx-auto mb-12">
            Hôtels, restaurants, cafés, traiteurs — Shiftly propose un modèle
            simple, transparent et pensé pour les réalités du terrain HCR. Un
            tarif fixe, un contact humain, des profils qualifiés.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 rounded-2xl border border-[#e8e2dc] bg-white px-6 sm:px-8 py-5 shadow-sm">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#782478]" />
                <span className="text-sm sm:text-base font-semibold text-[#1a1a1a]">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
