"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useMission, useCurrentProfile, useApplyToMission as useApplyMutation, useCheckApplication, useMissionApplications as useMissionApplicationsQuery, useUpdateApplicationStatus, useUserApplications } from "@/hooks/queries";
import { useMissionChat } from "@/hooks";
import type { ApplicationStatus } from "@shiftly/data";

/**
 * Hook pour gérer la logique de la page de détail d'une mission
 * Gère les applications, le chat, les permissions et les actions
 */
export function useMissionDetailPage() {
  const params = useParams();
  const missionId = params.id as string;

  const { data: mission, isLoading } = useMission(missionId);
  const { data: profile } = useCurrentProfile();
  const applyMutation = useApplyMutation();
  const { data: hasApplied = false, isLoading: isCheckingApplication } =
    useCheckApplication(missionId);

  // Déterminer les rôles et permissions
  const isRecruiter = profile?.role === "recruiter";
  const isMissionOwner = mission?.recruiter_id === profile?.id;

  // Pour les recruteurs : récupérer les candidatures
  const {
    data: applications = [],
    isLoading: isLoadingApplications,
    refetch: refetchApplications,
  } = useMissionApplicationsQuery(isRecruiter && isMissionOwner ? missionId : null);
  const updateStatusMutation = useUpdateApplicationStatus();

  // Pour les freelances : récupérer leurs candidatures pour vérifier le statut
  const { data: userApplications = [] } = useUserApplications();
  const freelanceApplication = useMemo(
    () => userApplications.find((app) => app.mission_id === missionId),
    [userApplications, missionId]
  );
  const isFreelanceAccepted = freelanceApplication?.status === "accepted";

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedFreelanceId, setSelectedFreelanceId] = useState<string | null>(
    null
  );

  // Déterminer le freelance avec qui chatter (pour recruteur) ou utiliser l'ID du freelance connecté
  const chatFreelanceId = useMemo(() => {
    if (isRecruiter && isMissionOwner) {
      return (
        selectedFreelanceId ||
        applications.find((app) => app.status === "accepted")?.user_id ||
        null
      );
    }
    if (profile?.role === "freelance" && isFreelanceAccepted) {
      return profile.id;
    }
    return null;
  }, [
    isRecruiter,
    isMissionOwner,
    selectedFreelanceId,
    applications,
    profile,
    isFreelanceAccepted,
  ]);

  // Vérifier si le freelance peut chatter (doit être accepté)
  const canFreelanceChat = profile?.role === "freelance" && isFreelanceAccepted;

  // Initialiser le chat si les conditions sont remplies
  const chat = useMissionChat(
    missionId && (isRecruiter || canFreelanceChat) ? missionId : null,
    mission?.recruiter_id || null,
    chatFreelanceId
  );

  // Gérer l'affichage du message de succès
  useEffect(() => {
    if (applyMutation.isSuccess) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [applyMutation.isSuccess]);

  const handleApply = async () => {
    if (!missionId) return;
    await applyMutation.mutateAsync({ mission_id: missionId });
    // Plus besoin de recharger la page, React Query invalide automatiquement le cache
  };

  // Formater les dates pour affichage
  const formatDateShort = (startDate?: string, endDate?: string) => {
    if (!startDate && !endDate) return "Dates non définies";

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffInDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const startDay = start.getDate().toString().padStart(2, "0");
      const endFormatted = end.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `Du ${startDay} au ${endFormatted}, ${diffInDays + 1} jours`;
    }

    return "Dates non définies";
  };

  return {
    missionId,
    mission,
    isLoading,
    profile,
    isRecruiter,
    isMissionOwner,
    applications,
    isLoadingApplications,
    isUpdatingStatus: updateStatusMutation.isPending,
    freelanceApplication,
    isFreelanceAccepted,
    showSuccessMessage,
    selectedFreelanceId,
    setSelectedFreelanceId,
    chatFreelanceId,
    canFreelanceChat,
    chat,
    apply: applyMutation.mutate,
    isApplying: applyMutation.isPending,
    applyError: applyMutation.error?.message || null,
    applySuccess: applyMutation.isSuccess,
    hasApplied,
    isCheckingApplication,
    updateStatus: (applicationId: string, status: ApplicationStatus) =>
      updateStatusMutation.mutate({ applicationId, status }),
    refetchApplications,
    handleApply,
    formatDateShort,
  };
}
