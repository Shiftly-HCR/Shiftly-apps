"use client";

import { useEffect, useState } from "react";
import { YStack, XStack, ScrollView } from "tamagui";
import { MissionFilters } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { Map, List } from "lucide-react";
import {
  AppLayout,
  PageLoading,
  ActiveFilters,
  EmptyState,
  MissionListView,
  MissionMapView,
} from "@/components";
import { useHomePage } from "@/hooks";
import { useCurrentProfile } from "@/hooks/queries";
import type { ViewMode } from "@/components/ui/ViewToggle";

export default function HomePage() {
  const router = useRouter();
  const { data: profile, isLoading: isLoadingProfile, isAuthResolved } = useCurrentProfile();
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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsMobile(
        typeof window !== "undefined" && window.innerWidth < 900
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isAuthResolved && profile?.role === "recruiter") {
      router.replace("/freelance");
    }
  }, [profile?.role, isAuthResolved, router]);

  // Afficher un loader pendant le chargement du profil ou si on est recruteur (en attente de redirection)
  if (isLoading || isLoadingProfile || !isAuthResolved || profile?.role === "recruiter") {
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
                { mode: "list", icon: <List size={16} />, label: "Liste" },
                { mode: "map", icon: <Map size={16} />, label: "Carte" },
              ],
              onModeChange: (mode) => setViewMode(mode as "list" | "map"),
            }}
          />

          {/* Contenu principal avec filtres */}
          <XStack
            gap="$6"
            alignItems="flex-start"
            marginTop="$4"
            flexDirection={isMobile ? "column" : "row"}
          >
            {/* Sidebar des filtres (mobile: full-width button row; desktop: panel) */}
            <YStack flexShrink={0} width={isMobile ? "100%" : undefined}>
              <MissionFilters filters={filters} onFiltersChange={setFilters} />
            </YStack>

            {/* Grille de missions OU Carte */}
            <YStack flex={1} gap="$4" width={isMobile ? "100%" : undefined}>
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
                  formatDate={formatDate}
                  isNewMission={isNewMission}
                />
              )}
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
