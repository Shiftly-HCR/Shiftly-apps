"use client";

import { YStack, XStack, Text } from "tamagui";
import { Briefcase } from "lucide-react";
import type { Mission } from "@shiftly/data";

interface MissionDetailSkillsProps {
  mission: Mission;
}

export function MissionDetailSkills({ mission }: MissionDetailSkillsProps) {
  if (!mission.skills || mission.skills.length === 0) return null;

  return (
    <YStack
      backgroundColor="white"
      borderRadius={12}
      padding="$5"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
    >
      <XStack alignItems="center" gap="$2" marginBottom="$3">
        <Briefcase size={20} color="#000" />
        <Text fontSize={18} fontWeight="bold" color="#000">
          Compétences requises
        </Text>
      </XStack>
      <XStack gap="$2" flexWrap="wrap">
        {mission.skills.map((skill, index) => (
          <YStack
            key={index}
            backgroundColor="#F0F0F0"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={20}
          >
            <Text fontSize={14} color="#333">
              {skill}
            </Text>
          </YStack>
        ))}
      </XStack>
    </YStack>
  );
}

