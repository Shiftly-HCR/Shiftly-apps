"use client";

import { XStack, Text } from "tamagui";
import { Button, colors } from "@shiftly/ui";

type TabType = "candidates" | "details" | "activity";

interface MissionCandidatesTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  candidatesCount: number;
}

export function MissionCandidatesTabs({
  activeTab,
  onTabChange,
  candidatesCount,
}: MissionCandidatesTabsProps) {
  return (
    <XStack
      gap="$2"
      borderBottomWidth={1}
      borderBottomColor={colors.gray200}
    >
      <Button
        variant={activeTab === "candidates" ? "primary" : "outline"}
        size="md"
        onPress={() => onTabChange("candidates")}
        borderRadius={0}
        borderBottomWidth={activeTab === "candidates" ? 2 : 0}
        borderBottomColor={
          activeTab === "candidates"
            ? colors.shiftlyViolet
            : "transparent"
        }
      >
        <XStack alignItems="center" gap="$2">
          <Text>Candidats</Text>
          {candidatesCount > 0 && (
            <XStack
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius={12}
              backgroundColor={
                activeTab === "candidates" ? colors.white : colors.gray200
              }
            >
              <Text
                fontSize={12}
                fontWeight="600"
                color={
                  activeTab === "candidates"
                    ? colors.shiftlyViolet
                    : colors.gray700
                }
              >
                {candidatesCount}
              </Text>
            </XStack>
          )}
        </XStack>
      </Button>
      <Button
        variant={activeTab === "details" ? "primary" : "outline"}
        size="md"
        onPress={() => onTabChange("details")}
        borderRadius={0}
        borderBottomWidth={activeTab === "details" ? 2 : 0}
        borderBottomColor={
          activeTab === "details" ? colors.shiftlyViolet : "transparent"
        }
      >
        Détails
      </Button>
      <Button
        variant={activeTab === "activity" ? "primary" : "outline"}
        size="md"
        onPress={() => onTabChange("activity")}
        borderRadius={0}
        borderBottomWidth={activeTab === "activity" ? 2 : 0}
        borderBottomColor={
          activeTab === "activity" ? colors.shiftlyViolet : "transparent"
        }
      >
        Journal d'activité
      </Button>
    </XStack>
  );
}

