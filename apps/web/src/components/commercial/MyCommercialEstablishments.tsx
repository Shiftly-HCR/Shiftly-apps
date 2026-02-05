"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { colors } from "@shiftly/ui";
import { PageLoading, EmptyState } from "@/components";
import { useMyCommercialEstablishments } from "@/hooks";
import { Building2, MapPin, Briefcase } from "lucide-react";

/**
 * Composant pour afficher la liste des établissements rattachés au commercial
 */
export function MyCommercialEstablishments() {
  const { establishments, isLoading, error, refetch } =
    useMyCommercialEstablishments();

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <YStack
        padding="$4"
        backgroundColor="#FEE2E2"
        borderRadius="$4"
        borderWidth={1}
        borderColor="#EF4444"
      >
        <Text fontSize={14} color="#DC2626">
          {error}
        </Text>
      </YStack>
    );
  }

  if (establishments.length === 0) {
    return (
      <EmptyState
        title="Aucun établissement rattaché"
        description="Utilisez le code secret pour vous rattacher à un établissement."
      />
    );
  }

  return (
    <YStack gap="$4">
      <ScrollView>
        <YStack gap="$3">
          {establishments.map((establishment) => (
            <YStack
              key={establishment.id}
              padding="$4"
              backgroundColor={colors.white}
              borderRadius="$4"
              borderWidth={1}
              borderColor={colors.gray200}
              gap="$3"
            >
              {/* Header avec nom */}
              <XStack alignItems="center" gap="$3" flex={1}>
                <YStack
                  width={48}
                  height={48}
                  borderRadius={24}
                  backgroundColor={colors.gray100}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Building2 size={24} color={colors.shiftlyViolet} />
                </YStack>
                <YStack flex={1} gap="$1">
                  <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                    {establishment.name}
                  </Text>
                </YStack>
              </XStack>

              {/* Informations de localisation */}
              {(establishment.address || establishment.city) && (
                <XStack alignItems="center" gap="$2">
                  <MapPin size={16} color={colors.gray500} />
                  <Text fontSize={14} color={colors.gray500} flex={1}>
                    {[
                      establishment.address,
                      [establishment.postal_code, establishment.city]
                        .filter(Boolean)
                        .join(" "),
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </XStack>
              )}

              {/* Footer avec date de création */}
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap="$2">
                  <Briefcase size={14} color={colors.gray500} />
                  <Text fontSize={12} color={colors.gray500}>
                    Créé le{" "}
                    {establishment.created_at
                      ? new Date(establishment.created_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
