import React from "react";
import {
  YStack,
  XStack,
  ScrollView,
  Button as TamaguiButton,
  Card as TamaguiCard,
  Text,
} from "tamagui";

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
            <XStack gap={12} flexWrap="wrap">
              <TamaguiButton
                backgroundColor="#f97316"
                color="white"
                padding={12}
              >
                <Text color="white">Bouton Principal</Text>
              </TamaguiButton>
              <TamaguiButton
                backgroundColor="transparent"
                borderColor="#f97316"
                borderWidth={2}
                color="#f97316"
                padding={12}
              >
                <Text color="#f97316">Bouton Secondaire</Text>
              </TamaguiButton>
              <TamaguiButton
                backgroundColor="transparent"
                color="#f97316"
                padding={12}
              >
                <Text color="#f97316">Bouton Ghost</Text>
              </TamaguiButton>
            </XStack>
          </YStack>

          {/* Cards Section */}
          <YStack gap={12}>
            <Text fontSize={20} fontWeight="600">
              Cartes
            </Text>
            <XStack gap={12} flexWrap="wrap">
              <TamaguiCard
                padding={16}
                backgroundColor="white"
                borderRadius={8}
                borderWidth={1}
                borderColor="#e5e5e5"
              >
                <YStack gap={8}>
                  <Text fontSize={18} fontWeight="600">
                    Carte Simple
                  </Text>
                  <Text color="#666" fontSize={14}>
                    Description de la carte
                  </Text>
                  <Text>Contenu de la carte</Text>
                </YStack>
              </TamaguiCard>

              <TamaguiCard
                padding={16}
                backgroundColor="white"
                borderRadius={8}
                borderWidth={1}
                borderColor="#e5e5e5"
              >
                <YStack gap={8}>
                  <Text color="#666" fontSize={14}>
                    Gains Totaux
                  </Text>
                  <Text fontSize={24} color="#f97316" fontWeight="600">
                    €1,250.00
                  </Text>
                  <Text color="#666" fontSize={12}>
                    Ce mois
                  </Text>
                </YStack>
              </TamaguiCard>
            </XStack>
          </YStack>

          {/* Badges Section */}
          <YStack gap={12}>
            <Text fontSize={20} fontWeight="600">
              Badges
            </Text>
            <XStack gap={8} flexWrap="wrap">
              <TamaguiCard
                padding={8}
                backgroundColor="#f3f4f6"
                borderRadius={6}
              >
                <Text fontSize={14}>Cuisine</Text>
              </TamaguiCard>
              <TamaguiCard
                padding={8}
                backgroundColor="#f3f4f6"
                borderRadius={6}
              >
                <Text fontSize={14}>Service</Text>
              </TamaguiCard>
              <TamaguiCard
                padding={8}
                backgroundColor="#f3f4f6"
                borderRadius={6}
              >
                <Text fontSize={14}>Bartender</Text>
              </TamaguiCard>
            </XStack>
          </YStack>

          {/* Search Bar */}
          <YStack gap={12}>
            <Text fontSize={20} fontWeight="600">
              Barre de Recherche
            </Text>
            <TamaguiCard
              padding={12}
              backgroundColor="white"
              borderRadius={8}
              borderWidth={1}
              borderColor="#e5e5e5"
            >
              <XStack alignItems="center" gap={8}>
                <Text fontSize={16}>🔍</Text>
                <Text color="#999" flex={1}>
                  Rechercher une mission...
                </Text>
              </XStack>
            </TamaguiCard>
          </YStack>

          {/* Mission Cards */}
          <YStack gap={12}>
            <Text fontSize={20} fontWeight="600">
              Cartes de Mission
            </Text>
            <TamaguiCard
              padding={16}
              backgroundColor="white"
              borderRadius={8}
              borderWidth={1}
              borderColor="#e5e5e5"
            >
              <YStack gap={12}>
                <YStack
                  width="100%"
                  height={120}
                  backgroundColor="#f0f0f0"
                  borderRadius={8}
                />
                <YStack gap={8}>
                  <Text fontSize={18} fontWeight="600">
                    Chef de Partie
                  </Text>
                  <XStack alignItems="center" gap={8}>
                    <Text fontSize={14}>📍</Text>
                    <Text fontSize={14} color="#666">
                      Paris, France
                    </Text>
                  </XStack>
                  <XStack alignItems="center" gap={8}>
                    <Text fontSize={14}>🕐</Text>
                    <Text fontSize={14} color="#666">
                      12:00 - 16:00
                    </Text>
                  </XStack>
                  <XStack alignItems="center" gap={8}>
                    <Text fontSize={14}>💰</Text>
                    <Text fontSize={16} fontWeight="600" color="#f97316">
                      120€/jour
                    </Text>
                  </XStack>
                  <TamaguiButton
                    backgroundColor="#f97316"
                    color="white"
                    padding={12}
                    marginTop={8}
                  >
                    <Text color="white">Postuler</Text>
                  </TamaguiButton>
                </YStack>
              </YStack>
            </TamaguiCard>

            <TamaguiCard
              padding={16}
              backgroundColor="white"
              borderRadius={8}
              borderWidth={1}
              borderColor="#e5e5e5"
            >
              <YStack gap={12}>
                <YStack
                  width="100%"
                  height={120}
                  backgroundColor="#f0f0f0"
                  borderRadius={8}
                />
                <YStack gap={8}>
                  <Text fontSize={18} fontWeight="600">
                    Bartender
                  </Text>
                  <XStack alignItems="center" gap={8}>
                    <Text fontSize={14}>📍</Text>
                    <Text fontSize={14} color="#666">
                      Lyon, France
                    </Text>
                  </XStack>
                  <XStack alignItems="center" gap={8}>
                    <Text fontSize={14}>🕐</Text>
                    <Text fontSize={14} color="#666">
                      18:00 - 02:00
                    </Text>
                  </XStack>
                  <XStack alignItems="center" gap={8}>
                    <Text fontSize={14}>💰</Text>
                    <Text fontSize={16} fontWeight="600" color="#f97316">
                      80€/soir
                    </Text>
                  </XStack>
                </YStack>
              </YStack>
            </TamaguiCard>
          </YStack>

          {/* Profile Cards */}
          <YStack gap={12}>
            <Text fontSize={20} fontWeight="600">
              Profils
            </Text>
            <TamaguiCard
              padding={16}
              backgroundColor="white"
              borderRadius={8}
              borderWidth={1}
              borderColor="#e5e5e5"
            >
              <XStack alignItems="center" gap={12}>
                <YStack
                  width={60}
                  height={60}
                  backgroundColor="#f97316"
                  borderRadius={30}
                />
                <YStack flex={1} gap={4}>
                  <Text fontSize={18} fontWeight="600">
                    Alexandre Dubois
                  </Text>
                  <Text fontSize={14} color="#666">
                    Chef de Cuisine
                  </Text>
                  <Text fontSize={14} color="#666">
                    Paris, France
                  </Text>
                  <XStack alignItems="center" gap={4}>
                    <Text fontSize={14}>⭐</Text>
                    <Text fontSize={14} fontWeight="600">
                      4.8
                    </Text>
                  </XStack>
                </YStack>
              </XStack>
            </TamaguiCard>
          </YStack>

          {/* Chat Bubbles */}
          <YStack gap={12}>
            <Text fontSize={20} fontWeight="600">
              Messages de Chat
            </Text>
            <TamaguiCard
              padding={12}
              backgroundColor="#f0f0f0"
              borderRadius={12}
              maxWidth="80%"
            >
              <YStack gap={4}>
                <Text fontSize={12} color="#666">
                  Le Grand Hotel • 14:30
                </Text>
                <Text>
                  Bonjour, êtes-vous disponible pour la mission de ce soir ?
                </Text>
              </YStack>
            </TamaguiCard>
            <TamaguiCard
              padding={12}
              backgroundColor="#f97316"
              borderRadius={12}
              maxWidth="80%"
              alignSelf="flex-end"
            >
              <YStack gap={4}>
                <Text fontSize={12} color="white" alignSelf="flex-end">
                  14:32
                </Text>
                <Text color="white">Oui, je suis disponible !</Text>
              </YStack>
            </TamaguiCard>
          </YStack>

          {/* Form Fields */}
          <YStack gap={12}>
            <Text fontSize={20} fontWeight="600">
              Champs de Formulaire
            </Text>
            <YStack gap={8}>
              <Text fontSize={14} fontWeight="500">
                Nom *
              </Text>
              <TamaguiCard
                padding={12}
                backgroundColor="white"
                borderRadius={8}
                borderWidth={1}
                borderColor="#e5e5e5"
              >
                <Text color="#999">Votre nom</Text>
              </TamaguiCard>
            </YStack>
            <YStack gap={8}>
              <Text fontSize={14} fontWeight="500">
                Description
              </Text>
              <TamaguiCard
                padding={12}
                backgroundColor="white"
                borderRadius={8}
                borderWidth={1}
                borderColor="#e5e5e5"
                minHeight={80}
              >
                <Text color="#999">Décrivez votre expérience...</Text>
              </TamaguiCard>
            </YStack>
          </YStack>

          {/* Bottom Navigation */}
          <YStack gap={12}>
            <Text fontSize={20} fontWeight="600">
              Navigation
            </Text>
            <TamaguiCard
              padding={16}
              backgroundColor="white"
              borderRadius={8}
              borderWidth={1}
              borderColor="#e5e5e5"
            >
              <XStack justifyContent="space-around" alignItems="center">
                <YStack alignItems="center" gap={4}>
                  <Text fontSize={20}>🏠</Text>
                  <Text fontSize={12}>Home</Text>
                </YStack>
                <YStack alignItems="center" gap={4}>
                  <Text fontSize={20}>✈️</Text>
                  <Text fontSize={12}>Explore</Text>
                </YStack>
                <YStack alignItems="center" gap={4}>
                  <Text fontSize={20}>🔨</Text>
                  <Text fontSize={12}>Playground</Text>
                </YStack>
              </XStack>
            </TamaguiCard>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
