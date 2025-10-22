import { YStack, XStack, Label, Text } from "tamagui";
import React, { useState } from "react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  onFileSelect?: (files: File[]) => void;
}

export const FileUpload = ({
  label,
  accept,
  multiple = false,
  required = false,
  error,
  helperText,
  disabled = false,
  onFileSelect,
}: FileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files.map((f) => f.name));
      onFileSelect?.(files);
    }
  };

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

      <XStack
        gap="$2"
        flexDirection="column"
        padding={16}
        borderRadius="$3"
        borderWidth={2}
        borderStyle="dashed"
        borderColor={error ? "$primary" : "$borderColor"}
        backgroundColor="$surface"
        alignItems="center"
        justifyContent="center"
        minHeight={120}
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.5 : 1}
        hoverStyle={{
          borderColor: "$primary",
          backgroundColor: "$primaryLight",
        }}
        position="relative"
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileChange}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        />

        <Text fontSize={40} color="$primary">
          📁
        </Text>

        <Text fontSize={14} color="$color" textAlign="center" fontWeight="600">
          Cliquez pour télécharger
        </Text>

        <Text fontSize={12} color="#999999" textAlign="center">
          ou glissez-déposez vos fichiers ici
        </Text>

        {selectedFiles.length > 0 && (
          <YStack gap="$1" marginTop="$2">
            {selectedFiles.map((fileName, index) => (
              <Text key={index} fontSize={12} color="$primary" fontWeight="600">
                ✓ {fileName}
              </Text>
            ))}
          </YStack>
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
