"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getEstablishmentById,
  getEstablishmentByIdPublic,
  type Establishment,
} from "@shiftly/data";

/**
 * Hook pour récupérer un établissement par ID avec cache React Query
 * 
 * Ce hook utilise React Query pour mettre en cache les établissements et éviter
 * les requêtes Supabase redondantes. Les données sont partagées entre tous
 * les composants qui utilisent ce hook avec le même establishmentId.
 * 
 * @param establishmentId - ID de l'établissement à récupérer
 * @param isPublic - Si true, utilise getEstablishmentByIdPublic (pour les missions publiées)
 * @returns L'établissement, l'état de chargement et les erreurs
 */
export function useCachedEstablishment(
  establishmentId: string | null | undefined,
  isPublic: boolean = false
) {
  return useQuery({
    queryKey: ["establishments", establishmentId, isPublic ? "public" : "private"],
    queryFn: async () => {
      if (!establishmentId) return null;

      // Essayer d'abord la version privée (si on est propriétaire)
      if (!isPublic) {
        const establishment = await getEstablishmentById(establishmentId);
        if (establishment) {
          return establishment;
        }
      }

      // Si pas trouvé et que c'est public, essayer la version publique
      if (isPublic) {
        const establishment = await getEstablishmentByIdPublic(establishmentId);
        return establishment;
      }

      return null;
    },
    enabled: !!establishmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

