"use client";

import { MapLoader, MissionBubbleMarker } from "@/components";
import type { Mission } from "@shiftly/data";

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
  const markers = missions
    .filter((m) => m.latitude && m.longitude)
    .map((mission) => ({
      id: mission.id,
      latitude: mission.latitude!,
      longitude: mission.longitude!,
      content: (
        <MissionBubbleMarker
          mission={mission}
          onClick={() => onMissionClick(mission.id)}
        />
      ),
    }));

  return (
    <MapLoader
      latitude={latitude}
      longitude={longitude}
      zoom={zoom}
      height={height}
      markers={markers}
      interactive={true}
    />
  );
}
