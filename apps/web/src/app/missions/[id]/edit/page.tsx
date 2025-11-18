"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Input,
  ImagePicker,
  DatePicker,
  TimePicker,
  colors,
} from "@hestia/ui";
import {
  getMissionById,
  updateMission,
  uploadMissionImage,
  deleteMission,
  type Mission,
  geocodeAddress,
  reverseGeocode,
  debounce,
} from "@hestia/data";
import { AppLayout } from "../../../../components/AppLayout";
import dynamic from "next/dynamic";

// Import dynamique de Map pour éviter les erreurs SSR
const Map = dynamic(() => import("../../../../components/Map"), {
  ssr: false,
  loading: () => (
    <YStack
      backgroundColor={colors.gray100}
      borderRadius={12}
      height={250}
      alignItems="center"
      justifyContent="center"
      borderWidth={1}
      borderColor={colors.gray200}
    >
      <Text fontSize={14} color={colors.gray500}>
        Chargement de la carte...
      </Text>
    </YStack>
  ),
});

type Step = 1 | 2 | 3 | 4;

export default function EditMissionPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.id as string;

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [mission, setMission] = useState<Mission | null>(null);

  // Étape 1: Infos générales
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string>("");

  // Étape 2: Localisation
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState<number>(48.8566);
  const [longitude, setLongitude] = useState<number>(2.3522);

  // Étape 3: Dates et horaires
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Étape 4: Rémunération et image
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
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
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
  }, [mapboxToken]);

  // Charger les données de la mission
  useEffect(() => {
    const loadMission = async () => {
      if (!missionId) return;

      setIsLoading(true);
      const missionData = await getMissionById(missionId);

      if (!missionData) {
        setError("Mission introuvable");
        setIsLoading(false);
        return;
      }

      // Remplir les champs avec les données existantes
      setMission(missionData);
      setTitle(missionData.title);
      setDescription(missionData.description || "");
      setSkills(missionData.skills?.join(", ") || "");
      setAddress(missionData.address || "");
      setCity(missionData.city || "");
      setPostalCode(missionData.postal_code || "");
      setLatitude(missionData.latitude || 48.8566);
      setLongitude(missionData.longitude || 2.3522);
      setStartDate(missionData.start_date || "");
      setEndDate(missionData.end_date || "");
      setStartTime(missionData.start_time || "");
      setEndTime(missionData.end_time || "");
      setHourlyRate(missionData.hourly_rate?.toString() || "");
      setExistingImageUrl(missionData.image_url || "");
      setImagePreview(missionData.image_url || "");

      setIsLoading(false);
    };

    loadMission();
  }, [missionId]);

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

    if (currentStep < 4) {
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

  // Indicateur de progression
  const renderStepIndicator = () => (
    <XStack gap="$2" justifyContent="center" marginBottom="$6">
      {[1, 2, 3, 4].map((step) => (
        <YStack
          key={step}
          width={currentStep >= step ? 60 : 40}
          height={8}
          borderRadius={4}
          backgroundColor={
            currentStep >= step ? colors.hestiaOrange : colors.gray200
          }
          animation="quick"
        />
      ))}
    </XStack>
  );

  // Étape 1: Infos générales
  const renderStep1 = () => (
    <YStack gap="$4">
      <Text fontSize={24} fontWeight="700" color={colors.gray900}>
        Infos générales
      </Text>

      <Input
        label="Poste"
        placeholder="ex: Chef de rang"
        value={title}
        onChangeText={setTitle}
        required
      />

      <YStack gap="$2">
        <Text fontSize={14} fontWeight="600" color={colors.gray900}>
          Description
        </Text>
        <YStack
          padding="$3"
          backgroundColor={colors.white}
          borderRadius={12}
          borderWidth={1}
          borderColor={colors.gray200}
          minHeight={120}
        >
          <Input
            placeholder="Décrivez les tâches et responsabilités du poste..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
          />
        </YStack>
      </YStack>

      <Input
        label="Compétences"
        placeholder="Séparées par des virgules (ex: Serveur, Barman)"
        value={skills}
        onChangeText={setSkills}
        helperText="Séparez les compétences par des virgules"
      />
    </YStack>
  );

  // Étape 2: Localisation
  const renderStep2 = () => (
    <YStack gap="$4">
      <Text fontSize={24} fontWeight="700" color={colors.gray900}>
        Où se déroule la mission ?
      </Text>

      <Input
        label="Adresse"
        placeholder="123 Rue de la Paix"
        value={address}
        onChangeText={setAddress}
      />

      <XStack gap="$3">
        <YStack flex={2}>
          <Input
            label="Ville"
            placeholder="Paris"
            value={city}
            onChangeText={setCity}
          />
        </YStack>
        <YStack flex={1}>
          <Input
            label="Code postal"
            placeholder="75000"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="number-pad"
          />
        </YStack>
      </XStack>

      {/* Carte interactive */}
      <YStack gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={14} fontWeight="600" color={colors.gray900}>
            Localisation sur la carte
          </Text>
          {isGeocoding && (
            <Text fontSize={12} color={colors.hestiaOrange}>
              🔄 Mise à jour...
            </Text>
          )}
        </XStack>
        <Text fontSize={12} color={colors.gray500}>
          Cliquez sur la carte pour positionner le marqueur et remplir l'adresse
          automatiquement
        </Text>
        <Map
          latitude={latitude}
          longitude={longitude}
          zoom={13}
          height={250}
          markers={[
            {
              id: "mission-location",
              latitude: latitude,
              longitude: longitude,
            },
          ]}
          onMapClick={(event) => {
            handleMapClick(event.lngLat.lat, event.lngLat.lng);
          }}
          interactive={true}
        />
      </YStack>
    </YStack>
  );

  // Étape 3: Dates et horaires
  const renderStep3 = () => (
    <YStack gap="$4">
      <Text fontSize={24} fontWeight="700" color={colors.gray900}>
        Éléments de planning
      </Text>

      <Text fontSize={16} fontWeight="600" color={colors.gray900}>
        Dates de la mission
      </Text>

      <XStack gap="$3">
        <YStack flex={1}>
          <DatePicker
            label="Date de début"
            value={startDate}
            onChangeText={setStartDate}
          />
        </YStack>
        <YStack flex={1}>
          <DatePicker
            label="Date de fin"
            value={endDate}
            onChangeText={setEndDate}
            min={startDate || undefined}
          />
        </YStack>
      </XStack>

      <Text
        fontSize={16}
        fontWeight="600"
        color={colors.gray900}
        marginTop="$3"
      >
        Horaires
      </Text>

      <XStack gap="$3">
        <YStack flex={1}>
          <TimePicker
            label="Heure de début"
            value={startTime}
            onChangeText={setStartTime}
          />
        </YStack>
        <YStack flex={1}>
          <TimePicker
            label="Heure de fin"
            value={endTime}
            onChangeText={setEndTime}
          />
        </YStack>
      </XStack>
    </YStack>
  );

  // Étape 4: Rémunération et image
  const renderStep4 = () => (
    <YStack gap="$4">
      <Text fontSize={24} fontWeight="700" color={colors.gray900}>
        Rémunération et visuels
      </Text>

      <Input
        label="Taux horaire (€/h)"
        placeholder="18"
        value={hourlyRate}
        onChangeText={setHourlyRate}
        keyboardType="decimal-pad"
      />

      <YStack gap="$2">
        <Text fontSize={14} fontWeight="600" color={colors.gray900}>
          Photo de la mission
        </Text>
        <ImagePicker
          value={imagePreview}
          onChange={handleImageChange}
          onRemove={handleImageRemove}
          placeholder="Ajoutez une photo pour rendre la mission plus attractive"
        />
      </YStack>

      {/* Résumé */}
      <YStack
        padding="$4"
        backgroundColor={colors.backgroundLight}
        borderRadius={12}
        gap="$2"
        marginTop="$4"
      >
        <Text fontSize={16} fontWeight="700" color={colors.gray900}>
          Résumé de la mission
        </Text>
        <Text fontSize={14} color={colors.gray700}>
          <Text fontWeight="600">Titre :</Text> {title || "Non défini"}
        </Text>
        <Text fontSize={14} color={colors.gray700}>
          <Text fontWeight="600">Ville :</Text> {city || "Non définie"}
        </Text>
        <Text fontSize={14} color={colors.gray700}>
          <Text fontWeight="600">Taux horaire :</Text>{" "}
          {hourlyRate || "Non défini"}€/h
        </Text>
      </YStack>
    </YStack>
  );

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
              Étape {currentStep} sur 4
            </Text>
          </YStack>

          {/* Indicateur de progression */}
          {renderStepIndicator()}

          {/* Contenu de l'étape */}
          <YStack
            padding="$6"
            backgroundColor={colors.white}
            borderRadius={12}
            borderWidth={1}
            borderColor={colors.gray200}
            marginBottom="$6"
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

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

            {currentStep < 4 ? (
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
