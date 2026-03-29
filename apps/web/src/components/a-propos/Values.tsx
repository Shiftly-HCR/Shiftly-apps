import { Shield, Clock, Users, Award, Scale, Headphones } from "lucide-react";

export default function Values() {
  const values = [
    {
      icon: Shield,
      title: "Conformité garantie",
      description:
        "Vérification systématique des documents (URSSAF, RC Pro, Kbis) via notre service Shiftly Compliance. Zéro risque de travail dissimulé.",
    },
    {
      icon: Clock,
      title: "Réactivité terrain",
      description:
        "Nous comprenons qu'un besoin en HCR ne peut pas attendre. Réponse sous 24h, profils qualifiés en moins de 48h.",
    },
    {
      icon: Users,
      title: "Réseau local qualifié",
      description:
        "Plus de 350 établissements partenaires et un réseau de talents vérifiés, évalués et disponibles dans votre région.",
    },
    {
      icon: Award,
      title: "Qualité de service",
      description:
        "98% de taux de satisfaction et 4.9/5 en moyenne. Nos équipes locales connaissent les exigences du secteur HCR.",
    },
    {
      icon: Scale,
      title: "Transparence totale",
      description:
        "Tarification claire et sans surprise. 50€/mois tout compris, sans frais cachés ni coût par recrutement.",
    },
    {
      icon: Headphones,
      title: "Support humain",
      description:
        "Un contact humain garanti. Nos équipes régionales vous accompagnent à chaque étape, de la publication à l'intégration.",
    },
  ];

  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#fcfaf7]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#782478] mb-6">
            Nos valeurs
          </p>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] leading-[1.15] mb-6"
          >
            Ce qui nous guide au quotidien.
          </h2>

          <p className="text-base sm:text-lg text-[#503342] leading-relaxed max-w-3xl mx-auto">
            Des principes clairs, ancrés dans la réalité du secteur
            HCR, pour vous offrir un service fiable et adapté à vos enjeux.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8e2dc] transition hover:shadow-md"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#782478]/10 mb-4">
                <value.icon className="h-6 w-6 text-[#782478]" aria-hidden />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-3">
                {value.title}
              </h3>
              <p className="text-sm sm:text-base text-[#503342] leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
