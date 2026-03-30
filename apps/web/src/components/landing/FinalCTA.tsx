import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section
      data-nav-dark
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#6b2d9e] via-[#782478] to-[#8b3aa8] overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(204, 153, 51, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(120, 36, 120, 0.2) 0%, transparent 50%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#cc9933] mb-6">
          Passez à l&apos;action
        </p>

        <h2
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold text-[#fcfaf7] leading-[1.15] mb-6 sm:mb-8"
        >
          Prêt à travailler autrement ?
        </h2>

        <p className="text-base sm:text-lg lg:text-xl text-[#fcfaf7]/90 leading-relaxed mb-10 sm:mb-12 max-w-2xl mx-auto">
          Échangeons sur vos besoins concrets. En 30 minutes, nous vous
          montrons comment Shiftly peut s&apos;adapter à votre exploitation —
          sans engagement, sans jargon.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-8">
          <a
            href="mailto:contact@shiftly.pro?subject=Demande%20de%20d%C3%A9monstration%20Shiftly&body=Bonjour%2C%0D%0A%0D%0AJe%20souhaite%20en%20savoir%20plus%20sur%20Shiftly%20et%20b%C3%A9n%C3%A9ficier%20d%27une%20d%C3%A9monstration.%0D%0A%0D%0ANom%20de%20l%27%C3%A9tablissement%20%3A%20%0D%0AType%20d%27%C3%A9tablissement%20%3A%20%0D%0ANombre%20de%20sites%20%3A%20%0D%0AT%C3%A9l%C3%A9phone%20%3A%20%0D%0A%0D%0AMerci%2C"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#fcfaf7] px-8 py-4 text-base font-semibold text-[#782478] shadow-xl shadow-black/20 transition hover:bg-[#fcfaf7]/95 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fcfaf7]"
          >
            Demander une démonstration
            <ArrowRight
              className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>

          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#fcfaf7]/40 bg-transparent px-8 py-4 text-base font-semibold text-[#fcfaf7] backdrop-blur-sm transition hover:border-[#fcfaf7] hover:bg-[#fcfaf7]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fcfaf7]"
          >
            Parler à un expert métier
          </Link>
        </div>

        <p className="text-sm text-[#fcfaf7]/70">
          Réponse sous 24h · Aucun engagement · Échange 100% terrain
        </p>
      </div>
    </section>
  );
}
