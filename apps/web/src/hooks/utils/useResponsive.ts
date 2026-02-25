"use client";

import { useState, useEffect } from "react";

/** Unified breakpoint for mobile (aligns with Navbar, filters). */
export const RESPONSIVE_BREAKPOINT = 900;

const MOBILE_BREAKPOINT = RESPONSIVE_BREAKPOINT;
const TABLET_BREAKPOINT = 1024;

export interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  mounted: boolean;
  screenWidth: number;
}

/**
 * Hook pour détecter la taille d'écran et gérer le responsive
 * Évite les problèmes d'hydratation en ne détectant qu'après le montage
 */
export function useResponsive(
  mobileBreakpoint: number = RESPONSIVE_BREAKPOINT,
  tabletBreakpoint: number = TABLET_BREAKPOINT
): UseResponsiveReturn {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Marquer le composant comme monté après l'hydratation
    setMounted(true);

    const checkScreenSize = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        setScreenWidth(width);
        setIsMobile(width < mobileBreakpoint);
        setIsTablet(
          width >= mobileBreakpoint && width < tabletBreakpoint
        );
      }
    };

    checkScreenSize();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkScreenSize);
      return () => window.removeEventListener("resize", checkScreenSize);
    }
  }, [mobileBreakpoint, tabletBreakpoint]);

  const isDesktop = mounted && !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    mounted,
    screenWidth,
  };
}

