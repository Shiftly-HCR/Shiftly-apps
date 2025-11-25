import { supabase } from "../supabaseClient";
import type {
  FreelanceProfile,
  FreelanceExperience,
  FreelanceEducation,
  UpdateFreelanceProfileParams,
  LinkedInProfileData,
} from "../types/profile";

/**
 * Récupère le profil freelance complet (avec expériences, éducations, compétences)
 */
export async function getFreelanceProfile(): Promise<FreelanceProfile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Récupérer le profil de base
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return profile as FreelanceProfile;
  } catch (err) {
    console.error("Erreur lors de la récupération du profil freelance:", err);
    return null;
  }
}

/**
 * Récupère un profil freelance par son ID (pour les recruteurs)
 */
export async function getFreelanceProfileById(
  userId: string
): Promise<FreelanceProfile | null> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .eq("role", "freelance")
      .single();

    if (profileError || !profile) {
      console.error("Erreur lors de la récupération du profil:", profileError);
      return null;
    }

    return profile as FreelanceProfile;
  } catch (err) {
    console.error("Erreur lors de la récupération du profil freelance:", err);
    return null;
  }
}

/**
 * Récupère les expériences d'un freelance par son ID
 */
export async function getFreelanceExperiencesById(
  userId: string
): Promise<FreelanceExperience[]> {
  try {
    const { data, error } = await supabase
      .from("freelance_experiences")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Erreur lors de la récupération des expériences:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur lors de la récupération des expériences:", err);
    return [];
  }
}

/**
 * Met à jour le profil freelance
 */
export async function updateFreelanceProfile(
  params: UpdateFreelanceProfileParams
): Promise<{ success: boolean; error?: string; profile?: FreelanceProfile }> {
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

    if (params.firstName !== undefined)
      updateData.first_name = params.firstName;
    if (params.lastName !== undefined) updateData.last_name = params.lastName;
    if (params.email !== undefined) updateData.email = params.email;
    if (params.phone !== undefined) updateData.phone = params.phone;
    if (params.bio !== undefined) updateData.bio = params.bio;
    if (params.headline !== undefined) updateData.headline = params.headline;
    if (params.location !== undefined) updateData.location = params.location;
    if (params.summary !== undefined) updateData.summary = params.summary;
    if (params.photo_url !== undefined) updateData.photo_url = params.photo_url;
    if (params.skills !== undefined) updateData.skills = params.skills;

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error(
        "Erreur lors de la mise à jour du profil freelance:",
        error
      );
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      profile: data as FreelanceProfile,
    };
  } catch (err) {
    console.error("Erreur lors de la mise à jour du profil freelance:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour du profil",
    };
  }
}

/**
 * Récupère toutes les expériences du freelance connecté
 */
export async function getFreelanceExperiences(): Promise<
  FreelanceExperience[]
> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("freelance_experiences")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Erreur lors de la récupération des expériences:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur lors de la récupération des expériences:", err);
    return [];
  }
}

/**
 * Crée ou met à jour une expérience
 */
export async function upsertFreelanceExperience(
  experience: Omit<FreelanceExperience, "id" | "created_at" | "updated_at">
): Promise<{
  success: boolean;
  error?: string;
  experience?: FreelanceExperience;
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

    const experienceData = {
      ...experience,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (experience.id) {
      // Mise à jour
      const { data, error } = await supabase
        .from("freelance_experiences")
        .update(experienceData)
        .eq("id", experience.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      result = { data, error: null };
    } else {
      // Création
      const { data, error } = await supabase
        .from("freelance_experiences")
        .insert({
          ...experienceData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      result = { data, error: null };
    }

    return {
      success: true,
      experience: result.data as FreelanceExperience,
    };
  } catch (err: any) {
    console.error("Erreur lors de la sauvegarde de l'expérience:", err);
    return {
      success: false,
      error: err.message || "Une erreur est survenue",
    };
  }
}

/**
 * Supprime une expérience
 */
export async function deleteFreelanceExperience(
  experienceId: string
): Promise<{ success: boolean; error?: string }> {
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
      .from("freelance_experiences")
      .delete()
      .eq("id", experienceId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erreur lors de la suppression de l'expérience:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error("Erreur lors de la suppression de l'expérience:", err);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}

/**
 * Récupère toutes les formations du freelance connecté
 */
export async function getFreelanceEducations(): Promise<FreelanceEducation[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("freelance_educations")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Erreur lors de la récupération des formations:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur lors de la récupération des formations:", err);
    return [];
  }
}

/**
 * Crée ou met à jour une formation
 */
export async function upsertFreelanceEducation(
  education: Omit<FreelanceEducation, "id" | "created_at" | "updated_at">
): Promise<{
  success: boolean;
  error?: string;
  education?: FreelanceEducation;
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

    const educationData = {
      ...education,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (education.id) {
      // Mise à jour
      const { data, error } = await supabase
        .from("freelance_educations")
        .update(educationData)
        .eq("id", education.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      result = { data, error: null };
    } else {
      // Création
      const { data, error } = await supabase
        .from("freelance_educations")
        .insert({
          ...educationData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      result = { data, error: null };
    }

    return {
      success: true,
      education: result.data as FreelanceEducation,
    };
  } catch (err: any) {
    console.error("Erreur lors de la sauvegarde de la formation:", err);
    return {
      success: false,
      error: err.message || "Une erreur est survenue",
    };
  }
}

/**
 * Supprime une formation
 */
export async function deleteFreelanceEducation(
  educationId: string
): Promise<{ success: boolean; error?: string }> {
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
      .from("freelance_educations")
      .delete()
      .eq("id", educationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erreur lors de la suppression de la formation:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error("Erreur lors de la suppression de la formation:", err);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}

/**
 * Récupère tous les profils freelance publiés (pour les recruteurs)
 */
export async function getPublishedFreelances(): Promise<FreelanceProfile[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "freelance")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des freelances:", error);
      return [];
    }

    return (data || []) as FreelanceProfile[];
  } catch (err) {
    console.error("Erreur lors de la récupération des freelances:", err);
    return [];
  }
}

/**
 * Synchronise les données LinkedIn importées avec le profil freelance
 */
export async function syncLinkedInData(
  linkedInData: LinkedInProfileData
): Promise<{ success: boolean; error?: string }> {
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

    // 1. Mettre à jour le profil de base
    const nameParts = linkedInData.fullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const profileUpdate = await updateFreelanceProfile({
      firstName,
      lastName,
      headline: linkedInData.headline,
      location: linkedInData.location,
      summary: linkedInData.summary,
      photo_url: linkedInData.photoUrl,
      skills: linkedInData.skills,
    });

    if (!profileUpdate.success) {
      return profileUpdate;
    }

    // 2. Synchroniser les expériences (supprimer les anciennes et créer les nouvelles)
    const existingExperiences = await getFreelanceExperiences();
    for (const exp of existingExperiences) {
      if (exp.id) {
        await deleteFreelanceExperience(exp.id);
      }
    }

    for (const exp of linkedInData.experiences) {
      await upsertFreelanceExperience({
        user_id: user.id,
        title: exp.title,
        company: exp.company,
        start_date: exp.startDate,
        end_date: exp.endDate,
        is_current: exp.isCurrent,
        location: exp.location,
        description: exp.description,
      });
    }

    // 3. Synchroniser les formations
    const existingEducations = await getFreelanceEducations();
    for (const edu of existingEducations) {
      if (edu.id) {
        await deleteFreelanceEducation(edu.id);
      }
    }

    for (const edu of linkedInData.educations) {
      await upsertFreelanceEducation({
        user_id: user.id,
        school: edu.school,
        degree: edu.degree,
        field: edu.field,
        start_date: edu.startDate,
        end_date: edu.endDate,
      });
    }

    return {
      success: true,
    };
  } catch (err: any) {
    console.error("Erreur lors de la synchronisation LinkedIn:", err);
    return {
      success: false,
      error: err.message || "Une erreur est survenue",
    };
  }
}
