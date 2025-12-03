"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@shiftly/data";
import { useSessionContext } from "@/providers/SessionProvider";

/**
 * Hook pour gérer la logique de la page d'inscription
 * Gère les champs du formulaire, la validation et la soumission
 */
export function useRegisterPage() {
  const router = useRouter();
  const { refresh } = useSessionContext();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<
    "freelance" | "recruiter" | "commercial"
  >("recruiter");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setIsLoading(true);

    // Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !userType
    ) {
      setError("Veuillez remplir tous les champs");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    const result = await signUp({
      email,
      password,
      firstName,
      lastName,
      role: userType,
    });

    if (result.success) {
      // Rafraîchir le cache après inscription
      // Le cache contient déjà le profil, pas besoin d'appeler getCurrentProfile()
      await refresh();

      // Attendre un peu pour que le cache soit mis à jour
      // Le SessionProvider s'abonne déjà à onAuthStateChange, donc le cache sera mis à jour automatiquement
      // On utilise un petit délai pour s'assurer que le cache est prêt
      setTimeout(() => {
        // Le cache sera mis à jour par onAuthStateChange dans SessionProvider
        // On redirige vers /home par défaut, le cache déterminera la bonne route
        router.push("/home");
      }, 100);
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setIsLoading(false);
  };

  return {
    // États du formulaire
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    userType,
    setUserType,
    // États généraux
    error,
    isLoading,
    // Handlers
    handleRegister,
  };
}
