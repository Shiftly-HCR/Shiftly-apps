"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@/hooks/queries";
import { track } from "@/analytics/client";
import { ANALYTICS_EVENTS } from "@/analytics/events";

/**
 * Hook pour gérer la logique de la page d'inscription
 * Gère les champs du formulaire, la validation et la soumission
 */
export function useRegisterPage() {
  const router = useRouter();
  const signUpMutation = useSignUp();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<
    "freelance" | "recruiter" | "commercial"
  >("recruiter");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    track(ANALYTICS_EVENTS.authRegisterAttempt, {
      role: userType,
    });

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
      track(ANALYTICS_EVENTS.authRegisterFailed, {
        error_type: "validation_error",
        reason: "missing_fields",
        role: userType,
      });
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      track(ANALYTICS_EVENTS.authRegisterFailed, {
        error_type: "validation_error",
        reason: "password_mismatch",
        role: userType,
      });
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      track(ANALYTICS_EVENTS.authRegisterFailed, {
        error_type: "validation_error",
        reason: "password_too_short",
        role: userType,
      });
      return;
    }

    try {
      const result = await signUpMutation.mutateAsync({
        email,
        password,
        firstName,
        lastName,
        role: userType,
      });

      if (result.success) {
        track(ANALYTICS_EVENTS.authRegisterSuccess, {
          role: userType,
        });
        // Après inscription: rediriger vers login avec message de confirmation email
        router.push("/login?signup=check-email");
      } else {
        setError(result.error || "Une erreur est survenue");
        track(ANALYTICS_EVENTS.authRegisterFailed, {
          error_type: "business_error",
          reason: result.error || "unknown_error",
          role: userType,
        });
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription");
      track(ANALYTICS_EVENTS.authRegisterFailed, {
        error_type: "exception",
        role: userType,
      });
    }
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
    isLoading: signUpMutation.isPending,
    // Handlers
    handleRegister,
  };
}
