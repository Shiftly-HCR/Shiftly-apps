"use client";

import { XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";

interface SimpleCheckboxProps {
  checked: boolean;
  onPress: () => void;
}

export function SimpleCheckbox({ checked, onPress }: SimpleCheckboxProps) {
  return (
    <XStack
      width={20}
      height={20}
      borderRadius={4}
      borderWidth={2}
      borderColor={checked ? colors.shiftlyViolet : colors.gray200}
      backgroundColor={checked ? colors.shiftlyViolet : colors.white}
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      onPress={onPress}
    >
      {checked && (
        <Text color={colors.white} fontSize={12} fontWeight="bold">
          ✓
        </Text>
      )}
    </XStack>
  );
}

