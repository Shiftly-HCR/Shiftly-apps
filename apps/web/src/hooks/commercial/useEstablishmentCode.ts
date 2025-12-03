"use client";

import { useState } from "react";
import {
  findEstablishmentBySecretCode,
  attachCommercialToEstablishment,
} from "@shiftly/data";
import type { Establishment } from "@shiftly/data";

interface UseEstablishmentCodeReturn {
  code: string;
  setCode: (code: string) => void;
  foundEstablishment: Establishment | null;
  isLoading: boolean;
  error: string | null;
  searchEstablishment: () => Promise<void>;
  confirmAttachment: () => Promise<boolean>;
  reset: () => void;
}

/**
 * Hook pour gérer la recherche et le rattachement d'un établissement via code secret
 */
export function useEstablishmentCode(): UseEstablishmentCodeReturn {
  const [code, setCode] = useState("");
  const [foundEstablishment, setFoundEstablishment] =
    useState<Establishment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchEstablishment = async () => {
    if (!code.trim()) {
      setError("Veuillez entrer un code");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFoundEstablishment(null);

    const result = await findEstablishmentBySecretCode(code.trim().toUpperCase());

    if (result.success && result.establishment) {
      setFoundEstablishment(result.establishment);
    } else {
      setError(result.error || "Erreur lors de la recherche");
    }

    setIsLoading(false);
  };

  const confirmAttachment = async (): Promise<boolean> => {
    if (!foundEstablishment) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    const result = await attachCommercialToEstablishment(foundEstablishment.id);

    if (result.success) {
      // Réinitialiser après succès
      reset();
      setIsLoading(false);
      return true;
    } else {
      setError(result.error || "Erreur lors du rattachement");
      setIsLoading(false);
      return false;
    }
  };

  const reset = () => {
    setCode("");
    setFoundEstablishment(null);
    setError(null);
  };

  return {
    code,
    setCode,
    foundEstablishment,
    isLoading,
    error,
    searchEstablishment,
    confirmAttachment,
    reset,
  };
}

