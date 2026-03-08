import { Clock, MessageCircle, Shield } from "lucide-react";

export default function ProblemSolution() {
  const features = [
    {
      icon: Clock,
      title: "Recrutez en quelques minutes",
      description:
        "Matching intelligent et profils certifiés pour des recrutements ultra-rapides.",
    },
    {
      icon: MessageCircle,
      title: "Communication simplifiée",
      description:
        "Chat et visio intégrés pour échanger directement avec les talents.",
    },
    {
      icon: Shield,
      title: "Confiance et transparence",
      description:
        "Notations bilatérales et profils vérifiés pour une collaboration sereine.",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#fcfaf7]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#4c114f] mb-4">
            Le recrutement HCR n&apos;a jamais été aussi fluide.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-[#bdaaa1]/20 hover:bg-gradient-to-br hover:from-[#782478] hover:to-[#cc9933] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="mb-6">
                <div className="w-16 h-16 rounded-xl bg-[#fcfaf7] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-[#782478] group-hover:text-[#cc9933]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#4c114f] mb-4 group-hover:text-[#fcfaf7] transition-colors">
                {feature.title}
              </h3>
              <p className="text-[#503342] leading-relaxed group-hover:text-[#fcfaf7]/90 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
