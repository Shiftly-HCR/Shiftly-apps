"use client";

import { YStack, XStack, Text } from "tamagui";
import { Button, colors } from "@shiftly/ui";
import { SimpleCheckbox } from "./SimpleCheckbox";
import { type ApplicationStatus } from "@shiftly/data";

interface MissionCandidatesFiltersProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onBulkAction: (action: "shortlist" | "reject" | "accept") => void;
  isUpdating: boolean;
  statusFilter: ApplicationStatus | "all";
  onStatusFilterChange: (filter: ApplicationStatus | "all") => void;
}

export function MissionCandidatesFilters({
  selectedCount,
  totalCount,
  onSelectAll,
  onBulkAction,
  isUpdating,
  statusFilter,
  onStatusFilterChange,
}: MissionCandidatesFiltersProps) {
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <YStack gap="$4">
      {/* Filtres et actions en masse */}
      <XStack
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap="$3"
      >
        <XStack gap="$2" alignItems="center">
          <SimpleCheckbox checked={isAllSelected} onPress={onSelectAll} />
          <Text fontSize={14} color={colors.gray700}>
            {selectedCount > 0
              ? `${selectedCount} sélectionné(s)`
              : "Tout sélectionner"}
          </Text>
        </XStack>

        <XStack gap="$2" flexWrap="wrap">
          <Button
            variant="outline"
            size="sm"
            onPress={() => onBulkAction("shortlist")}
            disabled={selectedCount === 0 || isUpdating}
          >
            Sélectionner
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => onBulkAction("reject")}
            disabled={selectedCount === 0 || isUpdating}
          >
            Refuser
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => onBulkAction("accept")}
            disabled={selectedCount === 0 || isUpdating}
          >
            Confirmer
          </Button>
        </XStack>
      </XStack>

      {/* Filtres de statut */}
      <XStack gap="$2" flexWrap="wrap">
        {(["all", "applied", "shortlisted", "accepted"] as const).map(
          (filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? "primary" : "outline"}
              size="sm"
              onPress={() => onStatusFilterChange(filter)}
            >
              {filter === "all"
                ? "Tous"
                : filter === "applied"
                  ? "Reçu"
                  : filter === "shortlisted"
                    ? "Shortlist"
                    : "Confirmés"}
            </Button>
          )
        )}
      </XStack>
    </YStack>
  );
}

