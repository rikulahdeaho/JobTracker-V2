---
name: JobTracker — Search agenda
description: A calm, purposeful personal job-search CRM.
colors:
  primary: "#235FC7"
  primary-hover: "#194CA6"
  primary-dark: "#89B4FF"
  primary-dark-hover: "#A8C7FF"
  workspace: "#F3F5F6"
  surface: "#FFFFFF"
  quiet-surface: "#E9EEF2"
  text: "#222B34"
  text-secondary: "#586672"
  divider: "#D7DFE5"
  workspace-dark: "#161B20"
  surface-dark: "#1E252C"
  quiet-surface-dark: "#252E37"
  text-dark: "#EAF0F5"
  text-secondary-dark: "#A8B5C1"
  divider-dark: "#35404C"
  filled-text-dark: "#122033"
  success: "#166534"
  success-dark: "#10B981"
  offer-dark: "#34D399"
  warning: "#92400E"
  warning-dark: "#F59E0B"
  error: "#B91C1C"
  error-dark: "#FB7185"
typography:
  headline:
    fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", sans-serif'
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", sans-serif'
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  section:
    fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", sans-serif'
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", sans-serif'
    fontSize: "1rem"
    lineHeight: 1.5
  body-small:
    fontSize: "0.875rem"
    lineHeight: 1.5
  caption:
    fontSize: "0.8125rem"
    lineHeight: 1.4
  button:
    fontSize: "0.9rem"
    fontWeight: 600
    lineHeight: 1.9
rounded:
  container: "8px"
  tag: "4px"
  navigation: "16px"
spacing:
  fine: "4px"
  unit: "8px"
  small: "12px"
  medium: "16px"
  section-mobile: "20px"
  section-desktop: "24px"
  page-desktop-y: "28px"
  page-wide-x: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.container}"
    padding: "6px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-dark:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.filled-text-dark}"
    rounded: "{rounded.container}"
  button-primary-dark-hover:
    backgroundColor: "{colors.primary-dark-hover}"
  button-outlined:
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.container}"
    padding: "5px 15px"
  button-text:
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.container}"
    padding: "6px 8px"
  status-tag:
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.tag}"
    height: "24px"
  input:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.container}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.container}"
  navigation-active:
    backgroundColor: "rgba(35, 95, 199, 0.1)"
    textColor: "{colors.primary}"
    rounded: "{rounded.navigation}"
  next-action-mark:
    textColor: "{colors.primary}"
---

# Design System: JobTracker

## Overview

**Creative North Star: "Search agenda"**

A personal job search needs clear records, explicit waiting and useful next steps.
The interface is calm, focused and slightly technical: readable Inter text, neutral
surfaces, aligned dates and one blue accent. Its personality comes from the
relationship between an application, its saved stage and its next action.

This is the implemented identity selected on 2026-10-05. Generated concepts guide
its character; actual components establish its reusable rules. Page compositions
belong in [.impeccable/surfaces/web-app.md](.impeccable/surfaces/web-app.md).

**Key Characteristics:**

- Open sections and modest borders instead of repeated summary cards.
- Neutral saved stages and waiting; blue for action, selection and focus.
- The dot–rule–outlined-dot signature accompanies Next Action.
- One identity across light and dark mode.

## Colors

The frontmatter records the shared implementation's palette. Light and dark
suffixes are mode pairs, not additional brand accents.
The sidecar's OKLCH tonal strips are synthesized preview ramps for the design
panel, not additional application tokens or approved replacement colors.

### Primary

Blue identifies primary actions, selected navigation, keyboard focus and actionable
Next Action suggestions. Dark filled controls use the dark filled-text token.
Hover uses the corresponding primary-hover token.

### Neutral

Workspace frames navigation; surface is the main reading canvas and container
background. Quiet surface separates subdued content. Text and text-secondary
provide hierarchy; divider draws restrained boundaries.

Success is reserved for positive outcomes; Offer uses the success chip treatment
(offer-dark in dark mode). Warning and error communicate real dated urgency,
validation failures and destructive actions. They are semantic colors, not brand
accents. Ordinary saved stages, including Rejected, remain neutral.

**The Action Rule.** A derived suggestion does not become a red deadline simply
because it needs attention. Preserve its words and distinguish it from a saved date.

## Typography

Inter is bundled locally, with Segoe UI, Helvetica Neue and sans-serif fallbacks.
The shared theme supplies headline (MUI h4), title (h5), section (h6), body,
body-small and caption roles. Titles use a purposeful medium weight; labels use
sentence case. Button text retains ordinary capitalization.

PageHeader reduces the headline to 1.625rem below md. SectionCard overrides its
section-heading line height to 1.25. These component adaptations do not replace
the theme scale. ApplicationIdentity gives roles a 700 weight and companies a
secondary-text 500 weight, with a 4px gap and wrapping text. Its page size uses
the responsive headline scale; its row size uses the section scale. Counts and dates use tabular figures where the component calls
for alignment. Visual variants are independent from HTML heading levels: page
titles are H1, sections H2, nested headings H3; counts are ordinary text.

## Layout

The shared rhythm is based on the theme's spacing unit, including half steps.
PageShell centers content with a default maximum width of 1536px; its vertical
gaps are section-mobile below md and section-desktop from md. AppLayout's
horizontal gutters are medium / section-desktop / page-wide-x at xs / md / xl,
with medium / page-desktop-y vertical padding at xs / md.
Dashboard limits its reading width to 1280px; Details uses 1200px.

A 260px permanent sidebar starts at lg (1200px). Smaller widths use the existing
temporary drawer. There is no active topbar or bottom navigation. Page headers
stack actions below the title on smaller screens. Responsive lists and fields
wrap long names, URLs and action text instead of compressing desktop columns.

Use open sections for summaries and groups; reserve containers for real records
and focused tasks. SectionCard's plain variant removes its fill, border and
padding. Its bordered variant has 18px / 24px internal padding at xs / md and
24px bottom padding. Page-specific hierarchy remains in the surface brief.

## Elevation & Depth

Shared cards and buttons have no shadow. Neutral fills, borders and spacing
provide separation. Paper has no gradient background image. Dialogs and temporary
drawers keep MUI's modal behavior and default elevation; the flat card rule does
not claim that all overlays have no shadow. No decorative animation is required.
Outlined inputs retain the implemented border-color transition (160ms ease).

## Shapes

Containers, buttons, fields and alerts use the container radius; rectangular tags
use the smaller tag radius. Sidebar links explicitly use the navigation radius
through MUI's numeric shape multiplier. Small state markers are circles. Rounded
avatars retain their account role and do not establish pill-shaped status tags.

## Components

### Buttons

Plain labels and a blue filled primary action make the next choice clear. Shared
buttons, icon buttons and toggles have a 44px minimum target height; icon buttons
also have a 44px minimum width. Keyboard focus uses a 2px blue outline with a
3px offset. Secondary and text actions use existing MUI variants. Defaults such as
medium contained-button padding come from the installed MUI component.

### Chips

StatusChip is a small outlined tag with a 7px circular marker: Draft and To Apply
are hollow; other stages are filled. All stages except Offer use neutral text.
Status backgrounds use foreground alpha 0.10 / 0.12, and borders 0.28 / 0.24,
in light / dark mode. Offer's chip foreground is adjusted separately for each mode.

NextActionChip is a derived suggestion: blue when attention is needed, secondary
text when waiting. Semantic chip backgrounds use alpha 0.08 / 0.12 and borders
0.24. Its height can grow beyond 24px to wrap its label. Chips are labels unless
the actual instance exposes an existing action; do not invent click behavior.

### Cards / Containers

Use a surface fill, one divider-colored border, container corners and no shadow.
Application cards group one record; plain SectionCard presents unboxed groups.
Do not wrap each count or field in another card.

### Application identity

ApplicationIdentity leads with the role and places the company below it in
secondary text. Application cards and Details use this shared identity in place
of company-initial avatars. Dashboard priority and action rows, Schedule records
and Insights suggestions use the same hierarchy. The task remains a separate cue.

### Dates and record facts

Timeline dates occupy a fixed 104px column from sm, with event content aligned
beside them; below sm the date sits above the event. Schedule records use a
150px date column from sm and stack on smaller screens. Tabular figures and
dividers support scanning. Details groups compact Quick facts into Dates,
Contact and populated Reference fields. Missing optional fields appear in one
collapsed disclosure without a count; Add details opens the existing Edit form.

### Inputs / Fields

Outlined fields have a surface fill, divider stroke, container corners and a
48px minimum height, except multiline fields. Focus changes the stroke to blue
without a glow; error and disabled states retain MUI semantics. Default TextField
size is small. Labels, helper text and validation messages remain visible.

### Navigation

The active link uses blue text on a 10% blue fill; hover uses quiet surface, with
active hover retaining selection. Links have a 48px minimum height and medium
weight body text. Account, sign-out and theme controls live in the sidebar.

### Next Action mark

NextActionMark is decorative and aria-hidden: an 8px filled blue dot, a 16px
blue rule, and an 8px outlined secondary-text dot separated by 6px gaps. Use it
only beside Next Action headings. It carries no progress percentage or interaction.

## Do's and Don'ts

### Do:

- **Do** preserve stage words, action words and recorded dates as separate cues.
- **Do** use the shared theme and components for both modes.
- **Do** retain visible focus, text labels, semantic headings and wrapping content.
- **Do** group real records and tasks while leaving summaries open.

### Don't:

- **Don't** add gradients, decorative AI imagery, excessive cards or generic KPI tiles.
- **Don't** turn waiting or missing optional information into a visual failure.
- **Don't** interpret the signature as a funnel or invent interaction for it.
- **Don't** copy synthetic counts, controls or screen geometry from concept images.

Extraction sources: [theme.ts](web/src/app/theme.ts),
[PageSection.tsx](web/src/components/ui/PageSection.tsx),
[AppLayout.tsx](web/src/components/layout/AppLayout.tsx),
[Sidebar.tsx](web/src/components/layout/Sidebar.tsx),
[StatusChip.tsx](web/src/features/applications/components/StatusChip.tsx),
[NextActionChip.tsx](web/src/features/applications/components/NextActionChip.tsx),
[ApplicationIdentity.tsx](web/src/features/applications/components/ApplicationIdentity.tsx),
[applicationStatus.ts](web/src/features/applications/utils/applicationStatus.ts),
and [NextActionMark.tsx](web/src/components/ui/NextActionMark.tsx).
Refresh this document and its sidecar when those shared decisions change.
