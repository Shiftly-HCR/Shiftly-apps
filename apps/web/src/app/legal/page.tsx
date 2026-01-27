"use client";

import { YStack, Text, ScrollView } from "tamagui";
import { AppLayout, PageHeader } from "@/components";
import { colors } from "@shiftly/ui";

export default function LegalPage() {
  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack maxWidth={1000} width="100%" alignSelf="center" padding="$6" gap="$6">
          <PageHeader
            title="Mentions légales"
            description="Informations légales sur Shiftly"
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
                1. Éditeur du site
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Le site Shiftly est édité par :
              </Text>
              <YStack gap="$2" marginTop="$2">
                <Text fontSize={14} color={colors.gray700}>
                  <Text fontWeight="600">Raison sociale :</Text> Shiftly
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  <Text fontWeight="600">Email :</Text>{" "}
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
                </Text>
              </YStack>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                2. Directeur de publication
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Le directeur de la publication est le représentant légal de Shiftly.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                3. Hébergement
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Le site est hébergé par des prestataires de services d'hébergement cloud sécurisés. Les données sont stockées dans des centres de données conformes aux normes de sécurité les plus strictes.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                4. Propriété intellectuelle
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                L'ensemble du contenu du site (textes, images, vidéos, logos, graphismes, etc.) est la propriété exclusive de Shiftly, sauf mention contraire. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site est interdite sans autorisation écrite préalable de Shiftly.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                5. Protection des données personnelles
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Conformément à la loi Informatique et Libertés et au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant. Pour exercer ces droits, contactez-nous à{" "}
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
                . Pour plus d'informations, consultez notre{" "}
                <Text
                  fontSize={14}
                  color={colors.shiftlyViolet}
                  fontWeight="600"
                  cursor="pointer"
                  hoverStyle={{ textDecorationLine: "underline" }}
                  onPress={() => {
                    window.location.href = "/privacy";
                  }}
                >
                  politique de confidentialité
                </Text>
                .
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                6. Cookies
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Le site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. En continuant à naviguer sur le site, vous acceptez l'utilisation de cookies conformément à notre politique de confidentialité.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                7. Limitation de responsabilité
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Shiftly s'efforce de fournir des informations aussi précises que possible. Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24} marginTop="$2">
                Shiftly ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications, soit de l'apparition d'un bug ou d'une incompatibilité.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                8. Liens hypertextes
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Le site peut contenir des liens hypertextes vers d'autres sites. Shiftly n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu et leur accessibilité.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                9. Droit applicable
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </Text>
            </YStack>

            <YStack gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                10. Contact
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter à{" "}
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
