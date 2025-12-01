"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { Badge, MissionCard, MissionFilters, colors } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { FiMap, FiList } from "react-icons/fi";
import { AppLayout, PageLoading } from "@/components";
import { useHomePage } from "@/hooks";
import { MapLoader } from "@/components";

export default function HomePage() {
  const router = useRouter();
  const {
    isLoading,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    filteredMissions,
    activeFilterTags,
    removeFilter,
    clearAllFilters,
    formatDate,
    isNewMission,
    handleMissionClick,
  } = useHomePage();

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <AppLayout>
      {/* Contenu principal */}
      <ScrollView flex={1}>
        <YStack maxWidth={1400} width="100%" alignSelf="center" padding="$6">
          {/* Filtres actifs et vue */}
          {activeFilterTags.length > 0 && (
            <XStack
              paddingVertical="$4"
              gap="$3"
              flexWrap="wrap"
              alignItems="center"
            >
              <Text fontSize={14} color={colors.gray700} fontWeight="600">
                Filtres actifs:
              </Text>

              {activeFilterTags.map((tag) => (
                <XStack
                  key={tag}
                  paddingHorizontal="$3"
                  paddingVertical="$1.5"
                  backgroundColor={colors.white}
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor={colors.gray200}
                  gap="$2"
                  alignItems="center"
                >
                  <Text fontSize={13} color={colors.gray900} fontWeight="500">
                    {tag}
                  </Text>
                  <Text
                    fontSize={16}
                    color={colors.gray700}
                    cursor="pointer"
                    hoverStyle={{ color: "#EF4444" }}
                    onPress={() => removeFilter(tag)}
                  >
                    ✕
                  </Text>
                </XStack>
              ))}

              <Text
                fontSize={13}
                color={colors.shiftlyViolet}
                fontWeight="600"
                cursor="pointer"
                textDecorationLine="underline"
                hoverStyle={{ opacity: 0.8 }}
                onPress={clearAllFilters}
              >
                Effacer tout
              </Text>

              {/* Toggle Liste/Carte */}
              <XStack marginLeft="auto" gap="$2">
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  backgroundColor={
                    viewMode === "list" ? colors.shiftlyViolet : colors.white
                  }
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor={
                    viewMode === "list" ? colors.shiftlyViolet : colors.gray200
                  }
                  gap="$2"
                  alignItems="center"
                  cursor="pointer"
                  hoverStyle={{
                    borderColor: colors.shiftlyViolet,
                    backgroundColor:
                      viewMode === "list"
                        ? colors.shiftlyViolet
                        : colors.shiftlyVioletLight,
                  }}
                  onPress={() => setViewMode("list")}
                >
                  <FiList
                    size={16}
                    color={viewMode === "list" ? "#fff" : colors.gray900}
                  />
                  <Text
                    fontSize={13}
                    color={viewMode === "list" ? "#fff" : colors.gray900}
                    fontWeight="600"
                  >
                    Liste
                  </Text>
                </XStack>

                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  backgroundColor={
                    viewMode === "map" ? colors.shiftlyViolet : colors.white
                  }
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor={
                    viewMode === "map" ? colors.shiftlyViolet : colors.gray200
                  }
                  gap="$2"
                  alignItems="center"
                  cursor="pointer"
                  hoverStyle={{
                    borderColor: colors.shiftlyViolet,
                    backgroundColor:
                      viewMode === "map"
                        ? colors.shiftlyViolet
                        : colors.shiftlyVioletLight,
                  }}
                  onPress={() => setViewMode("map")}
                >
                  <FiMap
                    size={16}
                    color={viewMode === "map" ? "#fff" : colors.shiftlyViolet}
                  />
                  <Text
                    fontSize={13}
                    color={viewMode === "map" ? "#fff" : colors.gray900}
                    fontWeight="600"
                  >
                    Carte
                  </Text>
                </XStack>
              </XStack>
            </XStack>
          )}

          {/* Contenu principal avec filtres */}
          <XStack gap="$6" alignItems="flex-start" marginTop="$4">
            {/* Sidebar des filtres */}
            <YStack flexShrink={0}>
              <MissionFilters filters={filters} onFiltersChange={setFilters} />
            </YStack>

            {/* Grille de missions OU Carte */}
            <YStack flex={1} gap="$4">
              {filteredMissions.length === 0 ? (
                <YStack
                  padding="$8"
                  alignItems="center"
                  justifyContent="center"
                  gap="$4"
                >
                  <Text fontSize={18} color={colors.gray700} textAlign="center">
                    Aucune mission disponible pour le moment
                  </Text>
                  <Text fontSize={14} color={colors.gray500} textAlign="center">
                    Revenez plus tard pour découvrir de nouvelles opportunités
                  </Text>
                </YStack>
              ) : viewMode === "list" ? (
                <XStack flexWrap="wrap" gap="$4" justifyContent="flex-start">
                  {filteredMissions.map((mission) => (
                    <YStack
                      key={mission.id}
                      width="calc(33.333% - 12px)"
                      minWidth={300}
                      position="relative"
                      cursor="pointer"
                      onPress={() => handleMissionClick(mission.id)}
                    >
                      {isNewMission(mission.created_at) && (
                        <YStack
                          position="absolute"
                          top={12}
                          left={12}
                          zIndex={10}
                        >
                          <Badge variant="new" size="sm">
                            Nouveau
                          </Badge>
                        </YStack>
                      )}
                      <MissionCard
                        title={mission.title}
                        date={formatDate(mission.start_date, mission.end_date)}
                        price={
                          mission.hourly_rate
                            ? `${mission.hourly_rate}€`
                            : "À négocier"
                        }
                        priceUnit="/ heure"
                        image={mission.image_url}
                      />
                    </YStack>
                  ))}
                </XStack>
              ) : (
                <MapLoader
                  latitude={48.8566}
                  longitude={2.3522}
                  zoom={11}
                  height={600}
                  markers={filteredMissions
                    .filter((m) => m.latitude && m.longitude)
                    .map((mission) => ({
                      id: mission.id,
                      latitude: mission.latitude!,
                      longitude: mission.longitude!,
                      title: mission.title,
                      onClick: () => handleMissionClick(mission.id),
                    }))}
                  interactive={true}
                />
              )}
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
