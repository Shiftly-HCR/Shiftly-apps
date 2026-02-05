import { Avatar as TAvatar, AvatarProps } from "tamagui";

interface ShiftlyAvatarProps extends AvatarProps {
  src?: string;
}

export function Avatar({ src, children, ...props }: ShiftlyAvatarProps) {
  return (
    <TAvatar circular size="$4" backgroundColor="$violet9" {...props}>
      {src ? <TAvatar.Image src={src} /> : null}
      <TAvatar.Fallback backgroundColor="$violet9" />
      {children}
    </TAvatar>
  );
}
