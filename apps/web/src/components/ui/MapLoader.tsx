"use client";

import dynamic from "next/dynamic";
import { YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";

// Type pour les markers de la carte
export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  onClick?: () => void;
  content?: React.ReactNode; // Contenu personnalisé (ex: MissionBubbleMarker)
};

// Type pour les props du Map
interface MapLoaderProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  width?: string | number;
  height?: string | number;
  markers?: MapMarker[];
  onMapClick?: (event: { lngLat: { lng: number; lat: number } }) => void;
  onViewStateChange?: (viewState: { latitude: number; longitude: number; zoom: number }) => void;
  interactive?: boolean;
  style?: React.CSSProperties;
}

// Import dynamique de Map pour éviter les erreurs SSR
const Map = dynamic(() => import("@/components/ui/Map"), {
  ssr: false,
  loading: () => (
    <YStack
      backgroundColor={colors.gray100}
      borderRadius={12}
      height={250}
      alignItems="center"
      justifyContent="center"
      borderWidth={1}
      borderColor={colors.gray200}
    >
      <Text fontSize={14} color={colors.gray500}>
        Chargement de la carte...
      </Text>
    </YStack>
  ),
});

/**
 * Composant wrapper pour l'import dynamique de Map
 * Évite la duplication du code d'import dynamique dans toutes les pages
 */
export function MapLoader(props: MapLoaderProps) {
  return <Map {...props} />;
}
