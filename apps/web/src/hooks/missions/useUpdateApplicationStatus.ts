"use client";

import { useUpdateApplicationStatus as useUpdateApplicationStatusMutation } from "@/hooks/queries";
import type { ApplicationStatus } from "@shiftly/data";

/**
 * Hook pour mettre à jour le statut d'une candidature
 * @deprecated Utilisez directement useUpdateApplicationStatus depuis @/hooks/queries
 */
export function useUpdateApplicationStatus() {
  const mutation = useUpdateApplicationStatusMutation();

  const updateStatus = async (applicationId: string, status: ApplicationStatus) => {
    try {
      const result = await mutation.mutateAsync({ applicationId, status });
      return result;
    } catch (err: any) {
      return { success: false, error: err.message || "Une erreur est survenue" };
    }
  };

  const reset = () => {
    mutation.reset();
  };

  return {
    updateStatus,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    success: mutation.isSuccess,
    reset,
  };
}

