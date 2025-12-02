"use client";

import { YStack } from "tamagui";
import { MissionCard } from "@shiftly/ui";
import { StatusBadge } from "@/components";
import { colors } from "@shiftly/ui";
import type { Mission } from "@shiftly/data";

interface RecruiterMissionCardProps {
  mission: Mission;
  onPress: () => void;
  onEdit: () => void;
  onManageCandidates: () => void;
}

export function RecruiterMissionCard({
  mission,
  onPress,
  onEdit,
  onManageCandidates,
}: RecruiterMissionCardProps) {
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "published":
        return "Publié";
      case "draft":
        return "Brouillon";
      case "closed":
        return "Fermé";
      case "cancelled":
        return "Annulé";
      default:
        return "Brouillon";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "published":
        return "#10B981";
      case "draft":
        return colors.gray500;
      case "closed":
        return "#EF4444";
      case "cancelled":
        return colors.gray500;
      default:
        return colors.gray500;
    }
  };

  return (
    <YStack width="calc(33.333% - 12px)" minWidth={300} position="relative">
      <MissionCard
        title={mission.title}
        date={
          mission.start_date && mission.end_date
            ? `Du ${new Date(mission.start_date).toLocaleDateString("fr-FR")} au ${new Date(mission.end_date).toLocaleDateString("fr-FR")}`
            : "Dates non définies"
        }
        price={mission.hourly_rate ? `${mission.hourly_rate}€` : "Non défini"}
        priceUnit="/ heure"
        image={mission.image_url}
        missionId={mission.id}
        onPress={onPress}
        onEdit={onEdit}
        onManageCandidates={onManageCandidates}
      />

      {/* Badge de statut */}
      <StatusBadge
        label={getStatusLabel(mission.status)}
        backgroundColor={getStatusColor(mission.status)}
      />
    </YStack>
  );
}
