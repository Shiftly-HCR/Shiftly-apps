import {
  Zap,
  CheckCircle,
  Users,
  BarChart3,
  Building2,
  ArrowRight,
} from "lucide-react";

export default function ForEstablishments() {
  const features = [
    {
      icon: Zap,
      title: "Matching intelligent",
      description: "Candidats disponibles et qualifiés sous 48h.",
    },
    {
      icon: CheckCircle,
      title: "Freelances certifiés",
      description: "Base de talents vérifiés et évalués par la communauté.",
    },
    {
      icon: Users,
      title: "Équipes prêtes à l'emploi",
      description: "Constitution de teams complètes en quelques clics.",
    },
    {
      icon: BarChart3,
      title: "Outils de suivi",
      description: "Statistiques de recrutement et gestion simplifiée.",
    },
    {
      icon: Building2,
      title: "Accès Premium",
      description: "Analytics avancés et gestion multi-sites.",
    },
  ];

  return (
    <section
      id="etablissements"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[#fcfaf7]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 rounded-xl bg-[#bdaaa1]/20 hover:bg-gradient-to-r hover:from-[#cc9933]/10 hover:to-[#782478]/10 border border-transparent hover:border-[#cc9933] hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-[#cc9933]/10 flex items-center justify-center group-hover:bg-[#cc9933] transition-colors">
                    <feature.icon className="w-6 h-6 text-[#cc9933] group-hover:text-[#fcfaf7] transition-colors" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#4c114f] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#503342]">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-block px-4 py-2 bg-[#cc9933]/10 rounded-full mb-6">
              <span className="text-[#cc9933] font-semibold">
                Pour les établissements
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-[#4c114f] mb-6">
              Constituez vos équipes en un instant.
            </h2>

            <p className="text-xl text-[#503342] mb-12 leading-relaxed">
              Accédez à un vivier de talents qualifiés, constituez vos équipes
              rapidement et pilotez vos recrutements efficacement.
            </p>

            <button className="group px-8 py-4 bg-[#cc9933] text-[#fcfaf7] rounded-lg hover:bg-[#782478] transition-all transform hover:scale-105 flex items-center gap-2 font-semibold text-lg">
              Essayer Shiftly Entreprise
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
