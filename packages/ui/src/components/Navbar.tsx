import React from "react";
import { XStack, YStack, Text, Avatar, Image } from "tamagui";
import { SearchBar } from "./SearchBar";
import { colors } from "../theme";

interface NavbarProps {
  onSearch?: (value: string) => void;
  searchValue?: string;
  userAvatar?: string;
  userName?: string;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
  onMissionsClick?: () => void;
  onSubscriptionClick?: () => void;
  onFreelanceClick?: () => void;
  onLogoutClick?: () => void;
}

export function Navbar({
  onSearch,
  searchValue = "",
  userAvatar,
  userName = "Utilisateur",
  onHomeClick,
  onProfileClick,
  onMissionsClick,
  onSubscriptionClick,
  onFreelanceClick,
  onLogoutClick,
}: NavbarProps) {
  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
      return;
    }

    if (typeof window !== "undefined") {
      window.location.href = "/home";
    }
  };
  return (
    <YStack
      backgroundColor={colors.white}
      borderBottomWidth={1}
      borderBottomColor={colors.gray200}
      paddingHorizontal="$6"
      paddingVertical="$3"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={1}
      shadowRadius={4}
      elevation={2}
      zIndex={1000}
    >
      <XStack
        alignItems="center"
        gap="$6"
        maxWidth={1400}
        width="100%"
        alignSelf="center"
      >
        {/* Logo */}
        <XStack
          alignItems="center"
          gap="$2"
          flexShrink={0}
          cursor="pointer"
          hoverStyle={{ opacity: 0.8 }}
          onPress={handleHomeClick}
        >
          <YStack
            width={32}
            height={32}
            borderRadius={16}
            backgroundColor={colors.shiftlyOrange}
            alignItems="center"
            justifyContent="center"
          >
            <Image
              source={{ uri: "/assets/images/logo.jpg" }}
              width={18}
              height={18}
            />
          </YStack>
          <Text fontSize={20} fontWeight="700" color={colors.gray900}>
            Shiftly
          </Text>
        </XStack>

        {/* Barre de recherche */}
        <YStack flex={1} maxWidth={600}>
          <SearchBar
            value={searchValue}
            onChangeText={onSearch}
            onSearch={() => onSearch && onSearch(searchValue || "")}
          />
        </YStack>

        {/* Menu navigation */}
        <XStack alignItems="center" gap="$5" flexShrink={0}>
          <Text
            fontSize={14}
            fontWeight="600"
            color={colors.gray900}
            cursor="pointer"
            hoverStyle={{
              color: colors.shiftlyOrange,
            }}
            onPress={onProfileClick}
          >
            Profil
          </Text>
          <Text
            fontSize={14}
            fontWeight="600"
            color={colors.gray900}
            cursor="pointer"
            hoverStyle={{
              color: colors.shiftlyOrange,
            }}
            onPress={onMissionsClick}
          >
            Mes missions
          </Text>
          <Text
            fontSize={14}
            fontWeight="600"
            color={colors.gray900}
            cursor="pointer"
            hoverStyle={{
              color: colors.shiftlyOrange,
            }}
            onPress={onSubscriptionClick}
          >
            Abonnement
          </Text>
          <Text
            fontSize={14}
            fontWeight="600"
            color={colors.gray900}
            cursor="pointer"
            hoverStyle={{
              color: colors.shiftlyOrange,
            }}
            onPress={onFreelanceClick}
          >
            Freelance
          </Text>
          {onLogoutClick && (
            <Text
              fontSize={14}
              fontWeight="600"
              color={colors.gray900}
              cursor="pointer"
              hoverStyle={{
                color: "#EF4444",
              }}
              onPress={onLogoutClick}
            >
              Déconnexion
            </Text>
          )}

          {/* Avatar utilisateur */}
          <XStack
            cursor="pointer"
            hoverStyle={{ opacity: 0.8 }}
            onPress={onProfileClick}
          >
            <Avatar circular size={40} backgroundColor={colors.shiftlyOrange}>
              {userAvatar ? (
                <Avatar.Image src={userAvatar} />
              ) : (
                <Avatar.Fallback
                  backgroundColor={colors.shiftlyOrange}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    color={colors.white}
                    fontSize={16}
                    fontWeight="600"
                    textAlign="center"
                  >
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </Avatar.Fallback>
              )}
            </Avatar>
          </XStack>
        </XStack>
      </XStack>
    </YStack>
  );
}
