import { YStack, Label, Input, TextArea, Paragraph } from "tamagui";

interface FormFieldProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  required?: boolean;
}

export function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  error,
  required = false,
}: FormFieldProps) {
  const InputComponent = multiline ? TextArea : Input;

  return (
    <YStack gap="$2">
      <Label size="$4" fontWeight="600">
        {label}
        {required && (
          <Paragraph color="$red10" marginLeft="$1">
            *
          </Paragraph>
        )}
      </Label>

      <InputComponent
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        size="$4"
        borderColor={error ? "$red8" : "$borderColor"}
        focusStyle={{
          borderColor: error ? "$red10" : "$violet8",
        }}
        numberOfLines={numberOfLines}
      />

      {error && (
        <Paragraph size="$3" color="$red10">
          {error}
        </Paragraph>
      )}
    </YStack>
  );
}
