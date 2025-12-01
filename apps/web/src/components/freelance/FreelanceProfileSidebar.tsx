"use client";

import { YStack, XStack, Text } from "tamagui";
import { Button, colors } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { FiMessageCircle, FiBookmark } from "react-icons/fi";
import { navigateToMessaging } from "@/utils/chatService";

interface FreelanceProfileSidebarProps {
  freelanceId: string;
}

/**
 * Composant pour afficher la sidebar avec les actions du profil freelance
 */
export function FreelanceProfileSidebar({
  freelanceId,
}: FreelanceProfileSidebarProps) {
  const router = useRouter();

  return (
    <YStack
      width={300}
      flexShrink={0}
      gap="$3"
      padding="$4"
      backgroundColor={colors.white}
      borderRadius={12}
      borderWidth={1}
      borderColor={colors.gray200}
      style={{ position: "sticky", top: 20 }}
    >
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
        onPress={() => {
          navigateToMessaging(router);
        }}
        width="100%"
      >
        <XStack gap="$2" alignItems="center" justifyContent="center">
          <FiMessageCircle size={18} />
          <Text>Démarrer un chat</Text>
        </XStack>
      </Button>
    </YStack>
  );
}

