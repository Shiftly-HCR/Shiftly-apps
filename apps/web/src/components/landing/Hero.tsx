import { ArrowRight, Users, Building2 } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#bdaaa1]/20 to-[#fcfaf7]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#4c114f] leading-tight">
              La nouvelle façon de recruter dans l&apos;
              <span className="text-[#782478]">Hôtellerie-Restauration</span>
            </h1>

            <p className="text-xl text-[#503342] leading-relaxed">
              Shiftly connecte les freelances qualifiés et les établissements en
              un clic. Rapide, fiable et 100% flexible.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="group px-8 py-4 bg-[#782478] text-[#fcfaf7] rounded-lg hover:bg-[#cc9933] transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-semibold text-lg"
              >
                Découvrir la plateforme
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-[#fcfaf7] border-2 border-[#782478] text-[#782478] rounded-lg hover:bg-[#782478] hover:text-[#fcfaf7] transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-semibold"
              >
                <Users className="w-5 h-5" />
                Je suis freelance
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-[#fcfaf7] border-2 border-[#cc9933] text-[#cc9933] rounded-lg hover:bg-[#cc9933] hover:text-[#fcfaf7] transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-semibold"
              >
                <Building2 className="w-5 h-5" />
                Je recrute
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-square bg-gradient-to-br from-[#782478] to-[#cc9933] p-12 flex items-center justify-center">
                <div className="bg-[#fcfaf7] rounded-xl p-8 w-full max-w-md shadow-xl">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#782478] to-[#cc9933]"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-[#bdaaa1] rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-[#bdaaa1]/50 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-[#bdaaa1] rounded"></div>
                      <div className="h-3 bg-[#bdaaa1] rounded w-5/6"></div>
                      <div className="h-3 bg-[#bdaaa1] rounded w-4/6"></div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <div className="flex-1 h-12 bg-[#782478] rounded-lg"></div>
                      <div className="flex-1 h-12 bg-[#bdaaa1]/30 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#cc9933] rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#782478] rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
