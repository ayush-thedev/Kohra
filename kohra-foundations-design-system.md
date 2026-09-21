# Kohler --- Foundations Design System

> **Source:** Extracted from the provided Kohler --- Foundations color
> and typography screenshots.\
> **Scope:** This document records the visible semantic tokens and
> heading specifications. The screenshots do not expose the underlying
> palette's exact hex values or the actual font name, so those are
> intentionally left as unresolved references.

## 1. Color foundations

### 1.1 Background

  Semantic token              Light theme   Dark theme
  --------------------------- ------------- ---------------
  `illustration-background`   `gray-100`    `primary-900`

### 1.2 Surface

  Semantic token              Light theme     Dark theme
  --------------------------- --------------- ---------------
  `surface-muted`             `primary-100`   `primary-800`
  `surface-subtle`            `gray-200`      `primary-700`
  `surface-low-contrast`      `gray-300`      `gray-500`
  `surface-medium-contrast`   `gray-500`      `gray-400`
  `surface-high-contrast`     `primary-700`   `gray-300`
  `surface-brand`             `brand-600`     `brand-600`

### 1.3 Palette references

The screenshots refer to palette tokens, but do not show the full
palette definitions. Treat these as references to be resolved against
the source design file or token package:

-   `gray-100`
-   `gray-200`
-   `gray-300`
-   `gray-400`
-   `gray-500`
-   `primary-100`
-   `primary-700`
-   `primary-800`
-   `primary-900`
-   `brand-600`

**Do not treat sampled-looking hex values as canonical.** Exact hex/RGB
values were not legible or provided in the screenshots. The bright brand
swatch appears orange-red, but its precise value is not specified.

## 2. Typography

### 2.1 Typeface

  Property              Value
  --------------------- -----------------------
  Font family token     `primary-font-family`
  Heading font weight   `light`

The actual font family name behind `primary-font-family` is not visible
in the supplied screenshot. Resolve it from the source design system
before production use.

### 2.2 Heading scale

  Style   Font family             Weight      Font size
  ------- ----------------------- --------- -----------
  H1      `primary-font-family`   `light`       `100px`
  H2      `primary-font-family`   `light`        `60px`
  H3      `primary-font-family`   `light`        `45px`
  H4      `primary-font-family`   `light`        `36px`
  H5      `primary-font-family`   `light`        `32px`
  H6      `primary-font-family`   `light`        `26px`

The screenshot describes headings as a hierarchy that organizes content,
ranging from larger to smaller styles.

## 3. CSS token mapping

The following is a **mapping template**, not a complete palette
implementation. Define the underlying palette variables separately using
verified source values.

``` css
:root {
  /* Typography */
  --font-primary: var(--primary-font-family);
  --font-weight-heading: 300;

  /* Heading sizes */
  --font-size-h1: 100px;
  --font-size-h2: 60px;
  --font-size-h3: 45px;
  --font-size-h4: 36px;
  --font-size-h5: 32px;
  --font-size-h6: 26px;

  /* Light theme semantic colors */
  --illustration-background: var(--gray-100);
  --surface-muted: var(--primary-100);
  --surface-subtle: var(--gray-200);
  --surface-low-contrast: var(--gray-300);
  --surface-medium-contrast: var(--gray-500);
  --surface-high-contrast: var(--primary-700);
  --surface-brand: var(--brand-600);
}

[data-theme="dark"] {
  --illustration-background: var(--primary-900);
  --surface-muted: var(--primary-800);
  --surface-subtle: var(--primary-700);
  --surface-low-contrast: var(--gray-500);
  --surface-medium-contrast: var(--gray-400);
  --surface-high-contrast: var(--gray-300);
  --surface-brand: var(--brand-600);
}
```

> **Implementation note:** `font-weight: 300` is a common CSS mapping
> for a `light` weight, but confirm the font's available weight mapping.
> The screenshot itself names the weight as `light`, not a numeric
> value.

## 4. Usage guidance

-   Use the semantic surface tokens for component backgrounds rather
    than hard-coding palette values.
-   Use the light/dark mappings consistently so components adapt to the
    selected theme.
-   Use `surface-brand` for brand-accent surfaces; the screenshots show
    it mapped to `brand-600` in both themes.
-   Preserve the heading hierarchy and the sizes listed above when
    matching the documented desktop typography.
-   Confirm responsive behavior, line heights, letter spacing, body
    typography, and the actual font family from the original design
    source; they are not specified in the provided screenshots.

## 5. Open items / not visible in source screenshots

The following information is not available from the screenshots and
should not be guessed:

-   Exact hex/RGB values for palette tokens.
-   Actual font name behind `primary-font-family`.
-   Body, paragraph, label, and caption typography.
-   Heading line-height and letter-spacing values.
-   Responsive typography rules or breakpoints.
-   Additional semantic color categories (text, border, icon, status,
    focus, etc.).
-   Spacing, radius, elevation, and component specifications.

## 6. Source fidelity

This file separates **visible specifications** from **implementation
assumptions**. The token names and heading sizes above are transcribed
from the screenshots; any missing palette or typeface details should be
verified against the original Kohler Foundations design source.
