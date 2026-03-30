import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

export default function AboutCTA() {
  return (
    <section
      data-nav-dark
      className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#782478]"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-6"
        >
          Prêt à simplifier votre recrutement HCR ?
        </h2>

        <p className="text-base sm:text-lg text-[#fcfaf7]/90 leading-relaxed mb-10 max-w-2xl mx-auto">
          Rejoignez plus de 350 établissements qui font confiance à Shiftly
          pour renforcer leurs équipes rapidement et en toute conformité.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-8">
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#fcfaf7] px-8 py-4 text-base font-semibold text-[#782478] shadow-xl shadow-black/20 transition hover:bg-[#fcfaf7]/95 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fcfaf7]"
          >
            Démarrer avec 1 mois offert
            <ArrowRight
              className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>

          <a
            href="mailto:contact@shiftly.pro?subject=Demande%20de%20d%C3%A9mo%20Shiftly&body=Bonjour%2C%0D%0A%0D%0AJe%20souhaite%20obtenir%20une%20d%C3%A9monstration%20de%20la%20plateforme%20Shiftly%20pour%20mon%20%C3%A9tablissement.%0D%0A%0D%0ANom%20de%20l%27%C3%A9tablissement%20%3A%20%0D%0AType%20d%27%C3%A9tablissement%20%3A%20%0D%0AVille%20%3A%20%0D%0AT%C3%A9l%C3%A9phone%20%3A%20%0D%0A%0D%0AMerci%20%21"
            className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-transparent px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10 hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Mail className="h-5 w-5" aria-hidden />
            Parler à un expert HCR
          </a>
        </div>

        <p className="text-sm text-[#fcfaf7]/70">
          Sans engagement · Réponse sous 24h · Contact humain garanti
        </p>
      </div>
    </section>
  );
}
