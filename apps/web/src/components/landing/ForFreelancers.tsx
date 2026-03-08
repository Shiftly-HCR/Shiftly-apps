import {
  Heart,
  Crown,
  FileText,
  GraduationCap,
  PiggyBank,
  ArrowRight,
} from "lucide-react";

export default function ForFreelancers() {
  const features = [
    {
      icon: Heart,
      title: "Matching type Tinder",
      description: "Postulez en un swipe aux missions qui vous correspondent.",
    },
    {
      icon: Crown,
      title: "Accès Premium anticipé",
      description: "Débloquez les meilleures missions en avant-première.",
    },
    {
      icon: FileText,
      title: "CV uniforme et suivi",
      description:
        "Profil standardisé, suivi de missions et facturation intégrée.",
    },
    {
      icon: GraduationCap,
      title: "Micro-learning",
      description: "Formations courtes : soft skills, hygiène, langues.",
    },
    {
      icon: PiggyBank,
      title: "Gestion administrative",
      description: "Mutuelle et documents comptables simplifiés.",
    },
  ];

  return (
    <section
      id="freelances"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#bdaaa1]/20 to-[#fcfaf7]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-[#782478]/10 rounded-full mb-6">
              <span className="text-[#782478] font-semibold">
                Pour les freelances
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-[#4c114f] mb-6">
              Travaillez avec plus de liberté.
            </h2>

            <p className="text-xl text-[#503342] mb-12 leading-relaxed">
              Accédez aux meilleures opportunités, gérez votre activité en toute
              simplicité et développez vos compétences.
            </p>

            <button className="group px-8 py-4 bg-[#782478] text-[#fcfaf7] rounded-lg hover:bg-[#cc9933] transition-all transform hover:scale-105 flex items-center gap-2 font-semibold text-lg">
              Rejoindre Shiftly Freelance
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 rounded-xl bg-[#fcfaf7] border border-[#bdaaa1] hover:border-[#782478] hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-[#782478]/10 flex items-center justify-center group-hover:bg-[#782478] transition-colors">
                    <feature.icon className="w-6 h-6 text-[#782478] group-hover:text-[#fcfaf7] transition-colors" />
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
        </div>
      </div>
    </section>
  );
}
