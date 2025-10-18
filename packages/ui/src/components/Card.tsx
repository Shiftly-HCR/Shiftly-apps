import { Card as TCard, CardProps, Paragraph } from "tamagui";

export function Card(props: CardProps & { title?: string; subtitle?: string }) {
  const { title, subtitle, children, ...rest } = props;
  return (
    <TCard bordered elevate p="$4" br="$md" {...rest}>
      {title && (
        <Paragraph size="$6" fontWeight="700" mb="$2">
          {title}
        </Paragraph>
      )}
      {subtitle && (
        <Paragraph theme="alt2" size="$3" mb="$3">
          {subtitle}
        </Paragraph>
      )}
      {children}
    </TCard>
  );
}
