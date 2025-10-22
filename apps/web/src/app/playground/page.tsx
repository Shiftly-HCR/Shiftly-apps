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
  RadioGroup,
  Select,
  Checkbox,
  FileUpload,
  DatePicker,
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

              {/* RadioGroup */}
              <RadioGroup
                label="Uniforme"
                options={[
                  { label: "Oui", value: "yes" },
                  { label: "Non", value: "no" },
                ]}
                required
              />

              {/* RadioGroup vertical */}
              <RadioGroup
                label="Niveau requis"
                options={[
                  { label: "Débutant", value: "beginner" },
                  { label: "Intermédiaire", value: "intermediate" },
                  { label: "Avancé", value: "advanced" },
                ]}
                orientation="vertical"
              />

              {/* Select */}
              <Select
                label="Ville"
                placeholder="Sélectionnez une ville"
                options={[
                  { label: "Paris", value: "paris" },
                  { label: "Lyon", value: "lyon" },
                  { label: "Marseille", value: "marseille" },
                  { label: "Toulouse", value: "toulouse" },
                ]}
                required
              />

              {/* Checkbox */}
              <Checkbox label="J'accepte les conditions générales d'utilisation" />

              {/* DatePicker */}
              <DatePicker
                label="Date de début"
                required
                helperText="Sélectionnez la date de début de la mission"
              />

              {/* FileUpload */}
              <FileUpload
                label="Documents à fournir"
                accept="image/*,.pdf"
                multiple
                helperText="Carte d'identité et Carte Vitale"
                required
              />
            </YStack>
          </YStack>

          <Separator />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
