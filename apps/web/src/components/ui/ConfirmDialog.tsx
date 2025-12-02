"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { Button } from "@shiftly/ui";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmDialogProps) {
  if (!open) return null;

  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.();
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const variantColors = {
    danger: {
      icon: "#EF4444",
      button: colors.shiftlyViolet,
    },
    warning: {
      icon: "#F59E0B",
      button: "#F59E0B",
    },
    info: {
      icon: colors.shiftlyViolet,
      button: colors.shiftlyViolet,
    },
  };

  const colors_variant = variantColors[variant];

  return (
    <>
      {/* Overlay */}
      <YStack
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="rgba(0, 0, 0, 0.5)"
        zIndex={99998}
        onPress={handleCancel}
      />

      {/* Dialog */}
      <YStack
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="90%"
        maxWidth={400}
        backgroundColor={colors.white}
        borderRadius="$4"
        padding="$6"
        gap="$4"
        zIndex={99999}
        shadowColor="#000000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.25}
        shadowRadius={12}
        elevation={10}
      >
        {/* Icon and Title */}
        <XStack alignItems="center" gap="$3">
          <YStack
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={`${colors_variant.icon}15`}
            alignItems="center"
            justifyContent="center"
          >
            <AlertTriangle size={20} color={colors_variant.icon} />
          </YStack>
          <Text fontSize={18} fontWeight="700" color={colors.gray900} flex={1}>
            {title}
          </Text>
        </XStack>

        {/* Message */}
        <Text fontSize={14} color={colors.gray700} lineHeight={20}>
          {message}
        </Text>

        {/* Actions */}
        <XStack gap="$3" justifyContent="flex-end" marginTop="$2">
          <Button
            variant="outline"
            onPress={handleCancel}
            style={{ minWidth: 100 }}
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            onPress={handleConfirm}
            style={{
              minWidth: 100,
              backgroundColor: colors_variant.button,
            }}
          >
            {confirmText}
          </Button>
        </XStack>
      </YStack>
    </>
  );
}

