/**
 * Types pour les établissements (établissements recruteurs)
 */

export interface Establishment {
  id: string;
  owner_id: string;
  commercial_id?: string | null;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  secret_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEstablishmentParams {
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateEstablishmentParams {
  name?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

