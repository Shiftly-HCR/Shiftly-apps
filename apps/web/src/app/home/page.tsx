"use client";

import { YStack, XStack, ScrollView } from "tamagui";
import { Badge, MissionCard, MissionFilters } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { FiMap, FiList } from "react-icons/fi";
import {
  AppLayout,
  PageLoading,
  ActiveFilters,
  EmptyState,
  MapLoader,
} from "@/components";
import { useHomePage } from "@/hooks";
import type { ViewMode } from "@/components/ui/ViewToggle";

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
          <ActiveFilters
            filters={activeFilterTags}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
            viewToggle={{
              currentMode: viewMode as ViewMode,
              options: [
                { mode: "list", icon: <FiList size={16} />, label: "Liste" },
                { mode: "map", icon: <FiMap size={16} />, label: "Carte" },
              ],
              onModeChange: (mode) => setViewMode(mode as "list" | "map"),
            }}
          />

          {/* Contenu principal avec filtres */}
          <XStack gap="$6" alignItems="flex-start" marginTop="$4">
            {/* Sidebar des filtres */}
            <YStack flexShrink={0}>
              <MissionFilters filters={filters} onFiltersChange={setFilters} />
            </YStack>

            {/* Grille de missions OU Carte */}
            <YStack flex={1} gap="$4">
              {filteredMissions.length === 0 ? (
                <EmptyState
                  title="Aucune mission disponible pour le moment"
                  description="Revenez plus tard pour découvrir de nouvelles opportunités"
                />
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
