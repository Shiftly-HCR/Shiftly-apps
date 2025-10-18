import { TamaguiProvider as TamaguiProviderBase } from "tamagui";
import { config } from "@hestia/ui";

export function TamaguiProvider({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProviderBase config={config} defaultTheme="light">
      {children}
    </TamaguiProviderBase>
  );
}
