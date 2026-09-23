import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sections, getChild } from "@/lib/navigation";
import { modules } from "@/content/registry";

/**
 * Sub-pages beneath an entry.
 *
 * Exists because a service can outgrow one page: Social Media was carrying
 * both the standard and the procedure, which are read at different times by
 * different people. Registry keys are the full path, so a child is registered
 * as `service-onboarding/social-media/setup-launch`.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return sections.flatMap((section) =>
    section.entries.flatMap((entry) =>
      (entry.children ?? []).map((child) => ({
        section: section.slug,
        entry: entry.slug,
        child: child.slug,
      })),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; entry: string; child: string }>;
}): Promise<Metadata> {
  const { section, entry, child } = await params;
  const found = getChild(section, entry, child);
  if (!found) return {};
  return { title: found.child.title, description: found.child.summary };
}

export default async function ChildPage({
  params,
}: {
  params: Promise<{ section: string; entry: string; child: string }>;
}) {
  const { section, entry, child } = await params;
  const found = getChild(section, entry, child);
  if (!found) notFound();

  const Module = modules[`${section}/${entry}/${child}`];
  if (!Module) notFound();

  return <Module />;
}
