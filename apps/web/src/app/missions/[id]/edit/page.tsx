"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, colors } from "@shiftly/ui";
import {
  updateMission,
  uploadMissionImage,
  deleteMission,
  type Mission,
  geocodeAddress,
  reverseGeocode,
  debounce,
  getEstablishmentById,
} from "@shiftly/data";
import { AppLayout } from "@/components";
import {
  useRecruiterMissions,
  useCachedMission,
  useEstablishments,
} from "@/hooks";
import {
  MissionFormSteps,
  MissionFormStepIndicator,
} from "@/components/mission";

type Step = 1 | 2 | 3 | 4 | 5;

export default function EditMissionPage() {
  const router = useRouter();
  const { refresh } = useRecruiterMissions();
  const { establishments } = useEstablishments();
  const params = useParams();
  const missionId = params.id as string;
  const { data: cachedMission, isLoading: isLoadingMission } =
    useCachedMission(missionId);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const isLoading = isLoadingMission;
  const mission = cachedMission;

  // Étape 1: Infos générales
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string>("");

  // Étape 2: Établissement
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<
    string | null
  >(null);

  // Étape 3: Localisation
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState<number>(48.8566);
  const [longitude, setLongitude] = useState<number>(2.3522);

  // Étape 4: Dates et horaires
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Étape 5: Rémunération et image
  const [hourlyRate, setHourlyRate] = useState("");
  const [missionImage, setMissionImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");

  // État pour le géocodage
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  // Géocodage de l'adresse vers coordonnées (avec debounce)
  const handleAddressChange = useCallback(
    debounce(async (addr: string, cty: string, postal: string) => {
      if (!addr && !cty && !postal) return;

      setIsGeocoding(true);
      const result = await geocodeAddress(addr, cty, postal, mapboxToken);
      setIsGeocoding(false);

      if (result) {
        setLatitude(result.latitude);
        setLongitude(result.longitude);
        // Mettre à jour les champs si vides
        if (!cty && result.city) setCity(result.city);
        if (!postal && result.postalCode) setPostalCode(result.postalCode);
      }
    }, 1000),
    [mapboxToken]
  );

  // Géocodage inversé des coordonnées vers adresse
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setLatitude(lat);
      setLongitude(lng);

      setIsGeocoding(true);
      const result = await reverseGeocode(lat, lng, mapboxToken);
      setIsGeocoding(false);

      if (result) {
        setAddress(result.address);
        setCity(result.city);
        setPostalCode(result.postalCode);
      }
    },
    [mapboxToken]
  );

  // Initialiser les champs avec les données de la mission (depuis le cache)
  useEffect(() => {
    if (!mission) return;

    // Remplir les champs avec les données existantes
    setTitle(mission.title);
    setDescription(mission.description || "");
    setSkills(mission.skills?.join(", ") || "");
    setSelectedEstablishmentId(mission.establishment_id || null);
    setAddress(mission.address || "");
    setCity(mission.city || "");
    setPostalCode(mission.postal_code || "");
    setLatitude(mission.latitude || 48.8566);
    setLongitude(mission.longitude || 2.3522);
    setStartDate(mission.start_date || "");
    setEndDate(mission.end_date || "");
    setStartTime(mission.start_time || "");
    setEndTime(mission.end_time || "");
    setHourlyRate(mission.hourly_rate?.toString() || "");
    setExistingImageUrl(mission.image_url || "");
    setImagePreview(mission.image_url || "");
  }, [mission]);

  // Charger l'adresse de l'établissement si sélectionné
  useEffect(() => {
    const loadEstablishmentAddress = async () => {
      if (selectedEstablishmentId) {
        // Chercher d'abord dans la liste des établissements déjà chargés
        const establishmentFromList = establishments.find(
          (est) => est.id === selectedEstablishmentId
        );

        if (establishmentFromList) {
          // Utiliser les données de l'établissement depuis la liste
          setAddress(establishmentFromList.address || "");
          setCity(establishmentFromList.city || "");
          setPostalCode(establishmentFromList.postal_code || "");
          if (
            establishmentFromList.latitude &&
            establishmentFromList.longitude
          ) {
            setLatitude(establishmentFromList.latitude);
            setLongitude(establishmentFromList.longitude);
          }
        } else {
          // Sinon, charger depuis l'API
          const establishment = await getEstablishmentById(
            selectedEstablishmentId
          );
          if (establishment) {
            setAddress(establishment.address || "");
            setCity(establishment.city || "");
            setPostalCode(establishment.postal_code || "");
            if (establishment.latitude && establishment.longitude) {
              setLatitude(establishment.latitude);
              setLongitude(establishment.longitude);
            }
          }
        }
      }
    };

    loadEstablishmentAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEstablishmentId]);

  // Effet pour déclencher le géocodage quand l'adresse change (sauf au chargement initial)
  useEffect(() => {
    if (!mission) return; // Ne pas géocoder pendant le chargement initial
    handleAddressChange(address, city, postalCode);
  }, [address, city, postalCode, mission, handleAddressChange]);

  const handleNext = () => {
    setError("");

    // Validation selon l'étape
    if (currentStep === 1) {
      if (!title.trim()) {
        setError("Le titre est requis");
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleImageChange = (file: File) => {
    setMissionImage(file);
    // Créer un aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setMissionImage(null);
    setImagePreview("");
    setExistingImageUrl("");
  };

  const handleSubmit = async () => {
    setError("");
    setIsSaving(true);

    try {
      // Préparer les compétences
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Mettre à jour la mission
      const updateResult = await updateMission(missionId, {
        title,
        description,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
        establishment_id: selectedEstablishmentId || undefined,
        address: address || undefined,
        city: city || undefined,
        postal_code: postalCode || undefined,
        latitude: latitude,
        longitude: longitude,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      });

      if (!updateResult.success) {
        setError(updateResult.error || "Erreur lors de la mise à jour");
        setIsSaving(false);
        return;
      }

      // Upload de l'image si une nouvelle image a été sélectionnée
      if (missionImage) {
        const imageResult = await uploadMissionImage(missionId, missionImage);
        if (!imageResult.success) {
          setError(
            "Mission mise à jour mais erreur lors de l'upload de l'image"
          );
        }
      }

      // Rafraîchir le cache des missions
      await refresh();

      // Rediriger vers la page de la mission
      router.push(`/missions/${missionId}`);
    } catch (err) {
      setError("Une erreur inattendue s'est produite");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette mission ?")) {
      return;
    }

    setIsSaving(true);
    const result = await deleteMission(missionId);

    if (result.success) {
      // Rafraîchir le cache des missions
      await refresh();
      router.push("/missions");
    } else {
      setError(result.error || "Erreur lors de la suppression");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$6"
        >
          <Text fontSize={16} color={colors.gray700}>
            Chargement de la mission...
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
          <Text fontSize={20} fontWeight="700" color={colors.gray900}>
            Mission introuvable
          </Text>
          <Button variant="primary" onPress={() => router.push("/missions")}>
            Retour aux missions
          </Button>
        </YStack>
      </AppLayout>
    );
  }


  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack maxWidth={800} width="100%" alignSelf="center" padding="$6">
          {/* En-tête */}
          <YStack gap="$3" marginBottom="$6">
            <Text fontSize={32} fontWeight="700" color={colors.gray900}>
              Modifier la mission
            </Text>
            <Text fontSize={16} color={colors.gray700}>
              Étape {currentStep} sur 5
            </Text>
          </YStack>

          {/* Indicateur de progression */}
          <MissionFormStepIndicator currentStep={currentStep} />

          {/* Contenu de l'étape */}
          <YStack
            padding="$6"
            backgroundColor={colors.white}
            borderRadius={12}
            borderWidth={1}
            borderColor={colors.gray200}
            marginBottom="$6"
          >
            <MissionFormSteps
              currentStep={currentStep}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              skills={skills}
              setSkills={setSkills}
              selectedEstablishmentId={selectedEstablishmentId}
              setSelectedEstablishmentId={setSelectedEstablishmentId}
              establishments={establishments}
              address={address}
              setAddress={setAddress}
              city={city}
              setCity={setCity}
              postalCode={postalCode}
              setPostalCode={setPostalCode}
              latitude={latitude}
              longitude={longitude}
              isGeocoding={isGeocoding}
              onMapClick={handleMapClick}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              hourlyRate={hourlyRate}
              setHourlyRate={setHourlyRate}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
            />

            {/* Message d'erreur */}
            {error && (
              <YStack
                padding="$3"
                backgroundColor="#FEE2E2"
                borderRadius={8}
                marginTop="$4"
              >
                <Text fontSize={14} color="#DC2626">
                  {error}
                </Text>
              </YStack>
            )}
          </YStack>

          {/* Boutons de navigation */}
          <XStack gap="$3" justifyContent="space-between">
            <Button
              variant="outline"
              size="lg"
              onPress={handleBack}
              disabled={currentStep === 1 || isSaving}
            >
              Retour
            </Button>

            {currentStep < 5 ? (
              <Button
                variant="primary"
                size="lg"
                onPress={handleNext}
                disabled={isSaving}
              >
                Suivant
              </Button>
            ) : (
              <XStack gap="$3">
                <Button
                  variant="outline"
                  size="lg"
                  onPress={handleDelete}
                  disabled={isSaving}
                  backgroundColor="#FEE2E2"
                  borderColor="#DC2626"
                  color="#DC2626"
                  hoverStyle={{ backgroundColor: "#FCA5A5" }}
                >
                  Supprimer
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSubmit}
                  disabled={isSaving}
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </XStack>
            )}
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
