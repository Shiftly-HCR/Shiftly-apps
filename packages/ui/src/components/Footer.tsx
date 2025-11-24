import React from "react";
import { XStack, YStack, Text } from "tamagui";
import { colors } from "../theme";

interface FooterProps {
  className?: string;
  onHomeClick?: () => void;
  onMissionsClick?: () => void;
  onProfileClick?: () => void;
  onSubscriptionClick?: () => void;
  onHelpClick?: () => void;
  onContactClick?: () => void;
  onFaqClick?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  onLegalClick?: () => void;
}

export function Footer({
  className,
  onHomeClick,
  onMissionsClick,
  onProfileClick,
  onSubscriptionClick,
  onHelpClick,
  onContactClick,
  onFaqClick,
  onTermsClick,
  onPrivacyClick,
  onLegalClick,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNavigation = (
    callback?: () => void,
    defaultPath: string
  ) => {
    if (callback) {
      callback();
      return;
    }

    if (typeof window !== "undefined") {
      window.location.href = defaultPath;
    }
  };

  return (
    <YStack
      backgroundColor={colors.white}
      borderTopWidth={1}
      borderTopColor={colors.gray200}
      paddingHorizontal="$6"
      paddingVertical="$6"
      marginTop="auto"
    >
      <XStack
        maxWidth={1400}
        width="100%"
        alignSelf="center"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap="$6"
      >
        {/* Section Logo et description */}
        <YStack gap="$3" flex={1} minWidth={200}>
          <XStack
            alignItems="center"
            gap="$2"
            cursor="pointer"
            hoverStyle={{ opacity: 0.8 }}
            onPress={() => handleNavigation(onHomeClick, "/home")}
          >
            <YStack
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor={colors.shiftlyOrange}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={18} color={colors.white} fontWeight="700">
                H
              </Text>
            </YStack>
            <Text fontSize={18} fontWeight="700" color={colors.gray900}>
              Shiftly
            </Text>
          </XStack>
          <Text fontSize={14} color={colors.gray700} lineHeight={20}>
            La plateforme de recrutement pour l'hôtellerie et la restauration.
            Trouvez les meilleurs talents ou les meilleures missions.
          </Text>
        </YStack>

        {/* Section Liens */}
        <XStack gap="$8" flexWrap="wrap">
          {/* Navigation */}
          <YStack gap="$2" minWidth={120}>
            <Text fontSize={14} fontWeight="600" color={colors.gray900} marginBottom="$1">
              Navigation
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.shiftlyOrange }}
              onPress={() => handleNavigation(onHomeClick, "/home")}
            >
              Accueil
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.shiftlyOrange }}
              onPress={() => handleNavigation(onMissionsClick, "/missions")}
            >
              Missions
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.shiftlyOrange }}
              onPress={() => handleNavigation(onProfileClick, "/profile")}
            >
              Profil
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.shiftlyOrange }}
              onPress={() => handleNavigation(onSubscriptionClick, "/subscription")}
            >
              Abonnement
            </Text>
          </YStack>

          {/* Support */}
          <YStack gap="$2" minWidth={120}>
            <Text fontSize={14} fontWeight="600" color={colors.gray900} marginBottom="$1">
              Support
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.shiftlyOrange }}
              onPress={() => handleNavigation(onHelpClick, "/help")}
            >
              Aide
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.shiftlyOrange }}
              onPress={() => handleNavigation(onContactClick, "/contact")}
            >
              Contact
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.shiftlyOrange }}
              onPress={() => handleNavigation(onFaqClick, "/faq")}
            >
              FAQ
            </Text>
          </YStack>

          {/* Légal */}
          <YStack gap="$2" minWidth={120}>
            <Text fontSize={14} fontWeight="600" color={colors.gray900} marginBottom="$1">
              Légal
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.shiftlyOrange }}
              onPress={() => handleNavigation(onTermsClick, "/terms")}
            >
              Conditions d'utilisation
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.shiftlyOrange }}
              onPress={() => handleNavigation(onPrivacyClick, "/privacy")}
            >
              Politique de confidentialité
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.shiftlyOrange }}
              onPress={() => handleNavigation(onLegalClick, "/legal")}
            >
              Mentions légales
            </Text>
          </YStack>
        </XStack>
      </XStack>

      {/* Copyright */}
      <XStack
        marginTop="$6"
        paddingTop="$4"
        borderTopWidth={1}
        borderTopColor={colors.gray200}
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize={12} color={colors.gray500}>
          © {currentYear} Shiftly. Tous droits réservés.
        </Text>
      </XStack>
    </YStack>
  );
}

