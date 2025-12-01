"use client";

import { useState, useEffect, useCallback } from "react";

interface UseMapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  onMapClick?: (event: { lngLat: { lng: number; lat: number } }) => void;
  interactive?: boolean;
}

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

/**
 * Hook pour gérer la logique d'une carte interactive
 * Gère l'état de la vue et les interactions de clic
 */
export function useMap({
  latitude = 48.8566, // Paris par défaut
  longitude = 2.3522,
  zoom = 12,
  onMapClick,
  interactive = true,
}: UseMapProps = {}) {
  const [viewState, setViewState] = useState<ViewState>({
    latitude,
    longitude,
    zoom,
  });

  // Mettre à jour la vue si les props changent
  useEffect(() => {
    setViewState({
      latitude,
      longitude,
      zoom,
    });
  }, [latitude, longitude, zoom]);

  const handleMapClick = useCallback(
    (event: any) => {
      if (onMapClick && interactive) {
        onMapClick({
          lngLat: {
            lng: event.lngLat.lng,
            lat: event.lngLat.lat,
          },
        });
      }
    },
    [onMapClick, interactive]
  );

  return {
    viewState,
    setViewState,
    handleMapClick,
  };
}

