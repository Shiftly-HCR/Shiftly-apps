import { supabase } from "../supabaseClient";
import { uploadImage, replaceImage, deleteImage } from "../helpers/imageUpload";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export interface Profile {
  id: string;
  created_at?: string;
  updated_at?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  bio?: string;
  badges?: string;
  note?: number;
  phone?: string;
  email?: string;
  is_premium?: boolean;
  subscription_plan_id?: string;
  // Champs Stripe
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: SubscriptionStatus;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  subscription_price_id?: string;
  daily_rate?: number; // TJM (Taux Journalier Moyen) en euros
  hourly_rate?: number; // Tarif horaire en euros
  availability?: string; // Disponibilité (temps plein, temps partiel, etc.)
}

export interface CreateProfileParams {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  photo_url?: string;
  daily_rate?: number; // TJM (Taux Journalier Moyen) en euros
  hourly_rate?: number; // Tarif horaire en euros
  availability?: string; // Disponibilité (temps plein, temps partiel, etc.)
}

/**
 * Crée un profil utilisateur dans la base de données
 */
export async function createProfile({
  userId,
  email,
  firstName,
  lastName,
  role = "recruiter",
}: CreateProfileParams): Promise<{
  success: boolean;
  error?: string;
  profile?: Profile;
}> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
        first_name: firstName || "",
        last_name: lastName || "",
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la création du profil:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      profile: data,
    };
  } catch (err) {
    console.error("Erreur lors de la création du profil:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création du profil",
    };
  }
}

/**
 * Récupère le profil d'un utilisateur par son ID
 */
export async function getProfileById(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Erreur lors de la récupération du profil:", err);
    return null;
  }
}

/**
 * Récupère le profil de l'utilisateur actuellement connecté
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return getProfileById(user.id);
  } catch (err) {
    console.error("Erreur lors de la récupération du profil actuel:", err);
    return null;
  }
}

/**
 * Met à jour le profil de l'utilisateur actuel
 */
export async function updateProfile(
  params: UpdateProfileParams
): Promise<{ success: boolean; error?: string; profile?: Profile }> {
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
    if (params.photo_url !== undefined) updateData.photo_url = params.photo_url;
    if (params.daily_rate !== undefined)
      updateData.daily_rate = params.daily_rate;
    if (params.hourly_rate !== undefined)
      updateData.hourly_rate = params.hourly_rate;
    if (params.availability !== undefined)
      updateData.availability = params.availability;

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      profile: data,
    };
  } catch (err) {
    console.error("Erreur lors de la mise à jour du profil:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour du profil",
    };
  }
}

/**
 * Met à jour le statut premium de l'utilisateur actuel
 */
export async function updatePremiumStatus(
  isPremium: boolean,
  planId?: string
): Promise<{ success: boolean; error?: string; profile?: Profile }> {
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
      is_premium: isPremium,
      updated_at: new Date().toISOString(),
    };

    // Si un planId est fourni, le stocker
    if (planId) {
      updateData.subscription_plan_id = planId;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la mise à jour du statut premium:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      profile: data,
    };
  } catch (err) {
    console.error("Erreur lors de la mise à jour du statut premium:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour du statut premium",
    };
  }
}

/**
 * Supprime le profil de l'utilisateur actuel
 */
export async function deleteProfile(): Promise<{
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
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (error) {
      console.error("Erreur lors de la suppression du profil:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error("Erreur lors de la suppression du profil:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression du profil",
    };
  }
}

/**
 * Upload une photo de profil pour l'utilisateur actuel
 * @param file - Le fichier image à uploader
 * @returns L'URL de la photo uploadée
 */
export async function uploadProfilePhoto(file: File): Promise<{
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

    // Récupérer le profil actuel pour obtenir l'ancienne photo
    const profile = await getProfileById(user.id);
    const oldPhotoUrl = profile?.photo_url;

    // Extraire le chemin de l'ancienne photo depuis l'URL si elle existe
    let oldPhotoPath: string | null = null;
    if (oldPhotoUrl) {
      const urlParts = oldPhotoUrl.split("/avatars/");
      if (urlParts.length > 1) {
        oldPhotoPath = urlParts[1].split("?")[0];
      }
    }

    // Upload la nouvelle photo (et supprime l'ancienne si elle existe)
    const uploadResult = await replaceImage(
      file,
      oldPhotoPath,
      "avatars",
      `profiles/${user.id}`
    );

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error,
      };
    }

    // Mettre à jour le profil avec la nouvelle URL
    const { error } = await supabase
      .from("profiles")
      .update({
        photo_url: uploadResult.url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      // Supprimer l'image uploadée en cas d'erreur
      if (uploadResult.path) {
        await deleteImage(uploadResult.path);
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
    console.error("Erreur lors de l'upload de la photo:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'upload de la photo",
    };
  }
}

/**
 * Supprime la photo de profil de l'utilisateur actuel
 */
export async function deleteProfilePhoto(): Promise<{
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

    // Récupérer le profil actuel pour obtenir le chemin de la photo
    const profile = await getProfileById(user.id);
    const photoUrl = profile?.photo_url;

    if (photoUrl) {
      // Extraire le chemin depuis l'URL
      const urlParts = photoUrl.split("/avatars/");
      if (urlParts.length > 1) {
        const photoPath = urlParts[1].split("?")[0];
        await deleteImage(photoPath);
      }
    }

    // Mettre à jour le profil pour supprimer l'URL
    const { error } = await supabase
      .from("profiles")
      .update({
        photo_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error("Erreur lors de la suppression de la photo:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de la photo",
    };
  }
}
