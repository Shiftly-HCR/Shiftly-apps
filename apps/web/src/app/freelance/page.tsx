"use client";

import { YStack, XStack, ScrollView, Text } from "tamagui";
import {
  Button,
  FreelanceFilters,
  type FreelanceFiltersState,
  colors,
} from "@shiftly/ui";
import { FiGrid, FiList } from "react-icons/fi";
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
    filters,
    setFilters,
    filteredFreelances,
    activeFilterTags,
    removeFilter,
    clearAllFilters,
    getFullName,
    getTags,
    handleViewProfile,
    handleInvite,
  } = useFreelancePage();

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

          {/* Filtres actifs et vue */}
          <ActiveFilters
            filters={activeFilterTags}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
            viewToggle={{
              currentMode: viewMode as ViewMode,
              options: [
                { mode: "grid", icon: <FiGrid size={16} /> },
                { mode: "list", icon: <FiList size={16} /> },
              ],
              onModeChange: (mode) => setViewMode(mode as "grid" | "list"),
            }}
          />

          {/* Contenu principal avec filtres */}
          <XStack gap="$6" alignItems="flex-start">
            {/* Sidebar des filtres */}
            <YStack flexShrink={0}>
              <FreelanceFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </YStack>

            {/* Grille de freelances */}
            <YStack flex={1} gap="$4">
              {filteredFreelances.length === 0 ? (
                <EmptyState
                  title="Aucun freelance disponible pour le moment"
                  description="Revenez plus tard pour découvrir de nouveaux talents"
                />
              ) : (
                <XStack flexWrap="wrap" gap="$4" justifyContent="flex-start">
                  {filteredFreelances.map((freelance) => (
                    <YStack
                      key={freelance.id}
                      width={
                        viewMode === "grid" ? "calc(33.333% - 12px)" : "100%"
                      }
                      minWidth={viewMode === "grid" ? 280 : undefined}
                      position="relative"
                    >
                      <YStack
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
                            <Text fontSize={14} color={colors.gray700}>
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
                          </YStack>
                        </XStack>

                        {/* Tags/Badges */}
                        {getTags(freelance).length > 0 && (
                          <XStack gap="$2" flexWrap="wrap">
                            {getTags(freelance).map((tag, index) => (
                              <XStack
                                key={index}
                                paddingHorizontal="$2"
                                paddingVertical="$1"
                                borderRadius="$2"
                                backgroundColor={colors.gray100}
                                borderWidth={1}
                                borderColor={colors.gray200}
                              >
                                <Text fontSize={12} color={colors.gray700}>
                                  {tag}
                                </Text>
                              </XStack>
                            ))}
                          </XStack>
                        )}

                        {/* Boutons d'action */}
                        <XStack gap="$2" marginTop="$2">
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
                          <Button
                            variant="primary"
                            size="sm"
                            onPress={(e: any) => {
                              e.stopPropagation();
                              handleInvite(freelance.id);
                            }}
                            flex={1}
                          >
                            Inviter
                          </Button>
                        </XStack>
                      </YStack>
                    </YStack>
                  ))}
                </XStack>
              )}
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
