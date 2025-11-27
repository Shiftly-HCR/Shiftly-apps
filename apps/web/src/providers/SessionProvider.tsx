"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  createSessionCacheService,
  type SessionCache,
  type SessionCacheState,
  type SessionCacheConfig,
} from "@shiftly/core";

interface SessionContextValue extends SessionCacheState {
  refresh: () => Promise<void>;
  clear: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshFreelanceExperiences: () => Promise<void>;
  refreshFreelanceEducations: () => Promise<void>;
  refreshRecruiterMissions: () => Promise<void>;
  getRequestCount: () => number;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
  config?: SessionCacheConfig;
}

export function SessionProvider({
  children,
  config,
}: SessionProviderProps) {
  const [state, setState] = useState<SessionCacheState>({
    cache: null,
    isLoading: true,
    error: null,
    isInitialized: false,
  });

  // Créer le service de cache (une seule instance)
  const [cacheService] = useState(() =>
    createSessionCacheService(config)
  );

  /**
   * Charge la session depuis le cache ou Supabase
   */
  const loadSession = useCallback(
    async (forceRefresh: boolean = false) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const cache = await cacheService.getSession(forceRefresh);
        setState({
          cache,
          isLoading: false,
          error: null,
          isInitialized: true,
        });
      } catch (error: any) {
        console.error("[SessionProvider] Erreur lors du chargement:", error);
        setState({
          cache: null,
          isLoading: false,
          error: error.message || "Erreur lors du chargement de la session",
          isInitialized: true,
        });
      }
    },
    [cacheService]
  );

  /**
   * Rafraîchit le cache
   */
  const refresh = useCallback(async () => {
    await loadSession(true);
  }, [loadSession]);

  /**
   * Vide le cache (ne déconnecte PAS de Supabase, c'est fait dans AppLayout)
   */
  const clear = useCallback(async () => {
    cacheService.clear();
    setState({
      cache: null,
      isLoading: false,
      error: null,
      isInitialized: true,
    });
  }, [cacheService]);

  /**
   * Rafraîchit uniquement le profil
   */
  const refreshProfile = useCallback(async () => {
    await cacheService.refreshProfile();
    // Recharger la session pour mettre à jour l'état
    await loadSession(false);
  }, [cacheService, loadSession]);

  /**
   * Rafraîchit les expériences freelance
   */
  const refreshFreelanceExperiences = useCallback(async () => {
    await cacheService.refreshFreelanceExperiences();
    await loadSession(false);
  }, [cacheService, loadSession]);

  /**
   * Rafraîchit les formations freelance
   */
  const refreshFreelanceEducations = useCallback(async () => {
    await cacheService.refreshFreelanceEducations();
    await loadSession(false);
  }, [cacheService, loadSession]);

  /**
   * Rafraîchit les missions recruteur
   */
  const refreshRecruiterMissions = useCallback(async () => {
    await cacheService.refreshRecruiterMissions();
    await loadSession(false);
  }, [cacheService, loadSession]);

  /**
   * Récupère le nombre de requêtes Supabase effectuées
   */
  const getRequestCount = useCallback(() => {
    return cacheService.getRequestCount();
  }, [cacheService]);

  // Charger la session au montage
  useEffect(() => {
    // Ne charger que si pas encore initialisé pour éviter les doubles chargements
    if (!state.isInitialized) {
      loadSession(false);
    }
  }, [loadSession, state.isInitialized]);

  const value: SessionContextValue = {
    ...state,
    refresh,
    clear,
    refreshProfile,
    refreshFreelanceExperiences,
    refreshFreelanceEducations,
    refreshRecruiterMissions,
    getRequestCount,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte de session
 */
export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error(
      "useSessionContext doit être utilisé à l'intérieur d'un SessionProvider"
    );
  }
  return context;
}

