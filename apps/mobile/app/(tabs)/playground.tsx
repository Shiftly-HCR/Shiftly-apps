import React from "react";
import { YStack, XStack, ScrollView, Text } from "tamagui";
import {
  Button,
  Input,
  RadioGroup,
  Select,
  Checkbox,
  BaseCard,
  MissionCard,
  FreelanceCard,
  StatCard,
} from "@hestia/ui";

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

          {/* Cards Section */}
          <YStack gap={30}>
            <Text fontSize={20} fontWeight="600" marginTop={50}>
              Cartes
            </Text>

            {/* StatCards */}
            <YStack gap={12}>
              <Text fontSize={16} fontWeight="600">
                Cartes de statistiques
              </Text>
              <XStack gap={12} flexWrap="wrap">
                <StatCard label="Missions actives" value="2" />
                <StatCard label="Candidatures" value="15" color="$gold" />
              </XStack>
            </YStack>

            {/* MissionCards */}
            <YStack gap={12}>
              <Text fontSize={16} fontWeight="600">
                Cartes de missions
              </Text>
              <MissionCard
                title="Serveur(se) pour soirée événementielle"
                date="18 Juillet 2024"
                time="18:00 - 00:30"
                price="25€"
                priceUnit="/ heure"
                image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"
                isPremium
              />
              <MissionCard
                title="Chef de rang - Hôtel Le Gourmet"
                date="20 Juillet 2024"
                time="12:00 - 22:00"
                price="24€"
                priceUnit="/ heure"
                image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
              />
            </YStack>

            {/* FreelanceCards */}
            <YStack gap={12}>
              <Text fontSize={16} fontWeight="600">
                Cartes de freelances
              </Text>
              <XStack gap={12} flexWrap="wrap">
                <FreelanceCard
                  name="Léa Martin"
                  subtitle="Serveuse expérimentée"
                  avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                  rating={4.8}
                  isOnline
                  tags={["Contacter", "Service client", "Anglais"]}
                  onViewProfile={() => console.log("View profile")}
                />
                <FreelanceCard
                  name="Jean Dupont"
                  subtitle="Chef de rang"
                  avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                  rating={4.9}
                  tags={["Restauration"]}
                  onViewProfile={() => console.log("View profile")}
                />
              </XStack>
            </YStack>

            {/* BaseCard */}
            <YStack gap={12}>
              <Text fontSize={16} fontWeight="600">
                Carte de base
              </Text>
              <BaseCard elevated>
                <YStack gap={8}>
                  <Text fontSize={18} fontWeight="600">
                    Contenu personnalisé
                  </Text>
                  <Text fontSize={14} color="#666666">
                    Utilisez BaseCard pour créer vos propres designs de cartes
                    avec le style Hestia.
                  </Text>
                </YStack>
              </BaseCard>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
