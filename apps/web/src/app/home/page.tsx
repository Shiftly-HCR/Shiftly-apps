"use client";

import { YStack, XStack, ScrollView } from "tamagui";
import { MissionFilters } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { FiMap, FiList } from "react-icons/fi";
import {
  AppLayout,
  PageLoading,
  ActiveFilters,
  EmptyState,
  MissionListView,
  MissionMapView,
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
                <MissionListView
                  missions={filteredMissions}
                  onMissionClick={handleMissionClick}
                  formatDate={formatDate}
                  isNewMission={isNewMission}
                />
              ) : (
                <MissionMapView
                  missions={filteredMissions}
                  onMissionClick={handleMissionClick}
                />
              )}
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
