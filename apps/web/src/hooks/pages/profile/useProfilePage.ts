"use client";

import { useState, useEffect } from "react";
import {
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "@shiftly/data";
import { useCurrentProfile } from "@/hooks";

type ProfileFieldKey =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "siret"
  | "cityOfResidence"
  | "bio";

type ProfileFieldErrors = Partial<Record<ProfileFieldKey, string>>;

function translateProfileError(rawError?: string): {
  message: string;
  fieldErrors?: ProfileFieldErrors;
} {
  const fallback = "Une erreur est survenue lors de la mise a jour du profil.";

  if (!rawError) {
    return { message: fallback };
  }

  const normalized = rawError.toLowerCase();

  if (normalized.includes("duplicate key value") && normalized.includes("email")) {
    return {
      message: "Cette adresse e-mail est deja utilisee par un autre compte.",
      fieldErrors: { email: "Adresse e-mail deja utilisee." },
    };
  }

  if (normalized.includes("invalid input syntax for type numeric")) {
    if (normalized.includes("phone")) {
      return {
        message: "Le numero de telephone est invalide. Utilisez uniquement des chiffres.",
        fieldErrors: { phone: "Telephone invalide (chiffres uniquement)." },
      };
    }
    if (normalized.includes("siret")) {
      return {
        message: "Le format du SIRET est invalide. Il doit contenir 14 chiffres.",
        fieldErrors: { siret: "SIRET invalide (14 chiffres)." },
      };
    }
    return {
      message: "Un champ numerique est invalide. Verifiez le telephone et le SIRET.",
      fieldErrors: {
        phone: "Valeur numerique invalide.",
        siret: "Valeur numerique invalide.",
      },
    };
  }

  if (normalized.includes("permission denied")) {
    return {
      message: "Vous n'avez pas les droits necessaires pour modifier ce profil.",
    };
  }

  if (normalized.includes("violates row-level security")) {
    return {
      message: "Acces refuse pour cette operation.",
    };
  }

  if (normalized.includes("network") || normalized.includes("failed to fetch")) {
    return {
      message: "Impossible de joindre le serveur. Verifiez votre connexion internet.",
    };
  }

  return { message: rawError };
}

/**
 * Hook pour gérer la logique de la page de profil
 * Gère l'édition, la sauvegarde et l'upload de photo
 */
export function useProfilePage() {
  const { profile, isLoading, refresh } = useCurrentProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});

  // Champs du formulaire
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [siret, setSiret] = useState("");
  const [cityOfResidence, setCityOfResidence] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Initialiser les champs du formulaire avec le profil
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setSiret(profile.siret || "");
      setCityOfResidence(profile.city_of_residence || "");
      setBio(profile.bio || "");
      setPhotoUrl(profile.photo_url || null);
    }
  }, [profile]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});
    setIsSaving(true);

    const trimmedPhone = phone.trim();
    const trimmedSiret = siret.trim();
    if (trimmedPhone && !/^\d+$/.test(trimmedPhone)) {
      setFieldErrors({
        phone: "Le telephone doit contenir uniquement des chiffres.",
      });
      setError("Le numero de telephone est invalide (chiffres uniquement).");
      setIsSaving(false);
      return;
    }

    if (trimmedSiret && !/^\d{14}$/.test(trimmedSiret)) {
      setFieldErrors({
        siret: "Le SIRET doit contenir exactement 14 chiffres.",
      });
      setError("Le SIRET doit contenir exactement 14 chiffres.");
      setIsSaving(false);
      return;
    }

    // Mettre à jour les informations du profil
    const result = await updateProfile({
      firstName,
      lastName,
      email,
      phone: trimmedPhone || undefined,
      siret: trimmedSiret || undefined,
      city_of_residence: cityOfResidence.trim() || undefined,
      bio,
    });

    if (result.success) {
      // Rafraîchir le cache
      await refresh();
      setSuccess("Profil mis à jour avec succès !");
      setIsEditing(false);
    } else {
      const translated = translateProfileError(result.error);
      setError(translated.message);
      setFieldErrors(translated.fieldErrors || {});
    }

    setIsSaving(false);
  };

  const handlePhotoChange = async (file: File) => {
    setError("");
    setSuccess("");
    setIsUploadingPhoto(true);

    const uploadResult = await uploadProfilePhoto(file);
    setIsUploadingPhoto(false);

    if (uploadResult.success) {
      setPhotoUrl(uploadResult.url || null);
      setSuccess("Photo mise à jour avec succès !");

      // Rafraîchir le cache
      await refresh();
    } else {
      const translated = translateProfileError(uploadResult.error);
      setError(translated.message || "Erreur lors de l'upload de la photo");
    }
  };

  const handlePhotoRemove = async () => {
    if (!photoUrl) {
      return;
    }

    setIsUploadingPhoto(true);
    const result = await deleteProfilePhoto();
    setIsUploadingPhoto(false);

    if (result.success) {
      setPhotoUrl(null);
      setSuccess("Photo supprimée avec succès !");

      // Rafraîchir le cache
      await refresh();
    } else {
      const translated = translateProfileError(result.error);
      setError(translated.message || "Erreur lors de la suppression de la photo");
    }
  };

  const clearFieldError = (field: ProfileFieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleCancel = () => {
    // Réinitialiser les champs avec les valeurs actuelles
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setSiret(profile.siret || "");
      setCityOfResidence(profile.city_of_residence || "");
      setBio(profile.bio || "");
    }
    setIsEditing(false);
    setError("");
    setFieldErrors({});
  };

  return {
    profile,
    isLoading,
    refresh,
    isEditing,
    setIsEditing,
    isSaving,
    error,
    success,
    fieldErrors,
    clearFieldError,
    // Champs du formulaire
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
    // Handlers
    handleSave,
    handlePhotoChange,
    handlePhotoRemove,
    handleCancel,
  };
}
