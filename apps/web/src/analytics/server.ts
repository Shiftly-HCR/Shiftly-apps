import { PostHog } from "posthog-node";
import type { AnalyticsEventName, AnalyticsProperties } from "./events";

let posthogClient: PostHog | null = null;

function getPosthogServerClient(): PostHog | null {
  if (posthogClient) return posthogClient;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!apiKey || !apiHost) {
    return null;
  }

  posthogClient = new PostHog(apiKey, {
    host: apiHost,
    flushAt: 1,
    flushInterval: 0,
  });

  return posthogClient;
}

export function trackServerEvent(params: {
  event: AnalyticsEventName;
  distinctId?: string | null;
  properties?: AnalyticsProperties;
}) {
  const client = getPosthogServerClient();
  if (!client) return;

  client.capture({
    event: params.event,
    distinctId: params.distinctId || "anonymous_server",
    properties: {
      app: "web",
      env: process.env.NODE_ENV ?? "unknown",
      ...params.properties,
    },
  });
}
