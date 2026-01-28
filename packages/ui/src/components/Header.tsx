import { XStack, YStack, H3 } from "tamagui";
import { Avatar as AvatarComponent } from "./Avatar";

interface HeaderProps {
  title?: string;
  showAvatar?: boolean;
  avatarUrl?: string;
  onAvatarPress?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({
  title,
  showAvatar = false,
  avatarUrl,
  onAvatarPress,
  rightElement,
}: HeaderProps) {
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      padding="$4"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <XStack alignItems="center" gap="$3">
        {showAvatar && (
          <AvatarComponent
            src={avatarUrl}
            onPress={onAvatarPress}
            size="$3"
          />
        )}
        {title && <H3>{title}</H3>}
      </XStack>
      {rightElement}
    </XStack>
  );
}
