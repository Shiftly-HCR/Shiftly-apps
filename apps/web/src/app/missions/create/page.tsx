"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { YStack, XStack, Text, ScrollView } from "tamagui";
import { Button, colors } from "@shiftly/ui";
import { AppLayout } from "@/components";
import {
  MissionFormSteps,
  MissionFormStepIndicator,
} from "@/components/mission";
import { useCreateMissionPage } from "@/hooks";
import { useSearchParams } from "next/navigation";

function CreateMissionPageContent() {
  const searchParams = useSearchParams();
  const establishmentId = searchParams.get("establishment") || undefined;

  const {
    // États des étapes
    currentStep,
    isLoading,
    error,

    // États Étape 1: Infos générales
    title,
    setTitle,
    description,
    setDescription,
    skills,
    setSkills,

    // États Étape 2: Établissement
    selectedEstablishmentId,
    setSelectedEstablishmentId,
    establishments,

    // États Étape 3: Localisation
    address,
    setAddress,
    city,
    setCity,
    postalCode,
    setPostalCode,
    latitude,
    longitude,
    isGeocoding,

    // États Étape 4: Dates et horaires
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,

    // États Étape 5: Rémunération et image
    hourlyRate,
    setHourlyRate,
    dailyRate,
    setDailyRate,
    totalSalary,
    missionImage,
    imagePreview,

    // Handlers
    handleNext,
    handleBack,
    handleImageChange,
    handleMapClick,
    handleSubmit,
  } = useCreateMissionPage(establishmentId);

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
          <MissionFormStepIndicator currentStep={currentStep} />

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
              dailyRate={dailyRate}
              setDailyRate={setDailyRate}
              totalSalary={totalSalary}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
            />

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
                {currentStep < 5 ? (
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

export default function CreateMissionPage() {
  return (
    <Suspense fallback={null}>
      <CreateMissionPageContent />
    </Suspense>
  );
}
