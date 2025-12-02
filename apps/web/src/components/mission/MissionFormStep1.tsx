"use client";

import { YStack, Text } from "tamagui";
import { Input, colors } from "@shiftly/ui";

interface MissionFormStep1Props {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  skills: string;
  setSkills: (value: string) => void;
}

export function MissionFormStep1({
  title,
  setTitle,
  description,
  setDescription,
  skills,
  setSkills,
}: MissionFormStep1Props) {
  return (
    <YStack gap="$4">
      <Text fontSize={24} fontWeight="700" color={colors.gray900}>
        Infos générales
      </Text>

      <Input
        label="Poste"
        placeholder="ex: Chef de rang"
        value={title}
        onChangeText={setTitle}
        required
      />

      <YStack gap="$2">
        <Text fontSize={14} fontWeight="600" color={colors.gray900}>
          Description
        </Text>
        <YStack
          padding="$3"
          backgroundColor={colors.white}
          borderRadius={12}
          borderWidth={1}
          borderColor={colors.gray200}
          minHeight={120}
        >
          <Input
            placeholder="Décrivez les tâches et responsabilités du poste..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
          />
        </YStack>
      </YStack>

      <Input
        label="Compétences"
        placeholder="Séparées par des virgules (ex: Serveur, Barman)"
        value={skills}
        onChangeText={setSkills}
        helperText="Séparez les compétences par des virgules"
      />
    </YStack>
  );
}

