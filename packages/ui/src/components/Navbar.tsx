import React from "react";
import { XStack, YStack, Text, Avatar, Image } from "tamagui";
import { LogOut } from "lucide-react";
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
  onMessagingClick?: () => void;
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
  onMessagingClick,
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
        maxWidth={1400}
        width="100%"
        alignSelf="center"
        justifyContent="space-between"
      >
        {/* Logo - Tout à gauche */}
        <XStack
          alignItems="center"
          gap="$2"
          flexShrink={0}
          cursor="pointer"
          hoverStyle={{ opacity: 0.8 }}
          onPress={handleHomeClick}
        >
          <Image
            source={{ uri: "/logo-shiftly.png" }}
            width={40}
            height={40}
            borderRadius={20}
          />
          <Text fontSize={20} fontWeight="700" color={colors.gray900}>
            Shiftly
          </Text>
        </XStack>

        {/* Barre de recherche - Au centre */}
        <YStack
          flex={1}
          maxWidth={600}
          alignItems="center"
          justifyContent="center"
        >
          <SearchBar
            value={searchValue}
            onChangeText={onSearch}
            onSearch={() => onSearch && onSearch(searchValue || "")}
          />
        </YStack>

        {/* Menu navigation + Avatar + Logout - Tout à droite */}
        <XStack alignItems="center" gap="$5" flexShrink={0}>
          <Text
            fontSize={14}
            fontWeight="600"
            color={colors.gray900}
            cursor="pointer"
            hoverStyle={{
              color: colors.shiftlyViolet,
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
              color: colors.shiftlyViolet,
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
              color: colors.shiftlyViolet,
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
              color: colors.shiftlyViolet,
            }}
            onPress={onFreelanceClick}
          >
            Freelance
          </Text>
          <Text
            fontSize={14}
            fontWeight="600"
            color={colors.gray900}
            cursor="pointer"
            hoverStyle={{
              color: colors.shiftlyViolet,
            }}
            onPress={onMessagingClick}
          >
            Messagerie
          </Text>

          {/* Avatar utilisateur */}
          <XStack
            cursor="pointer"
            hoverStyle={{ opacity: 0.8 }}
            onPress={onProfileClick}
          >
            <Avatar circular size={40} backgroundColor={colors.shiftlyViolet}>
              {userAvatar ? (
                <Avatar.Image src={userAvatar} />
              ) : (
                <Avatar.Fallback
                  backgroundColor={colors.shiftlyViolet}
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

          {/* Icône de déconnexion */}
          {onLogoutClick && (
            <XStack
              cursor="pointer"
              hoverStyle={{ opacity: 0.8 }}
              onPress={onLogoutClick}
              padding="$2"
            >
              <LogOut size={20} color="#EF4444" />
            </XStack>
          )}
        </XStack>
      </XStack>
    </YStack>
  );
}
