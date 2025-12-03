"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@shiftly/data";
import { useSessionContext } from "@/providers/SessionProvider";

/**
 * Hook pour gérer la logique de la page de connexion
 * Gère les champs du formulaire, la validation et la soumission
 */
export function useLoginPage() {
  const router = useRouter();
  const { refresh } = useSessionContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setIsLoading(false);
      return;
    }

    const result = await signIn({ email, password });

    if (result.success) {
      // Rafraîchir le cache après connexion
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
    email,
    setEmail,
    password,
    setPassword,
    // États généraux
    error,
    isLoading,
    // Handlers
    handleLogin,
  };
}

