# UI design

Search agenda is JobTracker's implemented web identity, selected and approved on
2026-10-05: a calm, purposeful personal job-search CRM with Inter typography,
neutral surfaces and one blue accent.

[Root DESIGN.md](../DESIGN.md) contains the extracted machine-readable tokens and
reusable visual rules. [.impeccable/design.json](../.impeccable/design.json) supplies
schema-v2 metadata and component previews. Exact implementation comes from
[theme.ts](../web/src/app/theme.ts) and the shared components linked there.
This document records page behavior and accessibility conventions, rather than
maintaining a second palette table.

## Layout and navigation

- Desktop navigation uses a 260px sidebar from MUI's lg breakpoint (1200px).
- Smaller screens use a temporary drawer opened by the navigation button.
- Navigation contains Dashboard, Applications, Schedule, Insights and Settings.
- AppLayout uses an open reading surface. Summaries use alignment and dividers;
  containers group individual records and focused tasks. Fields stack on smaller
  screens. The existing Topbar component is not part of the active layout.
- Add/Edit dialogs scroll their content while keeping footer actions outside
  that area. There is no bottom navigation or Networking page.

## Shared theme

The implemented light/dark palette is documented in root DESIGN.md. Both modes
use the same blue action grammar, neutral ordinary stages, 8px container corners,
4px rectangular tags and an 8px spacing unit with smaller alignment steps.
Sidebar links retain their explicit 16px radius. Cards use one border and no
shadow; modal overlays retain MUI's behavior. There are no decorative gradients.
Theme selection persists in localStorage; native controls follow the color scheme.

Filled dark-mode actions use dark text on light blue. Selected navigation uses
blue text on a 10% blue fill. Semantic chip foregrounds are adjusted separately
from their background fills. Waiting and rejected stages are neutral; Offer
retains semantic green. The signature mark belongs only to Next Action headings.

## Visual hierarchy (2026-10-05)

- Dashboard opens with Next Action beside recorded Schedule from md. Mobile order
  is Next Action, Schedule, the six summary counts, then other next actions.
  Its reading width is capped at 1280px. Role and company lead the priority panel
  and action rows, with the task beneath or beside them. View schedule sits on its
  own row below Schedule summary so the header stays readable at intermediate widths.
  Counts remain Total applications, Active hiring processes, Interviews, Offers,
  Needs attention and Status review. Pipeline snapshot is removed; saved-stage
  distribution remains in Insights. Open space is intentional.
- Applications keeps search and the four list views visible. Below md, Status
  and Sort are disclosed by Filters; selected status remains visible and removable.
  Cards use shared ApplicationIdentity: role at 700 weight, company in secondary
  text, without company-initial avatars; saved stage and Next Action stay separate. Optional
  location/source metadata is omitted when absent and remains available in Details.
- Details uses the same role/company identity and a 1200px reading width. Next Action
  with Record activity and Timeline precede Description & notes. Delete is a secondary
  text action. Quick facts groups compact fields into Dates, Contact and populated
  Reference information. One collapsed Missing optional details section retains
  every absent optional field without a count; Add details opens the existing Edit form.
  Missing Applied date reads Not applied yet only for Draft and To Apply, and
  Applied date not recorded for other stages. Timeline aligns dates with events in
  a fixed column from sm and stacks dates above events below sm.
- Schedule groups recorded dates first and suggestions separately. Empty sections
  use neutral text; overdue/today colors apply only when those groups contain dates.
  Group headers share a divider and aligned count. Dated records align their date
  column beside application identity from sm and stack on smaller screens.
- Insights presents counts and their active-process denominator before percentages.
  A missing denominator is explained in words. Suggestions link to existing
  application details; optional recorded context is presented without failure language.
- Settings leads with Appearance and data reassurance. Existing future controls
  remain inside a collapsed, clearly labeled preview section.

## Component and accessibility conventions

- Authentication uses an open neutral workspace with one narrow centered column:
  JobTracker identity, a short product description and the native Clerk form.
  The Clerk form is the only container; theme switching is available at the top.
  Typography and light/dark colors follow the application theme.

- Use MUI and the existing shared page/section components. Choose open sections
  for summaries rather than creating nested cards or one KPI tile per count.
- Keep visual variants independent from HTML headings: page titles are H1,
  sections H2, nested content H3, and statistics ordinary text.
- Buttons, icon buttons and toggles have a 44px minimum height. Icon buttons also
  have a 44px minimum width; navigation rows are at least 48px tall. Keyboard
  focus has a visible blue outline. Long text and Next Action labels can wrap.
- Give primary actions clear labels, such as Add Application or Save changes.
- Status tags show saved stages; Next Action tags show derived suggestions.
  Text remains visible so meaning does not depend on color alone. Decorative
  stage markers and NextActionMark are hidden from assistive technology.
- Keep application deadlines distinct from interview, assignment and offer dates.
- Show loading, empty and error states explicitly. Preserve entered values after
  failed saves. An error is not a reason to replace the record with invented data.
- Add/Edit supports Enter submission from single-line fields and focuses the
  first invalid field. Multiline fields retain ordinary line breaks.
- Changed Add/Edit and Record activity dialogs ask Keep editing / Discard before
  Cancel, Escape or backdrop dismissal. Unchanged forms close directly. This is
  dialog protection, not autosave or a general browser-navigation guard.
- Keep Job Description and personal Notes separate. Optional contact/details
  sections stay expandable without losing their values.

See [form behavior](how-it-works.md#adding-and-editing) for current fields and
[current-feature.md](current-feature.md) for verification and remaining manual
checks. These conventions do not constitute a formal accessibility certification.
Historical date/workflow checks retain their own completion status.

## Visual reference history

The six images in [ui-references](ui-references/) are retained as historical
design concepts:

[Dashboard](ui-references/dashboard.png),
[Applications](ui-references/applications.png),
[Application Details](ui-references/application-details.png),
[Schedule](ui-references/schedule.png),
[Insights](ui-references/insights.png) and
[Settings](ui-references/settings.png).

The later [Search agenda decision record](jobtracker-visual-direction.md) links
the chosen light/dark concepts and alternatives. Both sets communicate direction;
neither is a screenshot or exact acceptance criterion. Concepts can contain
synthetic content or controls that were never implemented. Use the running app,
root DESIGN.md and actual shared components for future changes.
