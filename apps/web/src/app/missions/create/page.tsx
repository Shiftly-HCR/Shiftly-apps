"use client";

import { YStack, XStack, Text, ScrollView, Image } from "tamagui";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  ImagePicker,
  DatePicker,
  TimePicker,
  colors,
} from "@shiftly/ui";
import {
  createMission,
  uploadMissionImage,
  publishMission,
  geocodeAddress,
  reverseGeocode,
  debounce,
} from "@shiftly/data";
import { AppLayout } from "../../../components/AppLayout";
import { useRecruiterMissions } from "../../../hooks";
import dynamic from "next/dynamic";

// Import dynamique de Map pour éviter les erreurs SSR
const Map = dynamic(() => import("../../../components/Map"), {
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

export default function CreateMissionPage() {
  const router = useRouter();
  const { refresh } = useRecruiterMissions();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Étape 1: Infos générales
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string>("");

  // Étape 2: Localisation
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState<number>(48.8566); // Paris par défaut
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

  // Effet pour déclencher le géocodage quand l'adresse change
  useEffect(() => {
    handleAddressChange(address, city, postalCode);
  }, [address, city, postalCode, handleAddressChange]);

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

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    setError("");
    setIsLoading(true);

    try {
      // Créer la mission
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const missionResult = await createMission({
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
        status: saveAsDraft ? "draft" : "published",
      });

      if (!missionResult.success) {
        setError(missionResult.error || "Erreur lors de la création");
        setIsLoading(false);
        return;
      }

      // Upload l'image si elle existe
      if (missionImage && missionResult.mission) {
        await uploadMissionImage(missionResult.mission.id, missionImage);
      }

      // Rafraîchir le cache des missions
      await refresh();

      // Redirection vers la liste des missions
      router.push("/missions");
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <XStack gap="$2" justifyContent="center" marginBottom="$6">
      {[1, 2, 3, 4].map((step) => (
        <YStack
          key={step}
          width={currentStep >= step ? 60 : 40}
          height={4}
          backgroundColor={
            currentStep >= step ? colors.shiftlyViolet : colors.gray200
          }
          borderRadius={2}
        />
      ))}
    </XStack>
  );

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
            <Text fontSize={12} color={colors.shiftlyViolet}>
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

  const renderStep3 = () => (
    <YStack gap="$4">
      <Text fontSize={24} fontWeight="700" color={colors.gray900}>
        Éléments de planning
      </Text>

      <Text fontSize={16} fontWeight="600" color={colors.gray900}>
        Périodes de dates
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
        marginTop="$2"
      >
        Fourchette d'horaires
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

  const renderStep4 = () => (
    <YStack gap="$4">
      <Text fontSize={24} fontWeight="700" color={colors.gray900}>
        Mission à publier
      </Text>

      {/* Image de la mission */}
      {imagePreview ? (
        <YStack gap="$3">
          <Text fontSize={16} fontWeight="600" color={colors.gray900}>
            Photo de la mission
          </Text>
          <YStack
            height={250}
            borderRadius={12}
            overflow="hidden"
            borderWidth={1}
            borderColor={colors.gray200}
          >
            <Image
              source={{ uri: imagePreview }}
              width="100%"
              height={250}
              style={{
                width: "100%",
                height: 250,
                objectFit: "cover",
              }}
            />
          </YStack>
          <Button
            variant="outline"
            size="sm"
            onPress={() => {
              setMissionImage(null);
              setImagePreview("");
            }}
          >
            Changer l'image
          </Button>
        </YStack>
      ) : (
        <ImagePicker
          value={null}
          onChange={handleImageChange}
          shape="square"
          size={250}
          placeholder="Ajoutez une photo de votre établissement"
        />
      )}

      <Input
        label="Taux horaire (€)"
        placeholder="25"
        value={hourlyRate}
        onChangeText={setHourlyRate}
        keyboardType="decimal-pad"
      />

      {/* Résumé */}
      <YStack
        padding="$4"
        backgroundColor={colors.backgroundLight}
        borderRadius={12}
        gap="$2"
      >
        <Text fontSize={16} fontWeight="700" color={colors.gray900}>
          Résumé
        </Text>
        <Text fontSize={14} color={colors.gray700}>
          <Text fontWeight="600">Poste:</Text> {title || "Non défini"}
        </Text>
        <Text fontSize={14} color={colors.gray700}>
          <Text fontWeight="600">Ville:</Text> {city || "Non définie"}
        </Text>
        <Text fontSize={14} color={colors.gray700}>
          <Text fontWeight="600">Dates:</Text>{" "}
          {startDate && endDate
            ? `Du ${startDate} au ${endDate}`
            : "Non définies"}
        </Text>
        <Text fontSize={14} color={colors.gray700}>
          <Text fontWeight="600">Taux horaire:</Text>{" "}
          {hourlyRate ? `${hourlyRate}€/h` : "Non défini"}
        </Text>
      </YStack>
    </YStack>
  );

  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack
          maxWidth={800}
          width="100%"
          alignSelf="center"
          padding="$6"
          gap="$6"
        >
          {/* Indicateur d'étapes */}
          {renderStepIndicator()}

          {/* Contenu de l'étape */}
          <YStack
            padding="$6"
            backgroundColor={colors.white}
            borderRadius={12}
            borderWidth={1}
            borderColor={colors.gray200}
            gap="$6"
          >
            {/* Message d'erreur */}
            {error && (
              <YStack
                padding="$3"
                backgroundColor="#FEE2E2"
                borderRadius={8}
                borderWidth={1}
                borderColor="#EF4444"
              >
                <Text fontSize={14} color="#DC2626" fontWeight="500">
                  {error}
                </Text>
              </YStack>
            )}

            {/* Étapes */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Boutons de navigation */}
            <XStack gap="$3" marginTop="$4">
              {currentStep > 1 && (
                <YStack flex={1}>
                  <Button
                    variant="outline"
                    size="lg"
                    onPress={handleBack}
                    disabled={isLoading}
                  >
                    Retour
                  </Button>
                </YStack>
              )}

              <YStack flex={1}>
                {currentStep < 4 ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onPress={handleNext}
                    disabled={isLoading}
                  >
                    Suivant
                  </Button>
                ) : (
                  <XStack gap="$3">
                    <YStack flex={1}>
                      <Button
                        variant="outline"
                        size="lg"
                        onPress={() => handleSubmit(true)}
                        disabled={isLoading}
                      >
                        Enregistrer
                      </Button>
                    </YStack>
                    <YStack flex={1}>
                      <Button
                        variant="primary"
                        size="lg"
                        onPress={() => handleSubmit(false)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Publication..." : "Publier"}
                      </Button>
                    </YStack>
                  </XStack>
                )}
              </YStack>
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
