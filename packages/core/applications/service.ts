import {
  createApplication as createApplicationData,
  checkApplicationExists,
  getApplicationById,
  getApplicationsByMission as getApplicationsByMissionData,
  getApplicationsByUser as getApplicationsByUserData,
  updateApplicationStatus as updateApplicationStatusData,
  type CreateApplicationParams,
  type ApplicationStatus,
} from "@shiftly/data";
import { getMissionById } from "@shiftly/data";
import { getCurrentProfile } from "@shiftly/data";
import { supabase } from "@shiftly/data";

/**
 * Résultat d'une opération sur une candidature
 */
export interface ApplicationResult {
  success: boolean;
  error?: string;
  applicationId?: string;
}

/**
 * Postule à une mission (logique métier complète)
 */
export async function applyToMission(
  params: CreateApplicationParams
): Promise<ApplicationResult> {
  try {
    // 1. Vérifier que l'utilisateur est authentifié
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Vous devez être connecté pour postuler à une mission",
      };
    }

    // 2. Vérifier que le profil existe et a le rôle freelance
    const profile = await getCurrentProfile();
    if (!profile) {
      return {
        success: false,
        error: "Profil utilisateur introuvable",
      };
    }

    if (profile.role !== "freelance") {
      return {
        success: false,
        error: "Seuls les freelances peuvent postuler aux missions",
      };
    }

    // 3. Vérifier que la mission existe et est éligible
    const mission = await getMissionById(params.mission_id);
    if (!mission) {
      return {
        success: false,
        error: "Mission introuvable",
      };
    }

    if (mission.status !== "published") {
      return {
        success: false,
        error: "Cette mission n'est plus disponible pour les candidatures",
      };
    }

    // 4. Vérifier qu'il n'y a pas déjà une candidature
    const alreadyApplied = await checkApplicationExists(
      params.mission_id,
      user.id
    );
    if (alreadyApplied) {
      return {
        success: false,
        error: "Vous avez déjà postulé à cette mission",
      };
    }

    // 5. Créer la candidature
    const result = await createApplicationData(params);
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Erreur lors de la création de la candidature",
      };
    }

    return {
      success: true,
      applicationId: result.application?.id,
    };
  } catch (err) {
    console.error("Erreur lors de la candidature à la mission:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la candidature",
    };
  }
}

/**
 * Récupère toutes les candidatures d'une mission (pour les recruteurs)
 */
export async function getMissionApplications(missionId: string) {
  try {
    // Vérifier que l'utilisateur est authentifié
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Vous devez être connecté",
        applications: [],
      };
    }

    // Vérifier que la mission existe et que l'utilisateur est le recruteur
    const mission = await getMissionById(missionId);
    if (!mission) {
      return {
        success: false,
        error: "Mission introuvable",
        applications: [],
      };
    }

    if (mission.recruiter_id !== user.id) {
      return {
        success: false,
        error:
          "Vous n'êtes pas autorisé à voir les candidatures de cette mission",
        applications: [],
      };
    }

    // Récupérer les candidatures
    const applications = await getApplicationsByMissionData(missionId);

    return {
      success: true,
      applications,
    };
  } catch (err) {
    console.error("Erreur lors de la récupération des candidatures:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la récupération des candidatures",
      applications: [],
    };
  }
}

/**
 * Met à jour le statut d'une candidature (pour les recruteurs)
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<ApplicationResult> {
  try {
    // Vérifier que l'utilisateur est authentifié
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Vous devez être connecté",
      };
    }

    // Récupérer la candidature pour vérifier les permissions
    const application = await getApplicationById(applicationId);
    if (!application) {
      return {
        success: false,
        error: "Candidature introuvable",
      };
    }

    // Vérifier que la mission existe et que l'utilisateur est le recruteur
    const mission = await getMissionById(application.mission_id);
    if (!mission) {
      return {
        success: false,
        error: "Mission introuvable",
      };
    }

    if (mission.recruiter_id !== user.id) {
      return {
        success: false,
        error: "Vous n'êtes pas autorisé à modifier cette candidature",
      };
    }

    // Vérifier les transitions de statut autorisées
    const validTransitions = getValidStatusTransitions(application.status);
    if (!validTransitions.includes(status)) {
      return {
        success: false,
        error: `Transition de statut non autorisée de "${application.status}" à "${status}"`,
      };
    }

    // Mettre à jour le statut
    const result = await updateApplicationStatusData(applicationId, status);
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Erreur lors de la mise à jour du statut",
      };
    }

    return {
      success: true,
      applicationId: result.application?.id,
    };
  } catch (err) {
    console.error("Erreur lors de la mise à jour du statut:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour du statut",
    };
  }
}

/**
 * Récupère toutes les candidatures d'un freelance
 */
export async function getUserApplications(userId?: string) {
  try {
    const applications = await getApplicationsByUserData(userId);
    return {
      success: true,
      applications,
    };
  } catch (err) {
    console.error("Erreur lors de la récupération des candidatures:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la récupération des candidatures",
      applications: [],
    };
  }
}

/**
 * Retourne les transitions de statut valides depuis un statut donné
 */
function getValidStatusTransitions(
  currentStatus: ApplicationStatus
): ApplicationStatus[] {
  switch (currentStatus) {
    case "pending":
      // Depuis "pending", le recruteur peut passer à shortlisted, rejected, ou accepted
      return ["shortlisted", "rejected", "accepted"];
    case "applied":
      // Depuis "applied" (ancien statut, pour compatibilité), on peut aller vers shortlisted, rejected, ou withdrawn
      return ["shortlisted", "rejected", "withdrawn"];
    case "shortlisted":
      // Depuis "shortlisted", on peut aller vers accepted, rejected, ou withdrawn
      return ["accepted", "rejected", "withdrawn"];
    case "rejected":
      // Une fois rejeté, on ne peut plus changer (sauf retrait par le freelance)
      return ["withdrawn"];
    case "accepted":
      // Une fois accepté, on ne peut plus changer (sauf retrait par le freelance)
      return ["withdrawn"];
    case "withdrawn":
      // Une fois retiré, on ne peut plus changer
      return [];
    default:
      return [];
  }
}
