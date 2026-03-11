"use client";

import { useEffect, useState } from "react";
import { YStack, XStack, ScrollView, Text } from "tamagui";
import { Button, FreelanceFilters, colors } from "@shiftly/ui";
import { FiGrid, FiList, FiMapPin } from "react-icons/fi";
import {
  AppLayout,
  PageLoading,
  PageHeader,
  ActiveFilters,
  EmptyState,
} from "@/components";
import { useFreelancePage } from "@/hooks";
import type { ViewMode } from "@/components/ui/ViewToggle";

export default function FreelancePage() {
  const {
    isLoading,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    totalFreelances,
    filters,
    setFilters,
    filteredFreelances,
    activeFilterTags,
    removeFilter,
    clearAllFilters,
    getFullName,
    getTags,
    handleViewProfile,
  } = useFreelancePage();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack maxWidth={1400} width="100%" alignSelf="center" padding="$6">
          {/* En-tête */}
          <PageHeader
            title="Découvrez nos freelances"
            description="Trouvez le talent parfait pour votre mission parmi nos freelances qualifiés"
          />

          <XStack
            justifyContent="space-between"
            alignItems={isMobile ? "flex-start" : "center"}
            flexDirection={isMobile ? "column" : "row"}
            gap="$2"
            marginBottom="$4"
          >
            <Text fontSize={14} color={colors.gray700}>
              {totalFreelances} freelances au total
            </Text>
            <Text fontSize={14} color={colors.gray700}>
              {filteredFreelances.length} affichés sur cette page
            </Text>
          </XStack>

          {/* Filtres actifs ; toggle Liste/Carte uniquement sur desktop */}
          <ActiveFilters
            filters={activeFilterTags}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
            viewToggle={
              !isMobile
                ? {
                    currentMode: viewMode as ViewMode,
                    options: [
                      {
                        mode: "grid",
                        icon: <FiGrid size={16} />,
                        label: "Grille",
                      },
                      {
                        mode: "list",
                        icon: <FiList size={16} />,
                        label: "Liste",
                      },
                    ],
                    onModeChange: (mode) =>
                      setViewMode(mode as "grid" | "list"),
                  }
                : undefined
            }
          />

          {/* Contenu principal avec filtres */}
          <XStack
            gap="$6"
            alignItems="flex-start"
            flexDirection={isMobile ? "column" : "row"}
          >
            {/* Sidebar des filtres (mobile: bouton full-width; desktop: panneau) */}
            <YStack flexShrink={0} width={isMobile ? "100%" : undefined}>
              <FreelanceFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </YStack>

            {/* Grille de freelances */}
            <YStack flex={1} gap="$4" width={isMobile ? "100%" : undefined}>
              {filteredFreelances.length === 0 ? (
                <EmptyState
                  title="Aucun freelance disponible pour le moment"
                  description="Revenez plus tard pour découvrir de nouveaux talents"
                />
              ) : (
                <YStack gap="$4">
                  <XStack
                    flexWrap="wrap"
                    gap="$4"
                    justifyContent="flex-start"
                    alignItems="stretch"
                  >
                    {filteredFreelances.map((freelance) => (
                      <YStack
                        key={freelance.id}
                        width={
                          isMobile
                            ? "100%"
                            : viewMode === "grid"
                              ? "calc(33.333% - 12px)"
                              : "100%"
                        }
                        minWidth={
                          !isMobile && viewMode === "grid" ? 280 : undefined
                        }
                        position="relative"
                      >
                        {freelance.is_premium && (
                          <XStack
                            position="absolute"
                            top={8}
                            right={8}
                            width={30}
                            height={30}
                            alignItems="center"
                            justifyContent="center"
                            zIndex={2}
                          >
                            <img
                              src="/assets/img/certif.png"
                              alt="Profil certifié"
                              width={25}
                              height={25}
                              style={{ display: "block" }}
                            />
                          </XStack>
                        )}

                        <YStack
                          flex={1}
                          minHeight={
                            !isMobile && viewMode === "grid" ? 230 : undefined
                          }
                          backgroundColor={colors.white}
                          borderRadius={12}
                          padding="$4"
                          gap="$3"
                          borderWidth={1}
                          borderColor={colors.gray200}
                          cursor="pointer"
                          hoverStyle={{
                            borderColor: colors.shiftlyViolet,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                          }}
                          onPress={() => handleViewProfile(freelance.id)}
                        >
                          <YStack flex={1} gap="$3">
                            {/* Avatar et infos principales */}
                            <XStack gap="$3" alignItems="center">
                              <YStack position="relative">
                                <YStack
                                  width={60}
                                  height={60}
                                  borderRadius={30}
                                  backgroundColor={colors.shiftlyViolet}
                                  alignItems="center"
                                  justifyContent="center"
                                  overflow="hidden"
                                >
                                  {freelance.photo_url ? (
                                    <img
                                      src={freelance.photo_url}
                                      alt={getFullName(freelance)}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <Text
                                      color={colors.white}
                                      fontSize={24}
                                      fontWeight="600"
                                    >
                                      {getFullName(freelance)
                                        .charAt(0)
                                        .toUpperCase()}
                                    </Text>
                                  )}
                                </YStack>
                              </YStack>

                              <YStack flex={1} gap="$1">
                                <Text
                                  fontSize={18}
                                  fontWeight="700"
                                  color={colors.gray900}
                                >
                                  {getFullName(freelance)}
                                </Text>
                                <Text
                                  fontSize={14}
                                  color={colors.gray700}
                                  numberOfLines={2}
                                  ellipsizeMode="tail"
                                >
                                  {freelance.headline ||
                                    freelance.bio ||
                                    "Freelance"}
                                </Text>
                                {freelance.daily_rate && (
                                  <Text
                                    fontSize={14}
                                    color={colors.gray700}
                                    fontWeight="500"
                                  >
                                    {freelance.daily_rate} € / jour
                                  </Text>
                                )}
                                {freelance.city_of_residence && (
                                  <XStack gap="$1.5" alignItems="center">
                                    <FiMapPin
                                      size={13}
                                      color={colors.gray600}
                                    />
                                    <Text
                                      fontSize={13}
                                      color={colors.gray600}
                                      numberOfLines={1}
                                      ellipsizeMode="tail"
                                    >
                                      {freelance.city_of_residence}
                                    </Text>
                                  </XStack>
                                )}
                              </YStack>
                            </XStack>

                            {/* Compétences (badges sur 1 seule ligne, overflow masqué) */}
                            {getTags(freelance).length > 0 && (
                              <XStack
                                gap="$2"
                                flexWrap="nowrap"
                                overflow="hidden"
                                minHeight={30}
                                alignItems="center"
                              >
                                {getTags(freelance).map((tag, index) => (
                                  <XStack
                                    key={index}
                                    paddingHorizontal="$2"
                                    paddingVertical="$1"
                                    borderRadius="$2"
                                    backgroundColor={colors.gray100}
                                    borderWidth={1}
                                    borderColor={colors.gray200}
                                    maxWidth={170}
                                    flexShrink={0}
                                  >
                                    <Text
                                      fontSize={12}
                                      color={colors.gray700}
                                      numberOfLines={1}
                                      ellipsizeMode="tail"
                                    >
                                      {tag}
                                    </Text>
                                  </XStack>
                                ))}
                              </XStack>
                            )}
                          </YStack>

                          {/* Boutons d'action */}
                          <XStack gap="$2" marginTop="auto" paddingTop="$2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onPress={(e: any) => {
                                e.stopPropagation();
                                handleViewProfile(freelance.id);
                              }}
                              flex={1}
                            >
                              Voir profil
                            </Button>
                          </XStack>
                        </YStack>
                      </YStack>
                    ))}
                  </XStack>

                  <XStack
                    justifyContent="center"
                    alignItems="center"
                    gap="$3"
                    marginTop="$2"
                    flexWrap="wrap"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      onPress={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage <= 1}
                    >
                      Précédent
                    </Button>
                    <Text fontSize={14} color={colors.gray700}>
                      Page {currentPage} sur {totalPages}
                    </Text>
                    <Button
                      variant="secondary"
                      size="sm"
                      onPress={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage >= totalPages}
                    >
                      Suivant
                    </Button>
                  </XStack>
                </YStack>
              )}
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
