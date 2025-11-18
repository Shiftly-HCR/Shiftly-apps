"use client";

import { YStack, XStack, Text, ScrollView, Image } from "tamagui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, ImagePicker, colors } from "@hestia/ui";
import {
  createMission,
  uploadMissionImage,
  publishMission,
} from "@hestia/data";
import { AppLayout } from "../../../components/AppLayout";

type Step = 1 | 2 | 3 | 4;

export default function CreateMissionPage() {
  const router = useRouter();
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

  // Étape 3: Dates et horaires
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Étape 4: Rémunération et image
  const [hourlyRate, setHourlyRate] = useState("");
  const [missionImage, setMissionImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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
            currentStep >= step ? colors.hestiaOrange : colors.gray200
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

      {/* Map placeholder */}
      <YStack
        height={250}
        backgroundColor={colors.gray100}
        borderRadius={12}
        alignItems="center"
        justifyContent="center"
        borderWidth={1}
        borderColor={colors.gray200}
      >
        <Text fontSize={14} color={colors.gray500}>
          Carte (à implémenter)
        </Text>
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
          <Input
            label="Date de début"
            placeholder="JJ/MM/AAAA"
            value={startDate}
            onChangeText={setStartDate}
            type="date"
          />
        </YStack>
        <YStack flex={1}>
          <Input
            label="Date de fin"
            placeholder="JJ/MM/AAAA"
            value={endDate}
            onChangeText={setEndDate}
            type="date"
          />
        </YStack>
      </XStack>

      <Text fontSize={16} fontWeight="600" color={colors.gray900} marginTop="$2">
        Fourchette d'horaires
      </Text>

      <XStack gap="$3">
        <YStack flex={1}>
          <Input
            label="Heure de début"
            placeholder="09:00"
            value={startTime}
            onChangeText={setStartTime}
            type="time"
          />
        </YStack>
        <YStack flex={1}>
          <Input
            label="Heure de fin"
            placeholder="17:00"
            value={endTime}
            onChangeText={setEndTime}
            type="time"
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

