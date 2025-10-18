import {
  Toast,
  ToastProvider,
  ToastViewport,
  useToastController,
  useToastState,
} from "@tamagui/toast";
import { YStack } from "tamagui";

export interface ToastOptions {
  type?: "success" | "error" | "info";
  duration?: number;
  description?: string;
}

export function useHestiaToast() {
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

export { Toast, ToastProvider, ToastViewport, useToastState };
