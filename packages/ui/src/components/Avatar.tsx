import { Avatar as TAvatar, AvatarProps } from "tamagui";

export function Avatar(props: AvatarProps) {
  return <TAvatar circular size="$4" backgroundColor="$orange9" {...props} />;
}
