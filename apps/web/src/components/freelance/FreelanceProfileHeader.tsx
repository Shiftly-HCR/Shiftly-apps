"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { FiCheck } from "react-icons/fi";
import type { Profile, FreelanceProfile } from "@shiftly/data";

interface FreelanceProfileHeaderProps {
  profile: Profile | FreelanceProfile;
}

/**
 * Composant pour afficher l'en-tête du profil freelance
 * Affiche la photo, le nom, la note, le headline et les badges
 */
export function FreelanceProfileHeader({ profile }: FreelanceProfileHeaderProps) {
  const getFullName = () => {
    const firstName = profile.first_name || "";
    const lastName = profile.last_name || "";
    return `${firstName} ${lastName}`.trim() || "Freelance";
  };

  const fullName = getFullName();

  return (
    <XStack gap="$4" alignItems="flex-start">
      {/* Photo de profil */}
      <YStack
        width={120}
        height={120}
        borderRadius={60}
        backgroundColor={colors.shiftlyViolet}
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        flexShrink={0}
      >
        {profile.photo_url ? (
          <img
            src={profile.photo_url}
            alt={fullName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Text color={colors.white} fontSize={48} fontWeight="600">
            {fullName.charAt(0).toUpperCase()}
          </Text>
        )}
      </YStack>

      {/* Informations principales */}
      <YStack flex={1} gap="$2">
        <XStack gap="$3" alignItems="center" flexWrap="wrap">
          <Text fontSize={32} fontWeight="700" color={colors.gray900}>
            {fullName}
          </Text>
          {"note" in profile && profile.note && (
            <XStack alignItems="center" gap="$1">
              <Text fontSize={16} color={colors.shiftlyGold}>
                ⭐
              </Text>
              <Text fontSize={16} fontWeight="600" color={colors.gray700}>
                {profile.note.toFixed(1)} (12 avis)
              </Text>
            </XStack>
          )}
        </XStack>

        <Text fontSize={18} color={colors.gray700} fontWeight="500">
          {"headline" in profile && profile.headline
            ? profile.headline
            : "Freelance"}
        </Text>

        {/* Badges */}
        <XStack
          gap="$2"
          alignItems="center"
          flexWrap="wrap"
          marginTop="$2"
        >
          <XStack
            paddingHorizontal="$3"
            paddingVertical="$1.5"
            backgroundColor={colors.white}
            borderRadius="$3"
            borderWidth={1}
            borderColor={colors.gray200}
            gap="$2"
            alignItems="center"
          >
            <FiCheck size={16} color={colors.shiftlyViolet} />
            <Text fontSize={13} color={colors.gray700} fontWeight="500">
              Profil vérifié
            </Text>
          </XStack>
          <XStack
            paddingHorizontal="$3"
            paddingVertical="$1.5"
            backgroundColor={colors.shiftlyViolet + "20"}
            borderRadius="$3"
            borderWidth={1}
            borderColor={colors.shiftlyViolet}
          >
            <Text
              fontSize={13}
              color={colors.shiftlyViolet}
              fontWeight="600"
            >
              Top Freelance
            </Text>
          </XStack>
        </XStack>
      </YStack>
    </XStack>
  );
}

