"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateMission,
  useUpdateMission,
  useUploadMissionImage,
  useEstablishments,
  useEstablishment,
} from "@/hooks/queries";
import {
  geocodeAddress,
  reverseGeocode,
  debounce,
  type CreateMissionParams,
  type Mission,
} from "@shiftly/data";

type Step = 1 | 2 | 3 | 4 | 5;

const AUTOSAVE_DELAY_MS = 1500;

type PersistResult = {
  mission?: Mission;
  error?: string;
};

/**
 * Hook pour gérer la logique de la page de création de mission
 * Gère les étapes, les formulaires, le géocodage et la soumission
 */
export function useCreateMissionPage(initialEstablishmentId?: string) {
  const router = useRouter();
  const createMissionMutation = useCreateMission();
  const updateMissionMutation = useUpdateMission();
  const uploadImageMutation = useUploadMissionImage();
  const { data: establishments = [] } = useEstablishments();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [draftMissionId, setDraftMissionId] = useState<string | null>(null);
  const [isHydratingDraft, setIsHydratingDraft] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSavePromiseRef = useRef<Promise<PersistResult> | null>(null);

  // Étape 1: Infos générales
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string>("");

  // Étape 2: Établissement
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<
    string | null
  >(initialEstablishmentId || null);

  // Étape 3: Localisation
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState<number>(48.8566); // Paris par défaut
  const [longitude, setLongitude] = useState<number>(2.3522);

  // Étape 4: Dates et horaires
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Étape 5: Rémunération et image
  const [hourlyRate, setHourlyRate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [totalSalary, setTotalSalary] = useState("");
  const [missionImage, setMissionImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // État pour le géocodage
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  // Utiliser le hook React Query pour charger l'établissement
  const { data: selectedEstablishment } = useEstablishment(selectedEstablishmentId);

  const clearAutosaveTimeout = useCallback(() => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }
  }, []);

  const parseRate = (value: string): number | undefined => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  // Calculer le nombre d'heures journalières à partir des horaires
  const calculateDailyHours = (): number => {
    if (!startTime || !endTime) return 0;

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Gérer le cas où la fin est le lendemain (ex: 22h à 2h)
    let diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }

    return diffMinutes / 60;
  };

  // Calculer le nombre de jours entre start_date et end_date
  const calculateNumberOfDays = (): number => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1;
  };

  const buildMissionPayload = useCallback(
    (status: "draft" | "published"): CreateMissionParams => {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const parsedHourlyRate = parseRate(hourlyRate);
      let finalDailyRate = parseRate(dailyRate);

      if (!finalDailyRate && parsedHourlyRate) {
        const hoursPerDay = calculateDailyHours();
        if (hoursPerDay > 0) {
          finalDailyRate = parsedHourlyRate * hoursPerDay;
        }
      }

      let finalTotalSalary = parseRate(totalSalary);
      if (!finalTotalSalary && finalDailyRate) {
        const numberOfDays = calculateNumberOfDays();
        if (numberOfDays > 0) {
          finalTotalSalary = finalDailyRate * numberOfDays;
        }
      }

      return {
        title: title || "",
        description,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
        establishment_id: selectedEstablishmentId || undefined,
        address: address || undefined,
        city: city || undefined,
        postal_code: postalCode || undefined,
        latitude,
        longitude,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        hourly_rate: parsedHourlyRate,
        daily_rate: finalDailyRate,
        total_salary: finalTotalSalary,
        status,
      };
    },
    [
      title,
      description,
      skills,
      selectedEstablishmentId,
      address,
      city,
      postalCode,
      latitude,
      longitude,
      startDate,
      endDate,
      startTime,
      endTime,
      hourlyRate,
      dailyRate,
      totalSalary,
    ]
  );

  const persistMission = useCallback(
    async (status: "draft" | "published"): Promise<PersistResult> => {
      const payload = buildMissionPayload(status);

      const result = draftMissionId
        ? await updateMissionMutation.mutateAsync({
            missionId: draftMissionId,
            params: payload,
          })
        : await createMissionMutation.mutateAsync(payload);

      if (!result.success || !result.mission) {
        const message = result.error || "Erreur lors de l'enregistrement du brouillon";
        setSaveError(message);
        return { error: message };
      }

      if (!draftMissionId) {
        setDraftMissionId(result.mission.id);
      }

      setSaveError("");
      setLastSavedAt(new Date().toISOString());
      return { mission: result.mission };
    },
    [
      buildMissionPayload,
      draftMissionId,
      createMissionMutation,
      updateMissionMutation,
    ]
  );

  const flushPendingAutosave = useCallback(async () => {
    clearAutosaveTimeout();

    if (autoSavePromiseRef.current) {
      await autoSavePromiseRef.current;
      autoSavePromiseRef.current = null;
    }
  }, [clearAutosaveTimeout]);

  // Initialiser l'établissement si fourni en paramètre
  useEffect(() => {
    if (initialEstablishmentId && !selectedEstablishmentId) {
      setSelectedEstablishmentId(initialEstablishmentId);
    }
  }, [initialEstablishmentId, selectedEstablishmentId]);

  // Reprise du dernier brouillon, sauf si un établissement est explicitement imposé
  useEffect(() => {
    // /missions/create doit toujours partir d'une nouvelle mission.
    // Les brouillons existants se modifient depuis leur carte dédiée.
    setIsHydratingDraft(false);
  }, []);

  // Charger l'adresse de l'établissement si sélectionné
  useEffect(() => {
    if (selectedEstablishmentId) {
      const establishmentFromList = establishments.find(
        (est) => est.id === selectedEstablishmentId
      );

      const establishment = establishmentFromList || selectedEstablishment;

      if (establishment) {
        setAddress(establishment.address || "");
        setCity(establishment.city || "");
        setPostalCode(establishment.postal_code || "");
        if (establishment.latitude && establishment.longitude) {
          setLatitude(establishment.latitude);
          setLongitude(establishment.longitude);
        }
      }
    }
  }, [selectedEstablishmentId, establishments, selectedEstablishment]);

  // Géocodage de l'adresse vers coordonnées (avec debounce)
  const handleAddressChange = useCallback(
    debounce(async (addr: string, cty: string, postal: string) => {
      if (!addr && !cty && !postal) return;

      setIsGeocoding(true);
      const result = await geocodeAddress(addr, cty, postal, mapboxToken);
      setIsGeocoding(false);

      if (result) {
        setLatitude(result.latitude);
        setLongitude(result.longitude);
        if (!cty && result.city) setCity(result.city);
        if (!postal && result.postalCode) setPostalCode(result.postalCode);
      }
    }, 1000),
    [mapboxToken]
  );

  // Géocodage inversé des coordonnées vers adresse
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setHasUserInteracted(true);
      setLatitude(lat);
      setLongitude(lng);

      setIsGeocoding(true);
      const result = await reverseGeocode(lat, lng, mapboxToken);
      setIsGeocoding(false);

      if (result) {
        setAddress(result.address);
        setCity(result.city);
        setPostalCode(result.postalCode);
      }
    },
    [mapboxToken]
  );

  // Effet pour déclencher le géocodage quand l'adresse change
  useEffect(() => {
    handleAddressChange(address, city, postalCode);
  }, [address, city, postalCode, handleAddressChange]);

  // Calculer automatiquement le TJM si le tarif horaire est renseigné
  useEffect(() => {
    if (hourlyRate && !dailyRate) {
      const hoursPerDay = calculateDailyHours();
      if (hoursPerDay > 0) {
        const calculatedDailyRate = parseFloat(hourlyRate) * hoursPerDay;
        setDailyRate(calculatedDailyRate.toFixed(2));
      }
    }
  }, [hourlyRate, startTime, endTime, dailyRate]);

  // Calculer automatiquement le salaire total si le TJM est renseigné
  useEffect(() => {
    if (dailyRate) {
      const numberOfDays = calculateNumberOfDays();
      if (numberOfDays > 0) {
        const calculatedTotalSalary = parseFloat(dailyRate) * numberOfDays;
        setTotalSalary(calculatedTotalSalary.toFixed(2));
      }
    }
  }, [dailyRate, startDate, endDate]);

  // Autosave draft-first debounced (1,5s)
  useEffect(() => {
    if (isHydratingDraft || !hasUserInteracted || isSubmitting) {
      return;
    }

    clearAutosaveTimeout();

    autosaveTimeoutRef.current = setTimeout(() => {
      setIsAutoSaving(true);

      const autosavePromise = persistMission("draft")
        .catch((err) => {
          console.error(err);
          return { error: "Une erreur est survenue lors de l'enregistrement automatique" };
        })
        .finally(() => {
          autoSavePromiseRef.current = null;
          setIsAutoSaving(false);
        });

      autoSavePromiseRef.current = autosavePromise;
    }, AUTOSAVE_DELAY_MS);

    return clearAutosaveTimeout;
  }, [
    title,
    description,
    skills,
    selectedEstablishmentId,
    address,
    city,
    postalCode,
    latitude,
    longitude,
    startDate,
    endDate,
    startTime,
    endTime,
    hourlyRate,
    dailyRate,
    totalSalary,
    isHydratingDraft,
    hasUserInteracted,
    isSubmitting,
    persistMission,
    clearAutosaveTimeout,
  ]);

  useEffect(() => {
    return () => {
      clearAutosaveTimeout();
    };
  }, [clearAutosaveTimeout]);

  const markUserInteracted = useCallback(() => {
    setHasUserInteracted(true);
  }, []);

  const setTitleAndTrack = useCallback(
    (value: string) => {
      markUserInteracted();
      setTitle(value);
    },
    [markUserInteracted]
  );

  const setDescriptionAndTrack = useCallback(
    (value: string) => {
      markUserInteracted();
      setDescription(value);
    },
    [markUserInteracted]
  );

  const setSkillsAndTrack = useCallback(
    (value: string) => {
      markUserInteracted();
      setSkills(value);
    },
    [markUserInteracted]
  );

  const setSelectedEstablishmentIdAndTrack = useCallback(
    (value: string | null) => {
      markUserInteracted();
      setSelectedEstablishmentId(value);
    },
    [markUserInteracted]
  );

  const setAddressAndTrack = useCallback(
    (value: string) => {
      markUserInteracted();
      setAddress(value);
    },
    [markUserInteracted]
  );

  const setCityAndTrack = useCallback(
    (value: string) => {
      markUserInteracted();
      setCity(value);
    },
    [markUserInteracted]
  );

  const setPostalCodeAndTrack = useCallback(
    (value: string) => {
      markUserInteracted();
      setPostalCode(value);
    },
    [markUserInteracted]
  );

  const setStartDateAndTrack = useCallback(
    (value: string) => {
      markUserInteracted();
      setStartDate(value);
    },
    [markUserInteracted]
  );

  const setEndDateAndTrack = useCallback(
    (value: string) => {
      markUserInteracted();
      setEndDate(value);
    },
    [markUserInteracted]
  );

  const setStartTimeAndTrack = useCallback(
    (value: string) => {
      markUserInteracted();
      setStartTime(value);
    },
    [markUserInteracted]
  );

  const setEndTimeAndTrack = useCallback(
    (value: string) => {
      markUserInteracted();
      setEndTime(value);
    },
    [markUserInteracted]
  );

  const setHourlyRateAndTrack = useCallback(
    (value: string) => {
      markUserInteracted();
      setHourlyRate(value);
    },
    [markUserInteracted]
  );

  const setDailyRateAndTrack = useCallback(
    (value: string) => {
      markUserInteracted();
      setDailyRate(value);
    },
    [markUserInteracted]
  );

  const handleNext = () => {
    setError("");

    if (currentStep === 1 && !title.trim()) {
      setError("Le titre est requis");
      return;
    }

    if (currentStep === 5 && !hourlyRate.trim() && !dailyRate.trim()) {
      setError("Vous devez renseigner au moins le tarif horaire ou le TJM");
      return;
    }

    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleImageChange = (file: File | null) => {
    markUserInteracted();
    setMissionImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    setError("");
    setSaveError("");
    setIsSubmitting(true);

    try {
      await flushPendingAutosave();

      const status = saveAsDraft ? "draft" : "published";
      const persistResult = await persistMission(status);

      if (persistResult.error || !persistResult.mission) {
        setError(persistResult.error || "Erreur lors de l'enregistrement");
        setIsSubmitting(false);
        return;
      }

      // En mode "Enregistrer" on force la persistance et on reste sur place
      if (saveAsDraft) {
        setIsSubmitting(false);
        return;
      }

      // L'image est uploadée uniquement à la fin (publication)
      if (missionImage) {
        const imageResult = await uploadImageMutation.mutateAsync({
          missionId: persistResult.mission.id,
          file: missionImage,
        });

        if (!imageResult.success) {
          setError(imageResult.error || "Erreur lors de l'upload de l'image");
          setIsSubmitting(false);
          return;
        }
      }

      router.push("/missions");
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue");
      setIsSubmitting(false);
    }
  };

  return {
    // États des étapes
    currentStep,
    setCurrentStep,
    isLoading: isSubmitting || uploadImageMutation.isPending,
    isAutoSaving,
    lastSavedAt,
    saveError,
    error,
    setError,

    // États Étape 1: Infos générales
    title,
    setTitle: setTitleAndTrack,
    description,
    setDescription: setDescriptionAndTrack,
    skills,
    setSkills: setSkillsAndTrack,

    // États Étape 2: Établissement
    selectedEstablishmentId,
    setSelectedEstablishmentId: setSelectedEstablishmentIdAndTrack,
    establishments,

    // États Étape 3: Localisation
    address,
    setAddress: setAddressAndTrack,
    city,
    setCity: setCityAndTrack,
    postalCode,
    setPostalCode: setPostalCodeAndTrack,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    isGeocoding,

    // États Étape 4: Dates et horaires
    startDate,
    setStartDate: setStartDateAndTrack,
    endDate,
    setEndDate: setEndDateAndTrack,
    startTime,
    setStartTime: setStartTimeAndTrack,
    endTime,
    setEndTime: setEndTimeAndTrack,

    // États Étape 5: Rémunération et image
    hourlyRate,
    setHourlyRate: setHourlyRateAndTrack,
    dailyRate,
    setDailyRate: setDailyRateAndTrack,
    totalSalary,
    missionImage,
    imagePreview,

    // Handlers
    handleNext,
    handleBack,
    handleImageChange,
    handleMapClick,
    handleSubmit,
  };
}
