# EUV Defines Editor — Design Guide

This document outlines the visual identity, layout, and component design for the EUV Defines Editor. It serves as a guide for developers to ensure a consistent and high-quality user experience.

## 1. Color Palette

The color system is based on CSS custom properties to support both light and dark themes. The primary palette is inspired by the EU5 in-game UI, adapted for a clean, functional web application.

### Base Palette

These are the core brand and semantic colors.

```css
:root {
  --color-white: #ffffff;
  --color-gold: #8f7d5e;
  --color-silver: #cfcbb8;
  --color-concept: #7dc7e3;
  --color-red: #e36166;
  --color-green: #59d469;
  --color-blue-gray: #737380;
  --color-black: #000000;
}
```

### Theming

#### Light Theme (Default)

The light theme uses a bright, clean background with dark text for high contrast and readability.

```css
:root {
  /* Text */
  --text-primary: #1a1a1a;
  --text-secondary: #4d4d4d;
  --text-accent: var(--color-gold);
  --text-link: #005a9c;
  --text-inverted: var(--color-white);

  /* Background */
  --bg-primary: #f5f5f5;
  --bg-secondary: var(--color-white);
  --bg-tertiary: #e0e0e0;

  /* Borders */
  --border-primary: #cccccc;
  --border-secondary: #e0e0e0;
  --border-focus: var(--color-gold);

  /* UI Elements */
  --ui-primary: var(--color-gold);
  --ui-secondary: var(--color-silver);
  --ui-interactive: var(--color-concept);
  --ui-positive: var(--color-green);
  --ui-negative: var(--color-red);
}
```

#### Dark Theme

The dark theme provides a comfortable viewing experience in low-light environments, inspired by modern development tools and the EU5 website.

```css
[data-theme="dark"] {
  /* Text */
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --text-accent: var(--color-gold);
  --text-link: var(--color-concept);
  --text-inverted: #1a1a1a;

  /* Background */
  --bg-primary: #1a1a1a;
  --bg-secondary: #242424;
  --bg-tertiary: #333333;

  /* Borders */
  --border-primary: #4d4d4d;
  --border-secondary: #333333;
  --border-focus: var(--color-gold);

  /* UI Elements */
  --ui-primary: var(--color-gold);
  --ui-secondary: var(--color-silver);
  --ui-interactive: var(--color-concept);
  --ui-positive: var(--color-green);
  --ui-negative: var(--color-red);
}
```

## 2. Typography

The typography system pairs a classic serif for headings with a modern sans-serif for body text, creating a clear and elegant hierarchy.

- **Heading Font:** EB Garamond (or a similar elegant serif like Playfair Display).
- **Body Font:** Inter (or a similar clean sans-serif like Lato or Open Sans).

### Font Scale (in `rem`)

```css
:root {
  --font-size-h1: 2.488rem; /* ~39.8px */
  --font-size-h2: 2.074rem; /* ~33.2px */
  --font-size-h3: 1.728rem; /* ~27.6px */
  --font-size-h4: 1.44rem;  /* ~23.0px */
  --font-size-body: 1rem;     /* 16px (base) */
  --font-size-small: 0.833rem;/* ~13.3px */
  --font-size-label: 0.9rem;  /* ~14.4px */
}

h1, .h1 {
  font-family: 'EB Garamond', serif;
  font-size: var(--font-size-h1);
  font-weight: 600;
  color: var(--text-accent);
}

h2, .h2 {
  font-family: 'EB Garamond', serif;
  font-size: var(--font-size-h2);
  font-weight: 500;
  color: var(--text-primary);
}

h3, .h3, h4, .h4 {
  font-family: 'Inter', sans-serif;
  font-size: var(--font-size-h3);
  font-weight: 600;
  color: var(--text-primary);
}

body {
  font-family: 'Inter', sans-serif;
  font-size: var(--font-size-body);
  color: var(--text-primary);
  line-height: 1.6;
}
```

## 3. Spacing and Layout

A consistent spacing system based on a `0.25rem` (4px) grid unit ensures visual harmony.

### Spacing Scale

```css
:root {
  --space-xs: 0.25rem;  /* 4px */
  --space-sm: 0.5rem;   /* 8px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 1.5rem;   /* 24px */
  --space-xl: 2rem;     /* 32px */
  --space-xxl: 3rem;    /* 48px */
}
```

### Layout Structure

The application uses a three-column layout for the main editor view on desktop screens.

```
+--------------------------------------------------------------------------+
| Header (Version Selector, Theme Toggle)                                  |
+----------------------+---------------------------+-----------------------+
|                      |                           |                       |
| Left Sidebar         | Main Content Area         | Right Sidebar         |
| (Navigation)         | (Editor / Docs)           | (Category Anchors)    |
|                      |                           |                       |
| - Projects           | +-----------------------+ | - Category 1          |
| - Documentation      | | Filter/Search Bar     | | - Category 2          |
| - About              | +-----------------------+ | - Category 3          |
|                      | |                       | | ...                   |
|                      | | Define Category 1     | |                       |
|                      | |  - Field 1            | |                       |
|                      | |  - Field 2            | |                       |
|                      | |                       | |                       |
|                      | | Define Category 2     | |                       |
|                      | |  - Field 3            | |                       |
|                      | |  - Field 4            | |                       |
|                      |                           |                       |
+----------------------+---------------------------+-----------------------+
```

- **Left Sidebar:** Fixed width (e.g., `240px`). Contains primary navigation.
- **Main Content:** Fluid width. Contains the primary workspace.
- **Right Sidebar:** Fixed width (e.g., `200px`). Contains in-page navigation for the editor. Only visible on the editor screen.

## 4. Component Specifications

### Buttons

- **Primary Button (`.btn-primary`):** Gold background, white text. For key actions like "Export" or "Save".
- **Secondary Button (`.btn-secondary`):** Silver background, dark text. For less critical actions.
- **Tertiary/Ghost Button (`.btn-ghost`):** Transparent background, bordered. For actions like "Cancel".
- **States:**
  - `hover`: Slightly darken/lighten background.
  - `focus`: Visible outline using `--border-focus`.
  - `disabled`: Reduced opacity, `not-allowed` cursor.

### Form Inputs (`<input>`, `<select>`)

- **Appearance:** Clean, minimal style. `1px` solid border (`--border-primary`). `padding: var(--space-sm)`.
- **States:**
  - `focus`: Border color changes to `--border-focus`.
  - `disabled`: Light gray background, reduced text opacity.
- **Labels:** Placed above the input field. Font size `--font-size-label`.

### Cards

- **Appearance:** Used for project selection, documentation links, and define categories.
- **Style:** `background-color: var(--bg-secondary)`, `border: 1px solid var(--border-secondary)`, `border-radius: 8px`, `padding: var(--space-lg)`.
- **Shadow:** Subtle box-shadow on hover to indicate interactivity.

### Modals (Export Dialog)

- **Overlay:** Semi-transparent backdrop (`rgba(0,0,0,0.5)`).
- **Dialog:** Centered on screen. `background-color: var(--bg-secondary)`, `border-radius: 8px`, `padding: var(--space-xl)`.
- **Content:** Contains a form for mod details (name, version) and action buttons.

### Sidebars

- **Appearance:** `background-color: var(--bg-secondary)`. A subtle border (`--border-primary`) separates them from the main content.
- **Navigation Links:** Clean list of links. The active link should be highlighted (e.g., bold text and a left border in `--color-gold`).

## 5. Interaction Patterns

- **Transitions:** Use subtle transitions for `background-color`, `border-color`, and `box-shadow` changes (`transition: all 0.2s ease-in-out;`).
- **Focus Indicators:** All interactive elements (links, buttons, inputs) MUST have a clear, visible focus state. A `2px` solid outline using `--border-focus` is recommended.
- **Hover States:** Provide clear visual feedback on hover for all interactive elements, typically by changing background color or text decoration.

## 6. Responsive & Accessibility

### Responsive Design

- **Desktop-First:** The primary target is desktop. The three-column layout is standard.
- **Tablet (`< 1024px`):** The right sidebar (category anchors) should be hidden or collapsed into a dropdown menu to save space.
- **Mobile (`< 768px`):** The left sidebar should collapse into a hamburger menu. The main content area takes full width. Font sizes may need slight adjustments.

### Accessibility (A11y)

- **Color Contrast:** Ensure all text meets WCAG AA contrast ratios against its background. Use tools to verify.
- **Keyboard Navigation:** The entire application must be navigable and operable using only a keyboard. Logical focus order is critical.
- **Semantic HTML:** Use appropriate HTML5 elements (`<nav>`, `<main>`, `<aside>`, `<header>`, `<button>`) to provide inherent meaning.
- **ARIA Attributes:** Use ARIA roles and properties where semantic HTML is insufficient (e.g., for custom components like toggles or modals).
- **Image Alt Text:** All meaningful images must have descriptive `alt` text. Decorative images should have an empty `alt=""`.
- **Forms:** All form inputs must have an associated `<label>`.
