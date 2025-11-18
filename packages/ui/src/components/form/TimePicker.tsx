import { YStack, Label, Text } from "tamagui";
import React from "react";

interface TimePickerProps {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export const TimePicker = ({
  label,
  value,
  onChangeText,
  required = false,
  error,
  helperText,
  disabled = false,
  min,
  max,
}: TimePickerProps) => {
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

      <input
        type="time"
        value={value || ""}
        onChange={(e) => onChangeText?.(e.target.value)}
        disabled={disabled}
        min={min}
        max={max}
        style={{
          width: "100%",
          minHeight: 48,
          padding: "12px 16px",
          fontSize: 16,
          borderRadius: 8,
          border: error ? "2px solid #FF6B35" : "1px solid #E5E7EB",
          backgroundColor: disabled ? "#F9FAFB" : "white",
          color: "#111827",
          outline: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: "inherit",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#FF6B35";
          e.target.style.borderWidth = "2px";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "#FF6B35" : "#E5E7EB";
          e.target.style.borderWidth = error ? "2px" : "1px";
        }}
      />

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

