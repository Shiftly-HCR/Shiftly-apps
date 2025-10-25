import { TamaguiProvider as TamaguiProviderBase } from "tamagui";
import { config, ToastProvider, ToastViewport } from "@hestia/ui";

export function TamaguiProvider({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProviderBase config={config} defaultTheme="light">
      <ToastProvider>
        {children}
        <ToastViewport />
      </ToastProvider>
    </TamaguiProviderBase>
  );
}
