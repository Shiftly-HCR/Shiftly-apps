"use client";

import { YStack, XStack, Text, ScrollView, Image } from "tamagui";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@hestia/ui";
import { getMissionById, type Mission } from "@hestia/data";
import { AppLayout } from "../../../components/AppLayout";
import dynamic from "next/dynamic";

// Import dynamique de Map pour éviter les erreurs SSR
const Map = dynamic(() => import("../../../components/Map"), {
  ssr: false,
  loading: () => (
    <YStack
      backgroundColor="#E0E0E0"
      borderRadius={8}
      height={300}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={14} color="#999">
        Chargement de la carte...
      </Text>
    </YStack>
  ),
});

export default function MissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.id as string;

  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMission = async () => {
      if (!missionId) return;

      setIsLoading(true);
      const missionData = await getMissionById(missionId);
      setMission(missionData);
      setIsLoading(false);
    };

    loadMission();
  }, [missionId]);

  if (isLoading) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$6"
        >
          <Text fontSize={16} color="#666">
            Chargement...
          </Text>
        </YStack>
      </AppLayout>
    );
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

  // Format dates pour affichage
  const formatDateShort = (startDate?: string, endDate?: string) => {
    if (!startDate && !endDate) return "Dates non définies";

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffInDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const startDay = start.getDate().toString().padStart(2, "0");
      const endFormatted = end.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `Du ${startDay} au ${endFormatted}, ${diffInDays + 1} jours`;
    }

    return "Dates non définies";
  };

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
            <Text fontSize={32} fontWeight="bold" color="#FF6B35">
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
                    backgroundColor="#FFF4F0"
                    borderRadius={8}
                    padding="$3"
                    alignItems="center"
                    justifyContent="center"
                    minWidth={70}
                    minHeight={70}
                  >
                    <Text fontSize={28} fontWeight="bold" color="#FF6B35">
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
                <Map
                  latitude={mission.latitude || 48.8566}
                  longitude={mission.longitude || 2.3522}
                  zoom={15}
                  height={300}
                  markers={[
                    {
                      id: mission.id,
                      latitude: mission.latitude || 48.8566,
                      longitude: mission.longitude || 2.3522,
                      title: mission.title,
                    },
                  ]}
                  interactive={true}
                />
              </YStack>

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
                  color="#FF6B35"
                  marginBottom="$4"
                >
                  {mission.hourly_rate}€/h
                </Text>

                {/* Boutons d'action */}
                <YStack gap="$3">
                  <Button
                    backgroundColor="#FF6B35"
                    color="white"
                    borderRadius={8}
                    fontSize={16}
                    fontWeight="600"
                    paddingVertical="$3"
                    hoverStyle={{ opacity: 0.9 }}
                    pressStyle={{ opacity: 0.8 }}
                    onPress={() => {
                      console.log("Postuler à cette mission:", mission.id);
                    }}
                  >
                    Postuler à cette mission
                  </Button>

                  <Button
                    backgroundColor="#FF6B35"
                    color="white"
                    borderRadius={8}
                    fontSize={16}
                    fontWeight="600"
                    paddingVertical="$3"
                    hoverStyle={{ opacity: 0.9 }}
                    pressStyle={{ opacity: 0.8 }}
                    onPress={() => {
                      console.log("Sauvegarder la mission:", mission.id);
                    }}
                  >
                    ♥ Sauvegarder la mission
                  </Button>

                  {/* Badge Hestia certifie */}
                  <XStack
                    backgroundColor="#D4F4DD"
                    borderRadius={8}
                    padding="$3"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={14} color="#00A86B" fontWeight="600">
                      ✓ Hestia certifie cette mission
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
                      <Text fontSize={14} color="#FF6B35" fontWeight="600">
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
                  backgroundColor="white"
                  borderColor="#FF6B35"
                  borderWidth={2}
                  color="#FF6B35"
                  borderRadius={8}
                  fontSize={16}
                  fontWeight="600"
                  paddingVertical="$3"
                  hoverStyle={{ backgroundColor: "#FFF4F0" }}
                  pressStyle={{ opacity: 0.8 }}
                  onPress={() => {
                    console.log("Contacter l'établissement:", mission.id);
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
