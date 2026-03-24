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
  externalSiret?: string;
  externalCityOfResidence?: string;
  externalBio?: string;
}

type FreelanceFieldKey =
  | "dailyRate"
  | "hourlyRate"
  | "experienceTitle"
  | "experienceCompany"
  | "educationSchool";

type FreelanceFieldErrors = Partial<Record<FreelanceFieldKey, string>>;

function translateFreelanceError(rawError?: string): {
  message: string;
  fieldErrors?: FreelanceFieldErrors;
} {
  if (!rawError) {
    return { message: "Une erreur est survenue." };
  }

  const normalized = rawError.toLowerCase();

  if (normalized.includes("invalid input syntax for type numeric")) {
    if (normalized.includes("daily_rate")) {
      return {
        message: "Le TJM est invalide. Saisissez uniquement un nombre.",
        fieldErrors: { dailyRate: "TJM invalide." },
      };
    }
    if (normalized.includes("hourly_rate")) {
      return {
        message: "Le tarif horaire est invalide. Saisissez uniquement un nombre.",
        fieldErrors: { hourlyRate: "Tarif horaire invalide." },
      };
    }
    return {
      message:
        "Un montant est invalide. Verifiez le TJM et le tarif horaire (nombres uniquement).",
      fieldErrors: {
        dailyRate: "Valeur numerique invalide.",
        hourlyRate: "Valeur numerique invalide.",
      },
    };
  }

  if (normalized.includes("duplicate key value") && normalized.includes("email")) {
    return { message: "Cette adresse e-mail est deja utilisee par un autre compte." };
  }

  if (normalized.includes("failed to fetch") || normalized.includes("network")) {
    return { message: "Impossible de joindre le serveur. Verifiez votre connexion." };
  }

  if (normalized.includes("permission denied") || normalized.includes("row-level security")) {
    return { message: "Acces refuse pour cette operation." };
  }

  return { message: rawError };
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
  externalSiret,
  externalCityOfResidence,
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
  const [fieldErrors, setFieldErrors] = useState<FreelanceFieldErrors>({});

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
    setFieldErrors({});

    const parsedDailyRate = dailyRate ? Number(dailyRate) : undefined;
    const parsedHourlyRate = hourlyRate ? Number(hourlyRate) : undefined;
    if (dailyRate && !Number.isFinite(parsedDailyRate)) {
      setFieldErrors({ dailyRate: "Le TJM doit etre un nombre valide." });
      setError("Le TJM est invalide. Entrez uniquement des chiffres.");
      setIsSaving(false);
      return;
    }
    if (hourlyRate && !Number.isFinite(parsedHourlyRate)) {
      setFieldErrors({ hourlyRate: "Le tarif horaire doit etre un nombre valide." });
      setError("Le tarif horaire est invalide. Entrez uniquement des chiffres.");
      setIsSaving(false);
      return;
    }

    try {
      const result = await updateFreelanceProfile({
        bio,
        skills,
        daily_rate: parsedDailyRate,
        hourly_rate: parsedHourlyRate,
        availability: availability || undefined,
      });

      console.log("✅ Résultat updateFreelanceProfile:", result);

      if (result.success) {
        setSuccess("Profil mis à jour avec succès !");
        await refreshProfile();
        onSave?.();
      } else {
        const translated = translateFreelanceError(result.error);
        setError(translated.message);
        setFieldErrors(translated.fieldErrors || {});
      }
    } catch (err: any) {
      console.error("❌ Erreur dans handleSaveProfile:", err);
      const translated = translateFreelanceError(err?.message);
      setError(translated.message);
      setFieldErrors(translated.fieldErrors || {});
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    const parsedDailyRate = dailyRate ? Number(dailyRate) : undefined;
    const parsedHourlyRate = hourlyRate ? Number(hourlyRate) : undefined;
    if (dailyRate && !Number.isFinite(parsedDailyRate)) {
      setFieldErrors({ dailyRate: "Le TJM doit etre un nombre valide." });
      setError("Le TJM est invalide. Entrez uniquement des chiffres.");
      setIsSaving(false);
      return;
    }
    if (hourlyRate && !Number.isFinite(parsedHourlyRate)) {
      setFieldErrors({ hourlyRate: "Le tarif horaire doit etre un nombre valide." });
      setError("Le tarif horaire est invalide. Entrez uniquement des chiffres.");
      setIsSaving(false);
      return;
    }

    try {
      const trimmedExternalPhone = externalPhone?.trim();
      const trimmedExternalSiret = externalSiret?.trim();
      const trimmedExternalCityOfResidence = externalCityOfResidence?.trim();
      // Sauvegarder les informations personnelles
      const personalInfoResult = await updateProfile({
        firstName: externalFirstName,
        lastName: externalLastName,
        email: externalEmail,
        phone: trimmedExternalPhone || undefined,
        siret: trimmedExternalSiret || undefined,
        city_of_residence: trimmedExternalCityOfResidence || undefined,
        bio: externalBio,
      });

      if (!personalInfoResult.success) {
        const translated = translateFreelanceError(personalInfoResult.error);
        setError(
          translated.message ||
            "Erreur lors de la mise a jour des informations personnelles"
        );
        setFieldErrors(translated.fieldErrors || {});
        setIsSaving(false);
        return;
      }

      // Sauvegarder les informations freelance
      const freelanceResult = await updateFreelanceProfile({
        bio: externalBio,
        skills,
        daily_rate: parsedDailyRate,
        hourly_rate: parsedHourlyRate,
        availability: availability || undefined,
      });

      if (!freelanceResult.success) {
        const translated = translateFreelanceError(freelanceResult.error);
        setError(
          translated.message ||
            "Erreur lors de la mise a jour des informations freelance"
        );
        setFieldErrors(translated.fieldErrors || {});
        setIsSaving(false);
        return;
      }

      setSuccess("Toutes vos modifications ont été enregistrées avec succès !");
      await refreshProfile();
      onSave?.();
    } catch (err: any) {
      console.error("❌ Erreur dans handleSaveAll:", err);
      const translated = translateFreelanceError(err?.message);
      setError(translated.message);
      setFieldErrors(translated.fieldErrors || {});
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
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.experienceTitle;
      delete next.experienceCompany;
      return next;
    });
    if (!experienceForm.title || !experienceForm.company) {
      setFieldErrors({
        experienceTitle: !experienceForm.title ? "Le titre du poste est requis." : undefined,
        experienceCompany: !experienceForm.company ? "L'entreprise est requise." : undefined,
      });
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
        const translated = translateFreelanceError(result.error);
        setError(translated.message || "Erreur lors de la sauvegarde");
        setFieldErrors(translated.fieldErrors || {});
      }
    } catch (err: any) {
      const translated = translateFreelanceError(err?.message);
      setError(translated.message || "Une erreur est survenue");
      setFieldErrors(translated.fieldErrors || {});
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
        const translated = translateFreelanceError(result.error);
        setError(translated.message || "Erreur lors de la suppression");
      }
    } catch (err: any) {
      const translated = translateFreelanceError(err?.message);
      setError(translated.message || "Une erreur est survenue");
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
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.educationSchool;
      return next;
    });
    if (!educationForm.school) {
      setFieldErrors({
        educationSchool: "L'etablissement est requis.",
      });
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
        const translated = translateFreelanceError(result.error);
        setError(translated.message || "Erreur lors de la sauvegarde");
        setFieldErrors(translated.fieldErrors || {});
      }
    } catch (err: any) {
      const translated = translateFreelanceError(err?.message);
      setError(translated.message || "Une erreur est survenue");
      setFieldErrors(translated.fieldErrors || {});
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
        const translated = translateFreelanceError(result.error);
        setError(translated.message || "Erreur lors de la suppression");
      }
    } catch (err: any) {
      const translated = translateFreelanceError(err?.message);
      setError(translated.message || "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const clearFieldError = (field: FreelanceFieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
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
      const translated = translateFreelanceError(err?.message);
      setError(translated.message || "Une erreur est survenue");
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
    fieldErrors,
    clearFieldError,

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
