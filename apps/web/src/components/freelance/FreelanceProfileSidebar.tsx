"use client";

import { useState } from "react";
import { YStack, XStack, Text } from "tamagui";
import { Button, colors } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { FiMessageCircle, FiBookmark, FiDollarSign } from "react-icons/fi";
import { openConversation } from "@/utils/chatService";
import { useCurrentProfile } from "@/hooks/queries";
import { getOrCreateDirectConversationMission } from "@shiftly/data";
import type { Profile, FreelanceProfile } from "@shiftly/data";

interface FreelanceProfileSidebarProps {
  freelanceId: string;
  profile?: Profile | FreelanceProfile | null;
  isMobile?: boolean;
}

/**
 * Composant pour afficher la sidebar avec les actions du profil freelance
 */
export function FreelanceProfileSidebar({
  freelanceId,
  profile,
  isMobile = false,
}: FreelanceProfileSidebarProps) {
  const router = useRouter();
  const { data: currentProfile } = useCurrentProfile();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  return (
    <YStack
      width={isMobile ? "100%" : 300}
      flexShrink={isMobile ? undefined : 0}
      gap="$3"
      padding="$4"
      backgroundColor={colors.white}
      borderRadius={12}
      borderWidth={1}
      borderColor={colors.gray200}
      style={{ position: "sticky", top: 20 }}
    >
      {/* Affichage du TJM si disponible */}
      {profile?.daily_rate && (
        <YStack
          padding="$3"
          backgroundColor={colors.shiftlyViolet + "10"}
          borderRadius="$3"
          borderWidth={1}
          borderColor={colors.shiftlyViolet + "30"}
          gap="$2"
        >
          <XStack alignItems="center" gap="$2">
            <FiDollarSign size={18} color={colors.shiftlyViolet} />
            <Text fontSize={14} fontWeight="600" color={colors.gray700}>
              Tarifs
            </Text>
          </XStack>
          <YStack gap="$1">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={13} color={colors.gray600}>
                TJM
              </Text>
              <Text fontSize={16} fontWeight="700" color={colors.shiftlyViolet}>
                {profile.daily_rate.toFixed(2)} €
              </Text>
            </XStack>
            {profile.hourly_rate && (
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={13} color={colors.gray600}>
                  Tarif horaire
                </Text>
                <Text fontSize={14} fontWeight="600" color={colors.gray700}>
                  {profile.hourly_rate.toFixed(2)} €
                </Text>
              </XStack>
            )}
          </YStack>
        </YStack>
      )}

      <Button
        variant="primary"
        size="md"
        onPress={() =>
          router.push(`/missions/create?freelance=${freelanceId}`)
        }
        width="100%"
      >
        Inviter sur une mission
      </Button>

      <Button
        variant="secondary"
        size="md"
        onPress={() => {
          // TODO: Implémenter la sauvegarde du profil
          console.log("Sauvegarder le profil");
        }}
        width="100%"
      >
        <XStack gap="$2" alignItems="center" justifyContent="center">
          <FiBookmark size={18} />
          <Text>Sauvegarder le profil</Text>
        </XStack>
      </Button>

      <Button
        variant="secondary"
        size="md"
        onPress={async () => {
          if (!currentProfile || isCreatingConversation || currentProfile.role !== "recruiter") {
            return;
          }

          setIsCreatingConversation(true);
          try {
            // Créer ou récupérer une mission "directe" pour cette conversation
            const missionResult = await getOrCreateDirectConversationMission(
              currentProfile.id,
              freelanceId
            );

            if (!missionResult.success || !missionResult.mission) {
              console.error("Erreur lors de la création de la mission:", missionResult.error);
              setIsCreatingConversation(false);
              return;
            }

            // Créer ou récupérer la conversation
            const conversationResult = await openConversation(
              {
                missionId: missionResult.mission.id,
                recruiterId: currentProfile.id,
                freelanceId: freelanceId,
              },
              (conversationId) => {
                router.push(`/messagerie?conversation=${conversationId}`);
              }
            );

            if (!conversationResult.success) {
              console.error("Erreur lors de la création de la conversation:", conversationResult.error);
            }
          } catch (error) {
            console.error("Erreur lors du démarrage du chat:", error);
          } finally {
            setIsCreatingConversation(false);
          }
        }}
        width="100%"
        disabled={isCreatingConversation}
      >
        <XStack gap="$2" alignItems="center" justifyContent="center">
          <FiMessageCircle size={18} />
          <Text>{isCreatingConversation ? "Création..." : "Démarrer un chat"}</Text>
        </XStack>
      </Button>
    </YStack>
  );
}

