import { YStack, XStack, Label, Text } from "tamagui";
import React, { useState } from "react";

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

export const Checkbox = ({
  label,
  checked = false,
  onChange,
  error,
  helperText,
  disabled = false,
}: CheckboxProps) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <YStack gap="$2" width="100%">
      <XStack
        gap="$3"
        alignItems="center"
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.5 : 1}
        onPress={handleToggle}
      >
        <XStack
          width={24}
          height={24}
          borderRadius="$2"
          borderWidth={2}
          borderColor={isChecked ? "$primary" : "$borderColor"}
          backgroundColor={isChecked ? "$primary" : "$surface"}
          alignItems="center"
          justifyContent="center"
          hoverStyle={{
            borderColor: "$primary",
          }}
        >
          {isChecked && (
            <Text color="white" fontSize={16} fontWeight="bold">
              ✓
            </Text>
          )}
        </XStack>

        {label && (
          <Label fontSize={14} fontWeight="400" color="$color" cursor="pointer">
            {label}
          </Label>
        )}
      </XStack>

      {error && (
        <Text fontSize={12} color="$primary">
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text fontSize={12} color="#999999">
          {helperText}
        </Text>
      )}
    </YStack>
  );
};
