import { Percent, Crown, Package } from "lucide-react";

export default function PricingModel() {
  const models = [
    {
      icon: Percent,
      title: "Commission",
      value: "15%",
      description: "sur les missions réalisées",
      color: "from-[#782478] to-[#cc9933]",
    },
    {
      icon: Crown,
      title: "Premium Freelance",
      value: "50€",
      description: "par mois",
      color: "from-[#cc9933] to-[#782478]",
    },
    {
      icon: Package,
      title: "Packs de services",
      value: "Sur mesure",
      description: "statut, assurance, mutuelle",
      color: "from-[#782478] to-[#cc9933]",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#bdaaa1]/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#4c114f] mb-6">
            Modèle économique transparent
          </h2>
          <p className="text-2xl text-[#782478] font-semibold">
            Un modèle simple, gagnant-gagnant pour freelances et établissements.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {models.map((model, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl bg-[#fcfaf7] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${model.color} opacity-0 group-hover:opacity-10 transition-opacity`}
              ></div>

              <div className="relative">
                <div className="mb-6">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center`}
                  >
                    <model.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#4c114f] mb-2">
                  {model.title}
                </h3>

                <div className="text-4xl font-bold bg-gradient-to-r from-[#782478] to-[#cc9933] bg-clip-text text-transparent mb-2">
                  {model.value}
                </div>

                <p className="text-[#503342]">{model.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
