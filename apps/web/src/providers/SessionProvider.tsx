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
import type {
  Profile,
  FreelanceProfile,
  FreelanceExperience,
  FreelanceEducation,
  Mission,
} from "@shiftly/data";

interface SessionContextValue extends SessionCacheState {
  refresh: () => Promise<void>;
  clear: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshFreelanceExperiences: () => Promise<void>;
  refreshFreelanceEducations: () => Promise<void>;
  refreshRecruiterMissions: () => Promise<void>;
  getRequestCount: () => number;
  // Méthodes de cache global
  getProfileFromCache: (profileId: string) => Profile | FreelanceProfile | null;
  cacheProfiles: (profiles: (Profile | FreelanceProfile)[]) => void;
  getMissionFromCache: (missionId: string) => Mission | null;
  cacheMissions: (missions: Mission[]) => void;
  getFreelanceExperiencesFromCache: (userId: string) => FreelanceExperience[];
  getFreelanceEducationsFromCache: (userId: string) => FreelanceEducation[];
  cacheFreelanceExperiences: (
    userId: string,
    experiences: FreelanceExperience[]
  ) => void;
  cacheFreelanceEducations: (
    userId: string,
    educations: FreelanceEducation[]
  ) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

interface SessionProviderProps {
  children: ReactNode;
  config?: SessionCacheConfig;
}

export function SessionProvider({ children, config }: SessionProviderProps) {
  const [state, setState] = useState<SessionCacheState>({
    cache: null,
    isLoading: true,
    error: null,
    isInitialized: false,
  });

  // Créer le service de cache (une seule instance)
  const [cacheService] = useState(() => createSessionCacheService(config));

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

  /**
   * Récupère un profil depuis le cache
   */
  const getProfileFromCache = useCallback(
    (profileId: string) => {
      return cacheService.getProfileFromCache(profileId);
    },
    [cacheService]
  );

  /**
   * Met en cache des profils
   */
  const cacheProfiles = useCallback(
    (profiles: (Profile | FreelanceProfile)[]) => {
      cacheService.cacheProfiles(profiles);
      // Recharger l'état pour mettre à jour l'UI
      loadSession(false);
    },
    [cacheService, loadSession]
  );

  /**
   * Récupère une mission depuis le cache
   */
  const getMissionFromCache = useCallback(
    (missionId: string) => {
      return cacheService.getMissionFromCache(missionId);
    },
    [cacheService]
  );

  /**
   * Met en cache des missions
   */
  const cacheMissions = useCallback(
    (missions: Mission[]) => {
      cacheService.cacheMissions(missions);
      // Recharger l'état pour mettre à jour l'UI
      loadSession(false);
    },
    [cacheService, loadSession]
  );

  /**
   * Récupère les expériences d'un freelance depuis le cache
   */
  const getFreelanceExperiencesFromCache = useCallback(
    (userId: string) => {
      return cacheService.getFreelanceExperiencesFromCache(userId);
    },
    [cacheService]
  );

  /**
   * Récupère les formations d'un freelance depuis le cache
   */
  const getFreelanceEducationsFromCache = useCallback(
    (userId: string) => {
      return cacheService.getFreelanceEducationsFromCache(userId);
    },
    [cacheService]
  );

  /**
   * Met en cache les expériences d'un freelance
   */
  const cacheFreelanceExperiences = useCallback(
    (userId: string, experiences: FreelanceExperience[]) => {
      cacheService.cacheFreelanceExperiences(userId, experiences);
      loadSession(false);
    },
    [cacheService, loadSession]
  );

  /**
   * Met en cache les formations d'un freelance
   */
  const cacheFreelanceEducations = useCallback(
    (userId: string, educations: FreelanceEducation[]) => {
      cacheService.cacheFreelanceEducations(userId, educations);
      loadSession(false);
    },
    [cacheService, loadSession]
  );

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
    getProfileFromCache,
    cacheProfiles,
    getMissionFromCache,
    cacheMissions,
    getFreelanceExperiencesFromCache,
    getFreelanceEducationsFromCache,
    cacheFreelanceExperiences,
    cacheFreelanceEducations,
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
