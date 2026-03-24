"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResendConfirmationEmail, useSignIn } from "@/hooks/queries";

/**
 * Hook pour gérer la logique de la page de connexion
 * Gère les champs du formulaire, la validation et la soumission
 */
export function useLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signInMutation = useSignIn();
  const resendConfirmationMutation = useResendConfirmationEmail();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const signupStatus = searchParams.get("signup");
    if (signupStatus === "check-email") {
      setInfo(
        "Compte créé. Confirmez votre adresse e-mail avant de vous connecter."
      );
    }
  }, [searchParams]);

  const handleLogin = async () => {
    setError("");
    setInfo("");

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

      // Marquer comme en cours de redirection
      setIsRedirecting(true);

      // React Query invalide automatiquement le cache via onSuccess
      // Rediriger vers la page d'accueil
      router.push("/home");
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
    }
  };

  const handleResendConfirmationEmail = async () => {
    setError("");
    setInfo("");

    if (!email || !email.trim()) {
      setError("Entrez votre e-mail pour renvoyer le lien de confirmation");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Veuillez entrer une adresse e-mail valide");
      return;
    }

    try {
      const result = await resendConfirmationMutation.mutateAsync({
        email: email.trim(),
      });

      if (!result.success) {
        setError(result.error || "Impossible d'envoyer l'email de confirmation");
        return;
      }

      setInfo(
        "Email de confirmation renvoyé. Vérifiez votre boîte mail (et vos spams)."
      );
    } catch (err) {
      setError("Une erreur est survenue lors du renvoi de l'email");
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
    info,
    isLoading: signInMutation.isPending || isRedirecting,
    isResendingConfirmationEmail: resendConfirmationMutation.isPending,
    // Handlers
    handleLogin,
    handleResendConfirmationEmail,
  };
}
