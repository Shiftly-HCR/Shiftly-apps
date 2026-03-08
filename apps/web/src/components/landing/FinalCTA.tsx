import { Users, Building2 } from "lucide-react";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#782478] via-[#782478] to-[#cc9933] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

      <div className="max-w-4xl mx-auto text-center relative">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fcfaf7] mb-6">
          Prêt à rejoindre la révolution Shiftly ?
        </h2>

        <p className="text-xl text-[#fcfaf7]/90 mb-12 leading-relaxed">
          Que vous soyez freelance en quête de liberté ou établissement à la
          recherche de talents, Shiftly est fait pour vous.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/register"
            className="group px-10 py-5 bg-[#fcfaf7] text-[#782478] rounded-lg hover:bg-[#fcfaf7]/90 transition-all transform hover:scale-105 flex items-center justify-center gap-3 font-bold text-lg shadow-2xl"
          >
            <Users className="w-6 h-6" />
            Je suis freelance
          </Link>

          <Link
            href="/register"
            className="group px-10 py-5 bg-[#cc9933] text-[#fcfaf7] rounded-lg hover:bg-[#cc9933]/90 transition-all transform hover:scale-105 flex items-center justify-center gap-3 font-bold text-lg shadow-2xl border-2 border-[#fcfaf7]/20"
          >
            <Building2 className="w-6 h-6" />
            Je recrute
          </Link>
        </div>
      </div>
    </section>
  );
}
