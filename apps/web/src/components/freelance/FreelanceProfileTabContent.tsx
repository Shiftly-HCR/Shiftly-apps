"use client";

import { XStack, YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { FreelanceProfileOverview } from "./FreelanceProfileOverview";
import type {
  Profile,
  FreelanceProfile,
  FreelanceExperience,
  FreelanceEducation,
} from "@shiftly/data";

type TabType = "overview" | "availability" | "reviews" | "documents";

interface FreelanceProfileTabContentProps {
  activeTab: TabType;
  profile: Profile | FreelanceProfile;
  experiences: FreelanceExperience[];
  educations: FreelanceEducation[];
}

type AvailabilityDisplayOption = {
  id: string;
  label: string;
  description: string;
  badgeColor: string;
};

const AVAILABILITY_OPTIONS: Record<string, AvailabilityDisplayOption> = {
  temps_plein: {
    id: "temps_plein",
    label: "Temps plein",
    description: "Disponible en continu sur des missions régulières.",
    badgeColor: "#E8F7EE",
  },
  temps_partiel: {
    id: "temps_partiel",
    label: "Temps partiel",
    description: "Disponible sur des créneaux définis en semaine.",
    badgeColor: "#EAF2FF",
  },
  weekend_soiree: {
    id: "weekend_soiree",
    label: "Week-end et soirée",
    description: "Disponible surtout en horaires décalés et week-end.",
    badgeColor: "#FFF1E8",
  },
  soiree: {
    id: "soiree",
    label: "Soirée uniquement",
    description: "Disponible principalement après la journée.",
    badgeColor: "#F7EEFF",
  },
  weekend: {
    id: "weekend",
    label: "Week-end uniquement",
    description: "Disponible sur les services du week-end.",
    badgeColor: "#FFF8E6",
  },
  flexible: {
    id: "flexible",
    label: "Disponibilité flexible",
    description: "Peut s'adapter selon les besoins de la mission.",
    badgeColor: "#E9FAF6",
  },
  ponctuel: {
    id: "ponctuel",
    label: "Ponctuel / Événements",
    description: "Interventions ponctuelles pour extras et événements.",
    badgeColor: "#FFEFF2",
  },
  immediate: {
    id: "immediate",
    label: "Immédiatement",
    description: "Disponible pour démarrer dès maintenant.",
    badgeColor: "#E8F7EE",
  },
  this_week: {
    id: "this_week",
    label: "Cette semaine",
    description: "Disponible à partir des prochains jours.",
    badgeColor: "#EAF2FF",
  },
  this_month: {
    id: "this_month",
    label: "Ce mois",
    description: "Disponible dans le courant du mois.",
    badgeColor: "#FFF1E8",
  },
};

function normalizeAvailabilityValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function formatFallbackLabel(value: string) {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseAvailability(rawAvailability?: string) {
  if (!rawAvailability || !rawAvailability.trim()) {
    return [];
  }

  const trimmed = rawAvailability.trim();
  let values: string[] = [];

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        values = parsed.map((value) => String(value));
      }
    } catch {
      values = [];
    }
  }

  if (values.length === 0) {
    values = trimmed.split(/[\n,;|]+/g);
  }

  const seen = new Set<string>();
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      const normalized = normalizeAvailabilityValue(value);
      const option = AVAILABILITY_OPTIONS[normalized];

      if (option) {
        return option;
      }

      return {
        id: normalized || value,
        label: formatFallbackLabel(value),
        description: "Disponibilité renseignée par le freelance.",
        badgeColor: colors.gray100,
      };
    })
    .filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
}

/**
 * Composant pour afficher le contenu des différents onglets du profil freelance
 */
export function FreelanceProfileTabContent({
  activeTab,
  profile,
  experiences,
  educations,
}: FreelanceProfileTabContentProps) {
  if (activeTab === "overview") {
    return (
      <FreelanceProfileOverview
        profile={profile}
        experiences={experiences}
        educations={educations}
      />
    );
  }

  if (activeTab === "availability") {
    const availabilityItems = parseAvailability(profile.availability);

    return (
      <YStack
        gap="$4"
        padding="$4"
        backgroundColor={colors.white}
        borderWidth={1}
        borderColor={colors.gray200}
        borderRadius={12}
      >
        <YStack gap="$1">
          <Text fontSize={18} fontWeight="700" color={colors.gray900}>
            Disponibilités
          </Text>
          <Text fontSize={14} color={colors.gray700}>
            Créneaux et rythme de mission préférés du freelance.
          </Text>
        </YStack>

        {availabilityItems.length === 0 ? (
          <Text fontSize={15} color={colors.gray700}>
            Aucune disponibilité renseignée pour le moment.
          </Text>
        ) : (
          <YStack gap="$3">
            {availabilityItems.map((item) => (
              <XStack
                key={item.id}
                gap="$3"
                alignItems="center"
                padding="$3"
                borderRadius={10}
                backgroundColor={colors.gray100}
                borderWidth={1}
                borderColor={colors.gray200}
              >
                <YStack
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius={999}
                  backgroundColor={item.badgeColor}
                  borderWidth={1}
                  borderColor={colors.gray200}
                >
                  <Text fontSize={12} fontWeight="600" color={colors.gray900}>
                    {item.label}
                  </Text>
                </YStack>
                <Text flex={1} fontSize={14} color={colors.gray700}>
                  {item.description}
                </Text>
              </XStack>
            ))}
          </YStack>
        )}
      </YStack>
    );
  }

  // TODO: Feature not ready yet
  // if (activeTab === "reviews") {
  //   return (
  //     <YStack
  //       gap="$4"
  //       padding="$4"
  //       backgroundColor={colors.white}
  //       borderRadius={12}
  //     >
  //       <Text fontSize={16} color={colors.gray700}>
  //         Les avis seront affichés ici.
  //       </Text>
  //     </YStack>
  //   );
  // }

  // TODO: Feature not ready yet
  // if (activeTab === "documents") {
  //   return (
  //     <YStack
  //       gap="$4"
  //       padding="$4"
  //       backgroundColor={colors.white}
  //       borderRadius={12}
  //     >
  //       <Text fontSize={16} color={colors.gray700}>
  //         Les documents seront affichés ici.
  //       </Text>
  //     </YStack>
  //   );
  // }

  return (
    <YStack
      gap="$2"
      padding="$4"
      backgroundColor={colors.white}
      borderRadius={12}
      borderWidth={1}
      borderColor={colors.gray200}
    >
      <Text fontSize={16} color={colors.gray700}>
        Contenu indisponible pour cet onglet.
      </Text>
    </YStack>
  );
}
