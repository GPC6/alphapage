---
name: Previzion Performance Report
description: Coverage-matched project navigation, four model/mode cohorts and preserved analytical records.
colors:
  bg: "#111318"
  surface: "#1b1f27"
  raised: "#232a35"
  line: "#36404e"
  text: "#f1f3f6"
  muted: "#b5bfce"
  board: "#79dbb5"
  scene: "#a9caff"
  follow: "#f0c879"
  focus: "#a9caff"
  red: "#f4a7a9"
  action-bg: "#25446c"
  action-border: "#6d95c7"
  action-text: "#fff"
  pressed: "#343e4d"
  field-hover: "#61728b"
  placeholder: "#b5bfce"
  row-selected: "#253850"
  raw-bg: "#111318"
typography:
  display:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "clamp(26px,3vw,40px)"
    fontWeight: 720
    lineHeight: 1.3
    letterSpacing: "-.025em"
  headline:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "22px"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-.02em"
  title:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "16px"
    fontWeight: 650
    lineHeight: 1.6
  body:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
  button:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "13px"
    fontWeight: 550
    lineHeight: 1.6
  table:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  summary-number:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "-.02em"
  run-id:
    fontFamily: "ui-monospace,SFMono-Regular,monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.6
  report-tab:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  batch-total:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "20px"
    fontWeight: 650
    lineHeight: 1.5
  batch-detail-title:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "24px"
    fontWeight: 650
    lineHeight: 1.5
  field:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  marker: "2px"
  status: "3px"
  tab: "6px"
  control: "6px"
  surface: "8px"
spacing:
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
  "36": "36px"
  "38": "38px"
components:
  header-action:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.surface}"
    padding: "9px 13px"
  header-action-selected:
    backgroundColor: "{colors.action-bg}"
    textColor: "{colors.action-text}"
  project-navigation-item:
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "10px 8px"
  project-navigation-item-selected:
    backgroundColor: "{colors.row-selected}"
    textColor: "{colors.action-text}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.surface}"
    padding: "10px 15px"
  button-secondary-hover:
    backgroundColor: "{colors.raised}"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  navigation-item:
    textColor: "{colors.muted}"
    padding: "0 0 13px"
  navigation-item-active:
    textColor: "{colors.text}"
  project-detail:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.surface}"
    padding: "24px"
  table-header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    padding: "13px 16px"
  table-row-selected:
    backgroundColor: "{colors.row-selected}"
  chart-tooltip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  report-tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.report-tab}"
    rounded: "{rounded.tab}"
    padding: "10px 12px"
  report-tab-hover:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text}"
  report-tab-selected:
    backgroundColor: "{colors.action-bg}"
    textColor: "{colors.action-text}"
  batch-note:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.surface}"
    padding: "16px 18px"
  batch-detail:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.surface}"
    padding: "24px"
  outcome-complete:
    textColor: "{colors.board}"
    typography: "{typography.label}"
  outcome-limited:
    textColor: "{colors.follow}"
    typography: "{typography.label}"
  outcome-error:
    textColor: "{colors.red}"
    typography: "{typography.label}"
---
# Design System: Previzion Performance Report

## Overview

**Creative North Star: "Dark Scientific Publication Tables"**

Dark scientific publication tables give the report a quiet, precise working character. Flat charcoal surfaces, readable Korean system typography and restrained signals keep measurements easy to scan. The user-pinned coverage reference governs the actual composition: a compact full-width header, persistent project rail and inset reading column. Matching its palette alone does not satisfy this direction.

Evidence and annotation have separate space. Numeric tables carry exact reading, while interactive plot marks expose distribution. Four explicit model/mode tabs begin with Claude normal and retain its existing analysis. Native controls, visible keyboard focus and project detail within the main column support repeated inspection without decorative imagery or external fonts.

**Key Characteristics:**

- Coverage-matched header, project rail and inset reading column.
- Four model/mode tabs with Claude normal first and selected by default.
- Flat charcoal surfaces, fine structural rules and blue selected controls.
- Separate, labelled color meanings for pipeline stages, cohorts and termination states.
- Tabular numerals, native controls and project-focused detail.
- A mobile project selector, two-by-two mode tabs and labelled comparison values.
- Authored SVG icons with text or accessible status labels.

## Colors

The palette shares the coverage report's charcoal neutrals, pale blue interaction color and green, amber and red signals. Frontmatter holds the implemented screen values; semantic roles below specify their context.

### Primary

- **Coverage blue (`scene`):** project numbers, links, first-scene chart marks, Claude normal and GPT AI cohort keys. `action-bg`, `action-border` and `action-text` define selected header actions and mode tabs. Hover does not change a selected control's blue fill.

### Secondary

- **Measured green (`board`):** project-rail costs, storyboard stage marks and headings, Claude AI cohort keys, model-complete status, historical section selection, data links and checkbox/caret accents.

### Tertiary

- **Measured amber (`follow`):** followup stage marks and notes, GPT normal cohort keys and 50-turn-limit status.
- **Error rose (`red`):** supplier-error status.

### Neutral

- `bg` is the page, header, project rail and raw-record ground; `surface` is table headers, fields, inactive mode tabs, notes and detail; `raised` is header actions, control hover and the status-bar track. `line` separates structure, while `text` and `muted` establish reading hierarchy. `row-selected` marks the current project and ledger selection.
- `focus` is the blue keyboard outline and skip-link surface. `field-hover` and `pressed` retain control-state roles. Input placeholders use `var(--muted)`, matching the screen `placeholder` token and the print muted override (`#444`). Plot marks use a brighter text-colored stroke on hover/focus.

**The Stage Meaning Rule.** In historical pipeline charts, green identifies storyboard, blue identifies first scene, and amber identifies followup requests. Keep the same mapping in text, tables and circle, square or diamond marks.

**The Context Label Rule.** Cohort keys identify Claude normal and GPT AI in blue, Claude AI in green and GPT normal in amber. Termination icons independently identify model complete in green, turn limit in amber and supplier error in red. Keep the model/mode or status label beside its color; termination is not a quality judgment.

## Typography

The installed Korean system sans stack in the frontmatter serves this analytical interface's headings, prose, controls and tables. Monospace is reserved for run identifiers and raw records; the general monospace utility also includes Consolas. This is the user-pinned report typography, not a display-font recommendation for other surfaces.

Page headings share a fluid display role, with a maximum reading width of 27ch. Headline and title roles serve section and subsection headings. Detail headings use the batch-detail-title role and become 20px at 700px and below. Body is the reading baseline; it becomes 16px at 1500px and above. Introductory prose uses 15px with 1.85 line-height and becomes 13px at 700px and below. Historical section headings become 20px at 760px and below.

Mode tabs use 12px labels on desktop, 11px at 1200px and below, 12px at 980px and below, then 11px at 700px and below. The project rail uses 12px names and 11px costs. Table and summary-number express compact historical measurements; summary numbers become 18px and summary-table headers use 11px at 700px and below. Batch-total values become 19px at 700px and below; the historical summary strip uses 22px. These are observed roles, not a mathematical type scale. Captions remain smaller and muted. Korean prose keeps words together and wraps long content.

**The Numeric Reading Rule.** Right-align measurements and use tabular numerals; keep labels, units, denominators and missing-record wording visible. Mobile comparison values may align left beneath explicit field labels.

## Layout

The full-width header is sticky at the viewport top with a 73px minimum height, 14px 28px padding and a fine bottom rule. The centered content shell has a maximum width of 1800px and a grid of 238px plus the flexible main column. The project rail sticks 73px below the top, fills the remaining viewport height, scrolls independently and uses 20px 14px padding. Main content has 38px top/side and 60px bottom padding. The footer aligns to that reading column with a 276px left inset.

Four equal-width model/mode tabs sit within the main column in this order: Claude normal, Claude AI, GPT normal, GPT AI. Their grid has an 8px gap, 24px bottom padding and 28px bottom margin. Claude normal is the initial view; comparison is a header action rather than a fifth tab. The historical section navigation is static within the main column and remains horizontally scrollable. Only the chosen historical section is shown, preserving overview, projects, statistics, timing, relationships, raw records and criteria.

Selecting one of the 18 rail projects opens its detail directly in the main column; a context line provides a return to the current mode's overview. In comparison, project selection isolates that project's four values. Ordinary report panels have no additional outer padding or border. Focused project detail uses 24px padding within a bordered surface. Historical overview uses a 1.8fr / minimum-220px explanatory column with a 28px gap. Other batch subsections retain 36px separation.

- At 1200px and below, the rail becomes 210px, main padding becomes 28px 24px 60px, and historical overview/intro content stacks. Footer left padding becomes 234px.
- At 1050px and below, existing analytical subcolumns stack, relationship metrics tighten and batch titles place the download action below the title.
- At 980px and below, the rail disappears and a labelled native project selector appears above the mode tabs, up to 420px wide. The shell becomes one column; main padding is 28px 22px 50px. Header padding becomes 12px 20px and the brand subtitle is hidden.
- At 760px and below, inherited analytical controls and detail fields use their compact layouts. Summary ledgers become labelled two-column rows; batch detail fields use two columns; historical detail and methodology stack. Wide historical tables retain scoped scrolling.
- At 700px and below, the header becomes relative rather than sticky, with 12px 16px padding and wrapping compact actions. Main padding becomes 24px 16px 40px; the project selector spans the column. Mode tabs form a two-by-two grid with 46px minimum height. Paired project rows place the project name above four explicitly labelled cohort values in a two-by-two grid. The shared desktop table heading is hidden and every value carries its own model/mode label. Focused detail padding becomes 20px 16px.

The four-cohort summary labels app/client time consistently. Server time remains a separate selectable comparison metric and detail field. The comparison header distinguishes original 148 cuts from new 152 cuts. Claude normal retains all 79 observations and its existing analyses; its first-scene 18 records join the comparison. Measurements stay in ruled ledgers and definition-list strips, not metric-card grids.

Other wide tables scroll within focusable regions. The historical project ledger retains a sticky header and first column, with a 620px scroll-height limit (520px at 760px and below); its first column narrows to 190px on mobile. The historical scatter plot switches SVG geometry when its own width is below 560px and wraps its legend beneath it. Print uses a light, text-first report without the header, project rail, selector, mode tabs, project context or plots. Paper-specific palette overrides live in the sidecar.

## Elevation & Depth

Depth comes from surface tone, borders and selected rows. The only ambient shadow belongs to the floating historical chart tooltip. The ledger's sticky-column shadow is a one-pixel separator, not a raised card. Exact shadow and motion values live in the sidecar. Buttons and plot marks use short state transitions; reduced-motion preference removes transitions and smooth scrolling. Mode/project changes return immediately to the top of the reading view.

**The Flat Surface Rule.** Use tone and fine rules for structure. Reserve the ambient shadow for the floating chart tooltip.

## Shapes

Surface corners use the `surface` radius; inputs, selects, project-rail buttons, raw-record wells and tooltip use `control`; mode tabs use the equal `tab` radius. Table header outer corners are rounded while internal cells remain square. Thin straight rules organize rows and annotation. Historical stage markers remain a circle for storyboard, a softly squared mark for first scene, and a diamond for followup. Cohort keys use small softly squared markers and thin magnitude bars. Outcome strips use the shallow `status` radius.

The authored SVG family uses unfilled paths, a 24-unit viewBox, 1.6px strokes and rounded caps/joins. Standard icons are 19px; mode-tab icons are 18px at every size; status icons are 16px (13px within paired values, 11px at 760px and below). The brand is text only. The header download retains its 18px, 1.5px-stroke SVG and is hidden by the inherited compact header rule at 760px and below.

## Components

- **Header actions:** overview, four-cohort comparison and criteria share raised charcoal controls; the current view has the selected blue fill and border. Data ZIP uses the same neutral control treatment. Header controls have 42px minimum height and become 36px at 700px and below. Other outlined actions retain 44px minimum height; compact actions use 40px. Hover changes surface/border, pressed state darkens, and disabled controls use 0.4 opacity. Focus uses a 2px blue outline with 4px offset.
- **Project navigation:** each rail button has a blue number, wrapped project name and right-aligned green final-scene cost. Selected rows use the selection tint and `aria-current`; hover uses the surface tone. Selection keeps the current mode. In comparison, rail costs continue to represent the previously viewed mode and the note states this. The mobile select reaches the same project detail.
- **Fields:** native search and select controls on the surface tone, with visible labels, a subtle border and the same focus outline. Search has a green caret; checkbox uses the green accent. Native select affordances are retained.
- **Mode tabs:** four icon-and-label buttons on surface tone; hover uses raised tone and bright text, while selection uses the shared blue fill and border. The active tab alone is in the tab order; Left/Right wrap and Home/End move to the ends. Selection updates the visible panel and URL hash. Comparison leaves the mode tabs unselected while keeping the first reachable by keyboard. Narrow screens reflow the tabs into two columns.
- **Historical navigation:** muted text becomes bright on hover; the selected section retains a green bottom rule. This navigation is static, scrollable within its row and selects one preserved analysis section. A focus-revealed skip link precedes the report.
- **Tables and project detail:** compact rows, muted header bands and tabular values. Hover/selection tint historical project rows; selection also colors the project name. Batch row selection uses the same tint. Activating a project, paired value or plot mark opens detail and moves focus to its heading. Detail occupies the main document, not a modal; the project context provides the return action. Failed and final attempts can be switched within the affected project's detail.
- **Four-cohort comparison:** a ruled summary ledger separates final-result measurements from all-attempt cost. Paired values remain clickable and use thin, right-anchored magnitude bars scaled to the selected metric's shared maximum. Four values retain their order and explicit model/mode labels after mobile reflow.
- **Outcome indicators:** check, clock and warning-triangle SVGs accompany model-complete, turn-limit and supplier-error labels. Compact paired indicators retain a title and visually hidden status text. The completion/limit strip describes final saved results; failures remain separately listed in the status legend and execution table.
- **Notes and totals:** totals form a flat definition-list strip between rules. Measurement notes use a bordered surface with an information icon where present; neither adds elevation.
- **Plot and legend:** historical circle/square/diamond SVG marks share cost/time axes. Marks support pointer, Enter and Space activation. Hover/focus brightens the stroke and reveals a compact tooltip; Escape hides it. The legend repeats the same shape/color mapping. Timing breakdowns use neutral tones to avoid borrowing stage or status meaning.
- **Disclosure and raw records:** native details/summary exposes extra analysis, provenance or JSON. Expanded historical raw-record summaries turn green; the record sits in a bounded, scrollable monospace well. Pagination and download controls reuse the button family.

## Do's and Don'ts

### Do

- Do preserve the coverage header, project rail and inset reading column as well as its palette.
- Do keep Claude normal first and selected by default in the four model/mode tabs.
- Do preserve the Korean system sans stack and monospace identifiers.
- Do pair pipeline color with text and circle, square or diamond marks.
- Do keep cohort identity and termination semantics labelled separately.
- Do retain visible focus, keyboard-operable tabs and plot marks, and focus transfer to detail.
- Do use the mobile project selector and explicitly label each of the four reflowed comparison values.
- Do keep remaining wide tables in their own scroll regions.
- Do use authored SVG icons with accessible labels for controls and statuses.

### Don't

- Don't reduce coverage alignment to a palette change or restore the old centered, rail-free shell.
- Don't make comparison a fifth model/mode tab or rename preserved Claude normal content as an anonymous archive.
- Don't add decorative imagery, external fonts, gradients or oversized marketing headings.
- Don't replace analytical tables with metric-card grids.
- Don't use pipeline, cohort or status colors interchangeably or as arbitrary decoration.
- Don't treat a model-complete or turn-limit indicator as a quality score.
- Don't add elevation to ordinary panels or introduce motion beyond the existing state transitions.
