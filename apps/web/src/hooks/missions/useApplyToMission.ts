"use client";

import { useApplyToMission as useApplyToMissionMutation } from "@/hooks/queries";
import type { CreateApplicationParams } from "@shiftly/data";

/**
 * Hook pour postuler à une mission
 * @deprecated Utilisez directement useApplyToMission depuis @/hooks/queries
 */
export function useApplyToMission() {
  const mutation = useApplyToMissionMutation();

  const apply = async (params: CreateApplicationParams) => {
    try {
      const result = await mutation.mutateAsync(params);
      return result;
    } catch (err: any) {
      return { success: false, error: err.message || "Une erreur est survenue" };
    }
  };

  const reset = () => {
    mutation.reset();
  };

  return {
    apply,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    success: mutation.isSuccess,
    reset,
  };
}

