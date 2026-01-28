"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listMyEstablishments,
  listAllEstablishments,
  listMyCommercialEstablishments,
  getEstablishmentById,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
  type Establishment,
} from "@shiftly/data";

/**
 * Hook pour récupérer tous les établissements de l'utilisateur
 */
export function useEstablishments() {
  const query = useQuery({
    queryKey: ["establishments", "my"],
    queryFn: async () => {
      const result = await listMyEstablishments();
      if (result.success && result.establishments) {
        return result.establishments;
      }
      throw new Error(
        result.error || "Erreur lors du chargement des établissements"
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...query,
    establishments: query.data ?? [],
  } as typeof query & {
    establishments: Establishment[];
  };
}

/**
 * Hook pour récupérer tous les établissements (pour les commerciaux)
 */
export function useAllEstablishments() {
  const query = useQuery({
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

  return {
    ...query,
    establishments: query.data ?? [],
  } as typeof query & {
    establishments: Establishment[];
  };
}

/**
 * Hook pour récupérer les établissements du commercial courant
 */
export function useMyCommercialEstablishments() {
  const query = useQuery({
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

  return {
    ...query,
    establishments: query.data ?? [],
  } as typeof query & {
    establishments: Establishment[];
  };
}

/**
 * Hook pour récupérer un établissement par ID
 */
export function useEstablishment(establishmentId: string | null) {
  const query = useQuery({
    queryKey: ["establishments", establishmentId],
    queryFn: async () => {
      if (!establishmentId) return null;
      return await getEstablishmentById(establishmentId);
    },
    enabled: !!establishmentId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    establishment: query.data ?? null,
  } as typeof query & {
    establishment: Establishment | null;
  };
}

/**
 * Hook pour créer un établissement
 */
export function useCreateEstablishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEstablishment,
    onSuccess: (result) => {
      if (result.success && result.establishment) {
        // Ajouter au cache
        queryClient.setQueryData(
          ["establishments", result.establishment.id],
          result.establishment
        );
        // Invalider toutes les listes
        queryClient.invalidateQueries({ queryKey: ["establishments"] });
      }
    },
  });
}

/**
 * Hook pour mettre à jour un établissement
 */
export function useUpdateEstablishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      establishmentId,
      params,
    }: {
      establishmentId: string;
      params: Partial<Establishment>;
    }) => updateEstablishment(establishmentId, params),
    onSuccess: (result, variables) => {
      if (result.success && result.establishment) {
        // Mettre à jour le cache
        queryClient.setQueryData(
          ["establishments", variables.establishmentId],
          result.establishment
        );
        // Invalider toutes les listes
        queryClient.invalidateQueries({ queryKey: ["establishments"] });
      }
    },
  });
}

/**
 * Hook pour supprimer un établissement
 */
export function useDeleteEstablishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEstablishment,
    onSuccess: (result, establishmentId) => {
      if (result.success) {
        // Retirer du cache
        queryClient.removeQueries({
          queryKey: ["establishments", establishmentId],
        });
        // Invalider toutes les listes
        queryClient.invalidateQueries({ queryKey: ["establishments"] });
      }
    },
  });
}
