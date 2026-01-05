"use client";

import { useState } from "react";
import { signIn } from "@shiftly/data";
import { useSessionContext } from "@/providers/SessionProvider";

/**
 * Hook pour gérer la logique de la page de connexion
 * Gère les champs du formulaire, la validation et la soumission
 */
export function useLoginPage() {
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

    try {
      const result = await signIn({ email, password });

      if (!result.success) {
        setError(result.error || "Une erreur est survenue");
        return;
      }

      // Rafraîchir le cache après connexion et attendre qu'il soit prêt
      await refresh();

      // Utiliser window.location.href pour forcer un rechargement complet
      // Cela garantit que toutes les données sont rechargées et que le cache Next.js est invalidé
      window.location.href = "/home";
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
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
