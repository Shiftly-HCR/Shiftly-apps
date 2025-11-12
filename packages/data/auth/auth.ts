import { supabase } from "../supabaseClient";
import { createProfile } from "../profiles/profiles";

export interface SignUpParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: any;
}

/**
 * Inscrit un nouvel utilisateur
 */
export async function signUp({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Si l'utilisateur est créé, on crée aussi son profil
    // Note: Le trigger SQL devrait le faire automatiquement, mais on le fait aussi ici
    // pour s'assurer que le profil existe immédiatement
    if (data.user) {
      const profileResult = await createProfile({
        userId: data.user.id,
        email,
        firstName,
        lastName,
      });

      // On ne bloque pas l'inscription si le profil échoue (le trigger le créera)
      if (!profileResult.success) {
        console.warn(
          "Le profil n'a pas pu être créé immédiatement, le trigger le créera automatiquement"
        );
      }
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (err) {
    return {
      success: false,
      error: "Une erreur est survenue lors de l'inscription",
    };
  }
}

/**
 * Connecte un utilisateur existant
 */
export async function signIn({
  email,
  password,
}: SignInParams): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (err) {
    return {
      success: false,
      error: "Une erreur est survenue lors de la connexion",
    };
  }
}

/**
 * Déconnecte l'utilisateur actuel
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error: "Une erreur est survenue lors de la déconnexion",
    };
  }
}

/**
 * Récupère l'utilisateur actuellement connecté
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return user;
  } catch (err) {
    return null;
  }
}

/**
 * Récupère la session actuelle
 */
export async function getSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return null;
    }

    return session;
  } catch (err) {
    return null;
  }
}

/**
 * Connexion avec Google
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/home`
        : undefined;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error: "Une erreur est survenue lors de la connexion avec Google",
    };
  }
}

/**
 * Connexion avec Facebook
 */
export async function signInWithFacebook(): Promise<AuthResponse> {
  try {
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/home`
        : undefined;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error: "Une erreur est survenue lors de la connexion avec Facebook",
    };
  }
}

/**
 * Réinitialisation du mot de passe
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error:
        "Une erreur est survenue lors de la réinitialisation du mot de passe",
    };
  }
}
