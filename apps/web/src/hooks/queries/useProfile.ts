"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentProfile,
  updateProfile,
  getProfileById,
  type Profile,
} from "@shiftly/data";

type MaybeAxiosError = Error & { response?: { status?: number } };

type AuthError = Error & {
  status?: number;
  code?: string;
  response?: { status?: number };
};

function is401Error(error: unknown): boolean {
  const e = error as AuthError;
  return (
    e?.status === 401 ||
    e?.code === "UNAUTHENTICATED" ||
    (e as MaybeAxiosError)?.response?.status === 401
  );
}

export function useCurrentProfile() {
  const query = useQuery({
    queryKey: ["profile", "current"],
    queryFn: getCurrentProfile,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // 401 = pas connecté
  const isUnauthenticated = query.isError && is401Error(query.error);
  // 200 + null = connecté mais profil pas créé
  const isProfileMissing = query.isSuccess && query.data == null;
  const isAuthResolved = query.isSuccess || query.isError;

  return {
    ...query,
    profile: query.data ?? null,
    isAuthResolved,
    isUnauthenticated,
    isProfileMissing,
  } as typeof query & {
    profile: Profile | null;
    isAuthResolved: boolean;
    isUnauthenticated: boolean;
    isProfileMissing: boolean;
  };
}

export function useProfile(profileId: string | null) {
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => (profileId ? getProfileById(profileId) : null),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      if (result.success && result.profile) {
        queryClient.setQueryData(["profile", "current"], result.profile);
        queryClient.setQueryData(
          ["profile", result.profile.id],
          result.profile,
        );
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
  });
}
