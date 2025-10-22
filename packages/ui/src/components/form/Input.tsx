import {
  Input as TInput,
  TextArea as TTextArea,
  styled,
  YStack,
  Label,
  Text,
} from "tamagui";
import React from "react";

const StyledInput = styled(TInput, {
  name: "Input",
  backgroundColor: "$surface",
  borderRadius: "$3",
  borderWidth: 1,
  borderColor: "$borderColor",
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  color: "$color",
  minHeight: 48,
  outlineWidth: 0,
  focusStyle: {
    borderColor: "$primary",
    borderWidth: 2,
    outlineWidth: 0,
  },
  hoverStyle: {
    borderColor: "$primary",
    outlineWidth: 0,
  },
  placeholderTextColor: "#999999",
});

const StyledTextArea = styled(TTextArea, {
  name: "TextArea",
  backgroundColor: "$surface",
  borderRadius: "$3",
  borderWidth: 1,
  borderColor: "$borderColor",
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  color: "$color",
  minHeight: 120,
  outlineWidth: 0,
  focusStyle: {
    borderColor: "$primary",
    borderWidth: 2,
    outlineWidth: 0,
  },
  hoverStyle: {
    borderColor: "$primary",
    outlineWidth: 0,
  },
  placeholderTextColor: "#999999",
});

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  [key: string]: any;
}

export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  required = false,
  error,
  helperText,
  disabled = false,
  ...props
}: InputProps) => {
  const InputComponent = multiline ? StyledTextArea : StyledInput;

  return (
    <YStack gap="$2" width="100%">
      {label && (
        <Label htmlFor={props.id} fontSize={14} fontWeight="600" color="$color">
          {label}
          {required && (
            <Text color="$primary" fontSize={14}>
              {" "}
              *
            </Text>
          )}
        </Label>
      )}

      <InputComponent
        id={props.id}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        disabled={disabled}
        borderColor={error ? "$primary" : "$borderColor"}
        opacity={disabled ? 0.5 : 1}
        cursor={disabled ? "not-allowed" : "text"}
        {...props}
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
