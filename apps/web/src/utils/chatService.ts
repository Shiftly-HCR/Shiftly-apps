/**
 * Service pour gérer la navigation et le démarrage de conversations
 */

import { getOrCreateConversation } from "@shiftly/data";
import type { GetOrCreateConversationParams } from "@shiftly/data";

/**
 * Ouvre ou crée une conversation et navigue vers la page de messagerie
 */
export async function openConversation(
  params: GetOrCreateConversationParams,
  onNavigate: (conversationId: string) => void
): Promise<{
  success: boolean;
  error?: string;
  conversationId?: string;
}> {
  try {
    const result = await getOrCreateConversation(params);

    if (!result.success || !result.conversation) {
      return {
        success: false,
        error: result.error || "Erreur lors de l'ouverture de la conversation",
      };
    }

    // Naviguer vers la conversation
    onNavigate(result.conversation.id);

    return {
      success: true,
      conversationId: result.conversation.id,
    };
  } catch (err: any) {
    console.error("Erreur lors de l'ouverture de la conversation:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'ouverture de la conversation",
    };
  }
}

/**
 * Ouvre une conversation depuis un profil avec une mission spécifique
 */
export async function openConversationFromProfile(
  targetUserId: string,
  currentUserId: string,
  missionId: string,
  recruiterId: string,
  onNavigate: (conversationId: string) => void
): Promise<{
  success: boolean;
  error?: string;
  conversationId?: string;
}> {
  // Déterminer qui est recruteur et qui est freelance
  const freelanceId =
    recruiterId === currentUserId ? targetUserId : currentUserId;

  return openConversation(
    {
      missionId,
      recruiterId,
      freelanceId,
    },
    onNavigate
  );
}

/**
 * Redirige vers la page de messagerie (sans conversation spécifique)
 */
export function navigateToMessaging(router: any) {
  router.push("/messagerie");
}

