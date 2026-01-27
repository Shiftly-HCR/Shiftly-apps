import { supabase } from "../supabaseClient";
import { uploadImage, replaceImage, deleteImage } from "../helpers/imageUpload";
import { GiConsoleController } from "react-icons/gi";

export interface Mission {
  id: string;
  created_at?: string;
  updated_at?: string;
  recruiter_id: string;
  establishment_id?: string | null; // ID de l'établissement associé (optionnel)
  title: string;
  description?: string;
  skills?: string[];
  address?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  hourly_rate?: number;
  daily_rate?: number; // TJM (Taux Journalier Moyen) en euros - peut être calculé automatiquement
  total_salary?: number; // Salaire total de la mission en euros - calculé automatiquement : TJM × nombre de jours
  currency?: string;
  image_url?: string;
  status?: "draft" | "published" | "closed" | "cancelled";
  is_urgent?: boolean;
  total_positions?: number;
  filled_positions?: number;
}

export interface CreateMissionParams {
  title: string;
  description?: string;
  skills?: string[];
  address?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  hourly_rate?: number;
  daily_rate?: number; // TJM (Taux Journalier Moyen) en euros
  total_salary?: number; // Salaire total de la mission en euros
  status?: "draft" | "published";
  is_urgent?: boolean;
  total_positions?: number;
  establishment_id?: string | null; // ID de l'établissement associé (optionnel)
}

export interface UpdateMissionParams {
  title?: string;
  description?: string;
  skills?: string[];
  address?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  hourly_rate?: number;
  daily_rate?: number; // TJM (Taux Journalier Moyen) en euros
  total_salary?: number; // Salaire total de la mission en euros
  status?: "draft" | "published" | "closed" | "cancelled";
  is_urgent?: boolean;
  total_positions?: number;
  establishment_id?: string | null; // ID de l'établissement associé (optionnel)
}

/**
 * Crée une nouvelle mission
 */
export async function createMission(params: CreateMissionParams): Promise<{
  success: boolean;
  error?: string;
  mission?: Mission;
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
      .from("missions")
      .insert({
        recruiter_id: user.id,
        ...params,
        status: params.status || "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la création de la mission:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      mission: data,
    };
  } catch (err) {
    console.error("Erreur lors de la création de la mission:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de la mission",
    };
  }
}

/**
 * Récupère une mission par son ID
 */
export async function getMissionById(
  missionId: string,
): Promise<Mission | null> {
  try {
    const { data, error } = await supabase
      .from("missions")
      .select("*")
      .eq("id", missionId)
      .single();

    if (error) {
      console.error("Erreur lors de la récupération de la mission:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Erreur lors de la récupération de la mission:", err);
    return null;
  }
}

/**
 * Récupère toutes les missions du recruteur connecté
 */
export async function getRecruiterMissions(): Promise<Mission[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("missions")
      .select("*")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Erreur lors de la récupération des missions du recruteur:",
        error,
      );
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des missions du recruteur:",
      err,
    );
    return [];
  }
}

/**
 * Récupère toutes les missions publiées (pour les freelances)
 */
export async function getPublishedMissions(): Promise<Mission[]> {
  try {
    const { data, error } = await supabase
      .from("missions")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Erreur lors de la récupération des missions publiées:",
        error,
      );
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur lors de la récupération des missions publiées:", err);
    return [];
  }
}

/**
 * Récupère toutes les missions pour lesquelles un freelance a postulé
 * Utilise une jointure SQL pour récupérer les missions directement
 */
export async function getFreelanceAppliedMissions(
  userId?: string,
): Promise<Mission[]> {
  try {
    let targetUserId = userId;
    console.log("targetUserId", targetUserId);

    // Si aucun userId n'est fourni, utiliser l'utilisateur connecté
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.log("getFreelanceAppliedMissions: Aucun utilisateur connecté");
        return [];
      }
      targetUserId = user.id;
    }

    console.log("tergetUserId final:", targetUserId);

    console.log(
      "getFreelanceAppliedMissions: Recherche pour user_id:",
      targetUserId,
    );

    // Récupérer d'abord les candidatures du freelance pour obtenir les mission_id
    const { data: applications, error: applicationsError } = await supabase
      .from("mission_applications")
      .select("mission_id")
      .eq("user_id", targetUserId);

    if (applicationsError) {
      console.error(
        "Erreur lors de la récupération des candidatures:",
        applicationsError,
      );
      return [];
    }

    if (!applications || applications.length === 0) {
      console.log(
        "getFreelanceAppliedMissions: Aucune candidature trouvée pour user_id:",
        targetUserId,
      );
      return [];
    }

    console.log(
      "getFreelanceAppliedMissions: Nombre de candidatures trouvées:",
      applications.length,
    );

    // Extraire les IDs des missions (en supprimant les doublons au cas où)
    const missionIds = [
      ...new Set(applications.map((app) => app.mission_id).filter(Boolean)),
    ];

    console.log(
      "getFreelanceAppliedMissions: Mission IDs à récupérer:",
      missionIds.length,
      "IDs",
    );

    if (missionIds.length === 0) {
      console.log(
        "getFreelanceAppliedMissions: Aucun mission_id valide trouvé",
      );
      return [];
    }

    // Supabase peut avoir des limites sur .in(), donc on traite par lots si nécessaire
    // Limite pratique: 1000 éléments par requête
    const BATCH_SIZE = 1000;
    const allMissions: Mission[] = [];

    for (let i = 0; i < missionIds.length; i += BATCH_SIZE) {
      const batch = missionIds.slice(i, i + BATCH_SIZE);

      const { data: missions, error: missionsError } = await supabase
        .from("missions")
        .select("*")
        .in("id", batch)
        .order("created_at", { ascending: false });

      if (missionsError) {
        console.error(
          `Erreur lors de la récupération des missions (lot ${i / BATCH_SIZE + 1}):`,
          missionsError,
        );
        // Continuer avec les autres lots même en cas d'erreur
        continue;
      }

      if (missions && missions.length > 0) {
        allMissions.push(...missions);
      }
    }

    // Trier toutes les missions par date de création décroissante
    allMissions.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    console.log(
      "getFreelanceAppliedMissions: Nombre total de missions récupérées:",
      allMissions.length,
    );

    return allMissions;
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des missions du freelance:",
      err,
    );
    return [];
  }
}

/**
 * Met à jour une mission
 */
export async function updateMission(
  missionId: string,
  params: UpdateMissionParams,
): Promise<{
  success: boolean;
  error?: string;
  mission?: Mission;
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
      ...params,
    };

    const { data, error } = await supabase
      .from("missions")
      .update(updateData)
      .eq("id", missionId)
      .eq("recruiter_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la mise à jour de la mission:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      mission: data,
    };
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la mission:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de la mission",
    };
  }
}

/**
 * Supprime une mission
 */
export async function deleteMission(missionId: string): Promise<{
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

    // Récupérer la mission pour supprimer l'image associée
    const mission = await getMissionById(missionId);
    if (mission?.image_url) {
      const urlParts = mission.image_url.split("/mission-images/");
      if (urlParts.length > 1) {
        const imagePath = urlParts[1].split("?")[0];
        await deleteImage(imagePath, "mission-images");
      }
    }

    const { error } = await supabase
      .from("missions")
      .delete()
      .eq("id", missionId)
      .eq("recruiter_id", user.id);

    if (error) {
      console.error("Erreur lors de la suppression de la mission:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error("Erreur lors de la suppression de la mission:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de la mission",
    };
  }
}

/**
 * Upload une image pour une mission
 */
export async function uploadMissionImage(
  missionId: string,
  file: File,
): Promise<{
  success: boolean;
  error?: string;
  url?: string;
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

    // Récupérer la mission pour obtenir l'ancienne image
    const mission = await getMissionById(missionId);
    const oldImageUrl = mission?.image_url;

    // Extraire le chemin de l'ancienne image
    let oldImagePath: string | null = null;
    if (oldImageUrl) {
      const urlParts = oldImageUrl.split("/mission-images/");
      if (urlParts.length > 1) {
        oldImagePath = urlParts[1].split("?")[0];
      }
    }

    // Upload la nouvelle image
    const uploadResult = await replaceImage(
      file,
      oldImagePath,
      "mission-images",
      `missions/${user.id}`,
    );

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error,
      };
    }

    // Mettre à jour la mission avec la nouvelle URL
    const { error } = await supabase
      .from("missions")
      .update({
        image_url: uploadResult.url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", missionId)
      .eq("recruiter_id", user.id);

    if (error) {
      console.error("Erreur lors de la mise à jour de la mission:", error);
      // Supprimer l'image uploadée en cas d'erreur
      if (uploadResult.path) {
        await deleteImage(uploadResult.path, "mission-images");
      }
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      url: uploadResult.url,
    };
  } catch (err) {
    console.error("Erreur lors de l'upload de l'image:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'upload de l'image",
    };
  }
}

/**
 * Publie une mission (change le statut de draft à published)
 */
export async function publishMission(missionId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  return updateMission(missionId, { status: "published" });
}

/**
 * Ferme une mission (change le statut à closed)
 */
export async function closeMission(missionId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  return updateMission(missionId, { status: "closed" });
}
