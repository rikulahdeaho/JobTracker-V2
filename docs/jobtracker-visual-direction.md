# JobTracker: visual direction and decision record

Status: Search agenda selected by the owner, 2026-10-05. The owner found Current
pipeline visually out of place and allowed changing or omitting that section.
Revision 2 removes it from the Dashboard concept without a replacement widget.
Stage distribution remains available in the existing Insights functionality.
Implementation was approved on 2026-10-05 and Search agenda now supplies the web
app's shared theme and visual grammar. The decision history and alternatives
below are retained for context. [../DESIGN.md](../DESIGN.md) records extracted
tokens; [DESIGN.md](DESIGN.md) describes current page and accessibility conventions.
This document's images remain direction references, not screenshot specifications.

## Previews

- [Search agenda revision 2, light](../.impeccable/mocks/decision/search-agenda-v2.png)
- [Search agenda revision 2, dark](../.impeccable/mocks/decision/search-agenda-v2-dark.png)
- [Application log](../.impeccable/mocks/decision/application-log.png)
- [Familiar dashboard comparison](../.impeccable/mocks/decision/canon.png)

The recommendation after inspecting the images is Search agenda: the task and
recorded dates remain visible together. Application log is a warmer, record-led
alternative. Its rendered Schedule sits lower, so that composition should not
be copied automatically if date visibility is important.

These generated images communicate direction, not exact specifications. Preserve
the existing controls. Revision 2 removes the original render's invented ellipsis
menus and restricts the signature mark to Next Action. Use flat token fills rather than
any subtle tonal shading in the images. Ordinary saved stages should retain
the neutral treatment in the written proposal. Mobile adapts this hierarchy;
these desktop images do not verify a responsive implementation.

## Brief

A personal job-search CRM for an individual actively applying. Focused, calm,
slightly technical and purposeful. Retain MUI, all current features, data semantics
and navigation. Avoid generic B2B dashboards, HR/ATS presentation, excessive cards,
gradients, decorative AI imagery and gamification.

JobTracker's mechanism is connecting each saved application with its activity
history and a suggested next step, while leaving status decisions to the user.
The real scene is a job seeker returning to their search between applications,
messages and interviews, sometimes on a phone and sometimes at a desk.
The interface must immediately distinguish a saved stage, waiting, a real date
and a suggested action. Dashboard counts are context rather than achievements.

## Grounded directions

Ordered before comparing the options; the seed assigns candidate 4 (key d414a3c3).
The usual KPI-card CRM and its opposite, a decorative motivational dashboard,
are excluded from the grounded set.

1. Personal application ledger: a stable record of role, company, stage and history.
2. Software work queue: clear item identity, state and a concrete next action.
3. Technical field manual: small dependable labels and repeatable section structure.
4. Timetable and personal agenda: dated commitments alongside explicit waiting.
5. Editorial worklist: text hierarchy and concise rows without repeated containers.
6. Interview preparation dossier: one application with neatly separated evidence.
7. Training log: accumulated entries and progress without achievement scores.

These span records, screen tools, documentation, wayfinding and editorial systems.
Candidate 4 is presented as **Search agenda**. Candidate 1 is the alternate
**Application log**. The timetable supplies alignment and date clarity, not
invented arrival predictions or a new calendar feature.

## Search agenda

The identity is a clear rhythm of **application → saved stage → next action**.
The three concepts occupy repeatable positions, including when one is absent.
The user can scan the day's work without every application becoming an alert.

### Palette

Restrained: neutral surfaces with one strong blue accent. Both themes support a
job seeker working under daylight or a desk lamp; dark mode should feel like the
same instrument with the lights lowered, not a separate brand.

| Role | Light | Dark |
| --- | --- | --- |
| Workspace | #F3F5F6 | #161B20 |
| Surface | #FFFFFF | #1E252C |
| Quiet surface | #E9EEF2 | #252E37 |
| Main text | #222B34 | #EAF0F5 |
| Secondary text | #586672 | #A8B5C1 |
| Strong accent / filled control | #235FC7 | #89B4FF |
| Accent control text | #FFFFFF | #122033 |
| Divider | #D7DFE5 | #35404C |

These mode pairs are now implemented in the shared MUI theme. They are not a
contrast certification; verification results and remaining checks belong in
[current-feature.md](current-feature.md), and normative tokens in root DESIGN.md.
Blue carries primary actions, selection and keyboard focus. It does not decorate
every section. Neutral labels cover ordinary waiting and saved stages; limited
green, amber and red identify affirmative outcomes, actual dated urgency and
destructive/error states. Text carries meaning even without color.

### Typography

Retain the current Inter UI face and MUI typography. Personality comes from the
application-specific hierarchy rather than importing a display font. Use sentence
case, 600-weight titles, 400/500-weight reading text and tabular figures for counts
and dates. Suggested scale: 30/36 page title, 20/28 task or role title, 16/24 body,
13/18 metadata. The implementation uses the exact scale in root DESIGN.md;
these rounded sizes describe the original direction. No tracked uppercase or
monospace labels across the whole app.

### Spacing and surfaces

Keep the 8 px unit with 4 px fine alignment. Typical internal gaps 8–16 px,
between related blocks 24 px and between major sections 32–40 px. Use 8 px corners
for real containers and 4 px corners for state tags. Use open sections and single
dividers for summaries, notes and settings; a container must group a real object
or task. Avoid nested cards and gratuitous shadows. Mobile preserves reading
order and 44 px interactive targets rather than shrinking the desktop grid.

### Status and waiting

Use a small filled/hollow marker plus a short text label in a quiet rectangular
tag. Saved stage, elapsed time and Next Action retain distinct treatment:
`Applied` is a stage, `Last contact 8 days ago` is contextual time, and
`Follow up` is a suggestion. Never infer a due date for a suggestion. Waiting is
a valid state, not an error or a productivity deficit. Never draw the nine stages
as an inevitable linear funnel; rejection and withdrawal are real branches.

### Iconography and signature detail

Retain MUI icons with consistent outlined forms and 20 px alignment. Icons support
labels. The signature is a restrained **solid dot + short rule + outlined dot**
in the Next Action heading, suggesting a recorded state and a possible next step.
It does not become a fictional progress meter, new logo requirement or decorative
illustration. No motion or new interaction is required for the identity proposal.

### Across the app

- Dashboard: one clear Next Action; quiet counts; open Schedule and task sections.
  Omit the separate Current pipeline block in the chosen visual direction. Do not
  fill the resulting whitespace merely to balance the screen.
- Applications: consistent role/company hierarchy, quiet state tags and a distinct
  action row within the existing cards and views.
- Details: the same task treatment beside Record activity, dates in stable positions
  and a quiet Timeline; Notes and Job Description remain separate.
- Schedule: dated commitments first; undated suggestions visually separated.
- Insights: count and denominator first; neutral saved-context summaries, without
  treating missing optional data as failure.
- Settings and forms: matching type and spacing, clear labels and subdued previews.

The first viewport comp is Dashboard with its existing content types. All sample
companies, roles, dates and counts in the comps are synthetic demonstration data.
The image is an identity proposal, not a screenshot of the running application.

## Application log alternate

The same task model with a slightly warmer neutral workspace (#F5F4F1), almost
white surfaces (#FEFEFC), charcoal text (#252B32) and a quieter blue (#315DB0).
Role and company become the strongest visual anchors. Consistent row alignment
makes the application record itself the recognisable object. It is more familiar
and less date-led; its risk is relying on fine craft to escape generic tool UI.
Dark counterpart: workspace #191B1D, surface #22262A, text #EDF0F2,
secondary #ADB6BE, accent #98B9F2. No paper texture, serif display or faux notebook.

## Challenger judgment

Six catalog forms were considered against audience identification and product
clarity. All lose both as a full JobTracker interface under this brief:
Datamatics hides meaning in numbers; a transit map introduces an unfamiliar
navigation model; a star atlas invents positional meaning; a dense utility mosaic
creates small-text clutter; a gate board excludes undated applications; a vertical
feed loses the overall search. Their useful disciplines are retained in the
decision board as named raises, without importing their decorative motifs.

## Implementation record

The approved [implementation plan](search-agenda-implementation-plan.md) translated
Search agenda through the existing MUI theme and shared components across the web
app. Dashboard omits Pipeline snapshot and preserves all six original summary
meanings. Ordinary saved stages and waiting are neutral; Offer retains semantic
green. Next Action carries the signature mark. The earlier critique's missing-date
copy, dirty-dialog protection and quieter, actionable Insights were included in
the authorized implementation; they did not introduce new API or auth behavior.

Use [current-feature.md](current-feature.md) for actual validation coverage and
remaining manual checks. The redesign does not close historical date/workflow
checks merely by changing the interface.
