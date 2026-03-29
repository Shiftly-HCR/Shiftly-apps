import { Playfair_Display } from "next/font/google";
import { Clock, Zap, CheckCircle } from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: Clock,
      badge: "⏱️ 2 minutes",
      title: "Vous publiez votre besoin",
      description:
        "Définissez le poste, les horaires, le TJM et vos contraintes terrain. La mission est diffusée immédiatement sur notre réseau local HCR.",
    },
    {
      number: "2",
      icon: Zap,
      badge: "⚡ < 48h",
      title: "Vous recevez des profils qualifiés",
      description:
        "Nos équipes locales vous suggèrent les profils les mieux adaptés. Accédez aux expériences, avis et disponibilités de chaque talent en un coup d'œil.",
    },
    {
      number: "3",
      icon: CheckCircle,
      badge: "✓ Immédiat",
      title: "Vous choisissez et renforcez",
      description:
        "Sélectionnez le bon profil, confirmez la mission. Le talent s'intègre immédiatement à votre équipe — déjà dans le rythme du service.",
    },
  ];

  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#fcfaf7]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#782478] mb-6">
            Comment ça fonctionne
          </p>

          <h2
            className={`${playfair.className} text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1a1a1a] leading-[1.15] mb-6`}
          >
            Opérationnel dès le premier service.
          </h2>

          <p className="text-base sm:text-lg text-[#503342] leading-relaxed max-w-3xl mx-auto">
            Trois étapes. Aucune formation nécessaire. Vos équipes renforcées en
            moins de 48h.
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-[#782478] via-[#782478] to-[#782478] hidden lg:block" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#782478] shadow-lg shadow-[#782478]/25">
                      <span className="text-3xl font-bold text-[#fcfaf7]">
                        {step.number}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#782478]/10 px-4 py-2 text-xs font-semibold text-[#782478]">
                    {step.badge}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-4">
                    {step.title}
                  </h3>

                  <p className="text-sm sm:text-base text-[#503342] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
