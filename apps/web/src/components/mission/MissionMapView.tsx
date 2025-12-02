"use client";

import React, { useState, useMemo } from "react";
import {
  MapLoader,
  MissionBubbleMarker,
  MissionClusterMarker,
} from "@/components";
import { useMissionClustering } from "@/hooks";
import type { Mission } from "@shiftly/data";
import type { MapMarker } from "@/components/ui/Map";

interface MissionMapViewProps {
  missions: Mission[];
  onMissionClick: (missionId: string) => void;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: number;
}

export function MissionMapView({
  missions,
  onMissionClick,
  latitude = 48.8566,
  longitude = 2.3522,
  zoom = 11,
  height = 600,
}: MissionMapViewProps) {
  const [currentZoom, setCurrentZoom] = useState(zoom);

  const clusteredMarkers = useMissionClustering({
    missions,
    currentZoom,
  });

  // Convertir les données clusterisées en markers avec JSX
  const markers = useMemo<MapMarker[]>(() => {
    return clusteredMarkers.map((marker) => {
      if (marker.type === "mission") {
        return {
          id: marker.id,
          latitude: marker.latitude,
          longitude: marker.longitude,
          content: (
            <MissionBubbleMarker
              mission={marker.mission}
              onClick={() => onMissionClick(marker.mission.id)}
            />
          ),
        };
      } else {
        return {
          id: marker.id,
          latitude: marker.latitude,
          longitude: marker.longitude,
          content: (
            <MissionClusterMarker
              count={marker.count}
              onClick={() => {
                // Zoomer sur le cluster - pourrait être amélioré pour zoomer automatiquement
                // Pour l'instant, on ne fait rien, l'utilisateur devra zoomer manuellement
              }}
            />
          ),
        };
      }
    });
  }, [clusteredMarkers, onMissionClick]);

  const handleViewStateChange = React.useCallback(
    (viewState: { latitude: number; longitude: number; zoom: number }) => {
      setCurrentZoom(viewState.zoom);
    },
    []
  );

  return (
    <MapLoader
      latitude={latitude}
      longitude={longitude}
      zoom={zoom}
      height={height}
      markers={markers}
      onViewStateChange={handleViewStateChange}
      interactive={true}
    />
  );
}
