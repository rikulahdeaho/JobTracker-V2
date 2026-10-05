# UI design

The UI uses MUI with a shared theme and Inter typography. The goal is to make
application status, the next action and important dates easy to scan.

This document describes the implemented interface. The source of truth for exact
styles is [theme.ts](../web/src/app/theme.ts), not the original concept images.

## Layout and navigation

- Desktop navigation uses a 260 px sidebar from MUI's `lg` breakpoint (1200 px).
- Smaller screens use a temporary drawer opened by the navigation button.
- Navigation contains Dashboard, Applications, Schedule, Insights and Settings.
- Content uses responsive cards and grids. Form fields stack on smaller screens.
- Add/Edit dialogs scroll their content while keeping footer actions outside that area.

There is no bottom navigation or Networking page.

## Theme

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#F8FAFC` | `#131211` |
| Card surface | `#FFFFFF` | `#181716` |
| Main text | `#0F172A` | `#F5F3F0` |
| Secondary text | `#475569` | `#A8A29E` |
| Primary action | `#2563EB` | `#3B82F6` |
| Border | `#E2E8F0` | `#262422` |

The theme uses an 8 px spacing unit and an 8 px base border radius. Chips are
rounded pills. Components can use their own spacing and radius multiples.
Dark surfaces rely on borders and tonal differences rather than strong shadows.
Theme selection persists in localStorage.

## Component conventions

- Use MUI components and existing shared page/section components.
- Give primary actions a clear label, such as Add Application or Save changes.
- Status chips show the saved stage; Next Action chips show the derived suggestion.
- Keep status/action text visible so meaning does not depend on color alone.
- Keep application deadlines distinct from interview, assignment and offer dates.
- Show loading, empty and error states explicitly. Preserve input after failed saves.
- Keep job description and personal notes separate. Optional contact/details
  sections should stay expandable without losing their values.

See [form behavior](how-it-works.md#adding-and-editing) for the current fields.

## Original visual references

The six images in [ui-references](ui-references/) are retained as **historical
design concepts**, not screenshots or acceptance criteria for the current app:

[Dashboard](ui-references/dashboard.png),
[Applications](ui-references/applications.png),
[Application Details](ui-references/application-details.png),
[Schedule](ui-references/schedule.png),
[Insights](ui-references/insights.png) and
[Settings](ui-references/settings.png).

Use the running interface and current components when making changes. Concept
images may contain layouts, colors or controls that were never implemented.
