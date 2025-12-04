"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactNode, useState, useMemo } from "react";

/**
 * Provider React Query pour gérer le cache des requêtes avec persistance
 *
 * Configuration du cache :
 * - staleTime: 5 minutes - Les données sont considérées fraîches pendant 5 minutes
 * - gcTime: 30 minutes - Les données restent en cache 30 minutes après le dernier usage
 * - refetchOnWindowFocus: false - Ne pas refetch au retour sur l'onglet (les données sont réhydratées depuis localStorage)
 * - refetchOnReconnect: true - Recharger à la reconnexion
 * - retry: 1 - Une seule tentative en cas d'erreur
 *
 * Persistance :
 * - Le cache React Query est sauvegardé dans localStorage
 * - Les données sont réhydratées automatiquement au chargement d'un nouvel onglet
 * - Cela évite les pages blanches lors de la navigation entre onglets
 *
 * Cette configuration réduit drastiquement les appels Supabase en réutilisant
 * les données mises en cache entre les différentes pages, composants et onglets.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes (anciennement cacheTime)
            // Désactiver refetchOnWindowFocus car les données sont réhydratées depuis localStorage
            // Le staleTime garantit que les données sont fraîches pendant 5 minutes
            refetchOnWindowFocus: false,
            refetchOnReconnect: true, // Recharger à la reconnexion
            retry: 1,
          },
        },
      })
  );

  // Créer le persister uniquement côté client (Next.js SSR)
  const persister = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return createSyncStoragePersister({
      storage: window.localStorage,
    });
  }, []);

  // Si pas de persister (SSR), utiliser le provider standard
  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  // Utiliser PersistQueryClientProvider pour la persistance cross-onglets
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // Optionnel : on peut filtrer les queries à persister si nécessaire
        // Par défaut, toutes les queries sont persistées
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
