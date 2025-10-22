import { YStack, Label, Text, XStack } from "tamagui";
import React, { useState } from "react";
import { Input } from "./Input";

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange?: (date: string) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

export const DatePicker = ({
  label,
  value,
  onChange,
  required = false,
  error,
  helperText,
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) => {
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
        type="date"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        min={minDate}
        max={maxDate}
        style={{
          backgroundColor: "var(--color-surface)",
          borderRadius: "12px",
          border: error
            ? "1px solid var(--color-primary)"
            : "1px solid var(--color-borderColor)",
          padding: "12px 16px",
          fontSize: "16px",
          color: "var(--color-color)",
          minHeight: "48px",
          width: "100%",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
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
