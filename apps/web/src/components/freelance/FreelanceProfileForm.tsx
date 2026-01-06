"use client";

import { YStack, XStack, Text } from "tamagui";
import {
  Button,
  Input,
  DatePicker,
  Checkbox,
  Select,
  colors,
} from "@shiftly/ui";
import { useFreelanceProfileForm } from "@/hooks";
import { useFormatDate } from "@/hooks";

interface FreelanceProfileFormProps {
  onSave?: () => void;
}

export function FreelanceProfileForm({ onSave }: FreelanceProfileFormProps) {
  const { formatDateShort } = useFormatDate();

  const {
    // Données
    isLoading,
    experiencesList,
    educationsList,

    // États du profil
    bio,
    setBio,
    skills,
    skillInput,
    setSkillInput,
    dailyRate,
    setDailyRate,
    hourlyRate,
    setHourlyRate,
    availability,
    setAvailability,

    // États des expériences
    editingExperienceId,
    experienceForm,
    setExperienceForm,

    // États des formations
    editingEducationId,
    educationForm,
    setEducationForm,

    // États généraux
    isSaving,
    error,
    success,

    // Handlers profil
    handleSaveProfile,
    handleAddSkill,
    handleRemoveSkill,

    // Handlers expériences
    handleSaveExperience,
    handleDeleteExperience,
    handleEditExperience,
    handleCancelEditExperience,

    // Handlers formations
    handleSaveEducation,
    handleDeleteEducation,
    handleEditEducation,
    handleCancelEditEducation,

    // Handler LinkedIn
    handleSyncLinkedIn,
  } = useFreelanceProfileForm({ onSave });

  if (isLoading) {
    return (
      <YStack padding="$6" alignItems="center">
        <Text fontSize={16} color={colors.gray700}>
          Chargement...
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$6" padding="$6" backgroundColor="white" borderRadius="$4">
      {/* Messages */}
      {error && (
        <YStack
          padding="$3"
          backgroundColor="#FEE2E2"
          borderRadius="$3"
          borderWidth={1}
          borderColor="#EF4444"
        >
          <Text fontSize={14} color="#DC2626" fontWeight="500">
            {error}
          </Text>
        </YStack>
      )}

      {success && (
        <YStack
          padding="$3"
          backgroundColor="#D1FAE5"
          borderRadius="$3"
          borderWidth={1}
          borderColor="#10B981"
        >
          <Text fontSize={14} color="#059669" fontWeight="500">
            {success}
          </Text>
        </YStack>
      )}

      {/* Informations générales */}
      <YStack gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={20} fontWeight="700" color={colors.gray900}>
            Informations générales
          </Text>
          <Button
            variant="outline"
            size="sm"
            onPress={handleSyncLinkedIn}
            disabled={isSaving}
          >
            🔗 Sync LinkedIn
          </Button>
        </XStack>

        <YStack gap="$3">
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color={colors.gray900}>
              Biographie
            </Text>
            <Input
              placeholder="Parlez-nous de vous..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
            />
          </YStack>

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color={colors.gray900}>
              Compétences
            </Text>
            <XStack gap="$2">
              <Input
                flex={1}
                placeholder="Ajouter une compétence"
                value={skillInput}
                onChangeText={setSkillInput}
                onSubmitEditing={handleAddSkill}
              />
              <Button onPress={handleAddSkill}>Ajouter</Button>
            </XStack>
            <XStack gap="$2" flexWrap="wrap">
              {skills.map((skill) => (
                <XStack
                  key={skill}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius={20}
                  backgroundColor={colors.shiftlyVioletLight}
                  alignItems="center"
                  gap="$2"
                >
                  <Text
                    fontSize={14}
                    color={colors.shiftlyViolet}
                    fontWeight="600"
                  >
                    {skill}
                  </Text>
                  <Text
                    fontSize={14}
                    color={colors.shiftlyViolet}
                    cursor="pointer"
                    onPress={() => handleRemoveSkill(skill)}
                  >
                    ×
                  </Text>
                </XStack>
              ))}
            </XStack>
          </YStack>

          <XStack gap="$3">
            <YStack flex={1} gap="$2">
              <Text fontSize={14} fontWeight="600" color={colors.gray900}>
                TJM (€)
              </Text>
              <Input
                placeholder="300"
                value={dailyRate}
                onChangeText={setDailyRate}
                keyboardType="numeric"
              />
            </YStack>
            <YStack flex={1} gap="$2">
              <Text fontSize={14} fontWeight="600" color={colors.gray900}>
                Tarif horaire (€)
              </Text>
              <Input
                placeholder="20"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
              />
            </YStack>
            <YStack flex={1} gap="$2">
              <Select
                label="Disponibilité"
                placeholder="Sélectionner une disponibilité"
                value={availability}
                onValueChange={setAvailability}
                options={[
                  { label: "Temps plein", value: "temps_plein" },
                  { label: "Temps partiel", value: "temps_partiel" },
                  { label: "Week-end et soirée", value: "weekend_soiree" },
                  { label: "Soirée uniquement", value: "soiree" },
                  { label: "Week-end uniquement", value: "weekend" },
                  { label: "Disponibilité flexible", value: "flexible" },
                  { label: "Ponctuel / Événements", value: "ponctuel" },
                ]}
              />
            </YStack>
          </XStack>
        </YStack>

        <Button
          variant="primary"
          size="lg"
          onPress={(e?: any) => {
            e?.preventDefault?.();
            e?.stopPropagation?.();
            handleSaveProfile();
          }}
          disabled={isSaving}
          opacity={isSaving ? 0.6 : 1}
        >
          {isSaving
            ? "Enregistrement..."
            : "Enregistrer les informations générales"}
        </Button>
      </YStack>

      {/* Expériences */}
      <YStack gap="$4">
        <Text fontSize={20} fontWeight="700" color={colors.gray900}>
          Expériences professionnelles
        </Text>

        {experiencesList.map((exp) => (
          <YStack
            key={exp.id}
            padding="$4"
            backgroundColor={colors.gray050}
            borderRadius="$3"
            gap="$3"
          >
            <XStack justifyContent="space-between" alignItems="flex-start">
              <YStack flex={1} gap="$1">
                <Text fontSize={18} fontWeight="600" color={colors.gray900}>
                  {exp.title}
                </Text>
                <Text fontSize={16} color={colors.gray700}>
                  {exp.company}
                  {exp.location && `, ${exp.location}`}
                </Text>
                <Text fontSize={14} color={colors.gray500}>
                  {formatDateShort(exp.start_date)}
                  {exp.end_date
                    ? ` - ${formatDateShort(exp.end_date)}`
                    : exp.is_current
                      ? " - Aujourd'hui"
                      : ""}
                </Text>
                {exp.description && (
                  <Text fontSize={14} color={colors.gray700} marginTop="$2">
                    {exp.description}
                  </Text>
                )}
              </YStack>
              <XStack gap="$2">
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handleEditExperience(exp)}
                >
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handleDeleteExperience(exp.id)}
                >
                  Supprimer
                </Button>
              </XStack>
            </XStack>
          </YStack>
        ))}

        <YStack
          padding="$4"
          backgroundColor={colors.gray050}
          borderRadius="$3"
          gap="$4"
        >
          <Text fontSize={16} fontWeight="600" color={colors.gray900}>
            {editingExperienceId
              ? "Modifier l'expérience"
              : "Ajouter une expérience"}
          </Text>

          <YStack gap="$3">
            <Input
              label="Titre du poste"
              placeholder="Serveur, Barman..."
              value={experienceForm.title}
              onChangeText={(text) =>
                setExperienceForm({ ...experienceForm, title: text })
              }
            />
            <Input
              label="Entreprise"
              placeholder="Nom de l'entreprise"
              value={experienceForm.company}
              onChangeText={(text) =>
                setExperienceForm({ ...experienceForm, company: text })
              }
            />
            <Input
              label="Lieu"
              placeholder="Ville, Pays"
              value={experienceForm.location}
              onChangeText={(text) =>
                setExperienceForm({ ...experienceForm, location: text })
              }
            />
            <XStack gap="$3">
              <YStack flex={1}>
                <DatePicker
                  label="Date de début"
                  value={experienceForm.start_date}
                  onChangeText={(date) =>
                    setExperienceForm({
                      ...experienceForm,
                      start_date: date,
                    })
                  }
                />
              </YStack>
              <YStack flex={1}>
                <DatePicker
                  label="Date de fin"
                  value={experienceForm.end_date}
                  onChangeText={(date) =>
                    setExperienceForm({
                      ...experienceForm,
                      end_date: date,
                    })
                  }
                  disabled={experienceForm.is_current}
                />
              </YStack>
            </XStack>
            <Checkbox
              checked={experienceForm.is_current}
              onCheckedChange={(checked) =>
                setExperienceForm({
                  ...experienceForm,
                  is_current: checked as boolean,
                })
              }
              label="Poste actuel"
            />
            <Input
              label="Description"
              placeholder="Décrivez vos responsabilités..."
              value={experienceForm.description}
              onChangeText={(text) =>
                setExperienceForm({ ...experienceForm, description: text })
              }
              multiline
              numberOfLines={3}
            />
            <XStack gap="$2">
              <Button
                variant="primary"
                onPress={handleSaveExperience}
                disabled={isSaving}
              >
                {editingExperienceId ? "Modifier" : "Ajouter"}
              </Button>
              {editingExperienceId && (
                <Button variant="outline" onPress={handleCancelEditExperience}>
                  Annuler
                </Button>
              )}
            </XStack>
          </YStack>
        </YStack>
      </YStack>

      {/* Formations */}
      <YStack gap="$4">
        <Text fontSize={20} fontWeight="700" color={colors.gray900}>
          Formations
        </Text>

        {educationsList.map((edu) => (
          <YStack
            key={edu.id}
            padding="$4"
            backgroundColor={colors.gray050}
            borderRadius="$3"
            gap="$3"
          >
            <XStack justifyContent="space-between" alignItems="flex-start">
              <YStack flex={1} gap="$1">
                <Text fontSize={18} fontWeight="600" color={colors.gray900}>
                  {edu.school}
                </Text>
                {edu.degree && (
                  <Text fontSize={16} color={colors.gray700}>
                    {edu.degree}
                    {edu.field && ` - ${edu.field}`}
                  </Text>
                )}
                <Text fontSize={14} color={colors.gray500}>
                  {formatDateShort(edu.start_date)}
                  {edu.end_date && ` - ${formatDateShort(edu.end_date)}`}
                </Text>
              </YStack>
              <XStack gap="$2">
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handleEditEducation(edu)}
                >
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handleDeleteEducation(edu.id)}
                >
                  Supprimer
                </Button>
              </XStack>
            </XStack>
          </YStack>
        ))}

        <YStack
          padding="$4"
          backgroundColor={colors.gray050}
          borderRadius="$3"
          gap="$4"
        >
          <Text fontSize={16} fontWeight="600" color={colors.gray900}>
            {editingEducationId
              ? "Modifier la formation"
              : "Ajouter une formation"}
          </Text>

          <YStack gap="$3">
            <Input
              label="Établissement"
              placeholder="Nom de l'école/université"
              value={educationForm.school}
              onChangeText={(text) =>
                setEducationForm({ ...educationForm, school: text })
              }
            />
            <Input
              label="Diplôme"
              placeholder="BAC, Licence, Master..."
              value={educationForm.degree}
              onChangeText={(text) =>
                setEducationForm({ ...educationForm, degree: text })
              }
            />
            <Input
              label="Domaine"
              placeholder="Informatique, Marketing..."
              value={educationForm.field}
              onChangeText={(text) =>
                setEducationForm({ ...educationForm, field: text })
              }
            />
            <XStack gap="$3">
              <YStack flex={1}>
                <DatePicker
                  label="Date de début"
                  value={educationForm.start_date}
                  onChangeText={(date) =>
                    setEducationForm({
                      ...educationForm,
                      start_date: date,
                    })
                  }
                />
              </YStack>
              <YStack flex={1}>
                <DatePicker
                  label="Date de fin"
                  value={educationForm.end_date}
                  onChangeText={(date) =>
                    setEducationForm({
                      ...educationForm,
                      end_date: date,
                    })
                  }
                />
              </YStack>
            </XStack>
            <XStack gap="$2">
              <Button
                variant="primary"
                onPress={handleSaveEducation}
                disabled={isSaving}
              >
                {editingEducationId ? "Modifier" : "Ajouter"}
              </Button>
              {editingEducationId && (
                <Button variant="outline" onPress={handleCancelEditEducation}>
                  Annuler
                </Button>
              )}
            </XStack>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
