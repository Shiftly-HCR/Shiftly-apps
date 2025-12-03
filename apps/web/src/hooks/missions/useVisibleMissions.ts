"use client";

import { useMemo } from "react";
import type { Mission } from "@shiftly/data";
import type { MapBounds } from "@/components/ui/Map";

interface UseVisibleMissionsProps {
  missions: Mission[];
  bounds: MapBounds | null;
}

/**
 * Hook pour calculer les missions visibles dans les bounds de la carte
 * Retourne les missions dont les coordonnées sont dans les bounds
 */
export function useVisibleMissions({
  missions,
  bounds,
}: UseVisibleMissionsProps): Mission[] {
  return useMemo(() => {
    if (!bounds) {
      return [];
    }

    return missions.filter((mission) => {
      if (!mission.latitude || !mission.longitude) {
        return false;
      }

      const lat = mission.latitude;
      const lng = mission.longitude;

      // Vérifier si la mission est dans les bounds
      return (
        lat >= bounds.south &&
        lat <= bounds.north &&
        lng >= bounds.west &&
        lng <= bounds.east
      );
    });
  }, [missions, bounds]);
}

