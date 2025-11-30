import { supabase } from "../supabaseClient";
import type {
  Conversation,
  ConversationWithDetails,
  Message,
  MessageWithSender,
  GetOrCreateConversationParams,
  SendMessageParams,
} from "../types/message";

/**
 * Récupère ou crée une conversation pour un couple (mission_id, recruiter_id, freelance_id)
 */
export async function getOrCreateConversation({
  missionId,
  recruiterId,
  freelanceId,
}: GetOrCreateConversationParams): Promise<{
  success: boolean;
  error?: string;
  conversation?: Conversation;
}> {
  try {
    // Vérifier si une conversation existe déjà
    const { data: existing, error: selectError } = await supabase
      .from("conversations")
      .select("*")
      .eq("mission_id", missionId)
      .eq("recruiter_id", recruiterId)
      .eq("freelance_id", freelanceId)
      .single();

    if (existing) {
      return {
        success: true,
        conversation: existing,
      };
    }

    // Si pas de conversation existante, créer une nouvelle
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        mission_id: missionId,
        recruiter_id: recruiterId,
        freelance_id: freelanceId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Si l'erreur est une contrainte d'unicité, réessayer de récupérer
      if (error.code === "23505") {
        const { data: retryData, error: retryError } = await supabase
          .from("conversations")
          .select("*")
          .eq("mission_id", missionId)
          .eq("recruiter_id", recruiterId)
          .eq("freelance_id", freelanceId)
          .single();

        if (retryData) {
          return {
            success: true,
            conversation: retryData,
          };
        }

        return {
          success: false,
          error:
            retryError?.message ||
            "Erreur lors de la récupération de la conversation",
        };
      }

      console.error("Erreur lors de la création de la conversation:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      conversation: data,
    };
  } catch (err: any) {
    console.error(
      "Erreur lors de la récupération/création de la conversation:",
      err
    );
    return {
      success: false,
      error:
        "Une erreur est survenue lors de la récupération/création de la conversation",
    };
  }
}

/**
 * Récupère une conversation par son ID
 */
export async function getConversationById(
  conversationId: string
): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (error) {
      console.error(
        "Erreur lors de la récupération de la conversation:",
        error
      );
      return null;
    }

    return data;
  } catch (err) {
    console.error("Erreur lors de la récupération de la conversation:", err);
    return null;
  }
}

/**
 * Liste toutes les conversations d'un utilisateur connecté
 */
export async function listUserConversations(
  userId?: string
): Promise<ConversationWithDetails[]> {
  try {
    let targetUserId = userId;

    // Si aucun userId n'est fourni, utiliser l'utilisateur connecté
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }
      targetUserId = user.id;
    }

    // Récupérer les conversations où l'utilisateur est recruteur ou freelance
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`recruiter_id.eq.${targetUserId},freelance_id.eq.${targetUserId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des conversations:", error);
      return [];
    }

    if (!conversations || conversations.length === 0) {
      return [];
    }

    // Récupérer les détails (mission, recruteur, freelance, dernier message)
    const missionIds = [...new Set(conversations.map((c) => c.mission_id))];
    const userIds = [
      ...new Set([
        ...conversations.map((c) => c.recruiter_id),
        ...conversations.map((c) => c.freelance_id),
      ]),
    ];

    // Récupérer les missions
    const { data: missions } = await supabase
      .from("missions")
      .select("id, title")
      .in("id", missionIds);

    // Récupérer les profils
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, photo_url")
      .in("id", userIds);

    // Récupérer les derniers messages pour chaque conversation
    const conversationIds = conversations.map((c) => c.id);
    const { data: lastMessages } = await supabase
      .from("messages")
      .select("*")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    // Construire des maps pour un accès rapide
    const missionsMap = new Map((missions || []).map((m) => [m.id, m]));
    const profilesMap = new Map((profiles || []).map((p) => [p.id, p]));

    // Grouper les messages par conversation et prendre le plus récent
    const lastMessagesMap = new Map<string, Message>();
    (lastMessages || []).forEach((msg) => {
      if (!lastMessagesMap.has(msg.conversation_id)) {
        lastMessagesMap.set(msg.conversation_id, msg);
      }
    });

    // Combiner les données
    return conversations.map((conversation) => ({
      ...conversation,
      mission: missionsMap.get(conversation.mission_id) || null,
      recruiter: profilesMap.get(conversation.recruiter_id) || null,
      freelance: profilesMap.get(conversation.freelance_id) || null,
      last_message: lastMessagesMap.get(conversation.id) || null,
      unread_count: 0, // TODO: Implémenter le comptage des messages non lus
    }));
  } catch (err) {
    console.error("Erreur lors de la récupération des conversations:", err);
    return [];
  }
}

/**
 * Récupère les messages d'une conversation
 */
export async function getMessagesByConversation(
  conversationId: string
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur lors de la récupération des messages:", err);
    return [];
  }
}

/**
 * Envoie un message dans une conversation
 */
export async function sendMessage({
  conversationId,
  content,
}: SendMessageParams): Promise<{
  success: boolean;
  error?: string;
  message?: Message;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Utilisateur non connecté",
      };
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: data,
    };
  } catch (err: any) {
    console.error("Erreur lors de l'envoi du message:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'envoi du message",
    };
  }
}

/**
 * Marque un message comme lu
 */
export async function markMessageAsRead(messageId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from("messages")
      .update({
        read_at: new Date().toISOString(),
      })
      .eq("id", messageId);

    if (error) {
      console.error("Erreur lors de la mise à jour du message:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err: any) {
    console.error("Erreur lors de la mise à jour du message:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour du message",
    };
  }
}

/**
 * Marque tous les messages d'une conversation comme lus (pour l'utilisateur connecté)
 */
export async function markConversationAsRead(conversationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Utilisateur non connecté",
      };
    }

    // Récupérer la conversation pour vérifier que l'utilisateur y participe
    const conversation = await getConversationById(conversationId);
    if (!conversation) {
      return {
        success: false,
        error: "Conversation non trouvée",
      };
    }

    if (
      conversation.recruiter_id !== user.id &&
      conversation.freelance_id !== user.id
    ) {
      return {
        success: false,
        error:
          "Vous n'êtes pas autorisé à marquer cette conversation comme lue",
      };
    }

    // Marquer tous les messages non lus de cette conversation (sauf ceux de l'utilisateur)
    const { error } = await supabase
      .from("messages")
      .update({
        read_at: new Date().toISOString(),
      })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .is("read_at", null);

    if (error) {
      console.error("Erreur lors de la mise à jour des messages:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err: any) {
    console.error("Erreur lors de la mise à jour des messages:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour des messages",
    };
  }
}
