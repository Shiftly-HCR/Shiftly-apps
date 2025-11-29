import { supabase } from "../supabaseClient";
import type {
  MissionApplication,
  MissionApplicationWithProfile,
  MissionApplicationWithMission,
  CreateApplicationParams,
  UpdateApplicationParams,
  ApplicationStatus,
} from "../types/application";

/**
 * Crée une nouvelle candidature pour une mission
 */
export async function createApplication(
  params: CreateApplicationParams
): Promise<{
  success: boolean;
  error?: string;
  application?: MissionApplication;
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

    // Vérifier si une candidature existe déjà
    const existing = await checkApplicationExists(params.mission_id, user.id);
    if (existing) {
      return {
        success: false,
        error: "Vous avez déjà postulé à cette mission",
      };
    }

    const { data, error } = await supabase
      .from("mission_applications")
      .insert({
        mission_id: params.mission_id,
        user_id: user.id,
        status: "pending",
        cover_letter: params.cover_letter || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la création de la candidature:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      application: data,
    };
  } catch (err) {
    console.error("Erreur lors de la création de la candidature:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de la candidature",
    };
  }
}

/**
 * Vérifie si une candidature existe déjà pour un couple (mission_id, user_id)
 */
export async function checkApplicationExists(
  missionId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("mission_applications")
      .select("id")
      .eq("mission_id", missionId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned, ce qui est normal si la candidature n'existe pas
      console.error("Erreur lors de la vérification de la candidature:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("Erreur lors de la vérification de la candidature:", err);
    return false;
  }
}

/**
 * Récupère une candidature par son ID
 */
export async function getApplicationById(
  applicationId: string
): Promise<MissionApplication | null> {
  try {
    const { data, error } = await supabase
      .from("mission_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (error) {
      console.error("Erreur lors de la récupération de la candidature:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Erreur lors de la récupération de la candidature:", err);
    return null;
  }
}

/**
 * Récupère toutes les candidatures pour une mission donnée (avec les profils des freelances)
 */
export async function getApplicationsByMission(
  missionId: string
): Promise<MissionApplicationWithProfile[]> {
  try {
    // Récupérer d'abord les candidatures
    const { data: applications, error: applicationsError } = await supabase
      .from("mission_applications")
      .select("*")
      .eq("mission_id", missionId)
      .order("created_at", { ascending: false });

    if (applicationsError) {
      console.error(
        "Erreur lors de la récupération des candidatures:",
        applicationsError
      );
      return [];
    }

    if (!applications || applications.length === 0) {
      return [];
    }

    // Récupérer les profils pour tous les user_id
    const userIds = applications.map((app) => app.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, email, phone, photo_url, bio, headline, location, role"
      )
      .in("id", userIds);

    if (profilesError) {
      console.error(
        "Erreur lors de la récupération des profils:",
        profilesError
      );
      // Retourner les candidatures sans profils plutôt que rien
    }

    // Créer un map pour accéder rapidement aux profils
    const profilesMap = new Map(
      (profiles || []).map((profile) => [profile.id, profile])
    );

    // Combiner les candidatures avec leurs profils
    return applications.map((application) => ({
      id: application.id,
      created_at: application.created_at,
      updated_at: application.updated_at,
      mission_id: application.mission_id,
      user_id: application.user_id,
      status: application.status,
      cover_letter: application.cover_letter,
      profile: profilesMap.get(application.user_id) || null,
    }));
  } catch (err) {
    console.error("Erreur lors de la récupération des candidatures:", err);
    return [];
  }
}

/**
 * Récupère toutes les candidatures d'un freelance (avec les informations des missions)
 */
export async function getApplicationsByUser(
  userId?: string
): Promise<MissionApplicationWithMission[]> {
  try {
    let targetUserId = userId;

    // Si aucun userId n'est fourni, utiliser l'utilisateur connecté
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }
      targetUserId = user.id;
    }

    // Récupérer d'abord les candidatures
    const { data: applications, error: applicationsError } = await supabase
      .from("mission_applications")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    if (applicationsError) {
      console.error(
        "Erreur lors de la récupération des candidatures:",
        applicationsError
      );
      return [];
    }

    if (!applications || applications.length === 0) {
      return [];
    }

    // Récupérer les missions pour tous les mission_id
    const missionIds = applications.map((app) => app.mission_id);
    const { data: missions, error: missionsError } = await supabase
      .from("missions")
      .select(
        "id, title, description, city, start_date, end_date, hourly_rate, status"
      )
      .in("id", missionIds);

    if (missionsError) {
      console.error(
        "Erreur lors de la récupération des missions:",
        missionsError
      );
      // Retourner les candidatures sans missions plutôt que rien
    }

    // Créer un map pour accéder rapidement aux missions
    const missionsMap = new Map(
      (missions || []).map((mission) => [mission.id, mission])
    );

    // Combiner les candidatures avec leurs missions
    return applications.map((application) => ({
      id: application.id,
      created_at: application.created_at,
      updated_at: application.updated_at,
      mission_id: application.mission_id,
      user_id: application.user_id,
      status: application.status,
      cover_letter: application.cover_letter,
      mission: missionsMap.get(application.mission_id) || null,
    }));
  } catch (err) {
    console.error("Erreur lors de la récupération des candidatures:", err);
    return [];
  }
}

/**
 * Met à jour le statut d'une candidature
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<{
  success: boolean;
  error?: string;
  application?: MissionApplication;
}> {
  try {
    const { data, error } = await supabase
      .from("mission_applications")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la mise à jour de la candidature:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      application: data,
    };
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la candidature:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de la candidature",
    };
  }
}

/**
 * Met à jour une candidature (statut et/ou message)
 */
export async function updateApplication(
  applicationId: string,
  params: UpdateApplicationParams
): Promise<{
  success: boolean;
  error?: string;
  application?: MissionApplication;
}> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (params.status !== undefined) {
      updateData.status = params.status;
    }
    if (params.cover_letter !== undefined) {
      updateData.cover_letter = params.cover_letter;
    }

    const { data, error } = await supabase
      .from("mission_applications")
      .update(updateData)
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la mise à jour de la candidature:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      application: data,
    };
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la candidature:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de la candidature",
    };
  }
}

/**
 * Retire une candidature (change le statut à withdrawn)
 */
export async function withdrawApplication(applicationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  return updateApplicationStatus(applicationId, "withdrawn");
}
