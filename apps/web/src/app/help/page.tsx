"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { AppLayout, PageHeader } from "@/components";
import { colors } from "@shiftly/ui";
import { HelpCircle, BookOpen, MessageCircle, Mail } from "lucide-react";

export default function HelpPage() {
  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack maxWidth={1200} width="100%" alignSelf="center" padding="$6" gap="$6">
          <PageHeader
            title="Centre d'aide"
            description="Trouvez rapidement les réponses à vos questions"
          />

          {/* Sections principales */}
          <YStack gap="$6">
            {/* Guide de démarrage */}
            <YStack
              padding="$6"
              backgroundColor="white"
              borderRadius="$4"
              borderWidth={1}
              borderColor={colors.gray200}
              gap="$4"
            >
              <XStack alignItems="center" gap="$3">
                <BookOpen size={24} color={colors.shiftlyViolet} />
                <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                  Guide de démarrage
                </Text>
              </XStack>
              <Text fontSize={14} color={colors.gray700} lineHeight={22}>
                Découvrez comment utiliser Shiftly pour trouver des missions ou recruter des talents dans l'hôtellerie et la restauration.
              </Text>
              <YStack gap="$2" marginTop="$2">
                <Text fontSize={14} color={colors.gray700}>
                  • Créez votre profil en quelques minutes
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Explorez les missions disponibles ou publiez vos offres
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Connectez-vous avec les meilleurs talents ou recruteurs
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Gérez vos candidatures et missions facilement
                </Text>
              </YStack>
            </YStack>

            {/* Ressources */}
            <YStack
              padding="$6"
              backgroundColor="white"
              borderRadius="$4"
              borderWidth={1}
              borderColor={colors.gray200}
              gap="$4"
            >
              <XStack alignItems="center" gap="$3">
                <HelpCircle size={24} color={colors.shiftlyViolet} />
                <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                  Ressources
                </Text>
              </XStack>
              <YStack gap="$3">
                <YStack gap="$1">
                  <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                    Questions fréquentes (FAQ)
                  </Text>
                  <Text fontSize={14} color={colors.gray700} lineHeight={20}>
                    Consultez notre FAQ pour trouver des réponses aux questions les plus courantes sur l'utilisation de la plateforme.
                  </Text>
                </YStack>
                <YStack gap="$1">
                  <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                    Tutoriels vidéo
                  </Text>
                  <Text fontSize={14} color={colors.gray700} lineHeight={20}>
                    Apprenez à utiliser toutes les fonctionnalités de Shiftly grâce à nos tutoriels vidéo.
                  </Text>
                </YStack>
                <YStack gap="$1">
                  <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                    Documentation
                  </Text>
                  <Text fontSize={14} color={colors.gray700} lineHeight={20}>
                    Accédez à notre documentation complète pour en savoir plus sur les fonctionnalités avancées.
                  </Text>
                </YStack>
              </YStack>
            </YStack>

            {/* Contact */}
            <YStack
              padding="$6"
              backgroundColor={colors.shiftlyVioletLight}
              borderRadius="$4"
              gap="$4"
            >
              <XStack alignItems="center" gap="$3">
                <MessageCircle size={24} color={colors.shiftlyViolet} />
                <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                  Besoin d'aide supplémentaire ?
                </Text>
              </XStack>
              <Text fontSize={14} color={colors.gray700} lineHeight={22}>
                Notre équipe est là pour vous aider. N'hésitez pas à nous contacter si vous avez des questions ou besoin d'assistance.
              </Text>
              <XStack gap="$4" flexWrap="wrap">
                <XStack alignItems="center" gap="$2">
                  <Mail size={18} color={colors.shiftlyViolet} />
                  <Text fontSize={14} color={colors.gray900} fontWeight="600">
                    support@shiftly.pro
                  </Text>
                </XStack>
                <XStack alignItems="center" gap="$2">
                  <Mail size={18} color={colors.shiftlyViolet} />
                  <Text fontSize={14} color={colors.gray900} fontWeight="600">
                    contact@shiftly.pro
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
