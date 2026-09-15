import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sections, getSection } from "@/lib/navigation";
import { PageHeader, SectionLabel } from "@/components/hub/primitives";

export const dynamicParams = false;

export function generateStaticParams() {
  return sections.map((section) => ({ section: section.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section: slug } = await params;
  const section = getSection(slug);
  if (!section) return {};
  return { title: section.title, description: section.summary };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: slug } = await params;
  const section = getSection(slug);
  if (!section) notFound();

  return (
    <div className="px-6 pt-10 pb-4 md:px-12 lg:px-16 lg:pt-14">
      <PageHeader
        marker={section.marker}
        title={section.title}
        lede={section.description}
        breadcrumb={[{ label: "Hub", href: "/" }, { label: section.title }]}
      />

      <div className="@container mt-12">
        <SectionLabel tone="muted">Modules</SectionLabel>

        <ol className="mt-5 border-t border-rule">
          {section.entries.map((entry, index) => {
            const href = `/${section.slug}/${entry.slug}`;
            const planned = entry.status === "planned";

            return (
              <li key={entry.slug} className="border-b border-rule">
                <Link
                  href={href}
                  className="group flex flex-col gap-2 py-6 transition-colors hover:bg-teal-tint sm:flex-row sm:items-baseline sm:gap-8 sm:px-4 sm:-mx-4"
                >
                  <span
                    className={`label shrink-0 tabular-nums sm:w-12 ${
                      planned ? "text-muted" : "text-teal-ink"
                    }`}
                  >
                    {section.marker}.{index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 className="text-lg leading-snug font-semibold tracking-[-0.02em] text-charcoal">
                        {entry.title}
                      </h2>
                      {/*
                       * Only the planned state is labelled. Marking the live
                       * module "Published" reads like a docs tool; the teal
                       * marker already distinguishes it.
                       */}
                      {planned && (
                        <span className="label text-muted">Soon</span>
                      )}
                    </div>
                    <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-slate">
                      {entry.summary}
                    </p>
                  </div>

                  <span
                    aria-hidden
                    className={`hidden h-px w-8 shrink-0 self-center transition-all duration-200 sm:block ${
                      planned
                        ? "bg-rule"
                        : "bg-rule-strong group-hover:w-12 group-hover:bg-teal"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
