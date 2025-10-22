"use client";

import {
  YStack,
  XStack,
  H2,
  H3,
  Paragraph,
  ScrollView,
  Separator,
} from "tamagui";
import {
  Button,
  Card,
  Badge,
  Avatar,
  Header,
  StatsCard,
  ChatBubble,
  FormField,
  Stack,
  Input,
} from "@hestia/ui";
import { SearchBar } from "../../../../../packages/ui/src/components/web/SearchBar";
import { MissionCard } from "../../../../../packages/ui/src/components/web/MissionCard";
import { BottomNavigation } from "../../../../../packages/ui/src/components/web/BottomNavigation";
import { ProfileCard } from "../../../../../packages/ui/src/components/web/ProfileCard";

export default function PlaygroundPage() {
  return (
    <YStack flex={1} backgroundColor="$background">
      <Header
        title="Hestia UI Playground"
        showAvatar={true}
        avatarUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      />

      <ScrollView flex={1} padding="$4">
        <YStack gap="$6">
          {/* Buttons Section */}
          <YStack gap="$3">
            <H2>Boutons</H2>
            <XStack gap="$3" flexWrap="wrap">
              <Button variant="primary">Bouton Principal</Button>
              <Button variant="secondary">Bouton Secondaire</Button>
              <Button variant="ghost">Bouton Ghost</Button>
            </XStack>
          </YStack>
          {/* Input Section */}
          <YStack gap="$3">
            <H2>Champs de saisie</H2>
            <YStack gap="$4" maxWidth={600}>
              {/* Input simple avec label */}
              <Input label="Titre attendu" placeholder="Du lac du Der" />

              {/* Input requis */}
              <Input label="Ville" placeholder="Paris" required />

              {/* Input avec texte d'aide */}
              <Input
                label="Parcours diplômant"
                placeholder="Ex: Formation sous-officier"
                helperText="Indiquez le parcours ou formation diplômante"
              />

              {/* TextArea multiligne */}
              <Input
                label="Description"
                placeholder="Décrivez votre mission..."
                multiline
              />

              {/* Input avec erreur */}
              <Input
                label="Email"
                placeholder="exemple@email.com"
                error="Format d'email invalide"
                required
              />

              {/* Input désactivé */}
              <Input
                label="Champ désactivé"
                placeholder="Non modifiable"
                disabled
              />
            </YStack>
          </YStack>

          <Separator />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
