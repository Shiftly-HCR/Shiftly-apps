"use client";

import { YStack, XStack, Text, Image } from "tamagui";
import { RefreshCw, MapPin } from "lucide-react";
import { Button } from "@shiftly/ui";
import type {
  ApplicationStatus,
  MissionApplicationWithProfile,
} from "@shiftly/data";
import { getStatusLabel, getStatusColor } from "@/utils/missionHelpers";

interface MissionApplicationsSectionProps {
  applications: MissionApplicationWithProfile[];
  isLoadingApplications: boolean;
  isUpdatingStatus: boolean;
  onRefresh: () => void;
  onStatusChange: (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => Promise<void>;
}

export function MissionApplicationsSection({
  applications,
  isLoadingApplications,
  isUpdatingStatus,
  onRefresh,
  onStatusChange,
}: MissionApplicationsSectionProps) {
  const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    await onStatusChange(applicationId, newStatus);
  };

  const getAvailableStatuses = (
    currentStatus: ApplicationStatus
  ): ApplicationStatus[] => {
    switch (currentStatus) {
      case "pending":
        return ["shortlisted", "rejected", "accepted"];
      case "applied":
        return ["shortlisted", "rejected"];
      case "shortlisted":
        return ["accepted", "rejected"];
      case "rejected":
      case "accepted":
      case "withdrawn":
        return [];
      default:
        return [];
    }
  };

  return (
    <YStack
      backgroundColor="white"
      borderRadius={12}
      padding="$5"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
      gap="$4"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize={18} fontWeight="bold" color="#000">
          Candidatures ({applications.length})
        </Text>
      </XStack>

      {isLoadingApplications ? (
        <YStack padding="$4" alignItems="center">
          <Text fontSize={14} color="#666">
            Chargement des candidatures...
          </Text>
        </YStack>
      ) : applications.length === 0 ? (
        <YStack padding="$4" alignItems="center" gap="$2">
          <Text fontSize={14} color="#666">
            Aucune candidature pour le moment
          </Text>
        </YStack>
      ) : (
        <YStack gap="$3">
          {applications.map((application) => {
            const availableStatuses = getAvailableStatuses(application.status);
            const profileName = application.profile
              ? `${application.profile.first_name || ""} ${application.profile.last_name || ""}`.trim() ||
                "Nom non renseigné"
              : "Utilisateur inconnu";

            return (
              <YStack
                key={application.id}
                padding="$4"
                backgroundColor="#F8F9FA"
                borderRadius={8}
                borderWidth={1}
                borderColor="#E5E7EB"
                gap="$3"
              >
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <YStack flex={1} gap="$2">
                    <Text fontSize={16} fontWeight="600" color="#000">
                      {profileName}
                    </Text>
                    {application.profile?.headline && (
                      <Text fontSize={14} color="#666">
                        {application.profile.headline}
                      </Text>
                    )}
                    {application.profile?.location && (
                      <XStack alignItems="center" gap="$1">
                        <MapPin
                          size={12}
                          color="#999"
                          style={{ flexShrink: 0 }}
                        />
                        <Text fontSize={12} color="#999">
                          {application.profile.location}
                        </Text>
                      </XStack>
                    )}
                    <XStack
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius={4}
                      backgroundColor={
                        getStatusColor(application.status) + "20"
                      }
                      alignSelf="flex-start"
                    >
                      <Text
                        fontSize={12}
                        fontWeight="600"
                        color={getStatusColor(application.status)}
                      >
                        {getStatusLabel(application.status)}
                      </Text>
                    </XStack>
                  </YStack>
                  {application.profile?.photo_url && (
                    <YStack
                      width={50}
                      height={50}
                      borderRadius={25}
                      overflow="hidden"
                      backgroundColor="#E5E7EB"
                    >
                      <Image
                        source={{
                          uri: application.profile.photo_url,
                        }}
                        width="100%"
                        height="100%"
                        resizeMode="cover"
                      />
                    </YStack>
                  )}
                </XStack>

                {application.cover_letter && (
                  <YStack padding="$3" backgroundColor="white" borderRadius={6}>
                    <Text
                      fontSize={12}
                      fontWeight="600"
                      color="#666"
                      marginBottom="$1"
                    >
                      Message de motivation :
                    </Text>
                    <Text fontSize={13} color="#333" lineHeight={18}>
                      {application.cover_letter}
                    </Text>
                  </YStack>
                )}

                {availableStatuses.length > 0 && (
                  <XStack gap="$2" flexWrap="wrap">
                    {availableStatuses.map((status) => (
                      <Button
                        key={status}
                        variant="outline"
                        size="sm"
                        onPress={() =>
                          handleStatusChange(application.id, status)
                        }
                        disabled={isUpdatingStatus}
                        backgroundColor={
                          status === "accepted"
                            ? "#10B981"
                            : status === "rejected"
                              ? "#EF4444"
                              : undefined
                        }
                        color={
                          status === "accepted" || status === "rejected"
                            ? "white"
                            : undefined
                        }
                      >
                        {getStatusLabel(status)}
                      </Button>
                    ))}
                  </XStack>
                )}

                <Text fontSize={11} color="#999">
                  Candidature envoyée le{" "}
                  {application.created_at
                    ? new Date(application.created_at).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "Date inconnue"}
                </Text>
              </YStack>
            );
          })}
        </YStack>
      )}
    </YStack>
  );
}
