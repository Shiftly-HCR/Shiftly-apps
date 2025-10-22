import { YStack, XStack, Label, Text } from "tamagui";
import React, { useState } from "react";
import { Button } from "../Button";

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
}

export const RadioGroup = ({
  label,
  options,
  value,
  onChange,
  required = false,
  error,
  helperText,
  disabled = false,
  orientation = "horizontal",
}: RadioGroupProps) => {
  const [selectedValue, setSelectedValue] = useState(value);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    setSelectedValue(optionValue);
    onChange?.(optionValue);
  };

  const Container = orientation === "horizontal" ? XStack : YStack;

  return (
    <YStack gap="$2" width="100%">
      {label && (
        <Label fontSize={14} fontWeight="600" color="$color">
          {label}
          {required && (
            <Text color="$primary" fontSize={14}>
              {" "}
              *
            </Text>
          )}
        </Label>
      )}

      <Container gap="$2" flexWrap="wrap">
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <XStack
              key={option.value}
              paddingHorizontal={20}
              paddingVertical={12}
              borderRadius="$3"
              borderWidth={2}
              borderColor={isSelected ? "$primary" : "$borderColor"}
              backgroundColor={isSelected ? "$primaryLight" : "$surface"}
              cursor={disabled ? "not-allowed" : "pointer"}
              opacity={disabled ? 0.5 : 1}
              onPress={() => handleSelect(option.value)}
              hoverStyle={{
                borderColor: "$primary",
                backgroundColor: "$primaryLight",
              }}
            >
              <Text
                fontSize={14}
                fontWeight={isSelected ? "600" : "400"}
                color={isSelected ? "$primary" : "$color"}
              >
                {option.label}
              </Text>
            </XStack>
          );
        })}
      </Container>

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
