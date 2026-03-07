"use client";

import { XStack, YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { useResponsive } from "@/hooks";
import type { EstablishmentDashboardRow } from "@/types/adminDashboard";

interface EstablishmentsTableProps {
  establishments: EstablishmentDashboardRow[];
}

function formatName(
  firstName: string | null,
  lastName: string | null,
  fallback: string | null,
  emptyLabel: string,
): string {
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  if (fullName) return fullName;
  if (fallback) return fallback;
  return emptyLabel;
}

export function EstablishmentsTable({
  establishments,
}: EstablishmentsTableProps) {
  const { isMobile } = useResponsive();

  if (establishments.length === 0) {
    return (
      <YStack
        padding="$5"
        backgroundColor={colors.white}
        borderWidth={1}
        borderColor={colors.gray200}
        borderRadius={12}
      >
        <Text fontSize={14} color={colors.gray700}>
          Aucun etablissement à afficher.
        </Text>
      </YStack>
    );
  }

  if (isMobile) {
    return (
      <YStack gap="$3">
        {establishments.map((establishment) => {
          const recruiterName = formatName(
            establishment.recruiter_first_name,
            establishment.recruiter_last_name,
            establishment.recruiter_email,
            "Recruiter inconnu",
          );
          const commercialName = establishment.commercial_id
            ? formatName(
                establishment.commercial_first_name,
                establishment.commercial_last_name,
                establishment.commercial_email,
                "Inconnu",
              )
            : "Aucun";

          return (
            <YStack
              key={establishment.establishment_id}
              backgroundColor={colors.white}
              borderWidth={1}
              borderColor={colors.gray200}
              borderRadius={12}
              padding="$4"
              gap="$2"
            >
              <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                {establishment.name}
              </Text>
              <Text fontSize={13} color={colors.gray700}>
                Ville: {establishment.city || "Non renseignee"}
              </Text>
              <Text fontSize={13} color={colors.gray700}>
                Code postal: {establishment.postal_code || "Non renseigne"}
              </Text>
              <Text fontSize={13} color={colors.gray700}>
                Recruiter: {recruiterName}
              </Text>
              <Text fontSize={13} color={colors.gray700}>
                Commercial: {commercialName}
              </Text>
              <Text fontSize={13} color={colors.gray700}>
                Missions liees: {establishment.missions_count}
              </Text>
            </YStack>
          );
        })}
      </YStack>
    );
  }

  return (
    <YStack
      backgroundColor={colors.white}
      borderWidth={1}
      borderColor={colors.gray200}
      borderRadius={12}
      overflow="hidden"
    >
      <XStack
        padding="$4"
        backgroundColor={colors.gray050}
        borderBottomWidth={1}
        borderBottomColor={colors.gray200}
      >
        <XStack flex={2}>
          <Text fontSize={13} fontWeight="700" color={colors.gray700}>
            Etablissement
          </Text>
        </XStack>
        <XStack width={130}>
          <Text fontSize={13} fontWeight="700" color={colors.gray700}>
            Ville
          </Text>
        </XStack>
        <XStack flex={2}>
          <Text fontSize={13} fontWeight="700" color={colors.gray700}>
            Recruiter lie
          </Text>
        </XStack>
        <XStack width={120}>
          <Text fontSize={13} fontWeight="700" color={colors.gray700}>
            Commercial
          </Text>
        </XStack>
        <XStack width={110} justifyContent="center">
          <Text fontSize={13} fontWeight="700" color={colors.gray700}>
            Missions
          </Text>
        </XStack>
      </XStack>

      {establishments.map((establishment, index) => {
        const isLast = index === establishments.length - 1;
        const recruiterName = formatName(
          establishment.recruiter_first_name,
          establishment.recruiter_last_name,
          establishment.recruiter_email,
          "Recruiter inconnu",
        );
        const commercialName = establishment.commercial_id
          ? formatName(
              establishment.commercial_first_name,
              establishment.commercial_last_name,
              establishment.commercial_email,
              "Inconnu",
            )
          : "Aucun";

        return (
          <XStack
            key={establishment.establishment_id}
            padding="$4"
            alignItems="center"
            borderBottomWidth={isLast ? 0 : 1}
            borderBottomColor={colors.gray100}
          >
            <XStack flex={2}>
              <Text fontSize={14} color={colors.gray900}>
                {establishment.name}
              </Text>
            </XStack>
            <XStack width={130}>
              <Text fontSize={14} color={colors.gray700}>
                {establishment.city || "Non renseignee"}
              </Text>
            </XStack>
            <XStack flex={2}>
              <Text fontSize={14} color={colors.gray700}>
                {recruiterName}
              </Text>
            </XStack>
            <XStack width={120}>
              <Text fontSize={14} color={colors.gray700}>
                {commercialName}
              </Text>
            </XStack>
            <XStack width={110} justifyContent="center">
              <Text fontSize={14} color={colors.gray900}>
                {establishment.missions_count}
              </Text>
            </XStack>
          </XStack>
        );
      })}
    </YStack>
  );
}
