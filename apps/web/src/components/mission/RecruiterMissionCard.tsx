"use client";

import { YStack, XStack } from "tamagui";
import { MissionCard, Button } from "@shiftly/ui";
import { StatusBadge } from "@/components";
import { colors } from "@shiftly/ui";
import { Trash2 } from "lucide-react";
import type { Mission } from "@shiftly/data";

interface RecruiterMissionCardProps {
  mission: Mission;
  onPress: () => void;
  onEdit: () => void;
  onManageCandidates: () => void;
  onDelete: () => void;
  isMobile?: boolean;
}

export function RecruiterMissionCard({
  mission,
  onPress,
  onEdit,
  onManageCandidates,
  onDelete,
  isMobile = false,
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
    <YStack
      width={isMobile ? "100%" : "calc(33.333% - 12px)"}
      minWidth={isMobile ? undefined : 300}
      position="relative"
    >
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

      {/* Bouton de suppression */}
      <XStack
        position="absolute"
        top="$2"
        right="$2"
        zIndex={10}
      >
        <Button
          variant="outline"
          size="sm"
          circular
          backgroundColor="rgba(255, 255, 255, 0.95)"
          borderColor="#EF4444"
          onPress={(e: any) => {
            e?.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 size={16} color="#EF4444" />
        </Button>
      </XStack>
    </YStack>
  );
}
