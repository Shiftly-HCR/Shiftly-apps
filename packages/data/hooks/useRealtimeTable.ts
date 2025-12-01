"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

export interface UseRealtimeTableOptions {
  /**
   * Nom de la table à écouter
   */
  table: string;
  /**
   * Filtre SQL optionnel (ex: "conversation_id=eq.123")
   */
  filter?: string;
  /**
   * Options de tri (ex: { column: "created_at", ascending: false })
   */
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  /**
   * Nombre maximum de résultats (optionnel)
   */
  limit?: number;
  /**
   * Colonnes à sélectionner (par défaut: "*")
   */
  select?: string;
}

export function useRealtimeTable<T = any>({
  table,
  filter,
  orderBy,
  limit,
  select = "*",
}: UseRealtimeTableOptions) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);
  const channelNameRef = useRef<string>(`realtime:${table}:${filter || "all"}`);

  // Fonction pour construire la requête
  const buildQuery = () => {
    let query = supabase.from(table).select(select);

    if (filter) {
      // Parser le filter au format PostgREST (ex: "conversation_id=eq.123")
      // Supporte les opérateurs: eq, neq, gt, gte, lt, lte, like, ilike, in, is
      const filterMatch = filter.match(/^([^=]+)=(.+)$/);

      if (filterMatch) {
        const [, column, condition] = filterMatch;
        const cleanColumn = column.trim();

        // Parser l'opérateur et la valeur
        if (condition.startsWith("eq.")) {
          const value = condition.substring(3);
          query = query.eq(cleanColumn, value);
        } else if (condition.startsWith("neq.")) {
          const value = condition.substring(4);
          query = query.neq(cleanColumn, value);
        } else if (condition.startsWith("gt.")) {
          const value = condition.substring(3);
          query = query.gt(cleanColumn, value);
        } else if (condition.startsWith("gte.")) {
          const value = condition.substring(4);
          query = query.gte(cleanColumn, value);
        } else if (condition.startsWith("lt.")) {
          const value = condition.substring(3);
          query = query.lt(cleanColumn, value);
        } else if (condition.startsWith("lte.")) {
          const value = condition.substring(4);
          query = query.lte(cleanColumn, value);
        } else if (condition.startsWith("like.")) {
          const value = condition.substring(5);
          query = query.like(cleanColumn, value);
        } else if (condition.startsWith("ilike.")) {
          const value = condition.substring(6);
          query = query.ilike(cleanColumn, value);
        } else if (condition.startsWith("in.")) {
          // Format: in.(val1,val2,val3)
          const valuesStr = condition.substring(3);
          const values = valuesStr
            .slice(1, -1)
            .split(",")
            .map((v) => v.trim());
          query = query.in(cleanColumn, values);
        } else if (condition.startsWith("is.")) {
          const value = condition.substring(3);
          query = query.is(cleanColumn, value === "null" ? null : value);
        } else {
          // Par défaut, traitement comme égalité simple
          query = query.eq(cleanColumn, condition);
        }
      }
    }

    if (orderBy) {
      query = query.order(orderBy.column, {
        ascending: orderBy.ascending !== false,
      });
    }

    if (limit) {
      query = query.limit(limit);
    }

    return query;
  };

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const query = buildQuery();
        const { data: initialData, error: fetchError } = await query;

        if (fetchError) {
          console.error(
            `Erreur lors du chargement initial de ${table}:`,
            fetchError
          );
          setError(fetchError.message);
          setData([]);
        } else {
          setData((initialData as T[]) || []);
        }
      } catch (err: any) {
        console.error(`Erreur lors du chargement de ${table}:`, err);
        setError(err.message || "Une erreur est survenue");
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [table, filter, orderBy?.column, orderBy?.ascending, limit, select]);

  // Configurer l'abonnement Realtime
  useEffect(() => {
    // Nettoyer l'ancien abonnement si il existe
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    // Créer un nouveau channel
    const channelName = `realtime:${table}:${filter || "all"}:${Date.now()}`;
    channelNameRef.current = channelName;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table,
          filter: filter || undefined,
        },
        (payload) => {
          const newRow = payload.new as T;
          setData((prevData) => {
            // Éviter les doublons
            if (prevData.some((row: any) => row.id === (newRow as any).id)) {
              return prevData;
            }

            // Ajouter le nouvel élément
            const updated = [...prevData, newRow];

            // Appliquer le tri si défini
            if (orderBy) {
              updated.sort((a: any, b: any) => {
                const aVal = a[orderBy.column];
                const bVal = b[orderBy.column];
                if (aVal === bVal) return 0;
                const comparison = aVal > bVal ? 1 : -1;
                return orderBy.ascending !== false ? comparison : -comparison;
              });
            }

            // Appliquer la limite si définie
            return limit ? updated.slice(0, limit) : updated;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table,
          filter: filter || undefined,
        },
        (payload) => {
          const updatedRow = payload.new as T;
          setData((prevData) =>
            prevData.map((row: any) =>
              (row as any).id === (updatedRow as any).id ? updatedRow : row
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table,
          filter: filter || undefined,
        },
        (payload) => {
          const deletedRow = payload.old as T;
          setData((prevData) =>
            prevData.filter(
              (row: any) => (row as any).id !== (deletedRow as any).id
            )
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Abonnement Realtime activé pour ${table}`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(`Erreur d'abonnement Realtime pour ${table}`);
          setError("Erreur de connexion en temps réel");
        }
      });

    subscriptionRef.current = channel;

    // Nettoyer l'abonnement au démontage
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [table, filter, orderBy, limit]);

  return {
    data,
    isLoading,
    error,
  };
}
