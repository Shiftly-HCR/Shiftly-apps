import { Playfair_Display } from "next/font/google";
import { Check, X, AlertTriangle } from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

export default function Comparison() {
  const comparisonRows = [
    {
      criteria: "Profils locaux & vérifiés",
      shiftly: { type: "check", value: "100%" },
      others: { type: "warning", value: "Variable" },
    },
    {
      criteria: "Connaissance secteur HCR",
      shiftly: { type: "check", value: "Oui" },
      others: { type: "warning", value: "Partielle" },
    },
    {
      criteria: "Publication en 2 minutes",
      shiftly: { type: "check", value: "Oui" },
      others: { type: "warning", value: "Long" },
    },
    {
      criteria: "Contact local humain dédié",
      shiftly: { type: "check", value: "Oui" },
      others: { type: "cross", value: "Non" },
    },
    {
      criteria: "Tarif fixe tout compris",
      shiftly: { type: "price", value: "50€/mois" },
      others: { type: "cross", value: "Coûts variables" },
    },
    {
      criteria: "Talent disponible <48h",
      shiftly: { type: "check", value: "Oui" },
      others: { type: "warning", value: "Selon dispo" },
    },
    {
      criteria: "Évolution selon vos retours",
      shiftly: { type: "check", value: "Oui" },
      others: { type: "cross", value: "Non" },
    },
    {
      criteria: "Sans engagement",
      shiftly: { type: "check", value: "Oui" },
      others: { type: "cross", value: "Contrat annuel" },
    },
  ];

  return (
    <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#1e1424]">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#cc9933] mb-6">
              Le marché vs Shiftly
            </p>

            <h2
              className={`${playfair.className} text-3xl sm:text-4xl lg:text-5xl font-normal text-[#fcfaf7] leading-[1.15] mb-6`}
            >
              73% des établissements HCR peinent à trouver les bons profils.
            </h2>

            <p className="text-base sm:text-lg text-[#bdaaa1] leading-relaxed mb-8">
              Source UMIH. Un mauvais recrutement coûte en moyenne entre 5 000€
              et 10 000€ à un établissement — en temps perdu, en désorganisation
              et en qualité de service dégradée.
            </p>

            <div className="rounded-2xl border border-white/5 bg-[#2d1f35] p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#bdaaa1] mb-4">
                Économie moyenne par mission avec Shiftly
              </p>
              <p
                className={`${playfair.className} text-5xl sm:text-6xl font-normal text-[#cc9933] mb-3`}
              >
                400€
              </p>
              <p className="text-sm text-[#bdaaa1] leading-relaxed">
                économisés per mission recrutée vs solutions traditionnelles
                d&apos;intérim
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#2d1f35] overflow-hidden shadow-xl">
            <div className="grid grid-cols-3 border-b border-white/5">
              <div className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-[#bdaaa1]">
                Critères
              </div>
              <div className="border-l border-white/5 bg-[#782478]/20 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#fcfaf7]">
                Shiftly
              </div>
              <div className="border-l border-white/5 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#bdaaa1]">
                Autres
              </div>
            </div>

            {comparisonRows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-3 border-b border-white/5 last:border-b-0"
              >
                <div className="px-4 py-4 text-sm text-[#fcfaf7]">
                  {row.criteria}
                </div>
                <div className="border-l border-white/5 bg-[#782478]/5 px-4 py-4 flex items-center justify-center gap-2">
                  {row.shiftly.type === "check" && (
                    <Check className="h-4 w-4 text-emerald-400" />
                  )}
                  {row.shiftly.type === "price" && (
                    <Check className="h-4 w-4 text-emerald-400" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      row.shiftly.type === "price"
                        ? "text-[#fcfaf7]"
                        : "text-emerald-400"
                    }`}
                  >
                    {row.shiftly.value}
                  </span>
                </div>
                <div className="border-l border-white/5 px-4 py-4 flex items-center justify-center gap-2">
                  {row.others.type === "cross" && (
                    <X className="h-4 w-4 text-red-400" />
                  )}
                  {row.others.type === "warning" && (
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      row.others.type === "cross"
                        ? "text-red-400"
                        : "text-amber-400"
                    }`}
                  >
                    {row.others.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
