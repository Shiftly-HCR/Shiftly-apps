"use client";

import { YStack, XStack, Text, ScrollView, Image } from "tamagui";
import { useRouter } from "next/navigation";
import { Button, colors } from "@shiftly/ui";
import type { ApplicationStatus } from "@shiftly/data";
import {
  AppLayout,
  ChatThread,
  MessageInput,
  PageLoading,
  MissionMapView,
} from "@/components";
import { openConversation } from "@/utils/chatService";
import { getStatusLabel, getStatusColor } from "@/utils/missionHelpers";
import { useMissionDetailPage } from "@/hooks";

export default function MissionDetailPage() {
  const router = useRouter();
  const {
    missionId,
    mission,
    isLoading,
    profile,
    isRecruiter,
    isMissionOwner,
    applications,
    isLoadingApplications,
    isUpdatingStatus,
    freelanceApplication,
    isFreelanceAccepted,
    showSuccessMessage,
    selectedFreelanceId,
    setSelectedFreelanceId,
    chatFreelanceId,
    canFreelanceChat,
    chat,
    apply,
    isApplying,
    applyError,
    applySuccess,
    hasApplied,
    isCheckingApplication,
    updateStatus,
    refetchApplications,
    handleApply,
    formatDateShort,
  } = useMissionDetailPage();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!mission) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$6"
          gap="$4"
        >
          <Text fontSize={20} fontWeight="700" color="#000">
            Mission introuvable
          </Text>
          <Button variant="primary" onPress={() => router.push("/home")}>
            Retour à l'accueil
          </Button>
        </YStack>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollView backgroundColor="#f5f5f5">
        <YStack
          padding="$6"
          maxWidth={1400}
          marginHorizontal="auto"
          width="100%"
        >
          {/* Header: Titre + Prix alignés */}
          <XStack
            justifyContent="space-between"
            alignItems="baseline"
            marginBottom="$4"
            flexWrap="wrap"
            gap="$3"
          >
            <Text fontSize={32} fontWeight="bold" color="#000" flex={1}>
              {mission.title}
            </Text>
            <Text fontSize={32} fontWeight="bold" color={colors.shiftlyViolet}>
              {mission.hourly_rate}€/h
            </Text>
          </XStack>

          {/* Location */}
          <XStack alignItems="center" gap="$2" marginBottom="$6">
            <Text fontSize={16} color="#666">
              📍 {mission.city || mission.address || "Paris"}
            </Text>
          </XStack>

          {/* Layout 2 colonnes */}
          <XStack
            gap="$4"
            alignItems="flex-start"
            $sm={{ flexDirection: "column" }}
          >
            {/* COLONNE GAUCHE */}
            <YStack flex={1} gap="$4" minWidth={300} $sm={{ width: "100%" }}>
              {/* Image de la mission */}
              {mission.image_url && (
                <YStack
                  backgroundColor="white"
                  borderRadius={12}
                  overflow="hidden"
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.1}
                  shadowRadius={8}
                >
                  <Image
                    source={{ uri: mission.image_url }}
                    width="100%"
                    height={400}
                    resizeMode="cover"
                  />
                </YStack>
              )}

              {/* Description */}
              <YStack
                backgroundColor="white"
                borderRadius={12}
                padding="$5"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={8}
              >
                <Text
                  fontSize={18}
                  fontWeight="bold"
                  marginBottom="$3"
                  color="#000"
                >
                  Description de la mission
                </Text>
                <Text fontSize={14} color="#666" lineHeight={22}>
                  {mission.description || "une mission classique de serveur"}
                </Text>
              </YStack>

              {/* Horaires et durée */}
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
                <Text fontSize={18} fontWeight="bold" color="#000">
                  Horaires et durée
                </Text>

                {/* Dates avec icône calendrier */}
                <XStack gap="$3" alignItems="center">
                  <YStack
                    backgroundColor={colors.shiftlyVioletLight}
                    borderRadius={8}
                    padding="$3"
                    alignItems="center"
                    justifyContent="center"
                    minWidth={70}
                    minHeight={70}
                  >
                    <Text
                      fontSize={28}
                      fontWeight="bold"
                      color={colors.shiftlyViolet}
                    >
                      {mission.start_date
                        ? new Date(mission.start_date).getDate()
                        : "17"}
                    </Text>
                    <Text fontSize={12} color="#666" textTransform="capitalize">
                      {mission.start_date
                        ? new Date(mission.start_date).toLocaleDateString(
                            "fr-FR",
                            { month: "short" }
                          )
                        : "juil"}
                    </Text>
                  </YStack>

                  <YStack flex={1}>
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color="#000"
                      marginBottom="$1"
                    >
                      Dates
                    </Text>
                    <Text fontSize={14} color="#666">
                      {formatDateShort(mission.start_date, mission.end_date)}
                    </Text>
                  </YStack>
                </XStack>

                {/* Horaires avec icône horloge */}
                <XStack alignItems="center" gap="$3">
                  <YStack
                    width={70}
                    height={70}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={40}>🕐</Text>
                  </YStack>
                  <YStack flex={1}>
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color="#000"
                      marginBottom="$1"
                    >
                      Horaires
                    </Text>
                    <Text fontSize={14} color="#666">
                      {mission.start_time && mission.end_time
                        ? `${mission.start_time} - ${mission.end_time}`
                        : "Horaires non définis"}
                    </Text>
                    <Text fontSize={12} color="#999" marginTop="$1">
                      Service de restaurant
                    </Text>
                  </YStack>
                </XStack>
              </YStack>

              {/* Compétences requises */}
              {mission.skills && mission.skills.length > 0 && (
                <YStack
                  backgroundColor="white"
                  borderRadius={12}
                  padding="$5"
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.1}
                  shadowRadius={8}
                >
                  <Text
                    fontSize={18}
                    fontWeight="bold"
                    marginBottom="$3"
                    color="#000"
                  >
                    Compétences requises
                  </Text>
                  <XStack gap="$2" flexWrap="wrap">
                    {mission.skills.map((skill, index) => (
                      <YStack
                        key={index}
                        backgroundColor="#F0F0F0"
                        paddingHorizontal="$3"
                        paddingVertical="$2"
                        borderRadius={20}
                      >
                        <Text fontSize={14} color="#333">
                          {skill}
                        </Text>
                      </YStack>
                    ))}
                  </XStack>
                </YStack>
              )}

              {/* Localisation */}
              <YStack
                backgroundColor="white"
                borderRadius={12}
                padding="$5"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={8}
              >
                <Text
                  fontSize={18}
                  fontWeight="bold"
                  marginBottom="$3"
                  color="#000"
                >
                  Localisation
                </Text>
                <Text fontSize={14} color="#666" marginBottom="$2">
                  {mission.address || "85 boulevard brune"}
                </Text>
                <Text fontSize={14} color="#666" marginBottom="$3">
                  {mission.postal_code || "75000"} {mission.city || "Paris"}
                </Text>
                <MissionMapView
                  missions={[mission]}
                  onMissionClick={() => {}}
                  latitude={mission.latitude || 48.8566}
                  longitude={mission.longitude || 2.3522}
                  zoom={15}
                  height={300}
                />
              </YStack>

              {/* Section Candidatures (pour les recruteurs) */}
              {isRecruiter && isMissionOwner && (
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
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => refetchApplications()}
                      disabled={isLoadingApplications}
                    >
                      Actualiser
                    </Button>
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
                        const handleStatusChange = async (
                          newStatus: ApplicationStatus
                        ) => {
                          const result = await updateStatus(
                            application.id,
                            newStatus
                          );
                          if (result.success) {
                            refetchApplications();
                          } else {
                            alert(
                              result.error || "Erreur lors de la mise à jour"
                            );
                          }
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

                        const availableStatuses = getAvailableStatuses(
                          application.status
                        );
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
                            <XStack
                              justifyContent="space-between"
                              alignItems="flex-start"
                            >
                              <YStack flex={1} gap="$2">
                                <Text
                                  fontSize={16}
                                  fontWeight="600"
                                  color="#000"
                                >
                                  {profileName}
                                </Text>
                                {application.profile?.headline && (
                                  <Text fontSize={14} color="#666">
                                    {application.profile.headline}
                                  </Text>
                                )}
                                {application.profile?.location && (
                                  <Text fontSize={12} color="#999">
                                    📍 {application.profile.location}
                                  </Text>
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
                              <YStack
                                padding="$3"
                                backgroundColor="white"
                                borderRadius={6}
                              >
                                <Text
                                  fontSize={12}
                                  fontWeight="600"
                                  color="#666"
                                  marginBottom="$1"
                                >
                                  Message de motivation :
                                </Text>
                                <Text
                                  fontSize={13}
                                  color="#333"
                                  lineHeight={18}
                                >
                                  {application.cover_letter}
                                </Text>
                              </YStack>
                            )}

                            {(() => {
                              const availableStatuses: ApplicationStatus[] =
                                application.status === "pending"
                                  ? ["shortlisted", "rejected", "accepted"]
                                  : application.status === "applied"
                                    ? ["shortlisted", "rejected"]
                                    : application.status === "shortlisted"
                                      ? ["accepted", "rejected"]
                                      : [];

                              return availableStatuses.length > 0 ? (
                                <XStack gap="$2" flexWrap="wrap">
                                  {availableStatuses.map((status) => (
                                    <Button
                                      key={status}
                                      variant="outline"
                                      size="sm"
                                      onPress={() => handleStatusChange(status)}
                                      disabled={isUpdatingStatus}
                                      backgroundColor={
                                        status === "accepted"
                                          ? "#10B981"
                                          : status === "rejected"
                                            ? "#EF4444"
                                            : undefined
                                      }
                                      color={
                                        status === "accepted" ||
                                        status === "rejected"
                                          ? "white"
                                          : undefined
                                      }
                                    >
                                      {getStatusLabel(status)}
                                    </Button>
                                  ))}
                                </XStack>
                              ) : null;
                            })()}

                            <Text fontSize={11} color="#999">
                              Candidature envoyée le{" "}
                              {application.created_at
                                ? new Date(
                                    application.created_at
                                  ).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Date inconnue"}
                            </Text>
                          </YStack>
                        );
                      })}
                    </YStack>
                  )}
                </YStack>
              )}

              {/* Section Messagerie pour les recruteurs */}
              {isRecruiter && isMissionOwner && (
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
                  <Text fontSize={18} fontWeight="bold" color="#000">
                    Messagerie
                  </Text>

                  {/* Liste des freelances acceptés pour chatter */}
                  {applications.filter((app) => app.status === "accepted")
                    .length > 0 ? (
                    <YStack gap="$3">
                      {applications
                        .filter((app) => app.status === "accepted")
                        .map((application) => {
                          const profileName = application.profile
                            ? `${application.profile.first_name || ""} ${application.profile.last_name || ""}`.trim() ||
                              "Nom non renseigné"
                            : "Utilisateur inconnu";
                          const isSelected =
                            selectedFreelanceId === application.user_id;

                          return (
                            <Button
                              key={application.id}
                              variant={isSelected ? "primary" : "outline"}
                              size="sm"
                              onPress={() =>
                                setSelectedFreelanceId(application.user_id)
                              }
                            >
                              💬 {profileName}
                            </Button>
                          );
                        })}
                    </YStack>
                  ) : (
                    <Text fontSize={14} color="#666">
                      Aucun freelance accepté pour le moment
                    </Text>
                  )}

                  {/* Chat avec le freelance sélectionné */}
                  {selectedFreelanceId && chat.canAccess && (
                    <YStack
                      borderWidth={1}
                      borderColor="#E5E7EB"
                      borderRadius={8}
                      height={500}
                      overflow="hidden"
                      marginTop="$3"
                    >
                      <YStack
                        backgroundColor="#F9FAFB"
                        padding="$3"
                        borderBottomWidth={1}
                        borderBottomColor="#E5E7EB"
                      >
                        <Text fontSize={14} fontWeight="600" color="#000">
                          Conversation avec{" "}
                          {chat.senderNames.get(selectedFreelanceId) ||
                            "Freelance"}
                        </Text>
                      </YStack>

                      <ChatThread
                        messages={chat.messages}
                        currentUserId={chat.currentUserId || ""}
                        senderNames={chat.senderNames}
                        isLoading={chat.isLoading}
                      />

                      <MessageInput
                        onSend={async (content) => {
                          const success = await chat.sendMessage(content);
                          if (success) {
                            chat.markAsRead();
                          }
                        }}
                        isSending={chat.isSending}
                      />
                    </YStack>
                  )}
                </YStack>
              )}

              {/* Section Messagerie pour les freelances acceptés */}
              {profile?.role === "freelance" && canFreelanceChat && mission && (
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
                  <Text fontSize={18} fontWeight="bold" color="#000">
                    Messagerie
                  </Text>

                  {chat.canAccess ? (
                    <YStack
                      borderWidth={1}
                      borderColor="#E5E7EB"
                      borderRadius={8}
                      height={500}
                      overflow="hidden"
                    >
                      <YStack
                        backgroundColor="#F9FAFB"
                        padding="$3"
                        borderBottomWidth={1}
                        borderBottomColor="#E5E7EB"
                      >
                        <Text fontSize={14} fontWeight="600" color="#000">
                          Conversation avec{" "}
                          {chat.senderNames.get(mission.recruiter_id) ||
                            "Recruteur"}
                        </Text>
                      </YStack>

                      <ChatThread
                        messages={chat.messages}
                        currentUserId={chat.currentUserId || ""}
                        senderNames={chat.senderNames}
                        isLoading={chat.isLoading}
                      />

                      <MessageInput
                        onSend={async (content) => {
                          const success = await chat.sendMessage(content);
                          if (success) {
                            chat.markAsRead();
                          }
                        }}
                        isSending={chat.isSending}
                      />
                    </YStack>
                  ) : chat.isLoading ? (
                    <YStack padding="$4" alignItems="center">
                      <Text fontSize={14} color="#666">
                        Initialisation de la conversation...
                      </Text>
                    </YStack>
                  ) : (
                    <YStack padding="$4" alignItems="center" gap="$2">
                      <Text fontSize={14} color="#666">
                        {chat.error || "Impossible d'accéder à la conversation"}
                      </Text>
                    </YStack>
                  )}
                </YStack>
              )}

              {/* Autres missions similaires */}
              <YStack
                backgroundColor="white"
                borderRadius={12}
                padding="$5"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={8}
              >
                <Text
                  fontSize={18}
                  fontWeight="bold"
                  marginBottom="$2"
                  color="#000"
                >
                  Autres missions similaires
                </Text>
                <Text fontSize={14} color="#666">
                  Fonctionnalité à venir
                </Text>
              </YStack>
            </YStack>

            {/* COLONNE DROITE */}
            <YStack width={320} gap="$4" $sm={{ width: "100%" }}>
              {/* Carte Rémunération */}
              <YStack
                backgroundColor="white"
                borderRadius={12}
                padding="$5"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={8}
              >
                <Text fontSize={14} color="#666" marginBottom="$2">
                  Rémunération
                </Text>
                <Text
                  fontSize={32}
                  fontWeight="bold"
                  color={colors.shiftlyViolet}
                  marginBottom="$4"
                >
                  {mission.hourly_rate}€/h
                </Text>

                {/* Boutons d'action */}
                <YStack gap="$3">
                  {isRecruiter && isMissionOwner ? (
                    // Bouton pour les recruteurs propriétaires
                    <Button
                      variant="primary"
                      size="md"
                      width="100%"
                      onPress={() =>
                        router.push(`/missions/${missionId}/candidates`)
                      }
                    >
                      Gérer les candidatures
                    </Button>
                  ) : showSuccessMessage ? (
                    <YStack
                      padding="$3"
                      backgroundColor="#D4F4DD"
                      borderRadius={8}
                      alignItems="center"
                    >
                      <Text fontSize={14} color="#00A86B" fontWeight="600">
                        ✓ Candidature envoyée avec succès !
                      </Text>
                    </YStack>
                  ) : hasApplied ? (
                    <YStack
                      padding="$3"
                      backgroundColor="#FFF3CD"
                      borderRadius={8}
                      alignItems="center"
                    >
                      <Text fontSize={14} color="#856404" fontWeight="600">
                        ✓ Vous avez déjà postulé à cette mission
                      </Text>
                    </YStack>
                  ) : profile?.role === "freelance" ? (
                    <Button
                      variant="primary"
                      size="md"
                      width="100%"
                      onPress={handleApply}
                      disabled={
                        isApplying ||
                        isCheckingApplication ||
                        mission?.status !== "published"
                      }
                    >
                      {isApplying
                        ? "Envoi en cours..."
                        : "Postuler à cette mission"}
                    </Button>
                  ) : (
                    <YStack
                      padding="$3"
                      backgroundColor="#F8F9FA"
                      borderRadius={8}
                      alignItems="center"
                    >
                      <Text fontSize={14} color="#666" fontWeight="600">
                        Connectez-vous en tant que freelance pour postuler
                      </Text>
                    </YStack>
                  )}

                  {applyError && (
                    <YStack
                      padding="$3"
                      backgroundColor="#F8D7DA"
                      borderRadius={8}
                    >
                      <Text fontSize={14} color="#721C24">
                        {applyError}
                      </Text>
                    </YStack>
                  )}

                  <Button
                    variant="primary"
                    size="md"
                    width="100%"
                    onPress={() => {
                      console.log("Sauvegarder la mission:", mission.id);
                    }}
                  >
                    ♥ Sauvegarder la mission
                  </Button>

                  {/* Badge Shiftly certifie */}
                  <XStack
                    backgroundColor="#D4F4DD"
                    borderRadius={8}
                    padding="$3"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={14} color="#00A86B" fontWeight="600">
                      ✓ Shiftly certifie cette mission
                    </Text>
                  </XStack>
                </YStack>
              </YStack>

              {/* Carte Établissement */}
              <YStack
                backgroundColor="white"
                borderRadius={12}
                padding="$5"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={8}
              >
                <Text
                  fontSize={18}
                  fontWeight="bold"
                  marginBottom="$4"
                  color="#000"
                >
                  Établissement
                </Text>

                {/* Header établissement */}
                <XStack alignItems="center" gap="$3" marginBottom="$4">
                  <YStack
                    width={60}
                    height={60}
                    borderRadius={30}
                    backgroundColor="#F0F0F0"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={28}>🏢</Text>
                  </YStack>
                  <YStack flex={1}>
                    <Text fontSize={16} fontWeight="600" color="#000">
                      Nom de l'établissement
                    </Text>
                    <XStack alignItems="center" gap="$1" marginTop="$1">
                      <Text
                        fontSize={14}
                        color={colors.shiftlyViolet}
                        fontWeight="600"
                      >
                        ★ 4.5
                      </Text>
                      <Text fontSize={12} color="#999">
                        (0 avis)
                      </Text>
                    </XStack>
                  </YStack>
                </XStack>

                {/* Informations établissement */}
                <YStack gap="$3" marginBottom="$4">
                  <XStack alignItems="center" gap="$2">
                    <Text fontSize={16}>📍</Text>
                    <Text fontSize={14} color="#666">
                      {mission.city || "Paris"}
                    </Text>
                  </XStack>

                  <XStack alignItems="center" gap="$2">
                    <Text fontSize={16}>🍽️</Text>
                    <Text fontSize={14} color="#666">
                      Restaurant
                    </Text>
                  </XStack>
                </YStack>

                {/* Statistiques */}
                <YStack
                  backgroundColor="#F8F8F8"
                  borderRadius={8}
                  padding="$3"
                  gap="$2"
                  marginBottom="$4"
                >
                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="#666">
                      Missions publiées
                    </Text>
                    <Text fontSize={14} fontWeight="600" color="#000">
                      0
                    </Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text fontSize={14} color="#666">
                      Taux de réponse
                    </Text>
                    <Text fontSize={14} fontWeight="600" color="#00A86B">
                      95%
                    </Text>
                  </XStack>
                </YStack>

                {/* Bouton Contact */}
                <Button
                  variant="outline"
                  size="md"
                  width="100%"
                  onPress={async () => {
                    if (!profile || !mission) return;

                    // Si on est freelance, on contacte le recruteur
                    // Si on est recruteur, on ne peut pas utiliser ce bouton (déjà dans la section messagerie)
                    if (profile.role === "freelance" && mission.recruiter_id) {
                      const result = await openConversation(
                        {
                          missionId: mission.id,
                          recruiterId: mission.recruiter_id,
                          freelanceId: profile.id,
                        },
                        (conversationId) => {
                          router.push(
                            `/messagerie?conversationId=${conversationId}`
                          );
                        }
                      );

                      if (!result.success) {
                        alert(
                          result.error ||
                            "Erreur lors de l'ouverture de la conversation"
                        );
                      }
                    }
                  }}
                >
                  Contacter l'établissement
                </Button>
              </YStack>
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
