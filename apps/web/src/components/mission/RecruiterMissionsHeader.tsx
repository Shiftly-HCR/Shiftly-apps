"use client";

import { XStack } from "tamagui";
import { PageHeader, StatisticsCard } from "@/components";
import { colors } from "@shiftly/ui";
import type { Mission } from "@shiftly/data";

interface RecruiterMissionsHeaderProps {
  missions: Mission[];
}

export function RecruiterMissionsHeader({
  missions,
}: RecruiterMissionsHeaderProps) {
  const publishedCount = missions.filter((m) => m.status === "published").length;
  const draftCount = missions.filter((m) => m.status === "draft").length;

  return (
    <>
      {/* En-tête */}
      <PageHeader
        title="Mes missions"
        description="Gérez vos missions et créez-en de nouvelles"
      />

      {/* Statistiques rapides */}
      <XStack gap="$4" flexWrap="wrap">
        <StatisticsCard label="Total des missions" value={missions.length} />
        <StatisticsCard
          label="Missions publiées"
          value={publishedCount}
          valueColor={colors.shiftlyViolet}
        />
        <StatisticsCard
          label="Brouillons"
          value={draftCount}
          valueColor={colors.gray500}
        />
      </XStack>
    </>
  );
}

