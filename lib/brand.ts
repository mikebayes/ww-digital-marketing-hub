/**
 * Approved Web Wizards brand assets.
 *
 * The canonical library lives in `public/brand/logos/` and is managed as a
 * whole — do not move, rename or prune it. Reference assets through this map
 * rather than hard-coding paths, so the Hub always points at approved artwork
 * and a future Templates & Resources → Brand Assets page can enumerate the
 * same source.
 *
 * `derived/` holds icon + wordmark lockups composed from the official `icon`
 * and `wordmark` groups (path data copied verbatim, tagline omitted because it
 * is illegible below roughly 200px wide). Rebuild with
 * `node scripts/build-lockups.mjs`.
 */

export const brandColors = {
  teal: "#3ABFAF",
  dark: "#231F20",
  white: "#FFFFFF",
} as const;

const LIBRARY = "/brand/logos";
const DERIVED = "/brand/derived";

export const logos = {
  /** Icon + wordmark, white type. For charcoal and other dark surfaces. */
  lockupOnDark: {
    src: `${DERIVED}/webwizards-lockup-on-dark.svg`,
    width: 573,
    height: 109,
  },
  /** Icon + wordmark, near-black type. For white and light surfaces. */
  lockupOnLight: {
    src: `${DERIVED}/webwizards-lockup-on-light.svg`,
    width: 573,
    height: 109,
  },
  /** Full official horizontal lockup including the tagline. */
  horizontalOnDark: {
    src: `${LIBRARY}/svg/webwizards-dark-bg.svg`,
    width: 1037,
    height: 232,
  },
  horizontalOnLight: {
    src: `${LIBRARY}/svg/webwizards-light-bg.svg`,
    width: 1037,
    height: 232,
  },
  /** Stacked lockup, icon above wordmark. */
  stackedOnDark: {
    src: `${LIBRARY}/svg/webwizards-stacked-dark.svg`,
    width: 403,
    height: 499,
  },
  stackedOnLight: {
    src: `${LIBRARY}/svg/webwizards-stacked-light.svg`,
    width: 403,
    height: 499,
  },
  /** Icon only, transparent background. */
  icon: {
    src: `${LIBRARY}/svg/webwizards-icon.svg`,
    width: 363,
    height: 174,
  },
} as const;

export const favicons = {
  ico: `${LIBRARY}/favicon/favicon.ico`,
  png32: `${LIBRARY}/favicon/favicon-32x32.png`,
  png16: `${LIBRARY}/favicon/favicon-16x16.png`,
  appleTouch: `${LIBRARY}/favicon/apple-touch-icon.png`,
} as const;

export type LogoKey = keyof typeof logos;
