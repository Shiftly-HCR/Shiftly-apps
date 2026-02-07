"use client";

import { useSearchParams } from "next/navigation";

/**
 * Returns the current search query from the URL (?q=).
 * Used by useHomePage and useFreelancePage to filter missions/freelances.
 */
export function useSearchQuery(): { searchQuery: string } {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  return { searchQuery };
}
