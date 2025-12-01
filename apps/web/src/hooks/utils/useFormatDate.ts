"use client";

/**
 * Hook pour formater les dates de différentes manières
 * Retourne plusieurs fonctions de formatage utilisables dans les composants
 */
export function useFormatDate() {
  /**
   * Formate une date au format court français (ex: "janv. 2024")
   * Utilisé pour les expériences et formations
   */
  const formatDateShort = (date?: string): string => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
    });
  };

  /**
   * Formate une date au format complet français (ex: "15 janvier 2024")
   */
  const formatDateLong = (date?: string): string => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      year: "numeric",
      month: "long",
    });
  };

  /**
   * Formate une date au format numérique (ex: "15/01/2024")
   */
  const formatDateNumeric = (date?: string): string => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return {
    formatDateShort,
    formatDateLong,
    formatDateNumeric,
  };
}

