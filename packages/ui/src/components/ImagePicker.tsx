import React, { useRef, useState } from "react";
import { YStack, XStack, Text, Image } from "tamagui";
import { colors } from "../theme";
import { Button } from "./Button";

interface ImagePickerProps {
  value?: string | null;
  onChange?: (file: File) => void;
  onRemove?: () => void;
  label?: string;
  disabled?: boolean;
  shape?: "circle" | "square";
  size?: number;
  placeholder?: string;
}

export function ImagePicker({
  value,
  onChange,
  onRemove,
  label = "Photo de profil",
  disabled = false,
  shape = "circle",
  size = 120,
  placeholder,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string>("");

  // Mettre à jour l'aperçu quand la prop value change
  React.useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError("");

    if (!file) return;

    // Validation
    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    // Créer un aperçu local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notifier le parent
    onChange?.(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onRemove?.();
  };

  return (
    <YStack gap="$3">
      {label && (
        <Text fontSize={14} fontWeight="600" color={colors.gray900}>
          {label}
        </Text>
      )}

      <XStack gap="$4" alignItems="center">
        {/* Zone d'affichage de l'image */}
        <YStack
          width={size}
          height={size}
          borderRadius={shape === "circle" ? size / 2 : 12}
          backgroundColor={colors.gray100}
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          borderWidth={2}
          borderColor={preview ? colors.shiftlyViolet : colors.gray200}
          cursor={disabled ? "not-allowed" : "pointer"}
          hoverStyle={
            !disabled
              ? {
                  borderColor: colors.shiftlyViolet,
                  opacity: 0.8,
                }
              : {}
          }
          onPress={handleClick}
        >
          {preview ? (
            <Image
              source={{ uri: preview }}
              width={size}
              height={size}
              resizeMode="cover"
              style={{
                width: size,
                height: size,
                objectFit: "cover",
              }}
            />
          ) : (
            <YStack alignItems="center" gap="$2">
              <Text fontSize={32} color={colors.gray500}>
                📷
              </Text>
              {placeholder && (
                <Text
                  fontSize={12}
                  color={colors.gray500}
                  textAlign="center"
                  paddingHorizontal="$2"
                >
                  {placeholder}
                </Text>
              )}
            </YStack>
          )}
        </YStack>

        {/* Input file caché */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          style={{ display: "none" }}
        />

        {/* Boutons d'action */}
        <YStack gap="$2">
          <Button
            variant="outline"
            size="sm"
            onPress={handleClick}
            disabled={disabled}
          >
            {preview ? "Changer" : "Choisir"}
          </Button>
          {preview && onRemove && (
            <Button
              variant="outline"
              size="sm"
              onPress={handleRemove}
              disabled={disabled}
            >
              Supprimer
            </Button>
          )}
        </YStack>
      </XStack>

      {/* Message d'erreur */}
      {error && (
        <Text fontSize={13} color="#EF4444" fontWeight="500">
          {error}
        </Text>
      )}

      {/* Indication */}
      <Text fontSize={12} color={colors.gray500}>
        Format accepté: JPG, PNG, GIF (max 5MB)
      </Text>
    </YStack>
  );
}

