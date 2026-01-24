"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@/hooks/queries";

/**
 * Hook pour gérer la logique de la page de connexion
 * Gère les champs du formulaire, la validation et la soumission
 */
export function useLoginPage() {
  const router = useRouter();
  const signInMutation = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      const result = await signInMutation.mutateAsync({ email, password });

      if (!result.success) {
        setError(result.error || "Une erreur est survenue");
        return;
      }

      // React Query invalide automatiquement le cache via onSuccess
      // Rediriger vers la page d'accueil
      router.push("/home");
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
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
    isLoading: signInMutation.isPending,
    // Handlers
    handleLogin,
  };
}
