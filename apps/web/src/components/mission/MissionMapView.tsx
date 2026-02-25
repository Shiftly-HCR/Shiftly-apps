"use client";

import React, { useState, useMemo } from "react";
import { YStack } from "tamagui";
import {
  MapLoader,
  MissionBubbleMarker,
  MissionClusterMarker,
  MissionVisibleList,
} from "@/components";
import { useMissionClustering, useVisibleMissions, useResponsive } from "@/hooks";
import type { Mission } from "@shiftly/data";
import type { MapMarker, MapBounds } from "@/components/ui/Map";

interface MissionMapViewProps {
  missions: Mission[];
  onMissionClick: (missionId: string) => void;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: number;
  formatDate: (startDate?: string, endDate?: string) => string;
  isNewMission: (createdAt?: string) => boolean;
  showVisibleList?: boolean; // Afficher ou non la liste des missions visibles sous la carte
}

export function MissionMapView({
  missions,
  onMissionClick,
  latitude = 48.8566,
  longitude = 2.3522,
  zoom = 11,
  height = 600,
  formatDate,
  isNewMission,
  showVisibleList = true, // Par défaut, afficher la liste
}: MissionMapViewProps) {
  const { isMobile } = useResponsive();
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  const mapHeight = isMobile ? 400 : height;

  const clusteredMarkers = useMissionClustering({
    missions,
    currentZoom,
  });

  // Calculer les missions visibles dans les bounds actuels
  const visibleMissions = useVisibleMissions({
    missions,
    bounds,
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
    <YStack gap={showVisibleList ? "$4" : 0}>
      <MapLoader
        latitude={latitude}
        longitude={longitude}
        zoom={zoom}
        height={mapHeight}
        markers={markers}
        onViewStateChange={handleViewStateChange}
        onBoundsChange={showVisibleList ? setBounds : undefined}
        interactive={true}
      />
      {showVisibleList && (
        <MissionVisibleList
          missions={visibleMissions}
          onMissionClick={onMissionClick}
          formatDate={formatDate}
          isNewMission={isNewMission}
        />
      )}
    </YStack>
  );
}
