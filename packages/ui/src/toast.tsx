import {
  Toast,
  ToastProvider as TamaguiToastProvider,
  ToastViewport as TamaguiToastViewport,
  useToastController,
  useToastState,
} from "@tamagui/toast";
import { YStack, XStack, SizableText, styled } from "tamagui";
import { useEffect, useState } from "react";

export interface ToastOptions {
  type?: "success" | "error" | "info";
  duration?: number;
  description?: string;
}

export function useShiftlyToast() {
  const toast = useToastController();

  return {
    show: (title: string, options?: ToastOptions) => {
      toast.show(title, {
        duration: options?.duration || 5000,
        ...options,
      });
    },
    success: (title: string, options?: Omit<ToastOptions, "type">) => {
      toast.show(title, {
        duration: options?.duration || 5000,
        type: "success",
        ...options,
      });
    },
    error: (title: string, options?: Omit<ToastOptions, "type">) => {
      toast.show(title, {
        duration: options?.duration || 5000,
        type: "error",
        ...options,
      });
    },
    info: (title: string, options?: Omit<ToastOptions, "type">) => {
      toast.show(title, {
        duration: options?.duration || 5000,
        type: "info",
        ...options,
      });
    },
  };
}

// Barre de progression animée
function ProgressBar({ duration, color }: { duration: number; color: string }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = 50; // Update every 50ms
    const decrement = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        return next <= 0 ? 0 : next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <YStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      height={3}
      backgroundColor="rgba(0,0,0,0.1)"
      overflow="hidden"
      borderBottomLeftRadius="$3"
      borderBottomRightRadius="$3"
    >
      <YStack
        height="100%"
        backgroundColor={color}
        width={`${progress}%`}
        animation="quick"
      />
    </YStack>
  );
}

// Composant Toast personnalisé avec les styles Shiftly
export function ShiftlyToast() {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) return null;

  const getToastStyles = (type?: string) => {
    switch (type) {
      case "success":
        return {
          bg: "#FFFFFF",
          textColor: "#2B2B2B",
          iconBg: "#22C55E",
          iconColor: "#FFFFFF",
          progressColor: "#22C55E",
          icon: "✓",
        };
      case "error":
        return {
          bg: "#FFFFFF",
          textColor: "#2B2B2B",
          iconBg: "#EF4444",
          iconColor: "#FFFFFF",
          progressColor: "#EF4444",
          icon: "✕",
        };
      case "info":
        return {
          bg: "#FFFFFF",
          textColor: "#2B2B2B",
          iconBg: "#782478",
          iconColor: "#FFFFFF",
          progressColor: "#782478",
          icon: "i",
        };
      default:
        return {
          bg: "#FFFFFF",
          textColor: "#2B2B2B",
          iconBg: "#6B7280",
          iconColor: "#FFFFFF",
          progressColor: "#6B7280",
          icon: "•",
        };
    }
  };

  const styles = getToastStyles(currentToast.type as string);

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, x: 100 }}
      exitStyle={{ opacity: 0, x: 100 }}
      x={0}
      opacity={1}
      animation="quick"
      viewportName={currentToast.viewportName}
    >
      <YStack
        position="relative"
        backgroundColor={styles.bg}
        borderRadius="$3"
        minWidth={320}
        maxWidth={420}
        overflow="hidden"
        shadowColor="#000000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.15}
        shadowRadius={12}
        elevation={5}
      >
        <XStack padding="$4" gap="$3" alignItems="flex-start">
          {/* Icône dans un cercle coloré */}
          <YStack
            width={24}
            height={24}
            borderRadius={12}
            backgroundColor={styles.iconBg}
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <SizableText
              fontSize={14}
              fontWeight="bold"
              color={styles.iconColor}
            >
              {styles.icon}
            </SizableText>
          </YStack>

          {/* Contenu */}
          <YStack flex={1} gap="$1.5">
            <Toast.Title
              fontSize={15}
              fontWeight="700"
              color={styles.textColor}
              lineHeight={20}
            />
            {currentToast.message && (
              <Toast.Description
                fontSize={13}
                color={styles.textColor}
                opacity={0.7}
                lineHeight={18}
              />
            )}
          </YStack>

          {/* Bouton de fermeture */}
          <Toast.Close
            width={20}
            height={20}
            padding={0}
            alignItems="center"
            justifyContent="center"
            backgroundColor="transparent"
            borderWidth={0}
            cursor="pointer"
            hoverStyle={{
              backgroundColor: "rgba(0,0,0,0.05)",
              borderRadius: "$2",
            }}
            pressStyle={{
              backgroundColor: "rgba(0,0,0,0.1)",
            }}
          >
            <SizableText
              fontSize={16}
              color={styles.textColor}
              opacity={0.5}
              fontWeight="bold"
            >
              ✕
            </SizableText>
          </Toast.Close>
        </XStack>

        {/* Barre de progression */}
        <ProgressBar
          duration={currentToast.duration || 5000}
          color={styles.progressColor}
        />
      </YStack>
    </Toast>
  );
}

// Provider et Viewport personnalisés
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiToastProvider swipeDirection="horizontal" duration={5000}>
      {children}
    </TamaguiToastProvider>
  );
}

export function ToastViewport() {
  return (
    <TamaguiToastViewport
      top={16}
      right={16}
      flexDirection="column"
      gap="$3"
      zIndex={100000}
    >
      <ShiftlyToast />
    </TamaguiToastViewport>
  );
}

export { Toast, useToastState };
