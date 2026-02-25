"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { AppLayout, PageHeader } from "@/components";
import { useResponsive } from "@/hooks";
import { colors } from "@shiftly/ui";
import { Mail, MessageSquare, Clock, MapPin } from "lucide-react";

export default function ContactPage() {
  const { isMobile } = useResponsive();
  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack
          maxWidth={1200}
          width="100%"
          alignSelf="center"
          padding={isMobile ? "$4" : "$6"}
          gap="$6"
        >
          <PageHeader
            title="Contactez-nous"
            description="Nous sommes là pour vous aider"
          />

          <YStack gap="$6">
            {/* Informations de contact */}
            <YStack
              padding="$6"
              backgroundColor="white"
              borderRadius="$4"
              borderWidth={1}
              borderColor={colors.gray200}
              gap="$6"
            >
              <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                Nos coordonnées
              </Text>

              <YStack gap="$4">
                {/* Support */}
                <YStack
                  padding="$4"
                  backgroundColor={colors.gray050}
                  borderRadius="$3"
                  gap="$3"
                >
                  <XStack alignItems="center" gap="$3">
                    <MessageSquare size={20} color={colors.shiftlyViolet} />
                    <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                      Support technique
                    </Text>
                  </XStack>
                  <Text fontSize={14} color={colors.gray700} lineHeight={20}>
                    Pour toute question technique, problème d'utilisation ou assistance sur la plateforme.
                  </Text>
                  <XStack alignItems="center" gap="$2">
                    <Mail size={18} color={colors.shiftlyViolet} />
                    <Text
                      fontSize={14}
                      color={colors.shiftlyViolet}
                      fontWeight="600"
                      cursor="pointer"
                      hoverStyle={{ textDecorationLine: "underline" }}
                      onPress={() => {
                        window.location.href = "mailto:support@shiftly.pro";
                      }}
                    >
                      support@shiftly.pro
                    </Text>
                  </XStack>
                </YStack>

                {/* Contact général */}
                <YStack
                  padding="$4"
                  backgroundColor={colors.gray050}
                  borderRadius="$3"
                  gap="$3"
                >
                  <XStack alignItems="center" gap="$3">
                    <Mail size={20} color={colors.shiftlyViolet} />
                    <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                      Contact général
                    </Text>
                  </XStack>
                  <Text fontSize={14} color={colors.gray700} lineHeight={20}>
                    Pour toute question générale, partenariat ou demande d'information.
                  </Text>
                  <XStack alignItems="center" gap="$2">
                    <Mail size={18} color={colors.shiftlyViolet} />
                    <Text
                      fontSize={14}
                      color={colors.shiftlyViolet}
                      fontWeight="600"
                      cursor="pointer"
                      hoverStyle={{ textDecorationLine: "underline" }}
                      onPress={() => {
                        window.location.href = "mailto:contact@shiftly.pro";
                      }}
                    >
                      contact@shiftly.pro
                    </Text>
                  </XStack>
                </YStack>
              </YStack>
            </YStack>

            {/* Délais de réponse */}
            <YStack
              padding="$6"
              backgroundColor={colors.shiftlyVioletLight}
              borderRadius="$4"
              gap="$4"
            >
              <XStack alignItems="center" gap="$3">
                <Clock size={24} color={colors.shiftlyViolet} />
                <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                  Délais de réponse
                </Text>
              </XStack>
              <Text fontSize={14} color={colors.gray700} lineHeight={22}>
                Nous nous efforçons de répondre à toutes vos demandes dans les plus brefs délais :
              </Text>
              <YStack gap="$2" marginTop="$2">
                <Text fontSize={14} color={colors.gray700}>
                  • Support technique : sous 24 heures
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Contact général : sous 48 heures
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Demandes urgentes : réponse prioritaire
                </Text>
              </YStack>
            </YStack>

            {/* Informations supplémentaires */}
            <YStack
              padding="$6"
              backgroundColor="white"
              borderRadius="$4"
              borderWidth={1}
              borderColor={colors.gray200}
              gap="$4"
            >
              <Text fontSize={18} fontWeight="600" color={colors.gray900}>
                Autres moyens de nous joindre
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={22}>
                Vous pouvez également consulter notre{" "}
                <Text
                  fontSize={14}
                  color={colors.shiftlyViolet}
                  fontWeight="600"
                  cursor="pointer"
                  hoverStyle={{ textDecorationLine: "underline" }}
                  onPress={() => {
                    window.location.href = "/faq";
                  }}
                >
                  FAQ
                </Text>{" "}
                ou notre{" "}
                <Text
                  fontSize={14}
                  color={colors.shiftlyViolet}
                  fontWeight="600"
                  cursor="pointer"
                  hoverStyle={{ textDecorationLine: "underline" }}
                  onPress={() => {
                    window.location.href = "/help";
                  }}
                >
                  centre d'aide
                </Text>{" "}
                pour trouver rapidement des réponses à vos questions.
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
