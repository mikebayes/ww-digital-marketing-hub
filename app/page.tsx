import Link from "next/link";
import { sections } from "@/lib/navigation";
import { site } from "@/lib/site";
import { SectionLabel, RouteCard } from "@/components/playbook/primitives";

export default function HomePage() {
  const published = sections
    .flatMap((section) =>
      section.entries
        .filter((entry) => entry.status === "published")
        .map((entry) => ({ section, entry })),
    );

  return (
    <>
      {/* Masthead */}
      <section className="border-b border-rule bg-surface px-6 pt-14 pb-14 md:px-12 lg:px-16 lg:pt-20 lg:pb-16">
        <div className="max-w-5xl">
          <SectionLabel>Web Wizards · Internal</SectionLabel>

          <h1 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-charcoal text-balance sm:text-5xl lg:text-[4rem]">
            Digital Marketing
            <br />
            Playbook
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-slate">
            The internal source of truth for how Web Wizards plans, onboards,
            manages and delivers digital marketing services.
          </p>

          <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
            It is built to be used during the work, not read once. Sections are
            published as they are agreed, so parts of it are still empty —
            anything marked <em className="not-italic text-slate">Soon</em> has
            been scoped but not written.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-rule pt-6">
            <span className="label text-muted">
              Version {site.version}
            </span>
            <span className="label text-muted">Updated {site.updated}</span>
            <span className="label text-muted">
              {published.length} of{" "}
              {sections.reduce((total, s) => total + s.entries.length, 0)}{" "}
              modules published
            </span>
          </div>
        </div>
      </section>

      {/* Start here */}
      {published.length > 0 && (
        <section className="border-b border-rule px-6 py-12 md:px-12 lg:px-16">
          <SectionLabel tone="muted">Start here</SectionLabel>
          <div className="mt-5 grid gap-px border border-rule bg-rule md:grid-cols-2">
            {published.map(({ section, entry }) => (
              <Link
                key={entry.slug}
                href={`/${section.slug}/${entry.slug}`}
                className="group flex flex-col justify-between gap-6 bg-surface px-7 py-7 transition-colors hover:bg-teal-tint"
              >
                <div>
                  <span className="label text-teal-ink">{section.title}</span>
                  <h2 className="mt-4 text-xl leading-snug font-semibold tracking-[-0.02em] text-charcoal">
                    {entry.title}
                  </h2>
                  <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-slate">
                    {entry.summary}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="h-px w-10 bg-rule-strong transition-all duration-200 group-hover:w-16 group-hover:bg-teal"
                />
              </Link>
            ))}

            <div className="flex flex-col justify-between gap-6 bg-surface px-7 py-7">
              <div>
                <span className="label text-muted">Next up</span>
                <h2 className="mt-4 text-xl leading-snug font-semibold tracking-[-0.02em] text-charcoal">
                  Client Onboarding
                </h2>
                <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-slate">
                  Internal handoff, Productive setup and the access checklist
                  are the next modules to be written.
                </p>
              </div>
              <span aria-hidden className="h-px w-10 bg-rule" />
            </div>
          </div>
        </section>
      )}

      {/* Full index */}
      <section className="px-6 py-12 md:px-12 lg:px-16">
        <SectionLabel tone="muted">The playbook</SectionLabel>

        <div className="mt-5 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const ready = section.entries.filter(
              (entry) => entry.status === "published",
            ).length;

            return (
              <RouteCard
                key={section.slug}
                href={`/${section.slug}`}
                marker={section.marker}
                title={section.title}
                summary={section.summary}
                count={`${ready}/${section.entries.length}`}
              />
            );
          })}
        </div>
      </section>

      {/* Working notes */}
      <section className="px-6 pb-4 md:px-12 lg:px-16">
        <div className="grid gap-px border border-rule bg-rule md:grid-cols-3">
          {[
            {
              title: "Standards come first",
              body: "If a procedure and a standard disagree, the standard wins. Raise the conflict rather than working around it.",
            },
            {
              title: "Written where the work happens",
              body: "Procedures are written by the people who run them. If you find a gap while delivering, write the gap down.",
            },
            {
              title: "Change it deliberately",
              body: "Anything here can be changed. Propose it, agree it, then update the page and bump the version.",
            },
          ].map((note) => (
            <div key={note.title} className="bg-surface px-6 py-6">
              <h3 className="text-[0.9375rem] font-semibold text-charcoal">
                {note.title}
              </h3>
              <p className="mt-2.5 text-[0.875rem] leading-relaxed text-slate">
                {note.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
