import React, { useState, useEffect } from "react";
import { XStack, YStack, Text, Avatar, Image, ScrollView } from "tamagui";
import { LogOut, Menu, X } from "lucide-react";
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

const MOBILE_BREAKPOINT = 768;

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
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Marquer le composant comme monté après l'hydratation
    setMounted(true);
    
    const checkScreenSize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }
    };

    checkScreenSize();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkScreenSize);
      return () => window.removeEventListener("resize", checkScreenSize);
    }
  }, []);

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
      return;
    }

    if (typeof window !== "undefined") {
      window.location.href = "/home";
    }
  };

  const handleMenuClick = (callback?: () => void) => {
    setMenuOpen(false);
    if (callback) {
      callback();
    }
  };

  const MenuLink = ({
    label,
    onPress,
  }: {
    label: string;
    onPress?: () => void;
  }) => (
    <Text
      fontSize={16}
      fontWeight="600"
      color={colors.gray900}
      cursor="pointer"
      paddingVertical="$3"
      paddingHorizontal="$4"
      hoverStyle={{
        color: colors.shiftlyViolet,
        backgroundColor: colors.gray050,
      }}
      onPress={() => handleMenuClick(onPress)}
    >
      {label}
    </Text>
  );

  return (
    <>
      <YStack
        backgroundColor={colors.white}
        borderBottomWidth={1}
        borderBottomColor={colors.gray200}
        paddingHorizontal={isMobile ? "$3" : "$6"}
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
          gap={isMobile ? "$2" : "$4"}
        >
          {/* Logo + Menu Burger (mobile) */}
          <XStack alignItems="center" gap="$2" flexShrink={0}>
            {/* Menu Burger - Visible uniquement sur mobile */}
            {mounted && isMobile && (
              <XStack
                cursor="pointer"
                hoverStyle={{ opacity: 0.8 }}
                onPress={() => setMenuOpen(true)}
                padding="$2"
              >
                <Menu size={24} color={colors.gray900} />
              </XStack>
            )}

            <XStack
              alignItems="center"
              gap="$2"
              cursor="pointer"
              hoverStyle={{ opacity: 0.8 }}
              onPress={handleHomeClick}
            >
              <Image
                source={{ uri: "/logo-shiftly.png" }}
                width={mounted && isMobile ? 32 : 40}
                height={mounted && isMobile ? 32 : 40}
                borderRadius={20}
              />
              {(!mounted || !isMobile) && (
                <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                  Shiftly
                </Text>
              )}
            </XStack>
          </XStack>

          {/* Barre de recherche - Au centre (cachée sur mobile) */}
          {(!mounted || !isMobile) && (
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
          )}

          {/* Menu navigation + Avatar + Logout - Tout à droite */}
          <XStack
            alignItems="center"
            gap={mounted && isMobile ? "$2" : "$5"}
            flexShrink={0}
          >
            {/* Liens de navigation - Cachés sur mobile */}
            {(!mounted || !isMobile) && (
              <>
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
              </>
            )}

            {/* Avatar utilisateur */}
            <XStack
              cursor="pointer"
              hoverStyle={{ opacity: 0.8 }}
              onPress={onProfileClick}
            >
              <Avatar
                circular
                size={mounted && isMobile ? 32 : 40}
                backgroundColor={colors.shiftlyViolet}
              >
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
                      fontSize={mounted && isMobile ? 14 : 16}
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
                <LogOut size={mounted && isMobile ? 18 : 20} color="#EF4444" />
              </XStack>
            )}
          </XStack>
        </XStack>
      </YStack>

      {/* Menu Drawer pour mobile - Rendu uniquement après hydratation */}
      {mounted && menuOpen && (
        <>
          {/* Overlay */}
          <YStack
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="rgba(0, 0, 0, 0.5)"
            zIndex={99999}
            onPress={() => setMenuOpen(false)}
          />

          {/* Menu Drawer */}
          <YStack
            position="fixed"
            top={0}
            right={0}
            bottom={0}
            width="85%"
            maxWidth={400}
            backgroundColor={colors.white}
            zIndex={100000}
            shadowColor="#000000"
            shadowOffset={{ width: -2, height: 0 }}
            shadowOpacity={0.25}
            shadowRadius={10}
            elevation={10}
          >
            <ScrollView flex={1}>
              <YStack gap="$2" width="100%" padding="$4">
                {/* Header du menu */}
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  marginBottom="$2"
                >
                  <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                    Menu
                  </Text>
                  <XStack
                    cursor="pointer"
                    hoverStyle={{ opacity: 0.8 }}
                    onPress={() => setMenuOpen(false)}
                    padding="$2"
                  >
                    <X size={24} color={colors.gray900} />
                  </XStack>
                </XStack>

                {/* Barre de recherche dans le menu mobile */}
                {isMobile && (
                  <YStack marginBottom="$4">
                    <SearchBar
                      value={searchValue}
                      onChangeText={onSearch}
                      onSearch={() => {
                        onSearch && onSearch(searchValue || "");
                        setMenuOpen(false);
                      }}
                    />
                  </YStack>
                )}

                {/* Informations utilisateur */}
                <XStack
                  alignItems="center"
                  gap="$3"
                  paddingVertical="$3"
                  borderBottomWidth={1}
                  borderBottomColor={colors.gray200}
                  marginBottom="$2"
                >
                  <Avatar
                    circular
                    size={48}
                    backgroundColor={colors.shiftlyViolet}
                  >
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
                          fontSize={18}
                          fontWeight="600"
                          textAlign="center"
                        >
                          {userName.charAt(0).toUpperCase()}
                        </Text>
                      </Avatar.Fallback>
                    )}
                  </Avatar>
                  <YStack flex={1}>
                    <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                      {userName}
                    </Text>
                    <Text fontSize={14} color={colors.gray500}>
                      Voir mon profil
                    </Text>
                  </YStack>
                </XStack>

                {/* Liens de navigation */}
                <YStack gap="$1" marginTop="$2">
                  <MenuLink label="Profil" onPress={onProfileClick} />
                  <MenuLink label="Mes missions" onPress={onMissionsClick} />
                  <MenuLink
                    label="Abonnement"
                    onPress={onSubscriptionClick}
                  />
                  <MenuLink label="Freelance" onPress={onFreelanceClick} />
                  <MenuLink label="Messagerie" onPress={onMessagingClick} />
                </YStack>

                {/* Déconnexion */}
                {onLogoutClick && (
                  <XStack
                    marginTop="$4"
                    paddingTop="$4"
                    borderTopWidth={1}
                    borderTopColor={colors.gray200}
                  >
                    <XStack
                      cursor="pointer"
                      hoverStyle={{
                        opacity: 0.8,
                        backgroundColor: colors.gray050,
                      }}
                      onPress={() => handleMenuClick(onLogoutClick)}
                      paddingVertical="$3"
                      paddingHorizontal="$4"
                      alignItems="center"
                      gap="$2"
                      width="100%"
                    >
                      <LogOut size={20} color="#EF4444" />
                      <Text
                        fontSize={16}
                        fontWeight="600"
                        color="#EF4444"
                        flex={1}
                      >
                        Déconnexion
                      </Text>
                    </XStack>
                  </XStack>
                )}
              </YStack>
            </ScrollView>
          </YStack>
        </>
      )}
    </>
  );
}
