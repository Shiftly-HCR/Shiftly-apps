"use client";

import { YStack, XStack, Text } from "tamagui";
import { useRouter } from "next/navigation";
import { Button, colors } from "@shiftly/ui";
import { MapPin, Building2, Heart, CheckCircle2, Star } from "lucide-react";
import type { Mission } from "@shiftly/data";
import { openConversation } from "@/utils/chatService";
import { useMissionEstablishment } from "@/hooks";
import { MissionAddressDisplay } from "./MissionAddressDisplay";

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
  const {
    establishment,
    isLoading: isLoadingEstablishment,
    displayName,
    displayAddress,
    displayCity,
    hasEstablishment,
  } = useMissionEstablishment(mission);

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
            <XStack
              paddingVertical="$3"
              paddingHorizontal="$4"
              backgroundColor="#D4F4DD"
              borderRadius={8}
              alignItems="center"
              justifyContent="center"
              gap="$2"
            >
              <CheckCircle2
                size={16}
                color="#00A86B"
                style={{ flexShrink: 0 }}
              />
              <Text fontSize={14} color="#00A86B" fontWeight="600">
                Candidature envoyée avec succès !
              </Text>
            </XStack>
          ) : hasApplied ? (
            <XStack
              paddingVertical="$3"
              paddingHorizontal="$4"
              backgroundColor="#FFF3CD"
              borderRadius={8}
              alignItems="center"
              justifyContent="space-between"
              gap="$2"
            >
              <CheckCircle2
                size={16}
                color="#856404"
                style={{ flexShrink: 0 }}
              />
              <Text fontSize={14} color="#856404" fontWeight="600">
                Vous avez déjà postulé à cette mission
              </Text>
            </XStack>
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
            <YStack padding="$3" backgroundColor="#F8D7DA" borderRadius={8}>
              <Text fontSize={14} color="#721C24">
                {applyError}
              </Text>
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
            <XStack
              alignItems="center"
              justifyContent="space-between"
              width="100%"
              paddingHorizontal="$2"
            >
              <Heart size={16} style={{ flexShrink: 0 }} color="white" />
              <Text color="white">Sauvegarder la mission</Text>
            </XStack>
          </Button>

          {/* Badge Shiftly certifie */}
          <XStack
            backgroundColor="#D4F4DD"
            borderRadius={8}
            paddingVertical="$3"
            paddingHorizontal="$4"
            alignItems="center"
            justifyContent="space-between"
            gap="$2"
          >
            <CheckCircle2 size={16} color="#00A86B" style={{ flexShrink: 0 }} />
            <Text fontSize={14} color="#00A86B" fontWeight="600">
              Shiftly certifie cette mission
            </Text>
          </XStack>
        </YStack>
      </YStack>

      {/* Carte Établissement / Localisation */}
      <YStack
        backgroundColor="white"
        borderRadius={12}
        padding="$5"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
      >
        <Text fontSize={18} fontWeight="bold" marginBottom="$4" color="#000">
          {hasEstablishment ? "Établissement" : "Localisation"}
        </Text>

        {/* Header établissement */}
        {isLoadingEstablishment ? (
          <YStack padding="$4" alignItems="center">
            <Text fontSize={14} color="#666">
              Chargement...
            </Text>
          </YStack>
        ) : (
          <MissionAddressDisplay
            establishment={establishment}
            mission={mission}
            displayAddress={displayAddress}
            displayCity={displayCity}
            displayName={displayName}
          />
        )}

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
                  router.push(`/messagerie?conversationId=${conversationId}`);
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
          {hasEstablishment
            ? "Contacter l'établissement"
            : "Contacter le recruteur"}
        </Button>
      </YStack>
    </YStack>
  );
}
