import { supabase } from "../supabaseClient";

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
  phone?: string;
  bio?: string;
  photo_url?: string;
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
    if (params.phone !== undefined) updateData.phone = params.phone;
    if (params.bio !== undefined) updateData.bio = params.bio;
    if (params.photo_url !== undefined) updateData.photo_url = params.photo_url;

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
