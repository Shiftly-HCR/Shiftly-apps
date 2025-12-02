"use client";

import { YStack, XStack, Text } from "tamagui";
import { useRouter } from "next/navigation";
import { Button, colors } from "@shiftly/ui";
import {
  MapPin,
  UtensilsCrossed,
  Building2,
  Heart,
  CheckCircle2,
  Star,
} from "lucide-react";
import type { Mission } from "@shiftly/data";
import { openConversation } from "@/utils/chatService";

interface MissionDetailSidebarProps {
  mission: Mission;
  profile?: {
    id: string;
    role?: string;
  } | null;
  isRecruiter: boolean;
  isMissionOwner: boolean;
  showSuccessMessage: boolean;
  hasApplied: boolean;
  isApplying: boolean;
  isCheckingApplication: boolean;
  applyError?: string | null;
  onApply: () => void;
  onManageCandidates?: () => void;
}

export function MissionDetailSidebar({
  mission,
  profile,
  isRecruiter,
  isMissionOwner,
  showSuccessMessage,
  hasApplied,
  isApplying,
  isCheckingApplication,
  applyError,
  onApply,
  onManageCandidates,
}: MissionDetailSidebarProps) {
  const router = useRouter();

  return (
    <YStack width={320} gap="$4" $sm={{ width: "100%" }}>
      {/* Carte Rémunération */}
      <YStack
        backgroundColor="white"
        borderRadius={12}
        padding="$5"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
      >
        <Text fontSize={14} color="#666" marginBottom="$2">
          Rémunération
        </Text>
        <Text
          fontSize={32}
          fontWeight="bold"
          color={colors.shiftlyViolet}
          marginBottom="$4"
        >
          {mission.hourly_rate}€/h
        </Text>

        {/* Boutons d'action */}
        <YStack gap="$3">
          {isRecruiter && isMissionOwner && onManageCandidates ? (
            <Button
              variant="primary"
              size="md"
              width="100%"
              onPress={onManageCandidates}
            >
              Gérer les candidatures
            </Button>
          ) : showSuccessMessage ? (
            <YStack
              padding="$3"
              backgroundColor="#D4F4DD"
              borderRadius={8}
              alignItems="center"
              flexDirection="row"
              justifyContent="center"
              gap="$2"
            >
              <CheckCircle2 size={16} color="#00A86B" />
              <Text fontSize={14} color="#00A86B" fontWeight="600">
                Candidature envoyée avec succès !
              </Text>
            </YStack>
          ) : hasApplied ? (
            <YStack
              padding="$3"
              backgroundColor="#FFF3CD"
              borderRadius={8}
              alignItems="center"
              flexDirection="row"
              justifyContent="center"
              gap="$2"
            >
              <CheckCircle2 size={16} color="#856404" />
              <Text fontSize={14} color="#856404" fontWeight="600">
                Vous avez déjà postulé à cette mission
              </Text>
            </YStack>
          ) : profile?.role === "freelance" ? (
            <Button
              variant="primary"
              size="md"
              width="100%"
              onPress={onApply}
              disabled={
                isApplying ||
                isCheckingApplication ||
                mission?.status !== "published"
              }
            >
              {isApplying ? "Envoi en cours..." : "Postuler à cette mission"}
            </Button>
          ) : (
            <YStack
              padding="$3"
              backgroundColor="#F8F9FA"
              borderRadius={8}
              alignItems="center"
            >
              <Text fontSize={14} color="#666" fontWeight="600">
                Connectez-vous en tant que freelance pour postuler
              </Text>
            </YStack>
          )}

          {applyError && (
            <YStack
              padding="$3"
              backgroundColor="#F8D7DA"
              borderRadius={8}
            >
              <Text fontSize={14} color="#721C24">{applyError}</Text>
            </YStack>
          )}

          <Button
            variant="primary"
            size="md"
            width="100%"
            onPress={() => {
              console.log("Sauvegarder la mission:", mission.id);
            }}
          >
            <Heart size={16} style={{ marginRight: 8 }} />
            Sauvegarder la mission
          </Button>

          {/* Badge Shiftly certifie */}
          <XStack
            backgroundColor="#D4F4DD"
            borderRadius={8}
            padding="$3"
            alignItems="center"
            justifyContent="center"
            gap="$2"
          >
            <CheckCircle2 size={16} color="#00A86B" />
            <Text fontSize={14} color="#00A86B" fontWeight="600">
              Shiftly certifie cette mission
            </Text>
          </XStack>
        </YStack>
      </YStack>

      {/* Carte Établissement */}
      <YStack
        backgroundColor="white"
        borderRadius={12}
        padding="$5"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
      >
        <Text
          fontSize={18}
          fontWeight="bold"
          marginBottom="$4"
          color="#000"
        >
          Établissement
        </Text>

        {/* Header établissement */}
        <XStack alignItems="center" gap="$3" marginBottom="$4">
          <YStack
            width={60}
            height={60}
            borderRadius={30}
            backgroundColor="#F0F0F0"
            alignItems="center"
            justifyContent="center"
          >
            <Building2 size={28} color={colors.shiftlyViolet} />
          </YStack>
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="600" color="#000">
              Nom de l'établissement
            </Text>
            <XStack alignItems="center" gap="$1" marginTop="$1">
              <Star size={14} color={colors.shiftlyViolet} fill={colors.shiftlyViolet} />
              <Text
                fontSize={14}
                color={colors.shiftlyViolet}
                fontWeight="600"
              >
                4.5
              </Text>
              <Text fontSize={12} color="#999">
                (0 avis)
              </Text>
            </XStack>
          </YStack>
        </XStack>

        {/* Informations établissement */}
        <YStack gap="$3" marginBottom="$4">
          <XStack alignItems="center" gap="$2">
            <MapPin size={16} color="#666" />
            <Text fontSize={14} color="#666">
              {mission.city || "Paris"}
            </Text>
          </XStack>

          <XStack alignItems="center" gap="$2">
            <UtensilsCrossed size={16} color="#666" />
            <Text fontSize={14} color="#666">
              Restaurant
            </Text>
          </XStack>
        </YStack>

        {/* Statistiques */}
        <YStack
          backgroundColor="#F8F8F8"
          borderRadius={8}
          padding="$3"
          gap="$2"
          marginBottom="$4"
        >
          <XStack justifyContent="space-between">
            <Text fontSize={14} color="#666">
              Missions publiées
            </Text>
            <Text fontSize={14} fontWeight="600" color="#000">
              0
            </Text>
          </XStack>
          <XStack justifyContent="space-between">
            <Text fontSize={14} color="#666">
              Taux de réponse
            </Text>
            <Text fontSize={14} fontWeight="600" color="#00A86B">
              95%
            </Text>
          </XStack>
        </YStack>

        {/* Bouton Contact */}
        <Button
          variant="outline"
          size="md"
          width="100%"
          onPress={async () => {
            if (!profile || !mission) return;

            if (profile.role === "freelance" && mission.recruiter_id) {
              const result = await openConversation(
                {
                  missionId: mission.id,
                  recruiterId: mission.recruiter_id,
                  freelanceId: profile.id,
                },
                (conversationId) => {
                  router.push(
                    `/messagerie?conversationId=${conversationId}`
                  );
                }
              );

              if (!result.success) {
                alert(
                  result.error ||
                    "Erreur lors de l'ouverture de la conversation"
                );
              }
            }
          }}
        >
          Contacter l'établissement
        </Button>
      </YStack>
    </YStack>
  );
}

