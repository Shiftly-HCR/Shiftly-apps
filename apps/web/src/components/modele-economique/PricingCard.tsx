import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingCard() {
  const features = [
    {
      title: "Accès complet au réseau local de talents",
      description:
        "profils qualifiés, locaux et vérifiés, disponibles dans votre bassin d'emploi",
    },
    {
      title: "Annonces à volonté, sans supplément",
      description:
        "publiez autant de missions que nécessaire, sans coût additionnel par recrutement",
    },
    {
      title: "Un interlocuteur dédié, pas un robot",
      description:
        "un contact humain local, disponible, qui connaît votre secteur et vos contraintes d'exploitation",
    },
    {
      title: "Publication en 2 minutes",
      description:
        "définissez le poste, les horaires et le TJM. Votre mission est diffusée immédiatement sur notre réseau",
    },
    {
      title: "Premiers profils reçus en moins de 48h",
      description:
        "candidatures pertinentes, pré-sélectionnées par nos équipes locales selon vos critères métier",
    },
    {
      title: "Solution évolutive construite avec vous",
      description:
        "la plateforme évolue selon vos retours terrain. Vos besoins façonnent notre développement",
    },
    {
      title: "1 mois offert supplémentaire",
      description:
        "pour 2 parrainages d'établissements HCR dans votre réseau",
    },
  ];

  const sideCards = [
    {
      value: "400€",
      label: "économisés en moyenne par mission recrutée *",
    },
    {
      value: "<48h",
      label: "pour recevoir vos premiers profils qualifiés",
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#f5f1ed]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
          <div className="rounded-3xl bg-[#1e1424] p-8 sm:p-10 shadow-2xl ring-1 ring-white/5">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#782478] px-4 py-2 text-xs font-semibold text-[#fcfaf7]">
              ✨ 1 mois offert — offre de lancement
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#bdaaa1] mb-3">
              Abonnement mensuel · Secteur HCR
            </p>

            <h2
              className="text-3xl sm:text-4xl font-bold text-[#fcfaf7] mb-8"
            >
              Shiftly Établissement
            </h2>

            <div className="mb-8 flex items-baseline gap-2">
              <span className="text-[#bdaaa1]">€</span>
              <span
                className="text-6xl sm:text-7xl font-bold text-[#fcfaf7]"
              >
                50
              </span>
              <span className="text-lg text-[#bdaaa1]">/ mois TTC</span>
            </div>

            <p className="text-sm text-[#bdaaa1] mb-6">
              Sans engagement · Sans frais cachés
            </p>

            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#782478] px-5 py-3 text-sm font-semibold text-[#fcfaf7]">
              🎁 1 mois offert à l&apos;inscription
            </div>

            <div className="space-y-4 border-t border-white/10 pt-8 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#782478]">
                      <Check className="h-3 w-3 text-[#fcfaf7]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#fcfaf7] mb-1">
                      {feature.title}
                    </p>
                    <p className="text-sm text-[#bdaaa1] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="block w-full rounded-xl bg-[#782478] px-6 py-4 text-center text-base font-semibold text-[#fcfaf7] shadow-lg shadow-[#782478]/25 transition hover:bg-[#5c1c5c]"
            >
              Commencer maintenant →
            </Link>

            <p className="mt-4 text-center text-xs text-[#bdaaa1]">
              Aucune carte requise pour l&apos;essai · Réponse sous 24h
            </p>
          </div>

          <div className="space-y-6">
            {sideCards.map((card, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#e8e2dc] bg-white p-8 text-center shadow-sm"
              >
                <p
                  className="text-5xl sm:text-6xl font-bold text-[#782478] mb-3"
                >
                  {card.value}
                </p>
                <p className="text-sm text-[#503342] leading-relaxed">
                  {card.label}
                </p>
              </div>
            ))}

            <p className="text-xs text-[#503342]/70 leading-relaxed px-4">
              * Économie calculée sur la base d&apos;une mission 20h/semaine au
              TJM de 22€, comparée aux solutions traditionnelles d&apos;intérim.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
