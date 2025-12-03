"use client";

import { useQuery } from "@tanstack/react-query";
import {
  listAllEstablishments,
  listMyCommercialEstablishments,
} from "@shiftly/data";
import type { Establishment } from "@shiftly/data";

/**
 * Hook pour récupérer tous les établissements avec cache React Query
 * 
 * Ce hook utilise React Query pour mettre en cache les établissements et éviter
 * les requêtes Supabase redondantes. Les données sont partagées entre tous
 * les composants qui utilisent ce hook.
 * 
 * @returns Les établissements, l'état de chargement et les erreurs
 */
export function useCachedAllEstablishments() {
  return useQuery({
    queryKey: ["establishments", "all"],
    queryFn: async () => {
      const result = await listAllEstablishments();
      if (result.success && result.establishments) {
        return result.establishments;
      }
      throw new Error(
        result.error || "Erreur lors du chargement des établissements"
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook pour récupérer les établissements du commercial courant avec cache React Query
 * 
 * Ce hook utilise React Query pour mettre en cache les établissements du commercial
 * et éviter les requêtes Supabase redondantes. Les données sont partagées entre tous
 * les composants qui utilisent ce hook.
 * 
 * @returns Les établissements du commercial, l'état de chargement et les erreurs
 */
export function useCachedMyCommercialEstablishments() {
  return useQuery({
    queryKey: ["establishments", "my-commercial"],
    queryFn: async () => {
      const result = await listMyCommercialEstablishments();
      if (result.success && result.establishments) {
        return result.establishments;
      }
      throw new Error(
        result.error || "Erreur lors du chargement des établissements"
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

