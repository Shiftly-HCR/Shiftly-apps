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
      await refresh();
      router.push("/home");
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

