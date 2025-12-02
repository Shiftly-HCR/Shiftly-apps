"use client";

import { YStack, XStack, Text } from "tamagui";
import { Input, colors } from "@shiftly/ui";
import { MapLoader } from "@/components";

interface MissionFormStep3Props {
  address: string;
  setAddress: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  postalCode: string;
  setPostalCode: (value: string) => void;
  latitude: number;
  longitude: number;
  isGeocoding: boolean;
  selectedEstablishmentId: string | null;
  onMapClick: (lat: number, lng: number) => void;
}

export function MissionFormStep3({
  address,
  setAddress,
  city,
  setCity,
  postalCode,
  setPostalCode,
  latitude,
  longitude,
  isGeocoding,
  selectedEstablishmentId,
  onMapClick,
}: MissionFormStep3Props) {
  return (
    <YStack gap="$4">
      <Text fontSize={24} fontWeight="700" color={colors.gray900}>
        Où se déroule la mission ?
      </Text>

      <Input
        label="Adresse"
        placeholder="123 Rue de la Paix"
        value={address}
        onChangeText={setAddress}
      />

      <XStack gap="$3">
        <YStack flex={2}>
          <Input
            label="Ville"
            placeholder="Paris"
            value={city}
            onChangeText={setCity}
          />
        </YStack>
        <YStack flex={1}>
          <Input
            label="Code postal"
            placeholder="75000"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="number-pad"
          />
        </YStack>
      </XStack>

      {/* Carte interactive - désactivée si établissement sélectionné */}
      {!selectedEstablishmentId && (
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={14} fontWeight="600" color={colors.gray900}>
              Localisation sur la carte
            </Text>
            {isGeocoding && (
              <Text fontSize={12} color={colors.shiftlyViolet}>
                🔄 Mise à jour...
              </Text>
            )}
          </XStack>
          <Text fontSize={12} color={colors.gray500}>
            Cliquez sur la carte pour positionner le marqueur et remplir
            l'adresse automatiquement
          </Text>
          <MapLoader
            latitude={latitude}
            longitude={longitude}
            zoom={13}
            height={250}
            markers={[
              {
                id: "mission-location",
                latitude: latitude,
                longitude: longitude,
              },
            ]}
            onMapClick={(event) => {
              onMapClick(event.lngLat.lat, event.lngLat.lng);
            }}
            interactive={true}
          />
        </YStack>
      )}

      {selectedEstablishmentId && (
        <YStack
          padding="$3"
          backgroundColor={colors.backgroundLight}
          borderRadius="$3"
        >
          <Text fontSize={14} color={colors.gray500}>
            L'adresse de l'établissement sélectionné sera utilisée. Vous pouvez
            modifier les champs ci-dessus si nécessaire.
          </Text>
        </YStack>
      )}
    </YStack>
  );
}

