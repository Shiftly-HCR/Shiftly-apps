"use client";

import { useEstablishments as useEstablishmentsQuery, useCreateEstablishment, useUpdateEstablishment, useDeleteEstablishment } from "@/hooks/queries";

/**
 * Hook pour gérer les établissements dans le contexte des missions
 * @deprecated Utilisez directement les hooks depuis @/hooks/queries
 */
export function useEstablishments() {
  const { data: establishments = [], isLoading, error, refetch } = useEstablishmentsQuery();
  const createMutation = useCreateEstablishment();
  const updateMutation = useUpdateEstablishment();
  const deleteMutation = useDeleteEstablishment();

  return {
    establishments,
    isLoading,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
    create: async (params: any) => {
      return await createMutation.mutateAsync(params);
    },
    update: async (establishmentId: string, params: any) => {
      return await updateMutation.mutateAsync({ establishmentId, params });
    },
    remove: async (establishmentId: string) => {
      return await deleteMutation.mutateAsync(establishmentId);
    },
  };
}

