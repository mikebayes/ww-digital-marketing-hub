import type { ComponentType } from "react";
import BrandDocumentDeliverableStandards from "./standards/brand-document-deliverable-standards";
import ClientOnboardingOverview from "./client-onboarding/overview";
import InternalHandoff from "./client-onboarding/internal-handoff";
import ClientKickoff from "./client-onboarding/client-kickoff";
import AccessAndAssets from "./client-onboarding/access-assets";
import InternalServiceBriefTemplate from "./templates-resources/internal-service-brief";

/**
 * Published Hub modules, keyed by `<section>/<entry>`.
 *
 * Keys must match a `status: "published"` entry in `lib/navigation.ts`.
 * Anything not listed here falls through to the placeholder template.
 */
export const modules: Record<string, ComponentType> = {
  "standards/brand-document-deliverable-standards":
    BrandDocumentDeliverableStandards,
  "client-onboarding/overview": ClientOnboardingOverview,
  "client-onboarding/internal-handoff": InternalHandoff,
  "client-onboarding/access-assets": AccessAndAssets,
  "client-onboarding/client-kickoff": ClientKickoff,
  "templates-resources/internal-service-brief": InternalServiceBriefTemplate,
};
