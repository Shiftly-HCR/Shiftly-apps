"use client";

import { ANALYTICS_EVENTS, type AnalyticsEventName, type AnalyticsProperties } from "./events";

interface PostHogLike {
  init: (apiKey: string, options?: Record<string, unknown>) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
  set_config?: (config: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    posthog?: PostHogLike;
  }
}

let isInitialized = false;
let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;
  sessionId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return sessionId;
}

function getBaseProps(extra?: AnalyticsProperties): AnalyticsProperties {
  const env = process.env.NODE_ENV ?? "unknown";
  const route = typeof window !== "undefined" ? window.location.pathname : "unknown";
  return {
    app: "web",
    env,
    route,
    session_id: getSessionId(),
    ...extra,
  };
}

function injectPostHogSnippet(apiKey: string, apiHost: string) {
  if (typeof window === "undefined" || window.posthog) return;

  /* PostHog loader queue */
  const w = window as Window & {
    posthog?: PostHogLike & {
      _i?: Array<[string, Record<string, unknown>, string]>;
      __SV?: number;
      push?: (...args: unknown[]) => number;
    };
  };

  const queue = [] as unknown as PostHogLike & {
    _i: Array<[string, Record<string, unknown>, string]>;
    __SV: number;
  };
  queue._i = [];

  const methods = [
    "capture",
    "identify",
    "reset",
    "set_config",
  ] as const;

  queue.init = (
    token: string,
    config?: Record<string, unknown>,
    name = "posthog"
  ) => {
    queue._i.push([token, config || {}, name]);
  };

  methods.forEach((method) => {
    (queue as unknown as Record<string, unknown>)[method] = (...args: unknown[]) => {
      (queue as unknown as unknown[]).push([method, ...args]);
    };
  });

  w.posthog = queue;
  const script = document.createElement("script");
  script.async = true;
  script.src = `${apiHost.replace(/\/$/, "")}/static/array.js`;
  document.head.appendChild(script);

  w.posthog.init(apiKey, {
    api_host: apiHost,
    person_profiles: "identified_only",
    capture_pageview: false,
    autocapture: false,
    capture_pageleave: true,
  });
}

export function initPosthogClient() {
  if (isInitialized || typeof window === "undefined") return;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!apiKey || !apiHost) {
    return;
  }

  injectPostHogSnippet(apiKey, apiHost);
  isInitialized = true;
}

export function track(event: AnalyticsEventName, properties?: AnalyticsProperties) {
  if (typeof window === "undefined" || !window.posthog) return;
  window.posthog.capture(event, getBaseProps(properties));
}

export function identifyPosthogUser(userId: string, properties?: AnalyticsProperties) {
  if (typeof window === "undefined" || !window.posthog || !userId) return;
  window.posthog.identify(userId, getBaseProps({ user_id: userId, ...properties }));
}

export function resetPosthog() {
  if (typeof window === "undefined" || !window.posthog) return;
  window.posthog.reset();
  sessionId = null;
}

export function captureException(context: string, error: unknown, properties?: AnalyticsProperties) {
  const message = error instanceof Error ? error.message : String(error);
  track(ANALYTICS_EVENTS.apiRequestFailed, {
    context,
    error_type: error instanceof Error ? error.name : "unknown_error",
    error_message: message.slice(0, 300),
    ...properties,
  });
}
