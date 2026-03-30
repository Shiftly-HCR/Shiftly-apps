"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import Link from "next/link";

const HEADER_HEIGHT = 64;

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const darkSections =
        document.querySelectorAll<HTMLElement>("[data-nav-dark]");
      let overDark = false;

      darkSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= HEADER_HEIGHT && rect.bottom >= 0) {
          overDark = true;
        }
      });

      setIsDark(overDark);
    };

    checkTheme();
    window.addEventListener("scroll", checkTheme, { passive: true });
    return () => window.removeEventListener("scroll", checkTheme);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 backdrop-blur-sm z-50 border-b border-[#bdaaa1]/40 transition-colors duration-300">
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
              className={`transition-colors duration-300 ${
                isDark
                  ? "text-[#fcfaf7]/80 hover:text-[#fcfaf7]"
                  : "text-[#503342] hover:text-[#782478]"
              }`}
            >
              Secteur
            </Link>
            <Link
              href="/modele-economique"
              className={`transition-colors duration-300 ${
                isDark
                  ? "text-[#fcfaf7]/80 hover:text-[#fcfaf7]"
                  : "text-[#503342] hover:text-[#782478]"
              }`}
            >
              Modèle économique
            </Link>
            <Link
              href="/a-propos"
              className={`transition-colors duration-300 ${
                isDark
                  ? "text-[#fcfaf7]/80 hover:text-[#fcfaf7]"
                  : "text-[#503342] hover:text-[#782478]"
              }`}
            >
              À propos
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className={`hidden sm:block px-4 py-2 font-medium transition-colors duration-300 ${
                isDark
                  ? "text-[#fcfaf7]/80 hover:text-[#fcfaf7]"
                  : "text-[#782478] hover:text-[#cc9933]"
              }`}
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className={`px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                isDark
                  ? "bg-[#fcfaf7] text-[#782478] hover:bg-[#f0e8e0]"
                  : "bg-[#782478] text-[#fcfaf7] hover:bg-[#cc9933]"
              }`}
            >
              Commencer
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
