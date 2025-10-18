"use client";

import {
  YStack,
  XStack,
  H2,
  H3,
  Paragraph,
  ScrollView,
  Separator,
  Button,
  Card,
  Input,
} from "tamagui";

export default function PlaygroundTamaguiPage() {
  return (
    <YStack flex={1} backgroundColor="$background" padding="$4">
      <ScrollView flex={1}>
        <YStack gap="$6">
          {/* Buttons Section */}
          <YStack gap="$3">
            <H2>Boutons</H2>
            <XStack gap="$3" flexWrap="wrap">
              <Button backgroundColor="$orange9" color="white">
                Bouton Principal
              </Button>
              <Button
                variant="outlined"
                borderColor="$orange9"
                color="$orange9"
              >
                Bouton Secondaire
              </Button>
              <Button variant="ghost" color="$orange9">
                Bouton Ghost
              </Button>
            </XStack>
          </YStack>

          <Separator />

          {/* Cards Section */}
          <YStack gap="$3">
            <H2>Cartes</H2>
            <XStack gap="$3" flexWrap="wrap">
              <Card
                padding="$4"
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$4"
              >
                <YStack gap="$2">
                  <H3>Carte Simple</H3>
                  <Paragraph color="$gray10">Description de la carte</Paragraph>
                  <Paragraph>Contenu de la carte</Paragraph>
                </YStack>
              </Card>

              <Card
                padding="$4"
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$4"
              >
                <YStack gap="$2">
                  <Paragraph color="$gray10" size="$3">
                    Gains Totaux
                  </Paragraph>
                  <H3 color="$orange10" size="$7">
                    €1,250.00
                  </H3>
                  <Paragraph color="$gray10" size="$2">
                    Ce mois
                  </Paragraph>
                </YStack>
              </Card>
            </XStack>
          </YStack>

          <Separator />

          {/* Search Bar */}
          <YStack gap="$3">
            <H2>Barre de Recherche</H2>
            <XStack
              alignItems="center"
              gap="$2"
              padding="$3"
              backgroundColor="$background"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <span style={{ fontSize: "16px" }}>🔍</span>
              <Input
                flex={1}
                borderWidth={0}
                backgroundColor="transparent"
                placeholder="Rechercher une mission..."
                size="$4"
              />
              <Button size="$3" backgroundColor="$orange9" color="white">
                Rechercher
              </Button>
            </XStack>
          </YStack>

          <Separator />

          {/* Mission Cards */}
          <YStack gap="$3">
            <H2>Cartes de Mission</H2>
            <Card
              padding="$4"
              marginBottom="$3"
              backgroundColor="$background"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$4"
            >
              <YStack gap="$3">
                <div
                  style={{
                    height: "120px",
                    width: "100%",
                    borderRadius: "8px",
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <YStack gap="$2">
                  <H3 size="$5" fontWeight="600">
                    Chef de Partie
                  </H3>

                  <XStack alignItems="center" gap="$2">
                    <span>📍</span>
                    <Paragraph size="$3" color="$gray10">
                      Paris, France
                    </Paragraph>
                  </XStack>

                  <XStack alignItems="center" gap="$2">
                    <span>🕐</span>
                    <Paragraph size="$3" color="$gray10">
                      12:00 - 16:00
                    </Paragraph>
                  </XStack>

                  <XStack alignItems="center" gap="$2">
                    <span>💰</span>
                    <Paragraph size="$4" fontWeight="600" color="$orange10">
                      120€/jour
                    </Paragraph>
                  </XStack>
                </YStack>

                <Button
                  backgroundColor="$orange9"
                  color="white"
                  size="$4"
                  marginTop="$2"
                >
                  Postuler
                </Button>
              </YStack>
            </Card>
          </YStack>

          <Separator />

          {/* Navigation */}
          <YStack gap="$3">
            <H2>Navigation</H2>
            <XStack
              alignItems="center"
              justifyContent="space-around"
              padding="$3"
              backgroundColor="$background"
              borderTopWidth={1}
              borderTopColor="$borderColor"
            >
              {[
                { id: "home", icon: "🏠", label: "Accueil" },
                { id: "missions", icon: "💼", label: "Missions" },
                { id: "chat", icon: "💬", label: "Chat" },
                { id: "profile", icon: "👤", label: "Profil" },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="$3"
                  alignItems="center"
                  justifyContent="center"
                  flex={1}
                  backgroundColor="transparent"
                  borderWidth={0}
                >
                  <YStack alignItems="center" gap="$1">
                    <span
                      style={{
                        fontSize: "18px",
                        color: tab.id === "home" ? "#f97316" : "#6b7280",
                      }}
                    >
                      {tab.icon}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: tab.id === "home" ? "#f97316" : "#6b7280",
                        fontWeight: tab.id === "home" ? "600" : "400",
                      }}
                    >
                      {tab.label}
                    </span>
                  </YStack>
                </Button>
              ))}
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
