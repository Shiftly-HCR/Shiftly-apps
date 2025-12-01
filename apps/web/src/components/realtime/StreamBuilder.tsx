"use client";

import { useRealtimeTable, type UseRealtimeTableOptions } from "@shiftly/data";

export interface StreamBuilderProps<T> {
  /**
   * Nom de la table Supabase à écouter
   */
  table: string;
  /**
   * Fonction de rendu qui reçoit les données en temps réel
   */
  builder: (data: T[]) => React.ReactNode;
  /**
   * Options supplémentaires pour le hook useRealtimeTable
   */
  options?: Omit<UseRealtimeTableOptions, "table">;
  /**
   * Composant à afficher pendant le chargement initial
   */
  loadingBuilder?: () => React.ReactNode;
  /**
   * Composant à afficher en cas d'erreur
   */
  errorBuilder?: (error: string) => React.ReactNode;
}

export function StreamBuilder<T = any>({
  table,
  builder,
  options,
  loadingBuilder,
  errorBuilder,
}: StreamBuilderProps<T>) {
  const { data, isLoading, error } = useRealtimeTable<T>({
    table,
    ...options,
  });

  if (isLoading && loadingBuilder) {
    return <>{loadingBuilder()}</>;
  }

  if (error && errorBuilder) {
    return <>{errorBuilder(error)}</>;
  }

  return <>{builder(data)}</>;
}
