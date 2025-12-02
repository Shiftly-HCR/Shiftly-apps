"use client";

import { YStack, XStack } from "tamagui";
import { colors } from "@shiftly/ui";
import {
  MissionFormStep1,
  MissionFormStep2,
  MissionFormStep3,
  MissionFormStep4,
  MissionFormStep5,
} from "./";

type Step = 1 | 2 | 3 | 4 | 5;

interface MissionFormStepsProps {
  currentStep: Step;
  // Step 1
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  skills: string;
  setSkills: (value: string) => void;
  // Step 2
  selectedEstablishmentId: string | null;
  setSelectedEstablishmentId: (value: string | null) => void;
  establishments: any[];
  // Step 3
  address: string;
  setAddress: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  postalCode: string;
  setPostalCode: (value: string) => void;
  latitude: number;
  longitude: number;
  isGeocoding: boolean;
  onMapClick: (lat: number, lng: number) => void;
  // Step 4
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  // Step 5
  hourlyRate: string;
  setHourlyRate: (value: string) => void;
  imagePreview: string;
  onImageChange: (file: File | null) => void;
  onImageRemove?: () => void;
}

export function MissionFormSteps(props: MissionFormStepsProps) {
  const {
    currentStep,
    title,
    setTitle,
    description,
    setDescription,
    skills,
    setSkills,
    selectedEstablishmentId,
    setSelectedEstablishmentId,
    establishments,
    address,
    setAddress,
    city,
    setCity,
    postalCode,
    setPostalCode,
    latitude,
    longitude,
    isGeocoding,
    onMapClick,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    hourlyRate,
    setHourlyRate,
    imagePreview,
    onImageChange,
    onImageRemove,
  } = props;

  return (
    <YStack gap="$4">
      {currentStep === 1 && (
        <MissionFormStep1
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          skills={skills}
          setSkills={setSkills}
        />
      )}
      {currentStep === 2 && (
        <MissionFormStep2
          selectedEstablishmentId={selectedEstablishmentId}
          setSelectedEstablishmentId={setSelectedEstablishmentId}
          establishments={establishments}
        />
      )}
      {currentStep === 3 && (
        <MissionFormStep3
          address={address}
          setAddress={setAddress}
          city={city}
          setCity={setCity}
          postalCode={postalCode}
          setPostalCode={setPostalCode}
          latitude={latitude}
          longitude={longitude}
          isGeocoding={isGeocoding}
          selectedEstablishmentId={selectedEstablishmentId}
          onMapClick={onMapClick}
        />
      )}
      {currentStep === 4 && (
        <MissionFormStep4
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
        />
      )}
      {currentStep === 5 && (
        <MissionFormStep5
          hourlyRate={hourlyRate}
          setHourlyRate={setHourlyRate}
          imagePreview={imagePreview}
          title={title}
          city={city}
          startDate={startDate}
          endDate={endDate}
          onImageChange={onImageChange}
          onImageRemove={onImageRemove}
        />
      )}
    </YStack>
  );
}

export function MissionFormStepIndicator({ currentStep }: { currentStep: Step }) {
  return (
    <XStack gap="$2" justifyContent="center" marginBottom="$6">
      {[1, 2, 3, 4, 5].map((step) => (
        <YStack
          key={step}
          width={currentStep >= step ? 60 : 40}
          height={4}
          backgroundColor={
            currentStep >= step ? colors.shiftlyViolet : colors.gray200
          }
          borderRadius={2}
        />
      ))}
    </XStack>
  );
}

