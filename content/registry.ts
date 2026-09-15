import type { ComponentType } from "react";
import BrandDocumentDeliverableStandards from "./standards/brand-document-deliverable-standards";
import ClientOnboardingOverview from "./client-onboarding/overview";

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
};
