/**
 * Types pour la messagerie (conversations et messages)
 */

/**
 * Conversation entre un recruteur et un freelance pour une mission
 */
export interface Conversation {
  id: string;
  created_at?: string;
  mission_id: string;
  recruiter_id: string;
  freelance_id: string;
}

/**
 * Conversation avec les informations de la mission et des participants
 */
export interface ConversationWithDetails extends Conversation {
  mission?: {
    id: string;
    title: string;
  } | null;
  recruiter?: {
    id: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  } | null;
  freelance?: {
    id: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  } | null;
  last_message?: Message | null;
  unread_count?: number;
}

/**
 * Message dans une conversation
 */
export interface Message {
  id: string;
  created_at?: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at?: string | null;
}

/**
 * Message avec les informations de l'expéditeur
 */
export interface MessageWithSender extends Message {
  sender?: {
    id: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  } | null;
}

/**
 * Paramètres pour créer ou récupérer une conversation
 */
export interface GetOrCreateConversationParams {
  missionId: string;
  recruiterId: string;
  freelanceId: string;
}

/**
 * Paramètres pour envoyer un message
 */
export interface SendMessageParams {
  conversationId: string;
  content: string;
}
