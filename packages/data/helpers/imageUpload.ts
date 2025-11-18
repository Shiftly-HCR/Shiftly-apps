import { supabase } from "../supabaseClient";

export interface UploadImageResult {
  success: boolean;
  error?: string;
  url?: string;
  path?: string;
}

/**
 * Upload une image vers Supabase Storage
 * @param file - Le fichier image à uploader
 * @param bucket - Le nom du bucket Supabase (par défaut: 'avatars')
 * @param folder - Le dossier dans le bucket (optionnel)
 * @returns L'URL publique de l'image uploadée
 */
export async function uploadImage(
  file: File,
  bucket: string = "avatars",
  folder?: string
): Promise<UploadImageResult> {
  try {
    // Validation du fichier
    if (!file) {
      return {
        success: false,
        error: "Aucun fichier fourni",
      };
    }

    // Vérifier que c'est bien une image
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "Le fichier doit être une image",
      };
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "L'image ne doit pas dépasser 5MB",
      };
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${fileExt}`;

    // Construire le chemin complet
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Erreur lors de l'upload:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Récupérer l'URL publique
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: filePath,
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
 * Supprime une image de Supabase Storage
 * @param path - Le chemin du fichier dans le bucket
 * @param bucket - Le nom du bucket Supabase (par défaut: 'avatars')
 */
export async function deleteImage(
  path: string,
  bucket: string = "avatars"
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!path) {
      return {
        success: false,
        error: "Aucun chemin fourni",
      };
    }

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error("Erreur lors de la suppression:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error("Erreur lors de la suppression de l'image:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de l'image",
    };
  }
}

/**
 * Remplace une image existante par une nouvelle
 * @param file - Le nouveau fichier image
 * @param oldPath - Le chemin de l'ancienne image à supprimer
 * @param bucket - Le nom du bucket Supabase (par défaut: 'avatars')
 * @param folder - Le dossier dans le bucket (optionnel)
 */
export async function replaceImage(
  file: File,
  oldPath: string | null,
  bucket: string = "avatars",
  folder?: string
): Promise<UploadImageResult> {
  try {
    // Supprimer l'ancienne image si elle existe
    if (oldPath) {
      await deleteImage(oldPath, bucket);
    }

    // Uploader la nouvelle image
    return await uploadImage(file, bucket, folder);
  } catch (err) {
    console.error("Erreur lors du remplacement de l'image:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors du remplacement de l'image",
    };
  }
}

