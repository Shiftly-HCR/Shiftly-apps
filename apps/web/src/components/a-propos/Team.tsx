import { Playfair_Display } from "next/font/google";
import { Building2, MapPin, Briefcase, GraduationCap } from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

export default function Team() {
  const expertise = [
    {
      icon: Briefcase,
      title: "Expérience HCR",
      description:
        "Notre équipe a travaillé dans l'hôtellerie et la restauration. Nous connaissons les contraintes du service, les pics d'activité et les enjeux opérationnels.",
    },
    {
      icon: MapPin,
      title: "Présence locale",
      description:
        "10 antennes régionales pour un accompagnement de proximité. Nos équipes locales connaissent votre bassin d'emploi et votre marché.",
    },
    {
      icon: GraduationCap,
      title: "Expertise RH & juridique",
      description:
        "Conformité réglementaire, conventions collectives, gestion des prestataires indépendants — nous maîtrisons le cadre légal du secteur.",
    },
    {
      icon: Building2,
      title: "Vision long terme",
      description:
        "Nous ne sommes pas une agence d'intérim. Nous construisons une solution durable qui grandit avec votre établissement et s'adapte à vos besoins.",
    },
  ];

  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#f5f1ed]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#782478] mb-6">
            Notre équipe
          </p>

          <h2
            className={`${playfair.className} text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1a1a1a] leading-[1.15] mb-6`}
          >
            Une équipe qui connaît votre métier.
          </h2>

          <p className="text-base sm:text-lg text-[#503342] leading-relaxed max-w-3xl mx-auto">
            Professionnels de l'HCR, experts RH et spécialistes de la
            conformité — tous réunis pour vous offrir un service adapté aux
            réalités du terrain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {expertise.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-[#e8e2dc] transition hover:shadow-md"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#782478]/10 mb-5">
                <item.icon className="h-7 w-7 text-[#782478]" aria-hidden />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-4">
                {item.title}
              </h3>
              <p className="text-sm sm:text-base text-[#503342] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#782478] rounded-2xl p-8 sm:p-10 shadow-xl text-center">
          <h3
            className={`${playfair.className} text-2xl sm:text-3xl font-normal text-white mb-4`}
          >
            SAS SHIFTLY
          </h3>
          <div className="space-y-2 text-[#fcfaf7]/90">
            <p className="text-sm sm:text-base">
              Société par actions simplifiée au capital de 3 000 €
            </p>
            <p className="text-sm sm:text-base">
              SIREN 100 524 719 — RCS Paris
            </p>
            <p className="text-sm sm:text-base">
              6 Rue d'Armaillé, 75017 Paris, France
            </p>
            <p className="text-sm sm:text-base mt-4">
              <a
                href="mailto:contact@shiftly.pro"
                className="text-white underline hover:text-[#fcfaf7] transition"
              >
                contact@shiftly.pro
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
