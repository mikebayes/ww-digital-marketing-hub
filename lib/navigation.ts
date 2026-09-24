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
  /**
   * Sub-pages beneath this entry. An entry with children is a group heading
   * rather than a page: the rail stops linking it, and its own URL redirects
   * to the first child so links made before the split still land somewhere
   * sensible.
   */
  children?: HubEntry[];
  /**
   * An entry that lives at its own route rather than in content/registry.ts.
   *
   * The Hub's documentation is config-driven: [section]/[entry] generates a
   * static page for everything listed here. An operational module is a real
   * route with its own layout, data and mutations, so it opts out — the rail
   * still links it, and generateStaticParams skips it so a generated page and
   * a real one do not both claim the same URL.
   */
  href?: string;
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
  /**
   * A section that is a single page rather than an index of entries. Its
   * component is registered in content/registry.ts under sectionModules and
   * rendered by app/[section]/page.tsx.
   */
  standalone?: boolean;
  entries: HubEntry[];
}

export const sections: HubSection[] = [
  {
    slug: "what-we-sell",
    title: "What We Sell",
    marker: "01",
    summary:
      "The services, the usual shape of each, and what is not settled commercially yet.",
    description:
      "An internal commercial reference for the Digital Marketing team. The approved proposal always governs a specific client.",
    standalone: true,
    entries: [],
  },
  {
    slug: "standards",
    title: "Standards",
    marker: "02",
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
    marker: "03",
    summary: "From client approval to an account that is set up and running.",
    description:
      "The general onboarding path a client follows when new work starts, whether they are new to Web Wizards or adding a service. Service-specific steps live under Service Onboarding.",
    entries: [
      {
        slug: "overview",
        title: "Overview",
        summary:
          "Who owns onboarding, what happens in what order, and what has to be true before delivery starts.",
        status: "published",
      },
      {
        slug: "internal-handoff",
        title: "Internal Handoff",
        summary:
          "What sales passes to delivery, in what format, and what delivery confirms before work starts.",
        status: "published",
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
        status: "published",
      },
      {
        slug: "client-kickoff",
        title: "Client Kickoff",
        summary:
          "Running the kickoff, confirming goals and priorities, and agreeing the first 30 days.",
        status: "published",
      },
    ],
  },
  {
    slug: "service-onboarding",
    title: "Service Onboarding",
    marker: "04",
    summary:
      "Service-specific setup that runs alongside the general onboarding process where appropriate.",
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
          "How an organic social account is run, and how to onboard a new one.",
        status: "published",
        children: [
          {
            slug: "service-standards",
            title: "Service Standards",
            summary:
              "How Web Wizards approaches and runs an organic social account.",
            status: "published",
          },
          {
            slug: "setup-launch",
            title: "Setup & Launch",
            summary:
              "The onboarding process, from approved engagement to the first content calendar.",
            status: "published",
          },
        ],
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
    marker: "05",
    summary: "How a service is actually run once it is live.",
    description:
      "Client Onboarding gets the account ready and Service Onboarding gets the service ready. This is how the work runs after that — a page per service, over the shared standards that apply to all of them.",
    entries: [
      {
        slug: "social-media",
        title: "Social Media",
        summary:
          "The monthly, quarterly and annual rhythm of a live organic social account.",
        status: "published",
      },
      {
        slug: "seo",
        title: "SEO",
        summary: "How a live SEO engagement is run month to month.",
        status: "planned",
      },
      {
        slug: "paid-media",
        title: "Paid Media",
        summary:
          "How live campaigns are managed, optimised and reviewed month to month.",
        status: "planned",
      },
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
    marker: "06",
    summary: "The working files behind the standards.",
    description:
      "Starting points rather than finished artefacts. Every template here should reflect the current Brand, Document & Deliverable Standards.",
    entries: [
      {
        slug: "internal-service-brief",
        title: "Internal Service Brief",
        summary:
          "The one-page brief Sales hands to Delivery, and the template behind it.",
        status: "published",
      },
      {
        slug: "client-onboarding-email",
        title: "Client Onboarding Email",
        summary:
          "The first client-facing email after approval — what it has to cover, and three examples to adapt.",
        status: "published",
      },
      {
        slug: "social-media-account-guide",
        title: "Social Media Account Guide",
        summary:
          "The living reference for how a social account is run, so anyone can pick it up.",
        status: "published",
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
  {
    slug: "client-questionnaires",
    title: "Client Questionnaires",
    marker: "07",
    summary:
      "Prepare, send and review the questionnaire a client fills in before onboarding.",
    description:
      "Everything above this point is documentation. This is the tool that implements it — it holds live client data, and the questionnaires it sends are real.",
    entries: [
      {
        slug: "admin",
        title: "Admin",
        summary:
          "Create, prepare, send and review client onboarding questionnaires.",
        status: "published",
        href: "/client-questionnaires/admin",
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

/** Resolve a child page beneath an entry. */
export function getChild(
  sectionSlug: string,
  entrySlug: string,
  childSlug: string,
): { section: HubSection; entry: HubEntry; child: HubEntry } | undefined {
  const found = getEntry(sectionSlug, entrySlug);
  const child = found?.entry.children?.find((item) => item.slug === childSlug);
  return found && child ? { ...found, child } : undefined;
}

/**
 * The URL an entry should actually link to.
 *
 * An entry with children is a heading, not a page, so every navigation surface
 * links past it to the first child rather than to a URL that only redirects.
 */
export function entryHref(sectionSlug: string, entry: HubEntry): string {
  if (entry.href) return entry.href;
  const base = `/${sectionSlug}/${entry.slug}`;
  const first = entry.children?.[0];
  return first ? `${base}/${first.slug}` : base;
}
