import { Star, Network, TrendingUp, ArrowRight } from "lucide-react";

export default function Ambassadors() {
  const benefits = [
    {
      icon: Star,
      title: "Représentez la marque",
      description: "Devenez l'ambassadeur Shiftly de votre région",
    },
    {
      icon: Network,
      title: "Développez votre réseau",
      description: "Connectez-vous avec les acteurs du secteur HCR",
    },
    {
      icon: TrendingUp,
      title: "Gagnez des commissions",
      description: "Rémunération attractive sur vos apports",
    },
  ];

  return (
    <section
      id="ambassadeurs"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#782478] to-[#cc9933]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#fcfaf7] mb-6">
            Devenez Ambassadeur Shiftly
          </h2>
          <p className="text-xl text-[#fcfaf7]/90 max-w-3xl mx-auto leading-relaxed">
            Partagez votre passion du métier, développez votre réseau et gagnez
            des commissions en représentant la marque dans votre région.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-[#fcfaf7]/10 backdrop-blur-sm border border-[#fcfaf7]/20 hover:bg-[#fcfaf7]/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="mb-6">
                <div className="w-16 h-16 rounded-xl bg-[#fcfaf7]/20 flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-[#fcfaf7]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#fcfaf7] mb-4">
                {benefit.title}
              </h3>
              <p className="text-[#fcfaf7]/90 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="group px-8 py-4 bg-[#fcfaf7] text-[#782478] rounded-lg hover:bg-[#fcfaf7]/90 transition-all transform hover:scale-105 flex items-center gap-2 font-semibold text-lg mx-auto">
            En savoir plus
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
