import React from "react";
import { XStack, YStack, Text } from "tamagui";
import { colors } from "../theme";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

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
          <XStack alignItems="center" gap="$2">
            <YStack
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor={colors.hestiaOrange}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={18} color={colors.white} fontWeight="700">
                H
              </Text>
            </YStack>
            <Text fontSize={18} fontWeight="700" color={colors.gray900}>
              Hestia
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
              hoverStyle={{ color: colors.hestiaOrange }}
            >
              Accueil
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.hestiaOrange }}
            >
              Missions
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.hestiaOrange }}
            >
              Profil
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.hestiaOrange }}
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
              hoverStyle={{ color: colors.hestiaOrange }}
            >
              Aide
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.hestiaOrange }}
            >
              Contact
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.hestiaOrange }}
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
              hoverStyle={{ color: colors.hestiaOrange }}
            >
              Conditions d'utilisation
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.hestiaOrange }}
            >
              Politique de confidentialité
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              cursor="pointer"
              hoverStyle={{ color: colors.hestiaOrange }}
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
          © {currentYear} Hestia. Tous droits réservés.
        </Text>
      </XStack>
    </YStack>
  );
}

