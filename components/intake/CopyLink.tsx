"use client";

import { useState } from "react";

/**
 * The client link, shown in full and copyable.
 *
 * Shown rather than hidden behind a button: the Account Manager should be able
 * to see what they are about to paste into an email, and read it back against
 * the address bar of the tab they previewed it in.
 */
export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-3 @xl:flex-row @xl:items-center">
      <code className="min-w-0 flex-1 truncate border border-rule bg-neutral-tint px-3.5 py-2.5 font-mono text-[0.8125rem] text-charcoal">
        {url}
      </code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Clipboard access can be refused; the URL is visible either way.
            setCopied(false);
          }
        }}
        className="label inline-flex shrink-0 items-center border border-rule-strong px-4 py-3 text-charcoal transition-colors hover:border-charcoal"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
