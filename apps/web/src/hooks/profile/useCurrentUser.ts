"use client";

import { useCurrentUser as useCurrentUserQuery } from "@/hooks/queries";
import type { User } from "@supabase/supabase-js";

/**
 * Hook pour accéder à l'utilisateur Supabase
 * @deprecated Utilisez directement useCurrentUser depuis @/hooks/queries
 */
export function useCurrentUser(): {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
} {
  const { data: user, isLoading, error } = useCurrentUserQuery();

  return {
    user: user || null,
    session: null, // La session n'est plus exposée directement
    isLoading,
    error: error?.message || null,
  };
}
