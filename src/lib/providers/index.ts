import { DemoBusinessProvider } from "./demo";
import { GoogleBusinessProvider, getGoogleOAuthConfig, type GoogleTokenStore } from "./google";
import type { BusinessDataProvider, ProviderKind } from "./types";

export type { BusinessDataProvider, ConnectionStatus, ProviderKind } from "./types";

/**
 * Which provider is active. Defaults to "demo". Set BUSINESS_DATA_PROVIDER=google
 * (server-side env var) once Google OAuth credentials are configured.
 */
export function activeProviderKind(): ProviderKind {
  const v = (process.env.BUSINESS_DATA_PROVIDER ?? "demo").toLowerCase();
  return v === "google" && getGoogleOAuthConfig() ? "google" : "demo";
}

let demo: DemoBusinessProvider | null = null;

/**
 * Server-side factory. The Google provider needs a token store (Supabase),
 * which is injected here so the provider itself stays testable.
 */
export function getBusinessProvider(tokenStore?: GoogleTokenStore): BusinessDataProvider {
  const kind = activeProviderKind();
  if (kind === "google") {
    const cfg = getGoogleOAuthConfig();
    if (cfg && tokenStore) return new GoogleBusinessProvider(cfg, tokenStore);
  }
  if (!demo) demo = new DemoBusinessProvider();
  return demo;
}
