import React from "react";
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
} from "@hestia/ui";
import { SearchBar } from "../../../../packages/ui/src/components/SearchBar";
import { MissionCard } from "../../../../packages/ui/src/components/MissionCard";
import { BottomNavigation } from "../../../../packages/ui/src/components/BottomNavigation";
import { ProfileCard } from "../../../../packages/ui/src/components/ProfileCard";

export default function PlaygroundScreen() {
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
              <Button color="$orange9">Bouton Ghost</Button>
            </XStack>
          </YStack>

          <Separator />

          {/* Cards Section */}
          <YStack gap="$3">
            <H2>Cartes</H2>
            <XStack gap="$3" flexWrap="wrap">
              <Card title="Carte Simple" subtitle="Description de la carte">
                <Paragraph>Contenu de la carte</Paragraph>
              </Card>

              <StatsCard
                title="Gains Totaux"
                value="€1,250.00"
                subtitle="Ce mois"
              />
            </XStack>
          </YStack>

          <Separator />

          {/* Badges Section */}
          <YStack gap="$3">
            <H2>Badges</H2>
            <XStack gap="$3" flexWrap="wrap">
              <Badge>Cuisine</Badge>
              <Badge>Service</Badge>
              <Badge>Bartender</Badge>
            </XStack>
          </YStack>

          <Separator />

          {/* Search Bar */}
          <YStack gap="$3">
            <H2>Barre de Recherche</H2>
            <SearchBar placeholder="Rechercher une mission..." />
          </YStack>

          <Separator />

          {/* Mission Cards */}
          <YStack gap="$3">
            <H2>Cartes de Mission</H2>
            <MissionCard
              title="Chef de Partie"
              location="Paris, France"
              time="12:00 - 16:00"
              price="120€/jour"
              image="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop"
              onApply={() => console.log("Postuler")}
            />

            <MissionCard
              title="Bartender"
              location="Lyon, France"
              time="18:00 - 02:00"
              price="80€/soir"
              image="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=200&fit=crop"
            />
          </YStack>

          <Separator />

          {/* Profile Cards */}
          <YStack gap="$3">
            <H2>Profils</H2>
            <ProfileCard
              name="Alexandre Dubois"
              title="Chef de Cuisine"
              location="Paris, France"
              rating={4.8}
              avatarUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
            />
          </YStack>

          <Separator />

          {/* Chat Bubbles */}
          <YStack gap="$3">
            <H2>Messages de Chat</H2>
            <ChatBubble
              message="Bonjour, êtes-vous disponible pour la mission de ce soir ?"
              isMe={false}
              senderName="Le Grand Hotel"
              timestamp="14:30"
            />
            <ChatBubble
              message="Oui, je suis disponible !"
              isMe={true}
              timestamp="14:32"
            />
          </YStack>

          <Separator />

          {/* Form Fields */}
          <YStack gap="$3">
            <H2>Champs de Formulaire</H2>
            <FormField label="Nom" placeholder="Votre nom" required />
            <FormField
              label="Description"
              placeholder="Décrivez votre expérience..."
              multiline
              numberOfLines={4}
            />
          </YStack>

          <Separator />

          {/* Bottom Navigation */}
          <YStack gap="$3">
            <H2>Navigation</H2>
            <BottomNavigation
              activeTab="home"
              onTabChange={(tab) => console.log("Tab changed:", tab)}
            />
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
