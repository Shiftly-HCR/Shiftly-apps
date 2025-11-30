# Implémentation de la Messagerie

## Vue d'ensemble

Ce document décrit l'implémentation du système de messagerie entre recruteurs et freelances pour les missions. La messagerie permet aux recruteurs et aux freelances acceptés de communiquer en temps réel via Supabase Realtime.

## Architecture

### Structure des fichiers

```
packages/data/
├── messages/
│   ├── messages.ts          # Fonctions métier pour conversations et messages
│   ├── useChat.ts           # Hook React avec Realtime pour gérer une conversation
│   └── index.ts             # Exports du module messages
├── types/
│   └── message.ts           # Types TypeScript pour conversations et messages
└── sql/
    ├── create_conversations_table.sql
    └── create_messages_table.sql

apps/web/src/
├── components/
│   └── chat/
│       ├── ChatThread.tsx   # Composant pour afficher la liste des messages
│       ├── MessageBubble.tsx # Composant pour un message individuel
│       ├── MessageInput.tsx  # Composant pour envoyer un message
│       └── index.ts
└── hooks/
    └── useMissionChat.ts    # Hook pour gérer le chat d'une mission

```

## Schéma de base de données

### Table `conversations`

Représente une conversation unique entre un recruteur et un freelance pour une mission.

**Colonnes :**

- `id` (uuid, PK) : Identifiant unique de la conversation
- `created_at` (timestamptz) : Date de création
- `mission_id` (uuid, FK → missions.id) : Mission concernée
- `recruiter_id` (uuid, FK → auth.users.id) : Recruteur propriétaire de la mission
- `freelance_id` (uuid, FK → auth.users.id) : Freelance participant

**Contraintes :**

- Contrainte d'unicité sur `(mission_id, recruiter_id, freelance_id)` : une seule conversation par couple mission/recruteur/freelance

**RLS :**

- Les utilisateurs ne peuvent voir que les conversations où ils sont `recruiter_id` OU `freelance_id`
- Les utilisateurs ne peuvent créer que des conversations où ils sont participant

### Table `messages`

Représente les messages échangés dans une conversation.

**Colonnes :**

- `id` (uuid, PK) : Identifiant unique du message
- `created_at` (timestamptz) : Date d'envoi
- `conversation_id` (uuid, FK → conversations.id) : Conversation parente
- `sender_id` (uuid, FK → auth.users.id) : Expéditeur du message
- `content` (text) : Contenu du message
- `read_at` (timestamptz, nullable) : Date de lecture (NULL si non lu)

**RLS :**

- Les utilisateurs ne peuvent voir que les messages des conversations auxquelles ils participent
- Les utilisateurs ne peuvent envoyer des messages que dans les conversations auxquelles ils participent
- Les utilisateurs peuvent mettre à jour les messages de leurs conversations (notamment pour `read_at`)

## Fonctions et Hooks exposés

### `packages/data/messages/messages.ts`

#### `getOrCreateConversation(params)`

Récupère ou crée une conversation pour un couple (mission_id, recruiter_id, freelance_id).

**Paramètres :**

```typescript
{
  missionId: string;
  recruiterId: string;
  freelanceId: string;
}
```

**Retour :**

```typescript
{
  success: boolean;
  error?: string;
  conversation?: Conversation;
}
```

#### `listUserConversations(userId?)`

Liste toutes les conversations d'un utilisateur (où il est recruteur ou freelance).

**Paramètres :**

- `userId?` (optionnel) : ID de l'utilisateur. Si non fourni, utilise l'utilisateur connecté.

**Retour :**

```typescript
ConversationWithDetails[]
```

#### `getMessagesByConversation(conversationId)`

Récupère tous les messages d'une conversation, triés par date croissante.

**Paramètres :**

- `conversationId: string`

**Retour :**

```typescript
Message[]
```

#### `sendMessage(params)`

Envoie un message dans une conversation.

**Paramètres :**

```typescript
{
  conversationId: string;
  content: string;
}
```

**Retour :**

```typescript
{
  success: boolean;
  error?: string;
  message?: Message;
}
```

#### `markConversationAsRead(conversationId)`

Marque tous les messages non lus d'une conversation comme lus (pour l'utilisateur connecté).

**Paramètres :**

- `conversationId: string`

**Retour :**

```typescript
{
  success: boolean;
  error?: string;
}
```

### `packages/data/messages/useChat.ts`

#### `useChat(conversationId)`

Hook React pour gérer une conversation en temps réel avec Supabase Realtime.

**Paramètres :**

- `conversationId: string | null` : ID de la conversation (null désactive le chat)

**Retour :**

```typescript
{
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isSending: boolean;
  sendMessage: (content: string) => Promise<boolean>;
  markAsRead: () => Promise<void>;
}
```

**Fonctionnalités :**

- Charge les messages initiaux
- S'abonne aux changements en temps réel via Supabase Realtime (`postgres_changes`)
- Met à jour automatiquement la liste de messages quand un nouveau message arrive
- Marque automatiquement comme lu les messages reçus

### `apps/web/src/hooks/useMissionChat.ts`

#### `useMissionChat(missionId, recruiterId, freelanceId)`

Hook React pour gérer le chat d'une mission entre un recruteur et un freelance.

**Paramètres :**

- `missionId: string | null`
- `recruiterId: string | null`
- `freelanceId: string | null`

**Retour :**

```typescript
{
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  markAsRead: () => Promise<void>;
  canAccess: boolean;
  senderNames: Map<string, string>;
  currentUserId: string | null;
}
```

**Fonctionnalités :**

- Initialise automatiquement la conversation (création si nécessaire)
- Charge les noms des participants
- Vérifie les autorisations d'accès
- Utilise `useChat` en interne pour la gestion temps réel

## Composants UI

### `ChatThread`

Affiche la liste des messages d'une conversation.

**Props :**

```typescript
{
  messages: Message[];
  currentUserId: string;
  senderNames?: Map<string, string>;
  isLoading?: boolean;
}
```

**Fonctionnalités :**

- Scroll automatique vers le bas quand de nouveaux messages arrivent
- Alignement des messages (gauche/droite selon l'expéditeur)

### `MessageBubble`

Affiche un message individuel avec formatage de la date.

**Props :**

```typescript
{
  message: Message;
  isMe: boolean;
  senderName?: string;
}
```

**Fonctionnalités :**

- Formatage intelligent de la date (à l'instant, il y a X min, aujourd'hui, hier, etc.)
- Style différent pour les messages envoyés/reçus (utilise le composant `ChatBubble` de `@shiftly/ui`)

### `MessageInput`

Composant pour saisir et envoyer un message.

**Props :**

```typescript
{
  onSend: (content: string) => Promise<void>;
  isSending?: boolean;
  placeholder?: string;
}
```

**Fonctionnalités :**

- Textarea avec auto-resize
- Envoi avec le bouton ou avec Entrée (Shift+Entrée pour un saut de ligne)
- Désactivation pendant l'envoi

## Utilisation

### Dans une page Next.js

```typescript
import { useMissionChat } from "@/hooks/useMissionChat";
import { ChatThread, MessageInput } from "@/components/chat";

export default function MissionPage() {
  const { profile } = useCurrentProfile();
  const mission = // ... récupérer la mission
  const freelanceId = // ... déterminer le freelance

  const chat = useMissionChat(
    mission?.id || null,
    mission?.recruiter_id || null,
    freelanceId
  );

  if (!chat.canAccess) {
    return <div>Vous n'avez pas accès à cette conversation</div>;
  }

  return (
    <div>
      <ChatThread
        messages={chat.messages}
        currentUserId={chat.currentUserId || ""}
        senderNames={chat.senderNames}
        isLoading={chat.isLoading}
      />
      <MessageInput
        onSend={async (content) => {
          const success = await chat.sendMessage(content);
          if (success) {
            chat.markAsRead();
          }
        }}
        isSending={chat.isSending}
      />
    </div>
  );
}
```

## Autorisations et règles métier

### Accès à la messagerie

- **Recruteurs** : Peuvent chatter avec tous les freelances dont la candidature est **acceptée** pour leur mission
- **Freelances** : Peuvent chatter avec le recruteur uniquement si leur candidature est **acceptée** pour la mission

### Sécurité

- Toutes les vérifications d'autorisation sont faites côté serveur via RLS (Row Level Security) dans Supabase
- Les utilisateurs ne peuvent voir que les conversations auxquelles ils participent
- Les utilisateurs ne peuvent envoyer des messages que dans leurs propres conversations

## Migration SQL

Pour déployer le schéma de base de données, exécutez dans Supabase (SQL Editor) :

1. `packages/data/sql/create_conversations_table.sql`
2. `packages/data/sql/create_messages_table.sql`

## Notes techniques

- **Realtime** : Utilise `postgres_changes` de Supabase Realtime pour les mises à jour en temps réel
- **Performance** : Index sur les colonnes fréquemment utilisées (`conversation_id`, `sender_id`, `created_at`)
- **RLS** : Toutes les tables ont RLS activé avec des policies sécurisées
- **Types** : Tous les types TypeScript sont centralisés dans `packages/data/types/message.ts`

## Améliorations futures

- Comptage des messages non lus par conversation
- Notifications push pour les nouveaux messages
- Support des pièces jointes (images, fichiers)
- Indicateurs de lecture (vu/non vu)
- Recherche dans les messages
- Historique de conversation pour une mission (si plusieurs freelances sont acceptés puis remplacés)
