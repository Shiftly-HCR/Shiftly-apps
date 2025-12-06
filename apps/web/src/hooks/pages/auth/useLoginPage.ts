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

    try {
      const result = await signIn({ email, password });

      if (!result.success) {
        setError(result.error || "Une erreur est survenue");
        return;
      }

      // Rafraîchir le cache après connexion et attendre qu'il soit prêt
      await refresh();

      // Rediriger dès que la session est en place (SessionProvider est abonné à onAuthStateChange)
      router.replace("/home");
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
