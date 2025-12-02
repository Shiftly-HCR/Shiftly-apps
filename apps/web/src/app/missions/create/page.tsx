"use client";

import { YStack, XStack, Text, ScrollView, Image } from "tamagui";
import {
  Button,
  Input,
  ImagePicker,
  DatePicker,
  TimePicker,
  Select,
  colors,
} from "@shiftly/ui";
import { AppLayout } from "@/components";
import { MapLoader } from "@/components";
import { useCreateMissionPage } from "@/hooks";
import { Building2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function CreateMissionPage() {
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
    missionImage,
    imagePreview,

    // Handlers
    handleNext,
    handleBack,
    handleImageChange,
    handleMapClick,
    handleSubmit,
  } = useCreateMissionPage(establishmentId);

  const renderStepIndicator = () => (
    <XStack gap="$2" justifyContent="center" marginBottom="$6">
      {[1, 2, 3, 4, 5].map((step) => (
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

  const renderStep2 = () => {
    // Trouver l'établissement sélectionné pour afficher ses informations
    const selectedEstablishment = establishments.find(
      (est) => est.id === selectedEstablishmentId
    );

    return (
      <YStack gap="$4">
        <Text fontSize={24} fontWeight="700" color={colors.gray900}>
          Établissement
        </Text>
        <Text fontSize={14} color={colors.gray500}>
          Liez cette mission à un établissement existant ou créez-la sans
          établissement
        </Text>

        <Select
          label="Établissement (optionnel)"
          value={selectedEstablishmentId || ""}
          onValueChange={(value) => setSelectedEstablishmentId(value || null)}
          placeholder="Aucun établissement"
          options={[
            { label: "Aucun établissement", value: "" },
            ...establishments.map((est: any) => ({
              label: `${est.name}${est.city ? ` - ${est.city}` : ""}`,
              value: est.id,
            })),
          ]}
        />

        {selectedEstablishmentId && selectedEstablishment && (
          <YStack
            padding="$4"
            backgroundColor={colors.backgroundLight}
            borderRadius="$3"
            gap="$3"
            borderWidth={1}
            borderColor={colors.shiftlyVioletLight}
          >
            <XStack alignItems="center" gap="$2">
              <Building2 size={18} color={colors.shiftlyViolet} />
              <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                {selectedEstablishment.name}
              </Text>
            </XStack>

            {selectedEstablishment.address && (
              <YStack gap="$1">
                <Text fontSize={12} fontWeight="600" color={colors.gray500}>
                  Adresse de l'établissement (sera utilisée pour la mission) :
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  {selectedEstablishment.address}
                </Text>
                {(selectedEstablishment.postal_code ||
                  selectedEstablishment.city) && (
                  <Text fontSize={14} color={colors.gray500}>
                    {[
                      selectedEstablishment.postal_code,
                      selectedEstablishment.city,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </Text>
                )}
              </YStack>
            )}

            <YStack
              padding="$2"
              backgroundColor={colors.white}
              borderRadius="$2"
              gap="$1"
            >
              <Text fontSize={12} color={colors.shiftlyViolet} fontWeight="600">
                ✓ L'adresse sera automatiquement héritée à l'étape suivante
              </Text>
            </YStack>
          </YStack>
        )}
      </YStack>
    );
  };

  const renderStep3 = () => (
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

      {/* Carte interactive - désactivée si établissement sélectionné */}
      {!selectedEstablishmentId && (
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
            Cliquez sur la carte pour positionner le marqueur et remplir
            l'adresse automatiquement
          </Text>
          <MapLoader
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
      )}

      {selectedEstablishmentId && (
        <YStack
          padding="$3"
          backgroundColor={colors.backgroundLight}
          borderRadius="$3"
        >
          <Text fontSize={14} color={colors.gray500}>
            L'adresse de l'établissement sélectionné sera utilisée. Vous pouvez
            modifier les champs ci-dessus si nécessaire.
          </Text>
        </YStack>
      )}
    </YStack>
  );

  const renderStep4 = () => (
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

  const renderStep5 = () => (
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
              handleImageChange(null as any);
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
            {currentStep === 5 && renderStep5()}

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
