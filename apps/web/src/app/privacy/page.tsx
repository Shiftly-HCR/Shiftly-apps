"use client";

import { YStack, Text, ScrollView } from "tamagui";
import { AppLayout, PageHeader } from "@/components";
import { colors } from "@shiftly/ui";

export default function PrivacyPage() {
  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack maxWidth={1000} width="100%" alignSelf="center" padding="$6" gap="$6">
          <PageHeader
            title="Politique de confidentialité"
            description="Dernière mise à jour : Janvier 2026"
          />

          <YStack
            padding="$6"
            backgroundColor="white"
            borderRadius="$4"
            borderWidth={1}
            borderColor={colors.gray200}
            gap="$6"
          >
            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                1. Introduction
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Shiftly s'engage à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre plateforme.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                2. Données collectées
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Nous collectons les informations que vous nous fournissez directement lors de l'inscription et de l'utilisation de la plateforme, notamment :
              </Text>
              <YStack gap="$2" marginTop="$2">
                <Text fontSize={14} color={colors.gray700}>
                  • Informations d'identification (nom, prénom, email, téléphone)
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Informations de profil (compétences, expérience, formations)
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Informations de paiement (gérées de manière sécurisée)
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Données d'utilisation de la plateforme
                </Text>
              </YStack>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                3. Utilisation des données
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Nous utilisons vos données pour :
              </Text>
              <YStack gap="$2" marginTop="$2">
                <Text fontSize={14} color={colors.gray700}>
                  • Fournir et améliorer nos services
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Faciliter les mises en relation entre recruteurs et freelances
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Traiter les paiements et gérer les transactions
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Communiquer avec vous concernant votre compte et nos services
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Assurer la sécurité de la plateforme
                </Text>
              </YStack>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                4. Partage des données
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :
              </Text>
              <YStack gap="$2" marginTop="$2">
                <Text fontSize={14} color={colors.gray700}>
                  • Avec votre consentement explicite
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Pour faciliter les mises en relation (profil visible aux autres utilisateurs selon vos paramètres)
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Avec nos prestataires de services de confiance (hébergement, paiement)
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Si requis par la loi ou pour protéger nos droits
                </Text>
              </YStack>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                5. Sécurité des données
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou destruction. Cependant, aucune méthode de transmission sur Internet n'est totalement sécurisée.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                6. Vos droits
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Conformément au RGPD, vous disposez des droits suivants :
              </Text>
              <YStack gap="$2" marginTop="$2">
                <Text fontSize={14} color={colors.gray700}>
                  • Droit d'accès à vos données personnelles
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Droit de rectification de vos données
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Droit à l'effacement de vos données
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Droit à la portabilité de vos données
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  • Droit d'opposition au traitement de vos données
                </Text>
              </YStack>
              <Text fontSize={14} color={colors.gray700} lineHeight={24} marginTop="$2">
                Pour exercer ces droits, contactez-nous à{" "}
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
                .
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                7. Cookies
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Nous utilisons des cookies et technologies similaires pour améliorer votre expérience sur la plateforme, analyser l'utilisation et personnaliser le contenu. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                8. Conservation des données
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales. Lorsque vous supprimez votre compte, nous supprimons vos données personnelles dans un délai raisonnable, sauf si la conservation est requise par la loi.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                9. Modifications
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications seront publiées sur cette page avec une date de mise à jour. Nous vous encourageons à consulter régulièrement cette page.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                10. Contact
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous à{" "}
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
                .
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
