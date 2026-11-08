---
name: Previzion Performance Report
description: Dark analytical tables and linked execution records.
colors:
  bg: "#10151e"
  surface: "#171e29"
  raised: "#202a38"
  line: "#344152"
  text: "#edf2f8"
  muted: "#aab8cb"
  board: "#79d7c7"
  scene: "#9ab7ff"
  follow: "#f2bc7c"
  focus: "#d6f68a"
  board-text: "#102a26"
  board-hover: "#9ee8db"
  pressed: "#2b394b"
  field-hover: "#61728b"
  placeholder: "#9aaac0"
  row-selected: "#1c2934"
  raw-bg: "#0b1018"
typography:
  display:
    fontFamily: "-apple-system,BlinkMacSystemFont,\"Apple SD Gothic Neo\",\"Malgun Gothic\",\"Noto Sans KR\",sans-serif"
    fontSize: "36px"
    fontWeight: 720
    lineHeight: 1.25
    letterSpacing: "-.03em"
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
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "-.02em"
  run-id:
    fontFamily: "ui-monospace,SFMono-Regular,monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
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
  "48": "48px"
components:
  button-primary:
    backgroundColor: "{colors.board}"
    textColor: "{colors.board-text}"
    typography: "{typography.button}"
    rounded: "{rounded.surface}"
    padding: "8px 13px"
  button-primary-hover:
    backgroundColor: "{colors.board-hover}"
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
    padding: "15px 0"
  navigation-item-active:
    textColor: "{colors.text}"
  project-detail:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.surface}"
    padding: "28px"
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
---
# Design System: Previzion Performance Report

## Overview

**Creative North Star: "Dark Scientific Publication Tables"**

Dark scientific publication tables give the report a quiet, precise working character. Flat ink surfaces, readable Korean system typography and restrained stage colors keep measurements easy to scan. The user-selected dark analytics direction is the visual authority.

Evidence and annotation have separate space. Numeric tables carry exact reading, while small interactive plot marks expose distribution. Native controls, visible keyboard focus and inline detail support repeated inspection without decorative imagery or external fonts.

**Key Characteristics:**

- Flat dark surfaces with fine structural rules.
- Stable teal, blue and orange pipeline meanings, reinforced by shapes and labels.
- Tabular numerals, native controls and restrained headings.
- Scoped table scrolling and stacked mobile layouts.

## Colors

The palette combines cool ink neutrals with clear, restrained pipeline signals. The frontmatter preserves the CSS values; literal state colors retain their implemented values too.

- **Primary — storyboard teal (`board`):** storyboard marks and headings, links, the download action, selection accents and checkbox/caret accents. `board-text` and `board-hover` define the filled action.
- **Secondary — first-scene blue (`scene`):** first-scene marks and headings.
- **Tertiary — followup orange (`follow`):** followup marks, headings and measurement notes.
- **Neutral:** `bg` is the page; `surface` is table headers, fields and inline detail; `raised` is button hover. `line` separates structure, while `text` and `muted` establish reading hierarchy. `row-selected` marks ledger hover/selection; `raw-bg` contains JSON.
- **Interaction:** `focus` is the lime keyboard outline and skip-link surface. `field-hover`, `placeholder` and `pressed` preserve the existing control states. Plot marks instead use a brighter text-colored stroke on hover/focus.

**The Stage Meaning Rule.** Teal identifies storyboard, blue identifies first scene, and orange identifies followup requests. Keep the same mapping in text, tables and plot marks.

## Typography

The system sans stack in the frontmatter serves headings, Korean prose, controls and tables. It uses installed fonts only. Monospace is reserved for run identifiers and raw records; the general monospace utility also includes Consolas.

Display, headline and title map to the page heading, section heading and small subsection heading. Body is the reading baseline; label is for controls and metadata; table and summary-number express compact records and summary values. These are observed sizes, not a mathematical type scale. Captions use a smaller, muted treatment with generous line height. Korean prose keeps words together and can wrap long content.

**The Numeric Reading Rule.** Right-align measurements and use tabular numerals; keep labels, units and missing-record wording visible.

## Layout

The centered shell has a maximum width of 1440px and desktop side padding of 48px. The sticky, horizontally scrollable navigation is separated by fine rules. Sections use 54px top / 60px bottom padding. Main comparisons sit beside narrower explanatory notes; detail and methodology use two columns.

At 1050px and below, side padding becomes 28px and secondary columns tighten. At 760px and below, side padding becomes 20px, sections use 36px / 40px padding, primary content stacks, search spans the available width, and native selects wrap. Page/section headings become 29px / 20px. At 1500px and above, body text becomes 16px.

Wide tables scroll within focusable regions. The project ledger retains a sticky header and first column, with a 620px scroll-height limit (520px on mobile); its first column narrows to 190px on mobile. The chart switches its SVG geometry when its own width is below 560px. The mobile legend wraps beneath it. Print styles use a light, text-first report and omit interactive chrome and the plot.

## Elevation & Depth

Depth comes from surface tone, borders and selected rows. The only ambient shadow belongs to the floating chart tooltip. The ledger's sticky-column shadow is a one-pixel separator, not a raised card. Exact shadow and motion values live in the sidecar. Buttons and plot marks use short state transitions; reduced-motion preference removes transitions and smooth scrolling.

**The Flat Surface Rule.** Use tone and fine rules for structure. Reserve the ambient shadow for the floating chart tooltip.

## Shapes

Surface corners use the `surface` radius; inputs, selects, raw-record wells and tooltip use `control`. Table header outer corners are rounded while internal cells remain square. Thin straight rules organize rows and annotation. Stage markers are a circle for storyboard, a softly squared mark for first scene, and a diamond for followup; color is never their only distinction.

## Components

- **Buttons:** restrained outlined actions; the header download is the filled teal variant. Standard actions have a 44px minimum height; compact actions use 40px. Hover changes surface/border, pressed state darkens, and disabled controls use 0.4 opacity. Focus uses a 2px lime outline with 4px offset.
- **Fields:** native search and select controls on the surface tone, with visible labels, a subtle border and the same focus outline. Search has a teal caret; checkbox uses the teal accent. Native select affordances are retained.
- **Navigation:** muted text becomes bright on hover; the active section has a teal bottom rule. Mobile navigation remains horizontally scrollable. A focus-revealed skip link precedes it.
- **Tables and inline detail:** compact rows, muted header bands and right-aligned values. Hover/selection tint the project row; selection also colors the project name. Activating a row or plot mark opens inline detail and moves focus to its heading. Detail uses a flat surface with internal tables and rules, not a modal.
- **Plot and legend:** circle/square/diamond SVG marks share cost/time axes. Marks support pointer, Enter and Space activation. Hover/focus brightens the stroke and reveals a compact tooltip; Escape hides it. The legend repeats the same shape/color mapping.
- **Disclosure and raw records:** native details/summary exposes extra analysis or JSON. Expanded raw-record summaries turn teal; the record itself sits in a bounded, scrollable monospace well. Pagination and download controls reuse the button family.

## Do's and Don'ts

### Do

- Do preserve the Korean system sans stack and monospace identifiers.
- Do pair pipeline color with text and circle, square or diamond marks.
- Do retain visible focus, keyboard-operable plot marks and focus transfer to project detail.
- Do keep wide tables in their own scroll regions and native controls stacked on narrow screens.

### Don't

- Don't add decorative imagery, external fonts, gradients or oversized marketing headings.
- Don't replace analytical tables with metric-card grids.
- Don't use pipeline colors interchangeably or as arbitrary decoration.
- Don't add elevation to ordinary panels or introduce motion beyond the existing state transitions.
