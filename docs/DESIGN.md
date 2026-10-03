---
name: Efficient Professional
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
  success-emerald: '#10B981'
  warning-amber: '#F59E0B'
  status-applied: '#3B82F6'
  bg-light: '#F8FAFC'
  bg-dark: '#020617'
  surface-light: '#FFFFFF'
  surface-dark: '#0F172A'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  sidebar-width: 260px
  container-max: 1280px
  margin-sm: 16px
  margin-md: 32px
---

> Design reference, not an implementation specification. The palette and layout
> ideas below include original concepts. Current navigation is Dashboard,
> Applications, Schedule, Insights and Settings; small screens use a drawer,
> not bottom navigation. Networking and the progress widgets described below
> are not implemented. See [current behavior](how-it-works.md).

## Brand & Style

The design system is engineered for **JobTracker**, a platform where high-stakes career management meets streamlined productivity. The brand personality is authoritative yet encouraging—acting as a reliable co-pilot during the job search process.

The visual style is **Corporate Modern with a Minimalist edge**. It prioritizes clarity and information density without overwhelming the user. The aesthetic relies on crisp geometry, generous whitespace in content areas to reduce cognitive load, and a high-contrast palette to ensure that critical status updates are immediately actionable. This system avoids decorative flourishes in favor of functional elegance, ensuring that the interface feels like a sophisticated tool rather than a distraction.

## Colors

The palette is anchored in **Corporate Blue** to establish trust and professional stability. 

### Core Logic
- **Primary (#2563EB):** Reserved for primary actions, active navigation states, and progress indicators.
- **Success (#10B981):** Specifically used for "Offer Received" statuses and positive growth metrics.
- **Warning (#F59E0B):** Used for "Follow-up Required" or "Interview Scheduled" to draw attention without causing alarm.
- **Neutral/Secondary:** A sophisticated range of slates and grays to handle typography and UI borders.

### Color Modes
- **Light Mode:** Uses a "Soft Paper" background (`#F8FAFC`) with pure white containers to create subtle depth. Text-on-surface is `#0F172A`.
- **Dark Mode:** Employs a "Deep Midnight" background (`#020617`) with elevated containers in `#0F172A`. Text-on-surface is `#F1F5F9`.

## Typography

This design system utilizes **Inter** for its exceptional legibility and neutral, professional character. 

The hierarchy is built on a tight scale to maintain high information density. Headlines use a tighter letter-spacing to appear more cohesive and "buttoned-up," while labels use uppercase styling with increased tracking to differentiate them from body copy in dense data tables or card headers. 

On mobile devices, headlines scale down to prevent excessive line wrapping in the job tracking dashboard.

## Layout & Spacing

The layout utilizes a **Fixed Sidebar / Fluid Content** model. 

### Structure
- **Sidebar:** Fixed at 260px. It houses high-level navigation (Dashboard, Applications, Networking, Settings).
- **Main Canvas:** A fluid area with a maximum content width of 1280px to prevent line lengths from becoming unreadable on ultra-wide monitors.
- **Grid:** A 12-column system is used within the main canvas for dashboard widgets and job cards.

### Breakpoints
- **Desktop (1024px+):** Full sidebar visible. 24px gutters.
- **Tablet (768px - 1023px):** Sidebar collapses into an icon-only rail or hidden drawer. Margins reduce to 16px.
- **Mobile (<767px):** Single column stack. Bottom navigation bar replaces the sidebar for primary actions.

## Elevation & Depth

This design system uses **Tonal Layering** supplemented by **Low-Contrast Outlines** rather than heavy shadows to maintain a clean, SaaS-native look.

1.  **Level 0 (Background):** The base canvas (`bg-light` or `bg-dark`).
2.  **Level 1 (Cards/Surface):** Primary containers for job data. These use a 1px border (`Slate-200` in light mode, `Slate-800` in dark mode).
3.  **Level 2 (Hover/Active):** Elements being interacted with receive a subtle, ultra-diffused shadow (0px 4px 12px, 5% opacity) to signify lift.

In dark mode, depth is achieved by lightening the surface color slightly as it "rises" closer to the user, following standard material principles.

## Shapes

The shape language is **Soft (0.25rem)**. This provides a professional, geometric feel that isn't as harsh as sharp 90-degree corners, but avoids the "consumer-app" playfulness of fully rounded corners.

- **Standard Elements:** 4px radius for buttons, inputs, and small chips.
- **Containers:** 8px (`rounded-lg`) for data cards and modal overlays.
- **Progress Bars:** Use a full pill-shape to distinguish them from interactive containers.

## Components

### Buttons & CTAs
- **Primary:** Solid blue background with white text. High-visibility for "Add New Application."
- **Secondary:** Ghost style (border only) or subtle gray background.

### Status Chips
Status chips are critical for the job tracker:
- **Applied:** Blue tint background, dark blue text.
- **Interviewing:** Purple tint background, dark purple text.
- **Offer:** Emerald green background, white text (High Contrast).
- **Rejected:** Light gray background, medium gray text (De-emphasized).

### Input Fields
Inputs should feature a persistent 1px border. The border should transition to the Primary Blue on focus with a subtle 2px outer glow (ring).

### Data Cards
Job cards must include:
- Company Logo placeholder.
- Role Title (Headline-md).
- Status Chip.
- Last Activity date (Body-sm).

### Progress Bars
Used for "Application Completion" or "Interview Stages." Use a thick 8px track with the success-emerald color for the fill.