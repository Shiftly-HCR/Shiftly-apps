"use client";

import { YStack, Text, ScrollView } from "tamagui";
import { AppLayout, PageHeader } from "@/components";
import { useResponsive } from "@/hooks";
import { colors } from "@shiftly/ui";

export default function TermsPage() {
  const { isMobile } = useResponsive();
  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack
          maxWidth={1000}
          width="100%"
          alignSelf="center"
          padding={isMobile ? "$4" : "$6"}
          gap="$6"
        >
          <PageHeader
            title="Conditions d'utilisation"
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
                1. Acceptation des conditions
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                En accédant et en utilisant la plateforme Shiftly, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                2. Description du service
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Shiftly est une plateforme de mise en relation entre recruteurs et freelances dans le secteur de l'hôtellerie et de la restauration. Nous facilitons la connexion entre les établissements et les professionnels, mais nous ne sommes pas responsables de la qualité des services fournis par les utilisateurs.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                3. Compte utilisateur
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Pour utiliser notre plateforme, vous devez créer un compte avec des informations exactes et à jour. Vous êtes responsable de maintenir la confidentialité de vos identifiants de connexion et de toutes les activités qui se produisent sous votre compte.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                4. Utilisation de la plateforme
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Vous vous engagez à utiliser la plateforme de manière légale et conforme à ces conditions. Il est interdit d'utiliser la plateforme pour des activités frauduleuses, illégales ou nuisibles à d'autres utilisateurs.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                5. Contenu utilisateur
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Vous conservez tous les droits sur le contenu que vous publiez sur la plateforme. En publiant du contenu, vous nous accordez une licence pour l'utiliser, l'afficher et le distribuer sur la plateforme. Vous garantissez que vous avez le droit de publier ce contenu.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                6. Paiements
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Les paiements entre recruteurs et freelances sont gérés via notre système sécurisé. Les frais de transaction peuvent s'appliquer. Nous nous réservons le droit de modifier nos tarifs avec un préavis approprié.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                7. Propriété intellectuelle
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Tous les contenus de la plateforme, y compris les logos, textes, graphiques et logiciels, sont la propriété de Shiftly ou de ses concédants de licence et sont protégés par les lois sur la propriété intellectuelle.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                8. Limitation de responsabilité
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Shiftly agit en tant qu'intermédiaire et n'est pas responsable des interactions entre utilisateurs, de la qualité des services fournis ou des dommages résultant de l'utilisation de la plateforme.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                9. Modification des conditions
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur la plateforme. Il est de votre responsabilité de consulter régulièrement ces conditions.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                10. Contact
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter à{" "}
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
