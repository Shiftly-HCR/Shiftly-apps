"use client";

import { useCheckApplication as useCheckApplicationQuery } from "@/hooks/queries";

/**
 * Hook pour vérifier si l'utilisateur a déjà postulé à une mission
 * @deprecated Utilisez directement useCheckApplication depuis @/hooks/queries
 */
export function useCheckApplication(missionId: string | null) {
  return useCheckApplicationQuery(missionId);
}

