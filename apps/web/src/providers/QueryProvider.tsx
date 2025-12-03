"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

/**
 * Provider React Query pour gérer le cache des requêtes
 *
 * Configuration du cache :
 * - staleTime: 5 minutes - Les données sont considérées fraîches pendant 5 minutes
 * - cacheTime: 30 minutes - Les données restent en cache 30 minutes après le dernier usage
 * - refetchOnWindowFocus: false - Ne pas refetch automatiquement au focus de la fenêtre
 * - refetchOnReconnect: false - Ne pas refetch automatiquement à la reconnexion
 * - retry: 1 - Une seule tentative en cas d'erreur
 *
 * Cette configuration réduit drastiquement les appels Supabase en réutilisant
 * les données mises en cache entre les différentes pages et composants.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes (anciennement cacheTime)
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
