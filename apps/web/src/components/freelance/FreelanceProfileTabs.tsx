"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";

type TabType = "overview" | "availability" | "reviews" | "documents";

interface Tab {
  id: TabType;
  label: string;
}

interface FreelanceProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * Composant pour afficher la navigation par onglets du profil freelance
 */
export function FreelanceProfileTabs({
  activeTab,
  onTabChange,
}: FreelanceProfileTabsProps) {
  const tabs: Tab[] = [
    { id: "overview", label: "Aperçu" },
    { id: "availability", label: "Disponibilités" },
    { id: "reviews", label: "Avis" },
    { id: "documents", label: "Documents" },
  ];

  return (
    <XStack
      borderBottomWidth={1}
      borderBottomColor={colors.gray200}
      gap="$6"
      marginTop="$4"
    >
      {tabs.map((tab) => (
        <YStack
          key={tab.id}
          paddingBottom="$3"
          borderBottomWidth={activeTab === tab.id ? 2 : 0}
          borderBottomColor={
            activeTab === tab.id ? colors.shiftlyViolet : "transparent"
          }
          marginBottom={activeTab === tab.id ? -1 : 0}
          cursor="pointer"
          onPress={() => onTabChange(tab.id)}
        >
          <Text
            fontSize={16}
            fontWeight={activeTab === tab.id ? "600" : "400"}
            color={
              activeTab === tab.id
                ? colors.shiftlyViolet
                : colors.gray700
            }
          >
            {tab.label}
          </Text>
        </YStack>
      ))}
    </XStack>
  );
}

