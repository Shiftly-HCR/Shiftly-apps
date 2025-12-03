import { supabase } from "../supabaseClient";
import type {
  Establishment,
  CreateEstablishmentParams,
  UpdateEstablishmentParams,
} from "../types/establishment";

/**
 * Génère un code secret aléatoire (8-10 caractères alpha-numériques)
 */
function generateSecretCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 8 + Math.floor(Math.random() * 3); // 8 à 10 caractères
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Liste les établissements du recruteur courant
 */
export async function listMyEstablishments(): Promise<{
  success: boolean;
  error?: string;
  establishments?: Establishment[];
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Utilisateur non connecté",
      };
    }

    const { data, error } = await supabase
      .from("establishments")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des établissements:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      establishments: data || [],
    };
  } catch (err) {
    console.error("Erreur lors de la récupération des établissements:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la récupération des établissements",
    };
  }
}

/**
 * Crée un établissement pour le recruteur courant
 */
export async function createEstablishment(
  params: CreateEstablishmentParams
): Promise<{
  success: boolean;
  error?: string;
  establishment?: Establishment;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Utilisateur non connecté",
      };
    }

    // Générer un code secret aléatoire
    const secretCode = generateSecretCode();

    const { data, error } = await supabase
      .from("establishments")
      .insert({
        owner_id: user.id,
        name: params.name,
        address: params.address || null,
        city: params.city || null,
        postal_code: params.postal_code || null,
        latitude: params.latitude || null,
        longitude: params.longitude || null,
        secret_code: secretCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la création de l'établissement:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      establishment: data,
    };
  } catch (err) {
    console.error("Erreur lors de la création de l'établissement:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de l'établissement",
    };
  }
}

/**
 * Met à jour un établissement
 */
export async function updateEstablishment(
  establishmentId: string,
  params: UpdateEstablishmentParams
): Promise<{
  success: boolean;
  error?: string;
  establishment?: Establishment;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Utilisateur non connecté",
      };
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (params.name !== undefined) updateData.name = params.name;
    if (params.address !== undefined) updateData.address = params.address;
    if (params.city !== undefined) updateData.city = params.city;
    if (params.postal_code !== undefined)
      updateData.postal_code = params.postal_code;
    if (params.latitude !== undefined) updateData.latitude = params.latitude;
    if (params.longitude !== undefined) updateData.longitude = params.longitude;

    const { data, error } = await supabase
      .from("establishments")
      .update(updateData)
      .eq("id", establishmentId)
      .eq("owner_id", user.id) // S'assurer que l'utilisateur est bien le propriétaire
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la mise à jour de l'établissement:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      establishment: data,
    };
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'établissement:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de l'établissement",
    };
  }
}

/**
 * Supprime un établissement
 */
export async function deleteEstablishment(
  establishmentId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Utilisateur non connecté",
      };
    }

    const { error } = await supabase
      .from("establishments")
      .delete()
      .eq("id", establishmentId)
      .eq("owner_id", user.id); // S'assurer que l'utilisateur est bien le propriétaire

    if (error) {
      console.error("Erreur lors de la suppression de l'établissement:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error("Erreur lors de la suppression de l'établissement:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de l'établissement",
    };
  }
}

/**
 * Récupère un établissement par son ID (pour le propriétaire uniquement)
 */
export async function getEstablishmentById(
  establishmentId: string
): Promise<Establishment | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("establishments")
      .select("*")
      .eq("id", establishmentId)
      .eq("owner_id", user.id) // Seul le propriétaire peut voir son établissement
      .single();

    if (error) {
      console.error("Erreur lors de la récupération de l'établissement:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Erreur lors de la récupération de l'établissement:", err);
    return null;
  }
}

/**
 * Récupère un établissement par son ID pour affichage public
 * Permet à tous les utilisateurs authentifiés de voir un établissement
 * s'il est lié à une mission publiée (pour l'affichage dans les détails de mission)
 * 
 * Note: Cette fonction nécessite que les RLS permettent la lecture des établissements
 * liés à des missions publiées. Voir la politique RLS correspondante.
 */
export async function getEstablishmentByIdPublic(
  establishmentId: string
): Promise<Establishment | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Vérifier d'abord que l'établissement est lié à au moins une mission publiée
    const { data: missionCheck, error: missionError } = await supabase
      .from("missions")
      .select("id")
      .eq("establishment_id", establishmentId)
      .eq("status", "published")
      .limit(1)
      .single();

    if (missionError || !missionCheck) {
      // L'établissement n'est pas lié à une mission publiée, ne pas le retourner
      return null;
    }

    // Si l'établissement est lié à une mission publiée, on peut le récupérer
    // La politique RLS doit permettre cette lecture pour les établissements liés à des missions publiées
    const { data, error } = await supabase
      .from("establishments")
      .select("*")
      .eq("id", establishmentId)
      .single();

    if (error) {
      console.error(
        "Erreur lors de la récupération publique de l'établissement:",
        error
      );
      return null;
    }

    return data;
  } catch (err) {
    console.error(
      "Erreur lors de la récupération publique de l'établissement:",
      err
    );
    return null;
  }
}

/**
 * Compte le nombre de missions publiées pour un établissement
 */
export async function countPublishedMissionsByEstablishment(
  establishmentId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("missions")
      .select("*", { count: "exact", head: true })
      .eq("establishment_id", establishmentId)
      .eq("status", "published");

    if (error) {
      console.error(
        "Erreur lors du comptage des missions de l'établissement:",
        error
      );
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error(
      "Erreur lors du comptage des missions de l'établissement:",
      err
    );
    return 0;
  }
}

/**
 * Liste tous les établissements non rattachés à un commercial (pour les commerciaux uniquement)
 * Le secret_code n'est pas retourné pour les commerciaux
 */
export async function listAllEstablishments(): Promise<{
  success: boolean;
  error?: string;
  establishments?: Establishment[];
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Utilisateur non connecté",
      };
    }

    // Vérifier que l'utilisateur est un commercial
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "commercial") {
      return {
        success: false,
        error: "Accès refusé : seuls les commerciaux peuvent voir tous les établissements",
      };
    }

    // Récupérer uniquement les établissements sans commercial_id
    // et masquer le secret_code pour les commerciaux
    const { data, error } = await supabase
      .from("establishments")
      .select("id, owner_id, commercial_id, name, address, city, postal_code, latitude, longitude, created_at, updated_at")
      .is("commercial_id", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des établissements:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      establishments: data || [],
    };
  } catch (err) {
    console.error("Erreur lors de la récupération des établissements:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la récupération des établissements",
    };
  }
}

