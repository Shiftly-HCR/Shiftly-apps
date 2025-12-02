"use client";

import React, { useState, useMemo } from "react";
import {
  MapLoader,
  MissionBubbleMarker,
  MissionClusterMarker,
} from "@/components";
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

// Seuil de zoom pour activer le clustering (en dessous de ce zoom, on clusterise)
const CLUSTER_ZOOM_THRESHOLD = 12;

// Distance maximale en degrés pour regrouper deux missions dans un cluster
// Cette distance est ajustée dynamiquement selon le zoom
function getDistanceInDegrees(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Distance simple en degrés (approximation suffisante pour le clustering)
  const dLat = Math.abs(lat2 - lat1);
  const dLon = Math.abs(lon2 - lon1);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

// Fonction de clustering
function clusterMissions(
  missions: Mission[],
  currentZoom: number,
  onMissionClick: (missionId: string) => void
): MapMarker[] {
  const validMissions = missions.filter(
    (m) => m.latitude && m.longitude
  ) as Array<Mission & { latitude: number; longitude: number }>;

  // Si le zoom est suffisant, afficher tous les markers individuellement
  if (currentZoom >= CLUSTER_ZOOM_THRESHOLD) {
    return validMissions.map((mission) => ({
      id: mission.id,
      latitude: mission.latitude,
      longitude: mission.longitude,
      content: (
        <MissionBubbleMarker
          mission={mission}
          onClick={() => onMissionClick(mission.id)}
        />
      ),
    }));
  }

  // Sinon, créer des clusters
  const clusters: Array<{
    missions: typeof validMissions;
    centerLat: number;
    centerLon: number;
  }> = [];

  validMissions.forEach((mission) => {
    let addedToCluster = false;

    // Chercher un cluster proche
    for (const cluster of clusters) {
      const distance = getDistanceInDegrees(
        mission.latitude,
        mission.longitude,
        cluster.centerLat,
        cluster.centerLon
      );

      // Si la distance est inférieure au seuil, ajouter au cluster
      // Ajuster le seuil selon le zoom (plus on dézoome, plus le seuil est grand)
      // À zoom 11, seuil ~0.02 degrés, à zoom 8, seuil ~0.05 degrés
      const threshold = 0.02 * Math.pow(1.5, 11 - currentZoom);
      if (distance < threshold) {
        cluster.missions.push(mission);
        // Recalculer le centre du cluster
        cluster.centerLat =
          cluster.missions.reduce((sum, m) => sum + m.latitude, 0) /
          cluster.missions.length;
        cluster.centerLon =
          cluster.missions.reduce((sum, m) => sum + m.longitude, 0) /
          cluster.missions.length;
        addedToCluster = true;
        break;
      }
    }

    // Si aucun cluster proche, créer un nouveau cluster
    if (!addedToCluster) {
      clusters.push({
        missions: [mission],
        centerLat: mission.latitude,
        centerLon: mission.longitude,
      });
    }
  });

  // Convertir les clusters en markers
  return clusters.map((cluster, index) => {
    if (cluster.missions.length === 1) {
      // Si un seul élément, afficher le marker normal
      const mission = cluster.missions[0];
      return {
        id: mission.id,
        latitude: mission.latitude,
        longitude: mission.longitude,
        content: (
          <MissionBubbleMarker
            mission={mission}
            onClick={() => onMissionClick(mission.id)}
          />
        ),
      };
    }

    // Sinon, afficher un cluster
    return {
      id: `cluster-${index}`,
      latitude: cluster.centerLat,
      longitude: cluster.centerLon,
      content: (
        <MissionClusterMarker
          count={cluster.missions.length}
          onClick={() => {
            // Zoomer sur le cluster - pourrait être amélioré pour zoomer automatiquement
            // Pour l'instant, on ne fait rien, l'utilisateur devra zoomer manuellement
          }}
        />
      ),
    };
  });
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

  const markers = useMemo(() => {
    return clusterMissions(missions, currentZoom, onMissionClick);
  }, [missions, currentZoom, onMissionClick]);

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
