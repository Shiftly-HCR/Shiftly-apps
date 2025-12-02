"use client";

import { useState } from "react";
import { useEstablishments } from "./useEstablishments";
import type { Establishment, CreateEstablishmentParams } from "@shiftly/data";

export function useEstablishmentsManager() {
  const { establishments, isLoading, create, update, remove } =
    useEstablishments();

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CreateEstablishmentParams>({
    name: "",
    address: "",
    city: "",
    postal_code: "",
  });

  const handleCreate = () => {
    setIsCreating(true);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      postal_code: "",
    });
    setError("");
  };

  const handleEdit = (establishment: Establishment) => {
    setIsEditing(true);
    setIsCreating(false);
    setEditingId(establishment.id);
    setFormData({
      name: establishment.name,
      address: establishment.address || "",
      city: establishment.city || "",
      postal_code: establishment.postal_code || "",
    });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet établissement ?")) {
      return;
    }

    const result = await remove(id);
    if (!result.success) {
      setError(result.error || "Erreur lors de la suppression");
    }
  };

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        setError("Le nom de l'établissement est requis");
        setIsSubmitting(false);
        return;
      }

      if (isEditing && editingId) {
        const result = await update(editingId, formData);
        if (result.success) {
          setIsEditing(false);
          setEditingId(null);
          setFormData({
            name: "",
            address: "",
            city: "",
            postal_code: "",
          });
        } else {
          setError(result.error || "Erreur lors de la modification");
        }
      } else {
        const result = await create(formData);
        if (result.success) {
          setIsCreating(false);
          setFormData({
            name: "",
            address: "",
            city: "",
            postal_code: "",
          });
        } else {
          setError(result.error || "Erreur lors de la création");
        }
      }
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      setError("Une erreur inattendue est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      postal_code: "",
    });
    setError("");
  };

  return {
    establishments,
    isLoading,
    isCreating,
    isEditing,
    isSubmitting,
    editingId,
    formData,
    setFormData,
    error,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleCancel,
  };
}

