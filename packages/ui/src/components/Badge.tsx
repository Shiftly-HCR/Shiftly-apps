import { SizableText, XStack } from "tamagui";

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <XStack
      ai="center"
      jc="center"
      px="$3"
      py="$1"
      br="$sm"
      bg="$surface"
      boc="$border"
      bw={1}
    >
      <SizableText size="$2">{children}</SizableText>
    </XStack>
  );
}
