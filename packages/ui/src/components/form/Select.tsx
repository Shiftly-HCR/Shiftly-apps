import { Select as TSelect, YStack, Label, Text, Adapt, Sheet } from "tamagui";
import React from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

export const Select = ({
  label,
  placeholder = "Sélectionner...",
  options,
  value,
  onValueChange,
  required = false,
  error,
  helperText,
  disabled = false,
}: SelectProps) => {
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

      <TSelect value={value} onValueChange={onValueChange}>
        <TSelect.Trigger
          backgroundColor="$surface"
          borderRadius="$3"
          borderWidth={1}
          borderColor={error ? "$primary" : "$borderColor"}
          paddingHorizontal={16}
          paddingVertical={12}
          minHeight={48}
          opacity={disabled ? 0.5 : 1}
          pointerEvents={disabled ? "none" : "auto"}
          hoverStyle={{
            borderColor: "$primary",
          }}
          focusStyle={{
            borderColor: "$primary",
            borderWidth: 2,
          }}
        >
          <TSelect.Value placeholder={placeholder} />
        </TSelect.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet
            modal
            dismissOnSnapToBottom
            animationConfig={{
              type: "spring",
              damping: 20,
              mass: 1.2,
              stiffness: 250,
            }}
          >
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Sheet>
        </Adapt>

        <TSelect.Content zIndex={200000}>
          <TSelect.ScrollUpButton />
          <TSelect.Viewport minWidth={200}>
            <TSelect.Group>
              {options.map((option, i) => (
                <TSelect.Item key={option.value} index={i} value={option.value}>
                  <TSelect.ItemText>{option.label}</TSelect.ItemText>
                </TSelect.Item>
              ))}
            </TSelect.Group>
          </TSelect.Viewport>
          <TSelect.ScrollDownButton />
        </TSelect.Content>
      </TSelect>

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
