"use client";

import { useSessionContext } from "../providers/SessionProvider";
import type { User, Session } from "@supabase/supabase-js";

/**
 * Hook pour accéder à l'utilisateur et la session Supabase
 */
export function useCurrentUser(): {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
} {
  const { cache, isLoading, error } = useSessionContext();

  return {
    user: cache?.user || null,
    session: cache?.session || null,
    isLoading,
    error,
  };
}


