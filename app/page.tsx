import Link from "next/link";
import { sections } from "@/lib/navigation";
import { site } from "@/lib/site";
import { SectionLabel } from "@/components/hub/primitives";

export default function HomePage() {
  const published = sections.flatMap((section) =>
    section.entries
      .filter((entry) => entry.status === "published")
      .map((entry) => ({ section, entry })),
  );

  const primary = published[0];
  const rest = published.slice(1);

  return (
    <>
      {/*
       * Charcoal hero — the one full-bleed dark moment on the page. It
       * establishes the property, then hands straight over to light, dense
       * content below.
       */}
      <section className="relative overflow-hidden bg-charcoal px-6 pt-16 pb-14 md:px-12 lg:px-16 lg:pt-24 lg:pb-20">
        <span
          aria-hidden
          className="absolute top-0 left-6 h-16 w-px bg-white/10 md:left-12 lg:left-16"
        />

        <div className="relative max-w-4xl">
          <SectionLabel tone="light">Web Wizards · Internal</SectionLabel>

          <h1 className="mt-7 text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.035em] text-balance text-white sm:text-6xl lg:text-[4.5rem]">
            Digital Marketing Hub
          </h1>

          <span aria-hidden className="mt-10 block h-px w-16 bg-teal" />

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70 lg:text-xl">
            The internal source of truth for how Web Wizards plans, onboards,
            manages and delivers digital marketing services.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-2">
            <span className="label text-white/40">Version {site.version}</span>
            <span className="label text-white/40">Updated {site.updated}</span>
          </div>
        </div>
      </section>

      {/* Start here — the live module leads, roadmap context stays quiet. */}
      {primary && (
        <section className="border-b border-rule px-6 py-14 md:px-12 lg:px-16">
          <SectionLabel tone="muted">Start here</SectionLabel>

          <div className="mt-6 grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <Link
              href={`/${primary.section.slug}/${primary.entry.slug}`}
              className="group block border-t-2 border-charcoal pt-7 transition-colors hover:border-teal"
            >
              <span className="label text-teal-ink">
                {primary.section.title}
              </span>
              <h2 className="mt-4 max-w-2xl text-3xl leading-[1.12] font-semibold tracking-[-0.025em] text-balance text-charcoal lg:text-[2.25rem]">
                {primary.entry.title}
              </h2>
              <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-slate">
                {primary.entry.summary}
              </p>
              <span className="mt-7 inline-flex items-center gap-3">
                <span className="label text-charcoal">Read the standard</span>
                <span
                  aria-hidden
                  className="h-px w-8 bg-charcoal transition-all duration-200 group-hover:w-14 group-hover:bg-teal"
                />
              </span>
            </Link>

            <div className="border-t border-rule pt-7">
              <span className="label text-muted">Coming next</span>
              <ul className="mt-5 space-y-4">
                {rest.map(({ section, entry }) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/${section.slug}/${entry.slug}`}
                      className="text-[0.9375rem] font-medium text-charcoal hover:text-teal-ink"
                    >
                      {entry.title}
                    </Link>
                  </li>
                ))}
                <li className="text-[0.9375rem] leading-relaxed text-slate">
                  <span className="font-medium text-charcoal">
                    Client Onboarding
                  </span>{" "}
                  — internal handoff, Productive setup and the access checklist
                  are the next modules to be written.
                </li>
                <li className="text-[0.9375rem] leading-relaxed text-slate">
                  Anything marked{" "}
                  <span className="label text-muted">Soon</span> has been scoped
                  but not yet written.
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Hub sections */}
      <section className="px-6 py-14 md:px-12 lg:px-16">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-2xl leading-tight font-semibold tracking-[-0.025em] text-charcoal">
            Hub Sections
          </h2>
          <p className="text-[0.9375rem] text-slate">
            Five areas, published as they are agreed.
          </p>
        </div>

        <ol className="mt-9 border-t border-rule">
          {sections.map((section) => {
            const available = section.entries.filter(
              (entry) => entry.status === "published",
            );

            return (
              <li key={section.slug} className="border-b border-rule">
                <Link
                  href={`/${section.slug}`}
                  className="group grid gap-x-10 gap-y-3 py-8 md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,17rem)]"
                >
                  <span
                    aria-hidden
                    className="label pt-2 tabular-nums text-muted transition-colors group-hover:text-teal-ink"
                  >
                    {section.marker}
                  </span>

                  <div className="min-w-0">
                    <h3 className="text-xl leading-snug font-semibold tracking-[-0.02em] text-charcoal transition-colors group-hover:text-teal-ink">
                      {section.title}
                    </h3>
                    <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-slate">
                      {section.summary}
                    </p>
                  </div>

                  <div className="md:pt-1.5">
                    <p className="label text-muted">
                      {available.length > 0 ? "Available now" : "In progress"}
                    </p>
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-slate">
                      {available.length > 0
                        ? available.map((entry) => entry.title).join(", ")
                        : `${section.entries
                            .slice(0, 3)
                            .map((entry) => entry.title)
                            .join(", ")}${
                            section.entries.length > 3 ? " and more" : ""
                          }`}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Working notes */}
      <section className="px-6 pb-6 md:px-12 lg:px-16">
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
            <div key={note.title} className="bg-surface px-6 py-7">
              <span aria-hidden className="block h-px w-6 bg-teal" />
              <h3 className="mt-5 text-[0.9375rem] font-semibold text-charcoal">
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
