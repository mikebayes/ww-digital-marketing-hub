/**
 * Single source of truth for the Hub's information architecture.
 *
 * Every navigation surface — sidebar, mobile drawer, breadcrumbs, section
 * indexes and the static routes themselves — reads from here.
 *
 * To add a module: add an entry below, write its component under `content/`,
 * register it in `content/registry.ts`, and set `status: "published"`.
 * Anything left `planned` renders the placeholder template automatically.
 */

export type EntryStatus = "published" | "planned";

export interface HubEntry {
  /** Path segment, unique within its section. */
  slug: string;
  title: string;
  /** Short line used in section indexes and nav tooltips. */
  summary: string;
  status: EntryStatus;
}

export interface HubSection {
  /** Path segment at the root of the site. */
  slug: string;
  title: string;
  /** Two-digit marker used in the rail and section headers. */
  marker: string;
  summary: string;
  /** Longer description shown on the section index page. */
  description: string;
  entries: HubEntry[];
}

export const sections: HubSection[] = [
  {
    slug: "standards",
    title: "Standards",
    marker: "01",
    summary: "How Web Wizards work looks, reads and holds together.",
    description:
      "Company-wide standards that apply to anything we produce — internal documentation, client deliverables and the way we communicate day to day.",
    entries: [
      {
        slug: "brand-document-deliverable-standards",
        title: "Brand, Document & Deliverable Standards",
        summary:
          "The visual system, branding and ownership rules, and document conventions behind everything we produce.",
        status: "published",
      },
      {
        slug: "client-communication",
        title: "Client Communication",
        summary:
          "Cadence, tone, channels and escalation expectations across the client relationship.",
        status: "planned",
      },
      {
        slug: "reporting",
        title: "Reporting",
        summary:
          "What a Web Wizards report contains, how often it goes out and who signs off.",
        status: "planned",
      },
    ],
  },
  {
    slug: "client-onboarding",
    title: "Client Onboarding",
    marker: "02",
    summary: "From signed agreement to a client that is set up and running.",
    description:
      "The general onboarding path every new digital marketing client follows, regardless of which services they bought. Service-specific steps live under Service Onboarding.",
    entries: [
      {
        slug: "overview",
        title: "Overview",
        summary: "The full onboarding sequence, owners and expected timing.",
        status: "planned",
      },
      {
        slug: "internal-handoff",
        title: "Internal Handoff",
        summary:
          "What sales passes to delivery, in what format, and what delivery confirms before work starts.",
        status: "planned",
      },
      {
        slug: "productive-setup",
        title: "Productive Setup",
        summary:
          "Project, budget, task template and time-tracking configuration in Productive.",
        status: "planned",
      },
      {
        slug: "access-assets",
        title: "Access & Assets",
        summary:
          "Accounts, platform access, brand assets and credentials we need before kickoff.",
        status: "planned",
      },
      {
        slug: "client-kickoff",
        title: "Client Kickoff",
        summary:
          "Running the kickoff call, confirming scope and setting the first 90 days.",
        status: "planned",
      },
    ],
  },
  {
    slug: "service-onboarding",
    title: "Service Onboarding",
    marker: "03",
    summary: "Service-specific setup once general onboarding is complete.",
    description:
      "What each service needs before it can start delivering — audits, baselines, account structure and the first deliverable in each discipline.",
    entries: [
      {
        slug: "seo",
        title: "SEO",
        summary:
          "Technical baseline, keyword and competitor research, and the initial roadmap.",
        status: "planned",
      },
      {
        slug: "paid-media",
        title: "Paid Media",
        summary:
          "Account structure, tracking, budget pacing and campaign launch checks.",
        status: "planned",
      },
      {
        slug: "social-media",
        title: "Social Media",
        summary:
          "Channel setup, content pillars, approval flow and publishing cadence.",
        status: "planned",
      },
      {
        slug: "one-time-projects",
        title: "One-Time Projects",
        summary:
          "Scoping, delivery and closeout for fixed-scope digital marketing work.",
        status: "planned",
      },
    ],
  },
  {
    slug: "ongoing-delivery",
    title: "Ongoing Delivery",
    marker: "04",
    summary: "The standards that hold once a client is live.",
    description:
      "How retained work is run month to month — reporting, review cycles, scope management and the path for things that go wrong.",
    entries: [
      {
        slug: "reporting",
        title: "Reporting",
        summary: "Monthly and quarterly reporting rhythm, format and ownership.",
        status: "planned",
      },
      {
        slug: "client-reviews",
        title: "Client Reviews",
        summary:
          "Quarterly business reviews, performance narrative and forward planning.",
        status: "planned",
      },
      {
        slug: "scope-changes",
        title: "Scope Changes",
        summary:
          "Recognising scope creep, documenting change and re-contracting cleanly.",
        status: "planned",
      },
      {
        slug: "qa-escalation",
        title: "QA & Escalation",
        summary:
          "Quality checks before anything leaves the building, and what to do when it goes wrong.",
        status: "planned",
      },
    ],
  },
  {
    slug: "templates-resources",
    title: "Templates & Resources",
    marker: "05",
    summary: "The working files behind the standards.",
    description:
      "Starting points rather than finished artefacts. Every template here should reflect the current Brand, Document & Deliverable Standards.",
    entries: [
      {
        slug: "handoff-brief",
        title: "Handoff Brief",
        summary: "The sales-to-delivery brief template and how to fill it in.",
        status: "planned",
      },
      {
        slug: "kickoff-agenda",
        title: "Kickoff Agenda",
        summary: "A standard agenda and pre-read for the client kickoff call.",
        status: "planned",
      },
      {
        slug: "strategy-templates",
        title: "Strategy Templates",
        summary: "Strategy and roadmap document shells by service.",
        status: "planned",
      },
      {
        slug: "reporting-examples",
        title: "Reporting Examples",
        summary: "Reports that met the standard, annotated with why.",
        status: "planned",
      },
      {
        slug: "productive-resources",
        title: "Productive Resources",
        summary: "Project templates, task libraries and Productive conventions.",
        status: "planned",
      },
      {
        slug: "brand-assets",
        title: "Brand Assets",
        summary:
          "Approved Web Wizards logos and brand files, with guidance on which variant to use where.",
        status: "planned",
      },
    ],
  },
];

export function getSection(slug: string): HubSection | undefined {
  return sections.find((section) => section.slug === slug);
}

export function getEntry(
  sectionSlug: string,
  entrySlug: string,
): { section: HubSection; entry: HubEntry } | undefined {
  const section = getSection(sectionSlug);
  const entry = section?.entries.find((item) => item.slug === entrySlug);
  return section && entry ? { section, entry } : undefined;
}
