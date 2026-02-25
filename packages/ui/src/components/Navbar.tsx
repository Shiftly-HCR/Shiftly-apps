import React, { useState, useEffect, useRef } from "react";
import { XStack, YStack, Text, Avatar, Image, ScrollView } from "tamagui";
import { LogOut, Menu, X } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { colors } from "../theme";

interface NavbarProps {
  onSearch?: (value: string) => void;
  /** Called on each keystroke; if not provided, onSearch is used for both typing and submit */
  onChangeText?: (value: string) => void;
  searchValue?: string;
  userAvatar?: string;
  userName?: string;
  userRole?: string;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
  onMissionsClick?: () => void;
  onSubscriptionClick?: () => void;
  onFreelanceClick?: () => void;
  onMessagingClick?: () => void;
  onCommercialClick?: () => void;
  onPaymentsClick?: () => void;
  onAdminDisputesClick?: () => void;
  onAdminDashboardClick?: () => void;
  onLogoutClick?: () => void;
}

// CSS media breakpoint: burger + hide logo/links below this width (no JS needed for first paint)
const NAVBAR_MOBILE_MAX_WIDTH = 900;

const navbarResponsiveStyles = `
.navbar-mobile-only { display: none !important; }
.navbar-desktop-only { display: flex !important; }
@media (max-width: ${NAVBAR_MOBILE_MAX_WIDTH}px) {
  .navbar-mobile-only { display: flex !important; }
  .navbar-desktop-only { display: none !important; }
}
`;

export function Navbar({
  onSearch,
  onChangeText,
  searchValue = "",
  userAvatar,
  userName = "Utilisateur",
  userRole,
  onHomeClick,
  onProfileClick,
  onMissionsClick,
  onSubscriptionClick,
  onFreelanceClick,
  onMessagingClick,
  onCommercialClick,
  onPaymentsClick,
  onAdminDisputesClick,
  onAdminDashboardClick,
  onLogoutClick,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const SCROLL_THRESHOLD = 60;

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < NAVBAR_MOBILE_MAX_WIDTH);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // On mobile: hide navbar when scrolling down, show when scrolling up
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      const current = window.scrollY ?? window.pageYOffset;
      if (window.innerWidth >= NAVBAR_MOBILE_MAX_WIDTH) {
        setNavbarVisible(true);
        lastScrollY.current = current;
        return;
      }
      if (current < lastScrollY.current) {
        setNavbarVisible(true);
      } else if (current > SCROLL_THRESHOLD) {
        setNavbarVisible(false);
      }
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
      return;
    }

    // Par défaut, rediriger selon le rôle si disponible
    if (typeof window !== "undefined") {
      if (userRole === "recruiter") {
        window.location.href = "/freelance";
      } else {
        window.location.href = "/";
      }
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

  const navbarContent = (
    <YStack
      backgroundColor={colors.white}
      borderBottomWidth={1}
      borderBottomColor={colors.gray200}
      paddingHorizontal="$3"
      paddingVertical="$3"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={1}
      shadowRadius={4}
      elevation={2}
      zIndex={1000}
      className="navbar-root"
      {...(isMobile && {
        position: "absolute" as const,
        top: 0,
        left: 0,
        right: 0,
        style: {
          position: "fixed",
          transform: navbarVisible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.25s ease-out",
        },
      })}
    >
        <XStack
          alignItems="center"
          maxWidth={1400}
          width="100%"
          alignSelf="center"
          justifyContent="space-between"
          gap="$4"
        >
          {/* Left: Burger (mobile only) + Logo + "Shiftly" (always visible) */}
          <XStack alignItems="center" gap="$2" flexShrink={0}>
            <XStack
              className="navbar-mobile-only"
              alignItems="center"
              cursor="pointer"
              hoverStyle={{ opacity: 0.8 }}
              onPress={() => setMenuOpen(true)}
              padding="$2"
            >
              <Menu size={24} color={colors.gray900} />
            </XStack>
            <XStack
              alignItems="center"
              gap="$2"
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
          </XStack>

          {/* Barre de recherche - Au centre (cachée sur mobile via CSS) */}
          <YStack
            className="navbar-desktop-only"
            flex={1}
            maxWidth={600}
            alignItems="center"
            justifyContent="center"
          >
            <SearchBar
              value={searchValue}
              onChangeText={onChangeText ?? onSearch}
              onSearch={() => onSearch && onSearch(searchValue || "")}
            />
          </YStack>

          {/* Menu navigation + Avatar + Logout */}
          <XStack
            alignItems="center"
            gap="$5"
            flexShrink={0}
          >
            {/* Liens de navigation - Cachés sur mobile via CSS */}
            <XStack className="navbar-desktop-only" alignItems="center" gap="$5">
              <>
                {/* Liens spécifiques aux admins */}
                {userRole === "admin" && (
                  <>
                    {onAdminDashboardClick && (
                      <Text
                        fontSize={14}
                        fontWeight="600"
                        color={colors.gray900}
                        cursor="pointer"
                        hoverStyle={{
                          color: colors.shiftlyViolet,
                        }}
                        onPress={onAdminDashboardClick}
                      >
                        Dashboard
                      </Text>
                    )}
                    {onAdminDisputesClick && (
                      <Text
                        fontSize={14}
                        fontWeight="600"
                        color={colors.gray900}
                        cursor="pointer"
                        hoverStyle={{
                          color: colors.shiftlyViolet,
                        }}
                        onPress={onAdminDisputesClick}
                      >
                        Litiges
                      </Text>
                    )}
                    {onMessagingClick && (
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
                    )}
                  </>
                )}
                {/* Liens pour les non-admins */}
                {userRole !== "admin" && (
                  <>
                    {/* Afficher le lien Commercial uniquement pour les commerciaux */}
                    {userRole === "commercial" && onCommercialClick && (
                      <Text
                        fontSize={14}
                        fontWeight="600"
                        color={colors.gray900}
                        cursor="pointer"
                        hoverStyle={{
                          color: colors.shiftlyViolet,
                        }}
                        onPress={onCommercialClick}
                      >
                        Dashboard commercial
                      </Text>
                    )}
                    {/* Lien Mes paiements pour freelances et commerciaux */}
                    {(userRole === "freelance" || userRole === "commercial") &&
                      onPaymentsClick && (
                        <Text
                          fontSize={14}
                          fontWeight="600"
                          color={colors.gray900}
                          cursor="pointer"
                          hoverStyle={{
                            color: colors.shiftlyViolet,
                          }}
                          onPress={onPaymentsClick}
                        >
                          Mes paiements
                        </Text>
                      )}
                    {/* Masquer les liens spécifiques aux recruteurs/freelances pour les commerciaux */}
                    {userRole !== "commercial" && (
                      <>
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
                  </>
                )}
              </>
            </XStack>

            {/* Avatar utilisateur */}
            <XStack
              cursor="pointer"
              hoverStyle={{ opacity: 0.8 }}
              onPress={onProfileClick}
            >
              <Avatar
                circular
                size={isMobile ? 32 : 40}
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
                      fontSize={isMobile ? 14 : 16}
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
                onPress={() => handleMenuClick(onLogoutClick)}
                role="button"
                tabIndex={0}
                padding="$2"
              >
                <LogOut size={isMobile ? 18 : 20} color="#EF4444" />
              </XStack>
            )}
          </XStack>
        </XStack>
      </YStack>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: navbarResponsiveStyles }} />
      {isMobile && <YStack height={56} width="100%" flexShrink={0} />}
      {navbarContent}
      {/* Menu Drawer pour mobile */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <YStack
            // @ts-expect-error: 'fixed' is required for overlay positioning, but not present in Tamagui types
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="rgba(0, 0, 0, 0.5)"
            zIndex={99999}
            onPress={() => setMenuOpen(false)}
          />

          {/* Menu Drawer - slides in from the left */}
          <YStack
            // @ts-expect-error: 'fixed' is used for mobile drawer, tamagui type may not match CSS
            position="fixed"
            top={0}
            left={0}
            bottom={0}
            width="85%"
            maxWidth={400}
            backgroundColor={colors.white}
            zIndex={100000}
            shadowColor="#000000"
            shadowOffset={{ width: 2, height: 0 }}
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
                      onChangeText={onChangeText ?? onSearch}
                      onSearch={() => {
                        onSearch && onSearch(searchValue || "");
                        setMenuOpen(false);
                      }}
                    />
                  </YStack>
                )}

                {/* Informations utilisateur (cliquable → profil) */}
                <XStack
                  alignItems="center"
                  gap="$3"
                  paddingVertical="$3"
                  borderBottomWidth={1}
                  borderBottomColor={colors.gray200}
                  marginBottom="$2"
                  cursor="pointer"
                  hoverStyle={{ backgroundColor: colors.gray050 }}
                  onPress={() => handleMenuClick(onProfileClick)}
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
                  {/* Liens spécifiques aux admins */}
                  {userRole === "admin" && (
                    <>
                      {onAdminDashboardClick && (
                        <MenuLink
                          label="Dashboard"
                          onPress={onAdminDashboardClick}
                        />
                      )}
                      {onAdminDisputesClick && (
                        <MenuLink
                          label="Litiges"
                          onPress={onAdminDisputesClick}
                        />
                      )}
                      {onMessagingClick && (
                        <MenuLink
                          label="Messagerie"
                          onPress={onMessagingClick}
                        />
                      )}
                    </>
                  )}
                  {/* Liens pour les non-admins */}
                  {userRole !== "admin" && (
                    <>
                      {/* Afficher le lien Commercial uniquement pour les commerciaux */}
                      {userRole === "commercial" && onCommercialClick && (
                        <MenuLink
                          label="Dashboard commercial"
                          onPress={onCommercialClick}
                        />
                      )}
                      {/* Lien Mes paiements pour freelances et commerciaux */}
                      {(userRole === "freelance" ||
                        userRole === "commercial") &&
                        onPaymentsClick && (
                          <MenuLink
                            label="Mes paiements"
                            onPress={onPaymentsClick}
                          />
                        )}
                      {/* Masquer les liens spécifiques aux recruteurs/freelances pour les commerciaux */}
                      {userRole !== "commercial" && (
                        <>
                          <MenuLink
                            label="Mes missions"
                            onPress={onMissionsClick}
                          />
                          <MenuLink
                            label="Abonnement"
                            onPress={onSubscriptionClick}
                          />
                          <MenuLink
                            label="Freelance"
                            onPress={onFreelanceClick}
                          />
                          <MenuLink
                            label="Messagerie"
                            onPress={onMessagingClick}
                          />
                        </>
                      )}
                    </>
                  )}
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
