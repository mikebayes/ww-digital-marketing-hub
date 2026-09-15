import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sections, getEntry } from "@/lib/navigation";
import { modules } from "@/content/registry";
import {
  PageHeader,
  PlannedNotice,
  SectionLabel,
} from "@/components/hub/primitives";

/**
 * Every Hub page below the section index resolves here.
 *
 * Published modules are rendered from the registry in `content/registry.ts`;
 * everything else in the IA renders the placeholder below. Adding a module
 * means writing a component under `content/`, registering it, and flipping the
 * entry to `status: "published"` in `lib/navigation.ts`.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return sections.flatMap((section) =>
    section.entries.map((entry) => ({
      section: section.slug,
      entry: entry.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; entry: string }>;
}): Promise<Metadata> {
  const { section, entry } = await params;
  const found = getEntry(section, entry);
  if (!found) return {};
  return { title: found.entry.title, description: found.entry.summary };
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ section: string; entry: string }>;
}) {
  const { section: sectionSlug, entry: entrySlug } = await params;
  const found = getEntry(sectionSlug, entrySlug);
  if (!found) notFound();

  const { section, entry } = found;
  const Module = modules[`${sectionSlug}/${entrySlug}`];

  if (Module) return <Module />;

  const siblings = section.entries.filter((item) => item.slug !== entry.slug);

  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        title={entry.title}
        lede={entry.summary}
        breadcrumb={[
          { label: "Hub", href: "/" },
          { label: section.title, href: `/${section.slug}` },
          { label: entry.title },
        ]}
      />

      <div className="@container mt-10 max-w-3xl space-y-8">
        <PlannedNotice>
          <p>
            This module is part of the Hub structure but has not been
            written yet. It is listed here so the shape of the system is visible
            and so the same process does not get invented twice in different
            places.
          </p>
          <p>
            If you already run this process, you are the right person to write
            it. Draft it against the{" "}
            <Link href="/standards/brand-document-deliverable-standards">
              Brand, Document &amp; Deliverable Standards
            </Link>{" "}
            and raise it with the Digital Marketing lead.
          </p>
        </PlannedNotice>

        {siblings.length > 0 && (
          <div>
            <SectionLabel tone="muted">
              Elsewhere in {section.title}
            </SectionLabel>
            <ul className="mt-4 border-t border-rule">
              {siblings.map((sibling) => (
                <li key={sibling.slug} className="border-b border-rule">
                  <Link
                    href={`/${section.slug}/${sibling.slug}`}
                    className="group flex items-baseline justify-between gap-4 py-3.5"
                  >
                    <span className="text-[0.9375rem] font-medium text-charcoal transition-colors group-hover:text-teal-ink">
                      {sibling.title}
                    </span>
                    {sibling.status === "planned" && (
                      <span className="label shrink-0 text-muted">Soon</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
