"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { YStack, XStack, Text, Image, ScrollView } from "tamagui";
import {
  Button,
  Input,
  ImagePicker,
  DatePicker,
  Checkbox,
  Select,
  colors,
} from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { AppLayout, PageLoading } from "@/components";
import { EditProfileTabs, type EditTabType } from "@/components/profile/EditProfileTabs";
import { useProfilePage, useResponsive, useFreelanceProfileForm } from "@/hooks";
import { useFormatDate } from "@/hooks";
import {
  FiCreditCard,
  FiChevronRight,
  FiCheck,
  FiAlertTriangle,
} from "react-icons/fi";

export default function ProfilePage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { formatDateShort } = useFormatDate();

  const [activeTab, setActiveTab] = useState<EditTabType>("personal");

  const {
    profile,
    isLoading,
    refresh,
    isSaving: isSavingProfile,
    error: profileError,
    success: profileSuccess,
    fieldErrors: profileFieldErrors,
    clearFieldError: clearProfileFieldError,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    siret,
    setSiret,
    cityOfResidence,
    setCityOfResidence,
    bio,
    setBio,
    photoUrl,
    isUploadingPhoto,
    handleSave,
    handlePhotoChange,
    handlePhotoRemove,
  } = useProfilePage();

  const {
    experiencesList,
    educationsList,
    experienceForm,
    setExperienceForm,
    educationForm,
    setEducationForm,
    editingExperienceId,
    editingEducationId,
    skills,
    skillInput,
    setSkillInput,
    dailyRate,
    setDailyRate,
    hourlyRate,
    setHourlyRate,
    availability,
    setAvailability,
    handleSaveProfile,
    handleAddSkill,
    handleRemoveSkill,
    handleSaveExperience,
    handleDeleteExperience,
    handleEditExperience,
    handleCancelEditExperience,
    handleSaveEducation,
    handleDeleteEducation,
    handleEditEducation,
    handleCancelEditEducation,
    isSaving: isSavingFreelance,
    error: freelanceError,
    success: freelanceSuccess,
    fieldErrors: freelanceFieldErrors,
    clearFieldError: clearFreelanceFieldError,
  } = useFreelanceProfileForm({ onSave: async () => await refresh() });

  if (isLoading) {
    return <PageLoading />;
  }

  const isFreelance = profile?.role === "freelance";
  const showPayments =
    profile?.role === "freelance" || profile?.role === "commercial";

  const tabs: EditTabType[] = isFreelance
    ? ["personal", "freelance", "account"]
    : ["personal", "account"];

  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack
          flex={1}
          alignItems="center"
          padding={isMobile ? "$4" : "$6"}
          paddingTop="$8"
          paddingBottom="$8"
        >
          <YStack maxWidth={800} gap="$4" style={{ width: "100%" }}>
            {/* En-tête */}
            <YStack gap="$4">
              <XStack
                flexDirection={isMobile ? "column" : "row"}
                justifyContent="space-between"
                alignItems={isMobile ? "flex-start" : "center"}
                gap={isMobile ? "$4" : undefined}
              >
                <YStack gap="$2">
                  <Text fontSize={24} fontWeight="700" color="#2B2B2B">
                    Mon Profil
                  </Text>
                  <Text fontSize={14} color="#6B7280">
                    {firstName && lastName
                      ? `${firstName} ${lastName}`
                      : email || "Utilisateur"}
                  </Text>
                </YStack>
                {photoUrl ? (
                  <YStack
                    width={64}
                    height={64}
                    borderRadius={32}
                    overflow="hidden"
                    borderWidth={2}
                    borderColor={colors.shiftlyViolet}
                  >
                    <Image
                      source={{ uri: photoUrl }}
                      width={64}
                      height={64}
                      style={{ width: 64, height: 64, objectFit: "cover" }}
                    />
                  </YStack>
                ) : (
                  <YStack
                    width={64}
                    height={64}
                    borderRadius={32}
                    backgroundColor={colors.shiftlyViolet}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={28} color="white" fontWeight="600">
                      {firstName.charAt(0).toUpperCase() || "?"}
                      {lastName.charAt(0).toUpperCase() || ""}
                    </Text>
                  </YStack>
                )}
              </XStack>

              {/* Barre d'onglets */}
              <EditProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={tabs}
              />
            </YStack>

            {/* Contenu des onglets */}
            <YStack gap="$4">
              {/* ── Onglet : Informations personnelles ── */}
              {activeTab === "personal" && (
                <YStack gap="$4">
                  <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                    Informations personnelles
                  </Text>

                  {profileError && (
                    <YStack
                      padding="$3"
                      backgroundColor="#FEE2E2"
                      borderRadius="$3"
                      borderWidth={1}
                      borderColor="#EF4444"
                    >
                      <Text fontSize={14} color="#DC2626" fontWeight="500">
                        {profileError}
                      </Text>
                    </YStack>
                  )}
                  {profileSuccess && (
                    <YStack
                      padding="$3"
                      backgroundColor="#D1FAE5"
                      borderRadius="$3"
                      borderWidth={1}
                      borderColor="#10B981"
                    >
                      <Text fontSize={14} color="#059669" fontWeight="500">
                        {profileSuccess}
                      </Text>
                    </YStack>
                  )}

                  {/* Photo de profil */}
                  <YStack gap="$2">
                    <ImagePicker
                      value={photoUrl}
                      onChange={handlePhotoChange}
                      onRemove={handlePhotoRemove}
                      disabled={isUploadingPhoto}
                      shape="circle"
                      size={150}
                      placeholder="Cliquez pour ajouter une photo"
                    />
                    {isUploadingPhoto && (
                      <Text
                        fontSize={14}
                        color={colors.shiftlyViolet}
                        fontWeight="500"
                      >
                        Upload en cours...
                      </Text>
                    )}
                  </YStack>

                  {/* Nom et Prénom */}
                  <XStack
                    gap="$3"
                    flexDirection={isMobile ? "column" : "row"}
                    style={{ width: "100%" }}
                  >
                    <YStack flex={1}>
                      <Input
                        label="Prénom"
                        placeholder="Votre prénom"
                        value={firstName}
                        onChangeText={(value) => {
                          setFirstName(value);
                          clearProfileFieldError("firstName");
                        }}
                        error={profileFieldErrors.firstName}
                      />
                    </YStack>
                    <YStack flex={1}>
                      <Input
                        label="Nom"
                        placeholder="Votre nom"
                        value={lastName}
                        onChangeText={(value) => {
                          setLastName(value);
                          clearProfileFieldError("lastName");
                        }}
                        error={profileFieldErrors.lastName}
                      />
                    </YStack>
                  </XStack>

                  <Input
                    label="Adresse e-mail"
                    placeholder="exemple@email.com"
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      clearProfileFieldError("email");
                    }}
                    keyboardType="email-address"
                    autoComplete="email"
                    error={profileFieldErrors.email}
                  />

                  <Input
                    label="Téléphone"
                    placeholder="0612345678"
                    value={phone}
                    onChangeText={(value) => {
                      setPhone(value);
                      clearProfileFieldError("phone");
                    }}
                    keyboardType="phone-pad"
                    error={profileFieldErrors.phone}
                  />

                  <Input
                    label="Ville de résidence"
                    placeholder="Paris"
                    value={cityOfResidence}
                    onChangeText={(value) => {
                      setCityOfResidence(value);
                      clearProfileFieldError("cityOfResidence");
                    }}
                    error={profileFieldErrors.cityOfResidence}
                  />

                  <Input
                    label="SIRET"
                    placeholder="12345678901234"
                    value={siret}
                    onChangeText={(value) => {
                      setSiret(value);
                      clearProfileFieldError("siret");
                    }}
                    keyboardType="number-pad"
                    error={profileFieldErrors.siret}
                  />

                  <YStack gap="$2">
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color={colors.gray900}
                    >
                      Biographie
                    </Text>
                    <Input
                      placeholder={
                        bio && bio.trim() ? undefined : "Parlez-nous de vous..."
                      }
                      value={bio || ""}
                      onChangeText={(value) => {
                        setBio(value);
                        clearProfileFieldError("bio");
                      }}
                      multiline
                      numberOfLines={4}
                      error={profileFieldErrors.bio}
                    />
                  </YStack>

                  <Button
                    variant="primary"
                    size="lg"
                    onPress={handleSave}
                    disabled={isSavingProfile}
                    opacity={isSavingProfile ? 0.6 : 1}
                  >
                    {isSavingProfile ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </YStack>
              )}

              {/* ── Onglet : Profil freelance ── */}
              {activeTab === "freelance" && (
                <YStack gap="$4">
                  <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                    Profil freelance
                  </Text>

                  {freelanceError && (
                    <YStack
                      padding="$3"
                      backgroundColor="#FEE2E2"
                      borderRadius="$3"
                      borderWidth={1}
                      borderColor="#EF4444"
                    >
                      <Text fontSize={14} color="#DC2626" fontWeight="500">
                        {freelanceError}
                      </Text>
                    </YStack>
                  )}
                  {freelanceSuccess && (
                    <YStack
                      padding="$3"
                      backgroundColor="#D1FAE5"
                      borderRadius="$3"
                      borderWidth={1}
                      borderColor="#10B981"
                    >
                      <Text fontSize={14} color="#059669" fontWeight="500">
                        {freelanceSuccess}
                      </Text>
                    </YStack>
                  )}

                  {/* Compétences */}
                  <YStack gap="$2">
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color={colors.gray900}
                    >
                      Compétences
                    </Text>
                    <XStack
                      gap="$2"
                      flexDirection={isMobile ? "column" : "row"}
                      style={{ width: isMobile ? "100%" : "88%" }}
                    >
                      <Input
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

                  {/* TJM + Tarif horaire + Dispo */}
                  <XStack
                    gap="$3"
                    flexDirection={isMobile ? "column" : "row"}
                    flexWrap="wrap"
                  >
                    <YStack
                      flex={isMobile ? undefined : 1}
                      gap="$2"
                      width={isMobile ? "100%" : undefined}
                    >
                      <Text
                        fontSize={14}
                        fontWeight="600"
                        color={colors.gray900}
                      >
                        TJM (€)
                      </Text>
                      <Input
                        placeholder="300"
                        value={dailyRate}
                        onChangeText={(value) => {
                          setDailyRate(value);
                          clearFreelanceFieldError("dailyRate");
                        }}
                        keyboardType="numeric"
                        error={freelanceFieldErrors.dailyRate}
                      />
                      {dailyRate &&
                        !isNaN(parseFloat(dailyRate)) &&
                        parseFloat(dailyRate) > 0 && (
                          <YStack gap="$1" marginTop="$1">
                            <Text fontSize={12} color={colors.gray700}>
                              Frais de plateforme: 15%
                            </Text>
                            <Text
                              fontSize={14}
                              fontWeight="600"
                              color={colors.shiftlyViolet}
                            >
                              TJM net:{" "}
                              {(parseFloat(dailyRate) * 0.85).toFixed(2)} €
                            </Text>
                          </YStack>
                        )}
                    </YStack>
                    <YStack
                      flex={isMobile ? undefined : 1}
                      gap="$2"
                      width={isMobile ? "100%" : undefined}
                    >
                      <Text
                        fontSize={14}
                        fontWeight="600"
                        color={colors.gray900}
                      >
                        Tarif horaire (€)
                      </Text>
                      <Input
                        placeholder="20"
                        value={hourlyRate}
                        onChangeText={(value) => {
                          setHourlyRate(value);
                          clearFreelanceFieldError("hourlyRate");
                        }}
                        keyboardType="numeric"
                        error={freelanceFieldErrors.hourlyRate}
                      />
                    </YStack>
                    <YStack
                      flex={isMobile ? undefined : 1}
                      gap="$2"
                      width={isMobile ? "100%" : undefined}
                    >
                      <Select
                        label="Disponibilité"
                        placeholder="Sélectionner une disponibilité"
                        value={availability}
                        onValueChange={setAvailability}
                        options={[
                          { label: "Temps plein", value: "temps_plein" },
                          { label: "Temps partiel", value: "temps_partiel" },
                          {
                            label: "Week-end et soirée",
                            value: "weekend_soiree",
                          },
                          {
                            label: "Soirée uniquement",
                            value: "soiree",
                          },
                          {
                            label: "Week-end uniquement",
                            value: "weekend",
                          },
                          {
                            label: "Disponibilité flexible",
                            value: "flexible",
                          },
                          {
                            label: "Ponctuel / Événements",
                            value: "ponctuel",
                          },
                        ]}
                      />
                    </YStack>
                  </XStack>

                  <Button
                    variant="primary"
                    size="lg"
                    onPress={handleSaveProfile}
                    disabled={isSavingFreelance}
                    opacity={isSavingFreelance ? 0.6 : 1}
                  >
                    {isSavingFreelance ? "Enregistrement..." : "Enregistrer"}
                  </Button>

                  {/* ── Séparateur ── */}
                  <YStack
                    height={1}
                    backgroundColor={colors.gray200}
                    marginVertical="$2"
                  />

                  {/* ── Section : Expériences professionnelles ── */}
                  <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                    Expériences professionnelles
                  </Text>

                  {experiencesList.map((exp) => (
                    <YStack
                      key={exp.id}
                      padding="$4"
                      backgroundColor={colors.white}
                      borderRadius="$3"
                      borderWidth={1}
                      borderColor={colors.gray200}
                      gap="$3"
                    >
                      <XStack
                        justifyContent="space-between"
                        alignItems="flex-start"
                        flexDirection={isMobile ? "column" : "row"}
                        gap={isMobile ? "$3" : undefined}
                      >
                        <YStack
                          flex={1}
                          gap="$1"
                          width={isMobile ? "100%" : undefined}
                        >
                          <Text
                            fontSize={18}
                            fontWeight="600"
                            color={colors.gray900}
                          >
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
                            <Text
                              fontSize={14}
                              color={colors.gray700}
                              marginTop="$2"
                            >
                              {exp.description}
                            </Text>
                          )}
                        </YStack>
                        <XStack
                          gap="$2"
                          flexDirection={isMobile ? "column" : "row"}
                          width={isMobile ? "100%" : undefined}
                        >
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
                    backgroundColor={colors.white}
                    borderRadius="$3"
                    borderWidth={1}
                    borderColor={colors.gray200}
                    gap="$4"
                  >
                    <Text
                      fontSize={16}
                      fontWeight="600"
                      color={colors.gray900}
                    >
                      {editingExperienceId
                        ? "Modifier l'expérience"
                        : "Ajouter une expérience"}
                    </Text>

                    <YStack gap="$3">
                      <Input
                        label="Titre du poste"
                        placeholder="Serveur, Barman..."
                        value={experienceForm.title}
                        onChangeText={(text) => {
                          setExperienceForm({ ...experienceForm, title: text });
                          clearFreelanceFieldError("experienceTitle");
                        }}
                        error={freelanceFieldErrors.experienceTitle}
                      />
                      <Input
                        label="Entreprise"
                        placeholder="Nom de l'entreprise"
                        value={experienceForm.company}
                        onChangeText={(text) => {
                          setExperienceForm({
                            ...experienceForm,
                            company: text,
                          });
                          clearFreelanceFieldError("experienceCompany");
                        }}
                        error={freelanceFieldErrors.experienceCompany}
                      />
                      <Input
                        label="Lieu"
                        placeholder="Ville, Pays"
                        value={experienceForm.location}
                        onChangeText={(text) =>
                          setExperienceForm({
                            ...experienceForm,
                            location: text,
                          })
                        }
                      />
                      <XStack
                        gap="$3"
                        flexDirection={isMobile ? "column" : "row"}
                      >
                        <YStack
                          flex={isMobile ? undefined : 1}
                          width={isMobile ? "100%" : undefined}
                        >
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
                        <YStack
                          flex={isMobile ? undefined : 1}
                          width={isMobile ? "100%" : undefined}
                        >
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
                          setExperienceForm({
                            ...experienceForm,
                            description: text,
                          })
                        }
                        multiline
                        numberOfLines={3}
                      />
                      <XStack
                        gap="$2"
                        flexDirection={isMobile ? "column" : "row"}
                      >
                        <Button
                          variant="primary"
                          onPress={handleSaveExperience}
                          disabled={isSavingFreelance}
                        >
                          {editingExperienceId ? "Modifier" : "Ajouter"}
                        </Button>
                        {editingExperienceId && (
                          <Button
                            variant="outline"
                            onPress={handleCancelEditExperience}
                          >
                            Annuler
                          </Button>
                        )}
                      </XStack>
                    </YStack>
                  </YStack>

                  {/* ── Séparateur ── */}
                  <YStack
                    height={1}
                    backgroundColor={colors.gray200}
                    marginVertical="$2"
                  />

                  {/* ── Section : Formations ── */}
                  <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                    Formations
                  </Text>

                  {educationsList.map((edu) => (
                    <YStack
                      key={edu.id}
                      padding="$4"
                      backgroundColor={colors.white}
                      borderRadius="$3"
                      borderWidth={1}
                      borderColor={colors.gray200}
                      gap="$3"
                    >
                      <XStack
                        justifyContent="space-between"
                        alignItems="flex-start"
                        flexDirection={isMobile ? "column" : "row"}
                        gap={isMobile ? "$3" : undefined}
                      >
                        <YStack
                          flex={1}
                          gap="$1"
                          width={isMobile ? "100%" : undefined}
                        >
                          <Text
                            fontSize={18}
                            fontWeight="600"
                            color={colors.gray900}
                          >
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
                            {edu.end_date &&
                              ` - ${formatDateShort(edu.end_date)}`}
                          </Text>
                        </YStack>
                        <XStack
                          gap="$2"
                          flexDirection={isMobile ? "column" : "row"}
                          width={isMobile ? "100%" : undefined}
                        >
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
                    backgroundColor={colors.white}
                    borderRadius="$3"
                    borderWidth={1}
                    borderColor={colors.gray200}
                    gap="$4"
                  >
                    <Text
                      fontSize={16}
                      fontWeight="600"
                      color={colors.gray900}
                    >
                      {editingEducationId
                        ? "Modifier la formation"
                        : "Ajouter une formation"}
                    </Text>

                    <YStack gap="$3">
                      <Input
                        label="Établissement"
                        placeholder="Nom de l'école/université"
                        value={educationForm.school}
                        onChangeText={(text) => {
                          setEducationForm({ ...educationForm, school: text });
                          clearFreelanceFieldError("educationSchool");
                        }}
                        error={freelanceFieldErrors.educationSchool}
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
                      <XStack
                        gap="$3"
                        flexDirection={isMobile ? "column" : "row"}
                      >
                        <YStack
                          flex={isMobile ? undefined : 1}
                          width={isMobile ? "100%" : undefined}
                        >
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
                        <YStack
                          flex={isMobile ? undefined : 1}
                          width={isMobile ? "100%" : undefined}
                        >
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
                      <XStack
                        gap="$2"
                        flexDirection={isMobile ? "column" : "row"}
                      >
                        <Button
                          variant="primary"
                          onPress={handleSaveEducation}
                          disabled={isSavingFreelance}
                        >
                          {editingEducationId ? "Modifier" : "Ajouter"}
                        </Button>
                        {editingEducationId && (
                          <Button
                            variant="outline"
                            onPress={handleCancelEditEducation}
                          >
                            Annuler
                          </Button>
                        )}
                      </XStack>
                    </YStack>
                  </YStack>
                </YStack>
              )}

              {/* ── Onglet : Compte ── */}
              {activeTab === "account" && (
                <YStack gap="$4">
                  <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                    Compte
                  </Text>

                  {/* Détails du compte */}
                  <YStack gap="$3">
                    <Text
                      fontSize={16}
                      fontWeight="600"
                      color={colors.gray900}
                    >
                      Détails du compte
                    </Text>

                    <XStack justifyContent="space-between">
                      <Text fontSize={14} color="#6B7280">
                        Rôle
                      </Text>
                      <Text fontSize={14} fontWeight="500" color="#2B2B2B">
                        {profile?.role || "Non défini"}
                      </Text>
                    </XStack>

                    <XStack justifyContent="space-between">
                      <Text fontSize={14} color="#6B7280">
                        Date d'inscription
                      </Text>
                      <Text fontSize={14} fontWeight="500" color="#2B2B2B">
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString(
                              "fr-FR"
                            )
                          : "N/A"}
                      </Text>
                    </XStack>

                    <XStack justifyContent="space-between">
                      <Text fontSize={14} color="#6B7280">
                        Dernière modification
                      </Text>
                      <Text fontSize={14} fontWeight="500" color="#2B2B2B">
                        {profile?.updated_at
                          ? new Date(profile.updated_at).toLocaleDateString(
                              "fr-FR"
                            )
                          : "N/A"}
                      </Text>
                    </XStack>
                  </YStack>

                  {/* Paramètres de paiement */}
                  {showPayments && (
                    <YStack gap="$3">
                      <XStack
                        justifyContent="space-between"
                        alignItems={isMobile ? "flex-start" : "center"}
                        flexDirection={isMobile ? "column" : "row"}
                        gap={isMobile ? "$2" : undefined}
                      >
                        <Text
                          fontSize={16}
                          fontWeight="600"
                          color={colors.gray900}
                        >
                          Paramètres de paiement
                        </Text>
                        {profile?.connect_onboarding_status === "complete" &&
                        profile?.connect_payouts_enabled ? (
                          <XStack
                            backgroundColor={colors.shiftlyViolet + "20"}
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            borderRadius="$2"
                            alignItems="center"
                            gap="$1"
                          >
                            <FiCheck size={14} color={colors.shiftlyViolet} />
                            <Text
                              fontSize={12}
                              fontWeight="600"
                              color={colors.shiftlyViolet}
                            >
                              Activé
                            </Text>
                          </XStack>
                        ) : profile?.connect_onboarding_status === "pending" ? (
                          <XStack
                            backgroundColor="#FEF3C7"
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            borderRadius="$2"
                            alignItems="center"
                            gap="$1"
                          >
                            <FiAlertTriangle size={14} color="#D97706" />
                            <Text fontSize={12} fontWeight="600" color="#D97706">
                              En attente
                            </Text>
                          </XStack>
                        ) : null}
                      </XStack>

                      <Text fontSize={14} color="#6B7280">
                        {profile?.role === "freelance"
                          ? "Configurez votre compte pour recevoir vos paiements de missions."
                          : "Configurez votre compte pour recevoir vos commissions."}
                      </Text>

                      <XStack
                        backgroundColor={colors.gray100}
                        padding="$4"
                        borderRadius="$3"
                        alignItems={isMobile ? "flex-start" : "center"}
                        justifyContent="space-between"
                        flexDirection={isMobile ? "column" : "row"}
                        gap={isMobile ? "$3" : undefined}
                        pressStyle={{ opacity: 0.8 }}
                        cursor="pointer"
                        onPress={() => router.push("/settings/payments")}
                      >
                        <XStack
                          alignItems="center"
                          gap="$3"
                          width={isMobile ? "100%" : undefined}
                        >
                          <XStack
                            width={40}
                            height={40}
                            borderRadius={20}
                            backgroundColor={colors.shiftlyViolet + "20"}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <FiCreditCard
                              size={20}
                              color={colors.shiftlyViolet}
                            />
                          </XStack>
                          <YStack>
                            <Text
                              fontSize={15}
                              fontWeight="600"
                              color="#2B2B2B"
                            >
                              Gérer mes paiements
                            </Text>
                            <Text fontSize={13} color="#6B7280">
                              {profile?.connect_onboarding_status ===
                                "complete" &&
                              profile?.connect_payouts_enabled
                                ? "Voir et modifier mes informations de paiement"
                                : "Activer mes paiements via Stripe"}
                            </Text>
                          </YStack>
                        </XStack>
                        <FiChevronRight size={20} color="#6B7280" />
                      </XStack>
                    </YStack>
                  )}
                </YStack>
              )}
            </YStack>

          </YStack>
        </YStack>
      </ScrollView>

    </AppLayout>
  );
}
