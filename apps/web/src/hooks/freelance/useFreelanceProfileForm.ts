"use client";

import { useState, useEffect } from "react";
import type { FreelanceExperience, FreelanceEducation } from "@shiftly/data";
import {
  updateProfile,
  updateFreelanceProfile,
  upsertFreelanceExperience,
  upsertFreelanceEducation,
  deleteFreelanceExperience,
  deleteFreelanceEducation,
  syncLinkedInData,
} from "@shiftly/data";
import { useFreelanceData } from "@/hooks";

interface UseFreelanceProfileFormProps {
  onSave?: () => void;
  externalFirstName?: string;
  externalLastName?: string;
  externalEmail?: string;
  externalPhone?: string;
  externalBio?: string;
}

/**
 * Hook pour gérer le formulaire complet du profil freelance
 * Gère le profil, les expériences et les formations
 */
export function useFreelanceProfileForm({
  onSave,
  externalFirstName,
  externalLastName,
  externalEmail,
  externalPhone,
  externalBio,
}: UseFreelanceProfileFormProps = {}) {
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
  const [dailyRate, setDailyRate] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState("");

  // États pour les expériences
  const [experiencesList, setExperiencesList] = useState<FreelanceExperience[]>(
    []
  );
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(
    null
  );
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
  const [educationsList, setEducationsList] = useState<FreelanceEducation[]>(
    []
  );
  const [editingEducationId, setEditingEducationId] = useState<string | null>(
    null
  );
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
      setDailyRate(freelanceProfile.daily_rate?.toString() || "");
      setHourlyRate(freelanceProfile.hourly_rate?.toString() || "");
      setAvailability(freelanceProfile.availability || "");
    }
    setExperiencesList(experiences);
    setEducationsList(educations);
  }, [freelanceProfile, experiences, educations]);

  const handleSaveProfile = async () => {
    console.log("🔄 handleSaveProfile appelé", {
      bio,
      skills,
      dailyRate,
      hourlyRate,
    });
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateFreelanceProfile({
        bio,
        skills,
        daily_rate: dailyRate ? parseFloat(dailyRate) : undefined,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        availability: availability || undefined,
      });

      console.log("✅ Résultat updateFreelanceProfile:", result);

      if (result.success) {
        setSuccess("Profil mis à jour avec succès !");
        await refreshProfile();
        onSave?.();
      } else {
        setError(result.error || "Erreur lors de la mise à jour");
      }
    } catch (err: any) {
      console.error("❌ Erreur dans handleSaveProfile:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // Sauvegarder les informations personnelles
      const personalInfoResult = await updateProfile({
        firstName: externalFirstName,
        lastName: externalLastName,
        email: externalEmail,
        phone: externalPhone,
        bio: externalBio,
      });

      if (!personalInfoResult.success) {
        setError(
          personalInfoResult.error ||
            "Erreur lors de la mise à jour des informations personnelles"
        );
        setIsSaving(false);
        return;
      }

      // Sauvegarder les informations freelance
      const freelanceResult = await updateFreelanceProfile({
        bio: externalBio,
        skills,
        daily_rate: dailyRate ? parseFloat(dailyRate) : undefined,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        availability: availability || undefined,
      });

      if (!freelanceResult.success) {
        setError(
          freelanceResult.error ||
            "Erreur lors de la mise à jour des informations freelance"
        );
        setIsSaving(false);
        return;
      }

      setSuccess("Toutes vos modifications ont été enregistrées avec succès !");
      await refreshProfile();
      onSave?.();
    } catch (err: any) {
      console.error("❌ Erreur dans handleSaveAll:", err);
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
      const experienceData = {
        user_id: "", // Sera rempli par la fonction
        title: experienceForm.title,
        company: experienceForm.company,
        location: experienceForm.location || undefined,
        start_date: experienceForm.start_date || undefined,
        end_date: experienceForm.is_current
          ? undefined
          : experienceForm.end_date || undefined,
        is_current: experienceForm.is_current,
        description: experienceForm.description || undefined,
      };

      // Utiliser un cast pour permettre l'id si on est en mode édition
      const result = await upsertFreelanceExperience(
        editingExperienceId
          ? ({ ...experienceData, id: editingExperienceId } as any)
          : experienceData
      );

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

  const handleDeleteExperience = async (id: string | undefined) => {
    if (!id) return;
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
    setEditingExperienceId(exp.id || null);
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

  const handleCancelEditExperience = () => {
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
      const educationData = {
        user_id: "", // Sera rempli par la fonction
        school: educationForm.school,
        degree: educationForm.degree || undefined,
        field: educationForm.field || undefined,
        start_date: educationForm.start_date || undefined,
        end_date: educationForm.end_date || undefined,
      };

      // Utiliser un cast pour permettre l'id si on est en mode édition
      const result = await upsertFreelanceEducation(
        editingEducationId
          ? ({ ...educationData, id: editingEducationId } as any)
          : educationData
      );

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

  const handleDeleteEducation = async (id: string | undefined) => {
    if (!id) return;
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
    setEditingEducationId(edu.id || null);
    setEducationForm({
      school: edu.school || "",
      degree: edu.degree || "",
      field: edu.field || "",
      start_date: edu.start_date || "",
      end_date: edu.end_date || "",
    });
  };

  const handleCancelEditEducation = () => {
    setEditingEducationId(null);
    setEducationForm({
      school: "",
      degree: "",
      field: "",
      start_date: "",
      end_date: "",
    });
  };

  const handleSyncLinkedIn = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Implémenter la récupération des données LinkedIn
      // Pour l'instant, on affiche un message d'erreur
      setError("La synchronisation LinkedIn n'est pas encore implémentée");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    // Données
    isLoading,
    freelanceProfile,
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
    handleSaveAll,
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
  };
}
