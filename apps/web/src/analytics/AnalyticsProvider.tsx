"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ANALYTICS_EVENTS } from "./events";
import { initPosthogClient, track } from "./client";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initPosthogClient();
  }, []);

  useEffect(() => {
    const query = searchParams.toString();
    track(ANALYTICS_EVENTS.pageViewed, {
      pathname,
      has_query: Boolean(query),
    });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
