import React, { useState } from "react";
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
  SearchBar,
  MissionCard,
  BottomNavigation,
  StatsCard,
  ChatBubble,
  ProfileCard,
  FormField,
  Stack,
} from "@hestia/ui";

export default function PlaygroundScreen() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchText, setSearchText] = useState("");

  return (
    <YStack flex={1} bg="$background">
      <Header
        title="Hestia UI Playground"
        showAvatar={true}
        avatarUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      />

      <ScrollView flex={1} p="$4">
        <YStack gap="$6">
          {/* Buttons Section */}
          <YStack gap="$3">
            <H2>Boutons</H2>
            <YStack gap="$3">
              <Button bg="$orange9" color="white" size="$4">
                Bouton Principal
              </Button>
              <Button
                variant="outlined"
                borderColor="$orange9"
                color="$orange9"
                size="$4"
              >
                Bouton Secondaire
              </Button>
              <Button variant="ghost" color="$orange9" size="$4">
                Bouton Ghost
              </Button>
            </YStack>
          </YStack>

          <Separator />

          {/* Cards Section */}
          <YStack gap="$3">
            <H2>Cartes</H2>
            <YStack gap="$3">
              <Card title="Carte Simple" subtitle="Description de la carte">
                <Paragraph>Contenu de la carte</Paragraph>
              </Card>

              <StatsCard
                title="Gains Totaux"
                value="€1,250.00"
                subtitle="Ce mois"
              />
            </YStack>
          </YStack>

          <Separator />

          {/* Badges Section */}
          <YStack gap="$3">
            <H2>Badges</H2>
            <XStack gap="$3" fw="wrap">
              <Badge>Cuisine</Badge>
              <Badge>Service</Badge>
              <Badge>Bartender</Badge>
            </XStack>
          </YStack>

          <Separator />

          {/* Search Bar */}
          <YStack gap="$3">
            <H2>Barre de Recherche</H2>
            <SearchBar
              placeholder="Rechercher une mission..."
              value={searchText}
              onChangeText={setSearchText}
            />
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
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
