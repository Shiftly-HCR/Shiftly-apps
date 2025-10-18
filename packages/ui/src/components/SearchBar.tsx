import { XStack, Input, Button } from "tamagui";
import { Search } from "@tamagui/lucide-icons";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: () => void;
}

export function SearchBar({
  placeholder = "Rechercher...",
  value,
  onChangeText,
  onSearch,
}: SearchBarProps) {
  return (
    <XStack
      alignItems="center"
      gap="$2"
      padding="$3"
      backgroundColor="$background"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <Search size="$1" color="$gray10" />
      <Input
        flex={1}
        borderWidth={0}
        backgroundColor="transparent"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        size="$4"
      />
      {onSearch && (
        <Button size="$3" onPress={onSearch}>
          Rechercher
        </Button>
      )}
    </XStack>
  );
}
