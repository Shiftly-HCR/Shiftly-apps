/**
 * Helpers pour les missions et candidatures
 */

import type { ApplicationStatus } from "@shiftly/data";
import { colors } from "@shiftly/ui";

/**
 * Retourne le label en français pour un statut de candidature
 */
export function getStatusLabel(status: ApplicationStatus): string {
  switch (status) {
    case "pending":
      return "En attente";
    case "applied":
      return "Reçu";
    case "shortlisted":
      return "Shortlist";
    case "rejected":
      return "Refusé";
    case "accepted":
      return "Confirmé";
    case "withdrawn":
      return "Retiré";
    default:
      return status;
  }
}

/**
 * Retourne la couleur associée à un statut de candidature
 */
export function getStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case "pending":
      return colors.shiftlyViolet;
    case "applied":
      return colors.shiftlyViolet;
    case "shortlisted":
      return colors.shiftlyGold;
    case "rejected":
      return "#EF4444";
    case "accepted":
      return "#10B981";
    case "withdrawn":
      return colors.gray500;
    default:
      return colors.gray700;
  }
}

/**
 * Formate une date de candidature en texte relatif
 * (ex: "Reçu aujourd'hui", "Reçu il y a 1 jour", etc.)
 */
export function formatApplicationDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Reçu aujourd'hui";
  if (diffInDays === 1) return "Reçu il y a 1 jour";
  return `Reçu il y a ${diffInDays} jours`;
}

