"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@/hooks/queries";

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
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
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
        // React Query invalide automatiquement le cache via onSuccess
        // Rediriger vers la page d'accueil
        router.push("/home");
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription");
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
