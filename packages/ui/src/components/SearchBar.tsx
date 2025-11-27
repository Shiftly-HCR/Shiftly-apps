import React from "react";
import { XStack, Input, YStack } from "tamagui";
import { FiSearch } from "react-icons/fi";
import { colors } from "../theme";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: () => void;
}

export function SearchBar({
  placeholder = "Rechercher un poste, un lieu ou un établissement",
  value,
  onChangeText,
  onSearch,
}: SearchBarProps) {
  return (
    <XStack
      alignItems="center"
      paddingLeft="$4"
      paddingRight="$1.5"
      paddingVertical="$1.5"
      backgroundColor={colors.gray050}
      borderRadius={100}
      borderWidth={1}
      borderColor={colors.gray200}
      gap="$3"
      maxWidth={600}
      width="100%"
      hoverStyle={{
        backgroundColor: colors.gray100,
      }}
    >
      <Input
        flex={1}
        borderWidth={0}
        backgroundColor="transparent"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        fontSize={14}
        color={colors.gray900}
        placeholderTextColor={colors.gray500}
        outlineWidth={0}
        height={44}
        focusStyle={{
          borderWidth: 0,
          outlineWidth: 0,
          backgroundColor: "transparent",
        }}
      />
      <YStack
        width={44}
        height={44}
        borderRadius={22}
        backgroundColor={colors.shiftlyViolet}
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        hoverStyle={{
          backgroundColor: colors.shiftlyVioletHover,
        }}
        pressStyle={{
          scale: 0.95,
        }}
        onPress={onSearch}
      >
        <FiSearch size={20} color={colors.white} />
      </YStack>
    </XStack>
  );
}
