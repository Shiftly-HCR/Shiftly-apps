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

          <Separator />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
