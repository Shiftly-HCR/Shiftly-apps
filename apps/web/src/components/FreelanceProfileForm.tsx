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
import { useFreelanceData } from "@/hooks/useFreelanceData";

interface FreelanceProfileFormProps {
  onSave?: () => void;
}

export function FreelanceProfileForm({ onSave }: FreelanceProfileFormProps) {
  const {
    freelanceProfile,
    experiences: cachedExperiences,
    educations: cachedEducations,
    isLoading,
    refreshProfile,
    refreshExperiences,
    refreshEducations,
  } = useFreelanceData();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // État pour l'import LinkedIn
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Champs du profil
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Expériences
  const [experiences, setExperiences] = useState<FreelanceExperience[]>([]);

  // Formations
  const [educations, setEducations] = useState<FreelanceEducation[]>([]);

  // Initialiser les champs avec les données du cache
  useEffect(() => {
    if (freelanceProfile) {
      setFirstName(freelanceProfile.first_name || "");
      setLastName(freelanceProfile.last_name || "");
      setEmail(freelanceProfile.email || "");
      setPhone(freelanceProfile.phone || "");
      setHeadline(freelanceProfile.headline || "");
      setLocation(freelanceProfile.location || "");
      setSummary(freelanceProfile.summary || "");
      setSkills(freelanceProfile.skills || []);
    }
    setExperiences(cachedExperiences);
    setEducations(cachedEducations);
  }, [freelanceProfile, cachedExperiences, cachedEducations]);

  const handleImportLinkedIn = async () => {
    if (!linkedInUrl.trim()) {
      setError("Veuillez entrer une URL LinkedIn");
      return;
    }

    // Validation basique de l'URL
    if (!linkedInUrl.includes("linkedin.com/in/")) {
      setError(
        "L'URL LinkedIn n'est pas valide. Format attendu: https://www.linkedin.com/in/..."
      );
      return;
    }

    setIsImporting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ linkedinUrl: linkedInUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Gestion des erreurs spécifiques selon le code de statut
        let errorMessage = data.error || "Erreur lors de l'import";

        if (response.status === 400) {
          errorMessage =
            data.error ||
            "URL LinkedIn invalide. Vérifiez que l'URL est correcte.";
        } else if (response.status === 404) {
          errorMessage =
            data.error ||
            "Profil LinkedIn introuvable. Le profil est peut-être privé ou l'URL est incorrecte.";
        } else if (response.status === 500) {
          errorMessage =
            data.error ||
            "Erreur serveur. Veuillez réessayer plus tard ou contacter le support.";
        }

        throw new Error(errorMessage);
      }

      const linkedInData: LinkedInProfileData = data;

      // Vérifier que des données ont été récupérées
      if (!linkedInData.fullName && linkedInData.experiences.length === 0) {
        throw new Error("Aucune donnée trouvée pour ce profil LinkedIn.");
      }

      // Synchroniser les données avec Supabase
      const syncResult = await syncLinkedInData(linkedInData);

      if (!syncResult.success) {
        throw new Error(
          syncResult.error || "Erreur lors de la synchronisation des données"
        );
      }

      // Rafraîchir le cache
      await refreshProfile();
      await refreshExperiences();
      await refreshEducations();

      setSuccess(
        "Profil LinkedIn importé avec succès ! Les données ont été pré-remplies dans le formulaire."
      );
      setLinkedInUrl("");
    } catch (err: any) {
      // Afficher un message d'erreur clair et lisible
      const errorMessage =
        err.message ||
        "Une erreur inattendue est survenue lors de l'import LinkedIn. Veuillez réessayer.";
      setError(errorMessage);
      console.error("Erreur import LinkedIn:", err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: undefined,
        user_id: "",
        title: "",
        company: "",
        start_date: undefined,
        end_date: undefined,
        is_current: false,
        location: "",
        description: "",
      },
    ]);
  };

  const handleUpdateExperience = (
    index: number,
    field: keyof FreelanceExperience,
    value: any
  ) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const handleRemoveExperience = async (index: number) => {
    const exp = experiences[index];
    if (exp.id) {
      await deleteFreelanceExperience(exp.id);
    }
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleAddEducation = () => {
    setEducations([
      ...educations,
      {
        id: undefined,
        user_id: "",
        school: "",
        degree: "",
        field: "",
        start_date: undefined,
        end_date: undefined,
      },
    ]);
  };

  const handleUpdateEducation = (
    index: number,
    field: keyof FreelanceEducation,
    value: any
  ) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  const handleRemoveEducation = async (index: number) => {
    const edu = educations[index];
    if (edu.id) {
      await deleteFreelanceEducation(edu.id);
    }
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      // Mettre à jour le profil
      const profileResult = await updateFreelanceProfile({
        firstName,
        lastName,
        email,
        phone,
        headline,
        location,
        summary,
        skills,
      });

      if (!profileResult.success) {
        throw new Error(
          profileResult.error || "Erreur lors de la mise à jour du profil"
        );
      }

      // Sauvegarder les expériences
      for (const exp of experiences) {
        await upsertFreelanceExperience({
          id: exp.id,
          user_id: exp.user_id,
          title: exp.title,
          company: exp.company,
          start_date: exp.start_date,
          end_date: exp.end_date,
          is_current: exp.is_current,
          location: exp.location,
          description: exp.description,
        });
      }

      // Sauvegarder les formations
      for (const edu of educations) {
        await upsertFreelanceEducation({
          id: edu.id,
          user_id: edu.user_id,
          school: edu.school,
          degree: edu.degree,
          field: edu.field,
          start_date: edu.start_date,
          end_date: edu.end_date,
        });
      }

      // Rafraîchir le cache
      await refreshProfile();
      await refreshExperiences();
      await refreshEducations();

      setSuccess("Profil mis à jour avec succès !");
      onSave?.();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <YStack padding="$4" alignItems="center">
        <Text fontSize={16} color="#6B7280">
          Chargement...
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$4" style={{ width: "100%" }}>
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

      {/* Section Import LinkedIn */}
      <YStack
        padding="$6"
        backgroundColor="white"
        borderRadius="$4"
        borderWidth={1}
        borderColor="#E5E5E5"
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={1}
        shadowRadius={12}
        gap="$4"
      >
        <Text fontSize={18} fontWeight="600" color="#2B2B2B">
          Importer depuis LinkedIn
        </Text>
        <Text fontSize={14} color="#6B7280">
          Importez vos informations professionnelles depuis votre profil
          LinkedIn
        </Text>

        <XStack gap="$3" width="100%">
          <YStack flex={1}>
            <Input
              placeholder="https://www.linkedin.com/in/votre-profil"
              value={linkedInUrl}
              onChangeText={setLinkedInUrl}
              disabled={isImporting}
            />
          </YStack>
          <Button
            variant="primary"
            size="lg"
            onPress={handleImportLinkedIn}
            disabled={isImporting}
            opacity={isImporting ? 0.6 : 1}
          >
            {isImporting ? "Import en cours..." : "Importer"}
          </Button>
        </XStack>
      </YStack>

      {/* Informations générales */}
      <YStack
        padding="$6"
        backgroundColor="white"
        borderRadius="$4"
        borderWidth={1}
        borderColor="#E5E5E5"
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={1}
        shadowRadius={12}
        gap="$4"
      >
        <Text fontSize={18} fontWeight="600" color="#2B2B2B">
          Informations générales
        </Text>

        <XStack gap="$3" width="100%">
          <YStack flex={1}>
            <Input
              label="Prénom"
              value={firstName}
              onChangeText={setFirstName}
              required
            />
          </YStack>
          <YStack flex={1}>
            <Input
              label="Nom"
              value={lastName}
              onChangeText={setLastName}
              required
            />
          </YStack>
        </XStack>

        <Input
          label="Adresse e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          required
        />

        <Input
          label="Téléphone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Input
          label="Titre professionnel"
          placeholder="Ex: Développeur Full Stack"
          value={headline}
          onChangeText={setHeadline}
        />

        <Input
          label="Localisation"
          placeholder="Ex: Paris, France"
          value={location}
          onChangeText={setLocation}
        />

        <YStack gap="$2">
          <Text fontSize={14} fontWeight="600" color="#2B2B2B">
            Résumé professionnel
          </Text>
          <Input
            placeholder="Parlez-nous de votre parcours..."
            value={summary}
            onChangeText={setSummary}
            multiline
            numberOfLines={6}
          />
        </YStack>

        {/* Compétences */}
        <YStack gap="$2">
          <Text fontSize={14} fontWeight="600" color="#2B2B2B">
            Compétences
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            {skills.map((skill) => (
              <XStack
                key={skill}
                paddingHorizontal="$3"
                paddingVertical="$2"
                backgroundColor={colors.shiftlyVioletLight}
                borderRadius="$3"
                alignItems="center"
                gap="$2"
              >
                <Text fontSize={14} color="#2B2B2B">
                  {skill}
                </Text>
                <Text
                  fontSize={16}
                  color={colors.shiftlyViolet}
                  cursor="pointer"
                  onPress={() => handleRemoveSkill(skill)}
                >
                  ×
                </Text>
              </XStack>
            ))}
          </XStack>
          <XStack gap="$2">
            <YStack flex={1}>
              <Input
                placeholder="Ajouter une compétence"
                value={newSkill}
                onChangeText={setNewSkill}
                onSubmitEditing={handleAddSkill}
              />
            </YStack>
            <Button variant="outline" size="md" onPress={handleAddSkill}>
              Ajouter
            </Button>
          </XStack>
        </YStack>
      </YStack>

      {/* Expériences */}
      <YStack
        padding="$6"
        backgroundColor="white"
        borderRadius="$4"
        borderWidth={1}
        borderColor="#E5E5E5"
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={1}
        shadowRadius={12}
        gap="$4"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={18} fontWeight="600" color="#2B2B2B">
            Expériences professionnelles
          </Text>
          <Button variant="outline" size="sm" onPress={handleAddExperience}>
            + Ajouter
          </Button>
        </XStack>

        {experiences.map((exp, index) => (
          <YStack
            key={index}
            padding="$4"
            backgroundColor="#F9FAFB"
            borderRadius="$3"
            gap="$3"
            borderWidth={1}
            borderColor="#E5E5E5"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={16} fontWeight="600" color="#2B2B2B">
                Expérience {index + 1}
              </Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => handleRemoveExperience(index)}
              >
                Supprimer
              </Button>
            </XStack>

            <Input
              label="Intitulé du poste"
              value={exp.title}
              onChangeText={(value) =>
                handleUpdateExperience(index, "title", value)
              }
              required
            />

            <Input
              label="Entreprise"
              value={exp.company}
              onChangeText={(value) =>
                handleUpdateExperience(index, "company", value)
              }
              required
            />

            <XStack gap="$3">
              <YStack flex={1}>
                <DatePicker
                  label="Date de début"
                  value={exp.start_date}
                  onChangeText={(value) =>
                    handleUpdateExperience(index, "start_date", value)
                  }
                />
              </YStack>
              <YStack flex={1}>
                <Checkbox
                  label="Poste actuel"
                  checked={exp.is_current}
                  onCheckedChange={(checked) =>
                    handleUpdateExperience(index, "is_current", checked)
                  }
                />
              </YStack>
            </XStack>

            {!exp.is_current && (
              <DatePicker
                label="Date de fin"
                value={exp.end_date}
                onChangeText={(value) =>
                  handleUpdateExperience(index, "end_date", value)
                }
              />
            )}

            <Input
              label="Localisation"
              value={exp.location || ""}
              onChangeText={(value) =>
                handleUpdateExperience(index, "location", value)
              }
            />

            <Input
              label="Description"
              value={exp.description || ""}
              onChangeText={(value) =>
                handleUpdateExperience(index, "description", value)
              }
              multiline
              numberOfLines={3}
            />
          </YStack>
        ))}
      </YStack>

      {/* Formations */}
      <YStack
        padding="$6"
        backgroundColor="white"
        borderRadius="$4"
        borderWidth={1}
        borderColor="#E5E5E5"
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={1}
        shadowRadius={12}
        gap="$4"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={18} fontWeight="600" color="#2B2B2B">
            Formations
          </Text>
          <Button variant="outline" size="sm" onPress={handleAddEducation}>
            + Ajouter
          </Button>
        </XStack>

        {educations.map((edu, index) => (
          <YStack
            key={index}
            padding="$4"
            backgroundColor="#F9FAFB"
            borderRadius="$3"
            gap="$3"
            borderWidth={1}
            borderColor="#E5E5E5"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={16} fontWeight="600" color="#2B2B2B">
                Formation {index + 1}
              </Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => handleRemoveEducation(index)}
              >
                Supprimer
              </Button>
            </XStack>

            <Input
              label="École / Université"
              value={edu.school}
              onChangeText={(value) =>
                handleUpdateEducation(index, "school", value)
              }
              required
            />

            <Input
              label="Diplôme"
              value={edu.degree || ""}
              onChangeText={(value) =>
                handleUpdateEducation(index, "degree", value)
              }
            />

            <Input
              label="Domaine d'études"
              value={edu.field || ""}
              onChangeText={(value) =>
                handleUpdateEducation(index, "field", value)
              }
            />

            <XStack gap="$3">
              <YStack flex={1}>
                <DatePicker
                  label="Date de début"
                  value={edu.start_date}
                  onChangeText={(value) =>
                    handleUpdateEducation(index, "start_date", value)
                  }
                />
              </YStack>
              <YStack flex={1}>
                <DatePicker
                  label="Date de fin"
                  value={edu.end_date}
                  onChangeText={(value) =>
                    handleUpdateEducation(index, "end_date", value)
                  }
                />
              </YStack>
            </XStack>
          </YStack>
        ))}
      </YStack>

      {/* Bouton de sauvegarde */}
      <Button
        variant="primary"
        size="lg"
        onPress={handleSave}
        disabled={isSaving}
        opacity={isSaving ? 0.6 : 1}
      >
        {isSaving ? "Enregistrement..." : "Enregistrer le profil"}
      </Button>
    </YStack>
  );
}
