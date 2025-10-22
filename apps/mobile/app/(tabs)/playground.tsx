import React from "react";
import { YStack, XStack, ScrollView, Card as TamaguiCard, Text } from "tamagui";
import { Button, Input, RadioGroup, Select, Checkbox } from "@hestia/ui";

export default function PlaygroundScreen() {
  return (
    <YStack flex={1} backgroundColor="white">
      {/* Header simplifié */}
      <YStack
        padding={16}
        backgroundColor="white"
        borderBottomWidth={1}
        borderBottomColor="#e5e5e5"
      >
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap={12}>
            <YStack
              width={40}
              height={40}
              backgroundColor="#f97316"
              borderRadius={20}
            />
            <Text fontSize={18} fontWeight="600">
              Hestia UI Playground
            </Text>
          </XStack>
        </XStack>
      </YStack>

      <ScrollView flex={1} padding={16}>
        <YStack gap={24}>
          {/* Buttons Section */}
          <YStack gap={12}>
            <Text fontSize={20} fontWeight="600">
              Boutons
            </Text>
            <YStack gap={12}>
              <Button variant="primary">Bouton Principal</Button>
              <Button variant="secondary">Bouton Secondaire</Button>
              <Button variant="ghost">Bouton Ghost</Button>
            </YStack>
          </YStack>

          {/* Input Section */}
          <YStack gap={30}>
            <Text fontSize={20} fontWeight="600" marginTop={50}>
              Champs de saisie
            </Text>
            <YStack gap={30}>
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
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
