import { Users, Briefcase, TrendingUp } from "lucide-react";

export default function Stats() {
  const stats = [
    {
      icon: Users,
      value: "+1,3M",
      label: "d'employés dans le HCR en France",
    },
    {
      icon: Briefcase,
      value: "63 000",
      label: "postes vacants chaque année",
    },
    {
      icon: TrendingUp,
      value: "+14%",
      label: "d'évolution de l'emploi depuis 2019",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#fcfaf7]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#4c114f] mb-6">
            Shiftly répond à un besoin réel du terrain.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-[#bdaaa1]/20 to-[#fcfaf7] border border-[#bdaaa1] hover:border-[#782478] hover:shadow-xl transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#782478] to-[#cc9933] opacity-0 group-hover:opacity-10 blur-3xl transition-opacity"></div>

              <div className="relative">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#782478] to-[#cc9933] flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <stat.icon className="w-8 h-8 text-[#fcfaf7]" />
                  </div>
                </div>

                <div className="text-5xl font-bold bg-gradient-to-r from-[#782478] to-[#cc9933] bg-clip-text text-transparent mb-4">
                  {stat.value}
                </div>

                <p className="text-lg text-[#503342] leading-relaxed">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
