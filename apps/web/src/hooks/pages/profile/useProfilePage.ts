"use client";

import { useState, useEffect } from "react";
import {
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "@shiftly/data";
import { useCurrentProfile } from "@/hooks";

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

  // Champs du formulaire
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
      setBio(profile.bio || "");
      setPhotoUrl(profile.photo_url || null);
    }
  }, [profile]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);

    // Mettre à jour les informations du profil
    const result = await updateProfile({
      firstName,
      lastName,
      email,
      phone,
      bio,
    });

    if (result.success) {
      // Rafraîchir le cache
      await refresh();
      setSuccess("Profil mis à jour avec succès !");
      setIsEditing(false);
    } else {
      setError(result.error || "Une erreur est survenue");
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
      setError(uploadResult.error || "Erreur lors de l'upload de la photo");
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
      setError(result.error || "Erreur lors de la suppression de la photo");
    }
  };

  const handleCancel = () => {
    // Réinitialiser les champs avec les valeurs actuelles
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
    }
    setIsEditing(false);
    setError("");
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
    // Champs du formulaire
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
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
