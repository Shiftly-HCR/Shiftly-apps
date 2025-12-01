"use client";

import React from "react";
import ReactMapGL, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { YStack } from "tamagui";
import { useMap } from "@/hooks";

interface MapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  width?: string | number;
  height?: string | number;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    onClick?: () => void;
  }>;
  onMapClick?: (event: { lngLat: { lng: number; lat: number } }) => void;
  interactive?: boolean;
  style?: React.CSSProperties;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function Map({
  latitude = 48.8566, // Paris par défaut
  longitude = 2.3522,
  zoom = 12,
  width = "100%",
  height = 400,
  markers = [],
  onMapClick,
  interactive = true,
  style,
}: MapProps) {
  const { viewState, setViewState, handleMapClick } = useMap({
    latitude,
    longitude,
    zoom,
    onMapClick,
    interactive,
  });

  if (!MAPBOX_TOKEN) {
    return (
      <YStack
        width={width}
        height={height}
        backgroundColor="#E0E0E0"
        borderRadius={12}
        alignItems="center"
        justifyContent="center"
        style={style}
      >
        <p style={{ color: "#999", fontSize: 14 }}>
          Clé API Mapbox non configurée
        </p>
        <p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>
          Ajoutez NEXT_PUBLIC_MAPBOX_TOKEN dans votre .env.local
        </p>
      </YStack>
    );
  }

  return (
    <div
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: 12,
        overflow: "hidden",
        ...style,
      }}
    >
      <ReactMapGL
        {...viewState}
        onMove={(evt) => interactive && setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        scrollZoom={interactive}
        dragPan={interactive}
        dragRotate={interactive}
        doubleClickZoom={interactive}
        keyboard={interactive}
      >
        {/* Contrôles de navigation */}
        {interactive && (
          <NavigationControl position="top-right" showCompass={false} />
        )}

        {/* Marqueurs */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.latitude}
            longitude={marker.longitude}
            anchor="bottom"
          >
            <div
              onClick={() => marker.onClick && marker.onClick()}
              style={{
                cursor: marker.onClick ? "pointer" : "default",
                fontSize: 32,
                transform: "translateY(-16px)",
              }}
            >
              📍
            </div>
          </Marker>
        ))}
      </ReactMapGL>
    </div>
  );
}
