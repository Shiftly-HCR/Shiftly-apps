"use client";

import { useEffect, RefObject } from "react";

interface UseAutoScrollProps<T = unknown> {
  scrollViewRef: RefObject<any>;
  dependency: T;
  enabled?: boolean;
}

/**
 * Hook pour gérer le scroll automatique vers le bas d'un ScrollView
 * Scroll automatiquement quand les dépendances changent
 */
export function useAutoScroll<T = unknown>({
  scrollViewRef,
  dependency,
  enabled = true,
}: UseAutoScrollProps<T>) {
  useEffect(() => {
    if (!enabled || !scrollViewRef.current) {
      return;
    }

    // Utiliser requestAnimationFrame pour s'assurer que le DOM est mis à jour
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency, enabled, scrollViewRef]);
}
