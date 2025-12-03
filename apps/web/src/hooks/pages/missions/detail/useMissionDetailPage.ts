"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useCachedMission } from "@/hooks";
import { useCurrentProfile } from "@/hooks";
import { useApplyToMission } from "@/hooks";
import { useCheckApplication } from "@/hooks";
import { useMissionApplications } from "@/hooks";
import { useUpdateApplicationStatus } from "@/hooks";
import { useUserApplications } from "@/hooks";
import { useMissionChat } from "@/hooks";

/**
 * Hook pour gérer la logique de la page de détail d'une mission
 * Gère les applications, le chat, les permissions et les actions
 */
export function useMissionDetailPage() {
  const params = useParams();
  const missionId = params.id as string;

  const { data: mission, isLoading } = useCachedMission(missionId);
  const { profile } = useCurrentProfile();
  const {
    apply,
    isLoading: isApplying,
    error: applyError,
    success: applySuccess,
  } = useApplyToMission();
  const { data: hasApplied = false, isLoading: isCheckingApplication } =
    useCheckApplication(missionId);

  // Déterminer les rôles et permissions
  const isRecruiter = profile?.role === "recruiter";
  const isMissionOwner = mission?.recruiter_id === profile?.id;

  // Pour les recruteurs : récupérer les candidatures
  const {
    applications,
    isLoading: isLoadingApplications,
    refetch: refetchApplications,
  } = useMissionApplications(isRecruiter && isMissionOwner ? missionId : null);
  const { updateStatus, isLoading: isUpdatingStatus } =
    useUpdateApplicationStatus();

  // Pour les freelances : récupérer leurs candidatures pour vérifier le statut
  const { applications: userApplications } = useUserApplications();
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
    if (applySuccess) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [applySuccess]);

  const handleApply = async () => {
    if (!missionId) return;

    const result = await apply({ mission_id: missionId });
    if (result.success) {
      // Recharger la page après un court délai pour mettre à jour l'état
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
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
    isUpdatingStatus,
    freelanceApplication,
    isFreelanceAccepted,
    showSuccessMessage,
    selectedFreelanceId,
    setSelectedFreelanceId,
    chatFreelanceId,
    canFreelanceChat,
    chat,
    apply,
    isApplying,
    applyError,
    applySuccess,
    hasApplied,
    isCheckingApplication,
    updateStatus,
    refetchApplications,
    handleApply,
    formatDateShort,
  };
}

