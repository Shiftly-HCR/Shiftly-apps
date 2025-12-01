"use client";

import { YStack, XStack, Text } from "tamagui";
import { Button, Input, DatePicker, Checkbox, colors } from "@shiftly/ui";
import { useState, useEffect } from "react";
import type {
  FreelanceExperience,
  FreelanceEducation,
  LinkedInProfileData,
} from "@shiftly/data";
import {
  updateFreelanceProfile,
  upsertFreelanceExperience,
  upsertFreelanceEducation,
  deleteFreelanceExperience,
  deleteFreelanceEducation,
  syncLinkedInData,
} from "@shiftly/data";
import { useFreelanceData } from "@/hooks";

interface FreelanceProfileFormProps {
  onSave?: () => void;
}

export function FreelanceProfileForm({ onSave }: FreelanceProfileFormProps) {
  const {
    freelanceProfile,
    experiences,
    educations,
    isLoading,
    refreshProfile,
    refreshExperiences,
    refreshEducations,
  } = useFreelanceData();

  // États pour le profil
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState("");

  // États pour les expériences
  const [experiencesList, setExperiencesList] = useState<FreelanceExperience[]>([]);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [experienceForm, setExperienceForm] = useState({
    title: "",
    company: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  });

  // États pour les formations
  const [educationsList, setEducationsList] = useState<FreelanceEducation[]>([]);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [educationForm, setEducationForm] = useState({
    school: "",
    degree: "",
    field: "",
    start_date: "",
    end_date: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Charger les données au montage
  useEffect(() => {
    if (freelanceProfile) {
      setBio(freelanceProfile.bio || "");
      setSkills(freelanceProfile.skills || []);
      setHourlyRate(freelanceProfile.hourly_rate?.toString() || "");
      setAvailability(freelanceProfile.availability || "");
    }
    setExperiencesList(experiences);
    setEducationsList(educations);
  }, [freelanceProfile, experiences, educations]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateFreelanceProfile({
        bio,
        skills,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        availability,
      });

      if (result.success) {
        setSuccess("Profil mis à jour avec succès !");
        await refreshProfile();
        onSave?.();
      } else {
        setError(result.error || "Erreur lors de la mise à jour");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveExperience = async () => {
    if (!experienceForm.title || !experienceForm.company) {
      setError("Le titre et l'entreprise sont requis");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await upsertFreelanceExperience({
        id: editingExperienceId || undefined,
        ...experienceForm,
        start_date: experienceForm.start_date || undefined,
        end_date: experienceForm.is_current ? undefined : experienceForm.end_date || undefined,
      });

      if (result.success) {
        setSuccess("Expérience sauvegardée avec succès !");
        setEditingExperienceId(null);
        setExperienceForm({
          title: "",
          company: "",
          location: "",
          start_date: "",
          end_date: "",
          is_current: false,
          description: "",
        });
        await refreshExperiences();
      } else {
        setError(result.error || "Erreur lors de la sauvegarde");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await deleteFreelanceExperience(id);
      if (result.success) {
        setSuccess("Expérience supprimée avec succès !");
        await refreshExperiences();
      } else {
        setError(result.error || "Erreur lors de la suppression");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditExperience = (exp: FreelanceExperience) => {
    setEditingExperienceId(exp.id);
    setExperienceForm({
      title: exp.title || "",
      company: exp.company || "",
      location: exp.location || "",
      start_date: exp.start_date || "",
      end_date: exp.end_date || "",
      is_current: exp.is_current || false,
      description: exp.description || "",
    });
  };

  const handleSaveEducation = async () => {
    if (!educationForm.school) {
      setError("L'établissement est requis");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await upsertFreelanceEducation({
        id: editingEducationId || undefined,
        ...educationForm,
        start_date: educationForm.start_date || undefined,
        end_date: educationForm.end_date || undefined,
      });

      if (result.success) {
        setSuccess("Formation sauvegardée avec succès !");
        setEditingEducationId(null);
        setEducationForm({
          school: "",
          degree: "",
          field: "",
          start_date: "",
          end_date: "",
        });
        await refreshEducations();
      } else {
        setError(result.error || "Erreur lors de la sauvegarde");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await deleteFreelanceEducation(id);
      if (result.success) {
        setSuccess("Formation supprimée avec succès !");
        await refreshEducations();
      } else {
        setError(result.error || "Erreur lors de la suppression");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditEducation = (edu: FreelanceEducation) => {
    setEditingEducationId(edu.id);
    setEducationForm({
      school: edu.school || "",
      degree: edu.degree || "",
      field: edu.field || "",
      start_date: edu.start_date || "",
      end_date: edu.end_date || "",
    });
  };

  const handleSyncLinkedIn = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await syncLinkedInData();
      if (result.success) {
        setSuccess("Données LinkedIn synchronisées avec succès !");
        await Promise.all([refreshProfile(), refreshExperiences(), refreshEducations()]);
      } else {
        setError(result.error || "Erreur lors de la synchronisation");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

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
          <Button variant="outline" size="sm" onPress={handleSyncLinkedIn} disabled={isSaving}>
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
                  <Text fontSize={14} color={colors.shiftlyViolet} fontWeight="600">
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
              <Text fontSize={14} fontWeight="600" color={colors.gray900}>
                Disponibilité
              </Text>
              <Input
                placeholder="Temps plein, Temps partiel..."
                value={availability}
                onChangeText={setAvailability}
              />
            </YStack>
          </XStack>
        </YStack>

        <Button
          variant="primary"
          size="lg"
          onPress={handleSaveProfile}
          disabled={isSaving}
          opacity={isSaving ? 0.6 : 1}
        >
          {isSaving ? "Enregistrement..." : "Enregistrer les informations générales"}
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
                  {exp.start_date &&
                    new Date(exp.start_date).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                    })}
                  {exp.end_date
                    ? ` - ${new Date(exp.end_date).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "short",
                      })}`
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
            {editingExperienceId ? "Modifier l'expérience" : "Ajouter une expérience"}
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
                  onChange={(date) =>
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
                  onChange={(date) =>
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
                <Button
                  variant="outline"
                  onPress={() => {
                    setEditingExperienceId(null);
                    setExperienceForm({
                      title: "",
                      company: "",
                      location: "",
                      start_date: "",
                      end_date: "",
                      is_current: false,
                      description: "",
                    });
                  }}
                >
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
                  {edu.start_date &&
                    new Date(edu.start_date).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                    })}
                  {edu.end_date &&
                    ` - ${new Date(edu.end_date).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                    })}`}
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
            {editingEducationId ? "Modifier la formation" : "Ajouter une formation"}
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
                  onChange={(date) =>
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
                  onChange={(date) =>
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
                <Button
                  variant="outline"
                  onPress={() => {
                    setEditingEducationId(null);
                    setEducationForm({
                      school: "",
                      degree: "",
                      field: "",
                      start_date: "",
                      end_date: "",
                    });
                  }}
                >
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

