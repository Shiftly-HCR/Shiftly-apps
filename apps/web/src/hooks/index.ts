// React Query hooks (nouveau système unifié)
export * from "./queries";

// Chat hooks
export * from "./chat";

// Profile hooks (legacy - à migrer progressivement)
export { useUpdatePremiumStatus } from "./profile/useUpdatePremiumStatus";

// Missions hooks (legacy - à migrer progressivement)
export { useMissionCandidatesRow } from "./missions/useMissionCandidatesRow";
export { useMissionClustering } from "./missions/useMissionClustering";
export { useVisibleMissions } from "./missions/useVisibleMissions";
export { useEstablishmentsManager } from "./missions/useEstablishmentsManager";
export { useMissionEstablishment } from "./missions/useMissionEstablishment";

// Freelance hooks (legacy - à migrer progressivement)
export * from "./freelance";

// Commercial hooks
export { useEstablishmentCode } from "./commercial/useEstablishmentCode";
export { useCommercialFinance } from "./commercial/useCommercialFinance";
export { useCommercialStats } from "./commercial/useCommercialStats";

// Layout hooks
export * from "./layout";

// Search hooks
export * from "./search";

// Page hooks
export * from "./pages";

// Utils hooks
export * from "./utils";

// Stripe hooks (Billing + Connect)
export * from "./stripe";
