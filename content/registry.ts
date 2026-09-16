import type { ComponentType } from "react";
import WhatWeSell from "./what-we-sell";
import BrandDocumentDeliverableStandards from "./standards/brand-document-deliverable-standards";
import ClientOnboardingOverview from "./client-onboarding/overview";
import InternalHandoff from "./client-onboarding/internal-handoff";
import ClientKickoff from "./client-onboarding/client-kickoff";
import AccessAndAssets from "./client-onboarding/access-assets";
import SocialMediaOnboarding from "./service-onboarding/social-media";
import SocialMediaOngoingDelivery from "./ongoing-delivery/social-media";
import InternalServiceBriefTemplate from "./templates-resources/internal-service-brief";
import ClientOnboardingEmail from "./templates-resources/client-onboarding-email";
import SocialMediaAccountGuide from "./templates-resources/social-media-account-guide";

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
  "service-onboarding/social-media": SocialMediaOnboarding,
  "ongoing-delivery/social-media": SocialMediaOngoingDelivery,
  "templates-resources/internal-service-brief": InternalServiceBriefTemplate,
  "templates-resources/client-onboarding-email": ClientOnboardingEmail,
  "templates-resources/social-media-account-guide": SocialMediaAccountGuide,
};

/**
 * Sections that are a single page rather than an index of entries, keyed by
 * section slug. Must match a section marked  in lib/navigation.ts.
 */
export const sectionModules: Record<string, ComponentType> = {
  "what-we-sell": WhatWeSell,
};
