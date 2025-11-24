import { YStack, Text } from "tamagui";
import { colors } from "../../theme";

interface CreateMissionCardProps {
  onPress?: () => void;
}

export function CreateMissionCard({ onPress }: CreateMissionCardProps) {
  return (
    <YStack
      width="100%"
      minHeight={300}
      backgroundColor={colors.white}
      borderRadius={12}
      borderWidth={2}
      borderStyle="dashed"
      borderColor={colors.shiftlyOrange}
      alignItems="center"
      justifyContent="center"
      gap="$4"
      padding="$6"
      cursor="pointer"
      hoverStyle={{
        backgroundColor: "#FFF4E6",
        borderColor: colors.shiftlyOrangeHover,
      }}
      pressStyle={{
        scale: 0.98,
      }}
      onPress={onPress}
    >
      {/* Icône Plus */}
      <YStack
        width={64}
        height={64}
        borderRadius={32}
        backgroundColor="#FFF4E6"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={32} color={colors.shiftlyOrange} fontWeight="700">
          +
        </Text>
      </YStack>

      {/* Texte */}
      <YStack alignItems="center" gap="$2">
        <Text
          fontSize={18}
          fontWeight="700"
          color={colors.gray900}
          textAlign="center"
        >
          Créer une nouvelle mission
        </Text>
        <Text
          fontSize={14}
          color={colors.gray500}
          textAlign="center"
          maxWidth={250}
        >
          Cliquez ici pour ajouter une nouvelle mission à votre liste
        </Text>
      </YStack>
    </YStack>
  );
}

