export default function ProblemSolution() {
  const stats = [
    {
      value: "350",
      label: "établissements",
      sublabel: "accompagnés en France",
    },
    {
      value: "4",
      label: "antennes locales sur le",
      sublabel: "territoire",
    },
    {
      value: "100",
      suffix: "%",
      label: "de missions honorées",
      sublabel: "dans les délais",
    },
    {
      value: "4.9",
      suffix: "/5",
      label: "de satisfaction client",
      sublabel: "mesurée",
    },
    {
      value: "<24",
      suffix: "h",
      label: "délai moyen de réponse",
      sublabel: "opérationnelle",
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#f5f1ed]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex items-center gap-3">
          <div className="flex -space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#782478] to-[#cc9933] ring-2 ring-[#fcfaf7]" />
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#cc9933] to-[#782478] ring-2 ring-[#fcfaf7]" />
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#4c114f] to-[#782478] ring-2 ring-[#fcfaf7]" />
          </div>
          <p className="text-sm sm:text-base text-[#503342]">
            <span className="font-semibold text-[#1a1a1a]">
              +350 établissements
            </span>{" "}
            nous font déjà confiance en France
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center border-r border-[#bdaaa1]/30 last:border-r-0 sm:last:border-r lg:last:border-r-0 px-3 sm:px-4"
            >
              <p
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#782478] leading-none tracking-tight"
              >
                {stat.value}
                {stat.suffix && (
                  <span className="text-2xl sm:text-3xl lg:text-4xl align-top">
                    {stat.suffix}
                  </span>
                )}
              </p>
              <p className="mt-3 text-xs sm:text-sm text-[#1a1a1a] leading-tight">
                {stat.label}
              </p>
              <p className="mt-1 text-xs text-[#503342]/70 leading-tight">
                {stat.sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
