import { Zap, MapPin, Handshake, Euro, RefreshCw, Trophy, FileText, ShieldCheck } from "lucide-react";

export default function WhyShiftly() {
  const benefits = [
    {
      icon: Zap,
      iconBg: "bg-[#fef3c7]",
      iconColor: "text-[#f59e0b]",
      title: "Rapidité d'exécution",
      description:
        "Une annonce publiée en 2 minutes. Des profils reçus en moins de 48h. Zéro délai inutile entre votre besoin et la solution opérationnelle.",
    },
    {
      icon: MapPin,
      iconBg: "bg-[#fce7f3]",
      iconColor: "text-[#ec4899]",
      title: "Profils 100% locaux",
      description:
        "Tous nos talents sont locaux, vérifiés et déjà dans le rythme du service. Ils connaissent votre secteur, pas juste une fiche de poste générique.",
    },
    {
      icon: Handshake,
      iconBg: "bg-[#fef3c7]",
      iconColor: "text-[#f59e0b]",
      title: "Contact humain dédié",
      description:
        "Un interlocuteur local, joignable, qui suit votre établissement dans la durée. Pas de chatbot, pas de ticket anonyme. Une vraie relation.",
    },
    {
      icon: Euro,
      iconBg: "bg-[#e0e7ff]",
      iconColor: "text-[#6366f1]",
      title: "Tarif fixe, tout compris",
      description:
        "50€/mois, sans coût par recrutement, sans commission cachée. Recrutez autant que nécessaire pour un prix fixe et parfaitement prévisible.",
    },
    {
      icon: RefreshCw,
      iconBg: "bg-[#dbeafe]",
      iconColor: "text-[#3b82f6]",
      title: "Solution évolutive",
      description:
        "La plateforme s'adapte à vos retours et à vos besoins réels. Vous n'êtes pas enfermé dans un outil figé conçu pour d'autres secteurs.",
    },
    {
      icon: Trophy,
      iconBg: "bg-[#fef3c7]",
      iconColor: "text-[#f59e0b]",
      title: "Standard Accor sur les profils",
      description:
        "Partenariat avec Tami, spécialiste de l'évaluation RH HCR, qui réalise les pré-sélections pour le groupe Accor — avec 100% de satisfaction.",
    },
    {
      icon: FileText,
      iconBg: "bg-[#f3e8ff]",
      iconColor: "text-[#a855f7]",
      title: "Gestion administrative incluse",
      description:
        "Contrats, conformité juridique, gestion des transactions — pris en charge via notre service externalisé. Vous restez concentré sur votre exploitation.",
    },
    {
      icon: ShieldCheck,
      iconBg: "bg-[#d1fae5]",
      iconColor: "text-[#10b981]",
      title: "Sans engagement",
      description:
        "Pas d'engagement annuel, pas de frais de résiliation. Vous restez parce que ça fonctionne — pas parce que vous êtes sous contrat.",
    },
  ];

  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#fcfaf7]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#782478] mb-6">
            Pourquoi Shiftly
          </p>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] leading-[1.15] mb-6"
          >
            Ce qui change vraiment avec Shiftly.
          </h2>

          <p className="text-base sm:text-lg text-[#503342] leading-relaxed max-w-3xl mx-auto">
            Nous avons conçu une solution pour les réalités du terrain HCR — pas
            pour un marché généraliste. Voici ce que cela change concrètement au
            quotidien.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#e8e2dc] bg-white p-6 shadow-sm transition hover:border-[#782478]/30 hover:shadow-md"
            >
              <div
                className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${benefit.iconBg}`}
              >
                <benefit.icon
                  className={`h-7 w-7 ${benefit.iconColor}`}
                  aria-hidden
                />
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
