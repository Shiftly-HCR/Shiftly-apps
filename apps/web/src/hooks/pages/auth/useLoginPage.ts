"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResendConfirmationEmail, useSignIn } from "@/hooks/queries";
import { identifyPosthogUser, track } from "@/analytics/client";
import { ANALYTICS_EVENTS } from "@/analytics/events";

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
    track(ANALYTICS_EVENTS.authLoginAttempt);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      track(ANALYTICS_EVENTS.authLoginFailed, {
        error_type: "validation_error",
        reason: "missing_fields",
      });
      return;
    }

    try {
      const result = await signInMutation.mutateAsync({ email, password });

      if (!result.success) {
        setError(result.error || "Une erreur est survenue");
        track(ANALYTICS_EVENTS.authLoginFailed, {
          error_type: "business_error",
          reason: result.error || "unknown_error",
        });
        return;
      }

      if (result.user?.id) {
        identifyPosthogUser(result.user.id, {
          role: result.user.user_metadata?.role || "unknown",
        });
      }
      track(ANALYTICS_EVENTS.authLoginSuccess, {
        role: result.user?.user_metadata?.role || "unknown",
        user_id: result.user?.id || null,
      });

      // Marquer comme en cours de redirection
      setIsRedirecting(true);

      // React Query invalide automatiquement le cache via onSuccess
      // Rediriger vers la page d'accueil
      router.push("/home");
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
      track(ANALYTICS_EVENTS.authLoginFailed, {
        error_type: "exception",
      });
    }
  };

  const handleResendConfirmationEmail = async () => {
    setError("");
    setInfo("");
    track(ANALYTICS_EVENTS.authResendConfirmationAttempt);

    if (!email || !email.trim()) {
      setError("Entrez votre e-mail pour renvoyer le lien de confirmation");
      track(ANALYTICS_EVENTS.authResendConfirmationFailed, {
        error_type: "validation_error",
        reason: "missing_email",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Veuillez entrer une adresse e-mail valide");
      track(ANALYTICS_EVENTS.authResendConfirmationFailed, {
        error_type: "validation_error",
        reason: "invalid_email",
      });
      return;
    }

    try {
      const result = await resendConfirmationMutation.mutateAsync({
        email: email.trim(),
      });

      if (!result.success) {
        setError(result.error || "Impossible d'envoyer l'email de confirmation");
        track(ANALYTICS_EVENTS.authResendConfirmationFailed, {
          error_type: "business_error",
          reason: result.error || "unknown_error",
        });
        return;
      }

      track(ANALYTICS_EVENTS.authResendConfirmationSuccess);
      setInfo(
        "Email de confirmation renvoyé. Vérifiez votre boîte mail (et vos spams)."
      );
    } catch (err) {
      setError("Une erreur est survenue lors du renvoi de l'email");
      track(ANALYTICS_EVENTS.authResendConfirmationFailed, {
        error_type: "exception",
      });
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
