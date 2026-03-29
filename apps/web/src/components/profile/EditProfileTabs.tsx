"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";

export type EditTabType =
  | "personal"
  | "freelance"
  | "experiences"
  | "educations"
  | "account";

const TAB_LABELS: Record<EditTabType, string> = {
  personal: "Informations personnelles",
  freelance: "Profil freelance",
  experiences: "Expériences",
  educations: "Formations",
  account: "Compte",
};

interface EditProfileTabsProps {
  activeTab: EditTabType;
  onTabChange: (tab: EditTabType) => void;
  tabs: EditTabType[];
}

export function EditProfileTabs({
  activeTab,
  onTabChange,
  tabs,
}: EditProfileTabsProps) {
  return (
    <XStack
      borderBottomWidth={1}
      borderBottomColor={colors.gray200}
      gap="$6"
      flexWrap="wrap"
    >
      {tabs.map((tab) => (
        <YStack
          key={tab}
          paddingBottom="$3"
          borderBottomWidth={activeTab === tab ? 2 : 0}
          borderBottomColor={
            activeTab === tab ? colors.shiftlyViolet : "transparent"
          }
          marginBottom={activeTab === tab ? -1 : 0}
          cursor="pointer"
          onPress={() => onTabChange(tab)}
        >
          <Text
            fontSize={16}
            fontWeight={activeTab === tab ? "600" : "400"}
            color={activeTab === tab ? colors.shiftlyViolet : colors.gray700}
          >
            {TAB_LABELS[tab]}
          </Text>
        </YStack>
      ))}
    </XStack>
  );
}
