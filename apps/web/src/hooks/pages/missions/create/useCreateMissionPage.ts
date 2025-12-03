"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRecruiterMissions, useEstablishments } from "@/hooks";
import { useCachedEstablishment } from "@/hooks/cache/useCachedEstablishment";
import {
  createMission,
  uploadMissionImage,
  geocodeAddress,
  reverseGeocode,
  debounce,
} from "@shiftly/data";

type Step = 1 | 2 | 3 | 4 | 5;

/**
 * Hook pour gérer la logique de la page de création de mission
 * Gère les étapes, les formulaires, le géocodage et la soumission
 */
export function useCreateMissionPage(initialEstablishmentId?: string) {
  const router = useRouter();
  const { refresh } = useRecruiterMissions();
  const { establishments } = useEstablishments();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Étape 1: Infos générales
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string>("");

  // Étape 2: Établissement (nouveau)
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<
    string | null
  >(initialEstablishmentId || null);

  // Initialiser l'établissement si fourni en paramètre
  useEffect(() => {
    if (initialEstablishmentId && !selectedEstablishmentId) {
      setSelectedEstablishmentId(initialEstablishmentId);
    }
  }, [initialEstablishmentId]);

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
  const [missionImage, setMissionImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // État pour le géocodage
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  // Utiliser le hook de cache pour charger l'établissement
  const { data: selectedEstablishment } = useCachedEstablishment(
    selectedEstablishmentId,
    false
  );

  // Charger l'adresse de l'établissement si sélectionné
  useEffect(() => {
    if (selectedEstablishmentId) {
      // Chercher d'abord dans la liste des établissements déjà chargés
      const establishmentFromList = establishments.find(
        (est) => est.id === selectedEstablishmentId
      );

      const establishment = establishmentFromList || selectedEstablishment;

      if (establishment) {
        // Utiliser les données de l'établissement
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
        // Mettre à jour les champs si vides
        if (!cty && result.city) setCity(result.city);
        if (!postal && result.postalCode) setPostalCode(result.postalCode);
      }
    }, 1000),
    [mapboxToken]
  );

  // Géocodage inversé des coordonnées vers adresse
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
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

  const handleNext = () => {
    setError("");

    // Validation selon l'étape
    if (currentStep === 1) {
      if (!title.trim()) {
        setError("Le titre est requis");
        return;
      }
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
    setMissionImage(file);
    if (file) {
      // Créer un aperçu
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
    setIsLoading(true);

    try {
      // Créer la mission
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const missionResult = await createMission({
        title,
        description,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
        establishment_id: selectedEstablishmentId || undefined,
        address: address || undefined,
        city: city || undefined,
        postal_code: postalCode || undefined,
        latitude: latitude,
        longitude: longitude,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        status: saveAsDraft ? "draft" : "published",
      });

      if (!missionResult.success) {
        setError(missionResult.error || "Erreur lors de la création");
        setIsLoading(false);
        return;
      }

      // Upload l'image si elle existe
      if (missionImage && missionResult.mission) {
        await uploadMissionImage(missionResult.mission.id, missionImage);
      }

      // Rafraîchir le cache des missions
      await refresh();

      // Redirection vers la liste des missions
      router.push("/missions");
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  return {
    // États des étapes
    currentStep,
    setCurrentStep,
    isLoading,
    error,
    setError,

    // États Étape 1: Infos générales
    title,
    setTitle,
    description,
    setDescription,
    skills,
    setSkills,

    // États Étape 2: Établissement
    selectedEstablishmentId,
    setSelectedEstablishmentId,
    establishments,

    // États Étape 3: Localisation
    address,
    setAddress,
    city,
    setCity,
    postalCode,
    setPostalCode,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    isGeocoding,

    // États Étape 4: Dates et horaires
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,

    // États Étape 4: Rémunération et image
    hourlyRate,
    setHourlyRate,
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

