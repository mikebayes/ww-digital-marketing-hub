# Web Wizards logo system

Production-ready logo assets built from the authentic Illustrator source PDFs.
All SVGs use real ITC Avant Garde Gothic Pro letterforms converted to vector
outlines, so there is no runtime font dependency.

## Brand colors

- Teal: `#3ABFAF` (Pantone 7465)
- Dark: `#231F20` (near-black)
- White: `#FFFFFF`

## Folders

### svg/
Scalable vector source. Use these anywhere you control the rendering
(website, Claude Code, Figma, Illustrator, etc.). Each SVG is organized
into `<g id="icon">`, `<g id="wordmark">`, `<g id="tagline">` groups so
individual components are easy to select and edit.

- `webwizards-horizontal-dark.svg` — primary horizontal on dark bg
- `webwizards-horizontal-light.svg` — primary horizontal on white bg
- `webwizards-stacked-dark.svg` — stacked (icon above wordmark), dark bg
- `webwizards-stacked-light.svg` — stacked, light bg
- `webwizards-icon.svg` — icon only, transparent
- `webwizards-icon-dark.svg` — icon on dark square
- `webwizards-dark-bg.svg` — horizontal, transparent, white text (drop onto any dark bg)
- `webwizards-light-bg.svg` — horizontal, transparent, dark text (drop onto any light bg)

### png/
Raster exports at three widths (512, 1024, 2048 for full logos; 128, 256,
512, 1024 for the icon). Use these for:
- Email signatures
- Slack/Discord/Teams avatars and uploads
- Microsoft Office documents
- Social media profile images and banners
- Any platform that does not support SVG

Pick the width nearest your display size. For retina displays, use the
size that is at least 2x your CSS width.

### favicon/
Everything you need to wire favicons into the Web Wizards website. Drop
all these files into the site root (typically `/public/` in Next.js) and
add the HTML below to your `<head>`.

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

Minimal `site.webmanifest` (also goes in site root):

```json
{
  "name": "Web Wizards",
  "short_name": "Web Wizards",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/pwa-icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "theme_color": "#231F20",
  "background_color": "#231F20",
  "display": "standalone"
}
```

## What to use where

| Use case | File |
|----------|------|
| Website header (light theme) | `svg/webwizards-horizontal-light.svg` |
| Website header (dark theme) | `svg/webwizards-horizontal-dark.svg` |
| App icon / profile photo | `png/webwizards-icon-512px.png` |
| Browser tab favicon | `favicon/` bundle |
| Email signature | `png/webwizards-horizontal-light-512w.png` or `-dark-512w.png` |
| PowerPoint / Word doc | `png/webwizards-horizontal-*-1024w.png` |
| Business card / print | Ask printer — most prefer source PDF you already have |
| Social media banner | `png/webwizards-horizontal-dark-2048w.png` |
| Social media avatar | `png/webwizards-icon-dark-1024px.png` |

## Editing

If you need to tweak colors, sizes, or layouts later, the source build
script that generated everything is at
`/home/claude/logos/build_from_source.py`. The color constants are at
the top of the file.
