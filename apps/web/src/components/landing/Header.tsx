import { Globe } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 /95 backdrop-blur-sm z-50 border-b border-[#bdaaa1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo-shiftly.png"
              alt="Shiftly Logo"
              className="h-10 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/secteur"
              className="text-[#503342] hover:text-[#782478] transition-colors"
            >
              Secteur
            </Link>
            <Link
              href="/modele-economique"
              className="text-[#503342] hover:text-[#782478] transition-colors"
            >
              Modèle économique
            </Link>
            <Link
              href="/a-propos"
              className="text-[#503342] hover:text-[#782478] transition-colors"
            >
              À propos
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:block px-4 py-2 text-[#782478] hover:text-[#cc9933] transition-colors font-medium"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-[#782478] text-[#fcfaf7] rounded-lg hover:bg-[#cc9933] transition-all transform hover:scale-105"
            >
              Commencer
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
