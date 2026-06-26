# UI Review — Invicta-One

**Scope:** Full static site (7 pages) — `index.html`, `trial-1/2/3-*.html`, `phase2-trial-1/2/3-*.html` — plus shared `css/base.css` and per-theme stylesheets. Audited against the live build (https://felipe-nicolau-visma.github.io/invicta-one) and the source.
**Trigger:** "the website is not well-formatted and is not readable."
**Date:** 2026-06-26
**Method:** Source read + rendered measurement (`getComputedStyle` at 1280px desktop / mobile viewport), WCAG contrast math.

---

## Overall

| | Score |
|---|---|
| **Before** | **14 / 24** |
| **After remediation** | **21 / 24** |

| Pillar | Before | After |
|--------|:------:|:-----:|
| Copywriting       | 3/4 | 3/4 |
| Visuals           | 3/4 | 3/4 |
| Color             | 2/4 | 4/4 |
| Typography        | 1/4 | 4/4 |
| Spacing           | 3/4 | 3/4 |
| Experience Design | 2/4 | 3/4 |

The complaint was correct, and it traced to **two systemic root causes**, not scattered page bugs: (1) a display pixel-font used as body copy at a ~10px root, and (2) muted secondary-text colors below WCAG contrast. Both lived in shared code, so both were fixable centrally.

---

## Findings

### Typography — 1/4 (the headline failure)
`css/base.css` set `html { font-size: clamp(7px, 0.85vw, 10px) }` and `body { font-family: 'Press Start 2P' }`. Press Start 2P is a chunky **display** font whose legibility floor is ~14–16px; everything was sized in `rem` off a 10px root. Measured rendered sizes at a normal 1280px desktop:

| Element | Rendered | |
|---|---|---|
| Body / paragraphs | **8px** | illegible |
| Nav links | 7.5px | |
| Footer | 6px | |
| Labels | **5.5px** | illegible |

Theme files compounded it with `0.45rem`–`0.55rem` declarations (≈ 4.5–9px), and the HTML carried ~60 inline `font-size` overrides plus a 7px SVG label. This single pillar is the whole "not readable" complaint.

### Color — 2/4
Per-theme palettes are characterful, but secondary text failed WCAG AA across **every** theme:

| Theme | `--color-dim` | Contrast | |
|---|---|---|---|
| Holocron | `#443366` | **1.65:1** | fail |
| Kessel Run | `#334455` | **2.07:1** | fail |
| Phase 2 | `#6f5f92` | 3.32:1 | fail |
| Passport | `#7a6a40` | 3.70:1 | fail |
| Architect | `#8a6050` | 3.47:1 | fail |

Plus Holocron's `#8866ff` accent (used for step chips and labels, including hardcoded inline) at **3.5:1**. AA needs 4.5:1 for normal text.

### Copywriting — 3/4
Strong, on-theme content: the passport/trial/visa metaphor is coherent, mission descriptions are clear and specific, microcopy is good. Only nit: heavy ALL-CAPS in a pixel font reads as shouting and worsened the legibility problem — but that's a typography interaction, not a writing flaw. No change needed.

### Visuals — 3/4
Distinctive, well-executed pixel-art system (CSS box-shadow sprites, inline SVG blueprints, scanline CRT overlay, starfield). The craft was real but undermined by unreadable type sitting on top of it. Aesthetic preserved through the fix.

### Spacing — 3/4
Consistent spacing scale (`--s1`…`--s6`), `max-width: 1200px` container, responsive grids that collapse at 768px. No horizontal overflow on any page before or after. Solid.

### Experience Design — 2/4
Good IA (passport home → phase progression → trials, sticky nav, mobile toggle) and interactions (copy-to-clipboard, panel tabs, live "Try It" Claude modal, scroll reveals). But tiny + low-contrast text severely hurt task readability, and continuous animations (scanlines, starfield, blinking) run with no `prefers-reduced-motion` guard.

---

## Remediation (applied this session)

Fixed via a keystone change in `base.css` (cascades to all 7 pages) plus parallel fix-agents — one per theme CSS file and one per HTML file.

**Typography system (`base.css`):**
- Root `font-size` → `clamp(15px, 0.4vw + 13px, 17px)` (≈15px mobile / 17px desktop).
- Added a dual-font system: `--font-body: 'VT323','Courier New',monospace'` for body copy (legible pixel font, with a real fallback if the CDN is blocked), `--font-pixel: 'Press Start 2P'` reserved for headings / hero / nav / labels / buttons only.
- Readability pass bumping all sub-0.68rem shared components (nav, labels, badges, table, footer, tooltip, stat labels).

**Per theme (`passport/kessel-run/architect/holocron/phase2/try-it.css`):**
- Every `0.45–0.6rem` size bumped to legible floors (content ≥0.85rem, labels ≥0.72rem).
- Each `--color-dim` lightened to **≥5:1** (e.g. Holocron 1.65→5.2:1, Kessel 2.07→6.97:1); Holocron `--color-glow` and `--color-danger` raised; same hues, higher luminance — identity preserved.

**Per HTML page:**
- ~60 inline `font-size` overrides bumped (content→0.9rem, labels→0.78rem); decorative/large left alone.
- Inline `#8866ff` text/borders → `var(--color-glow)` (3.5→6.31:1 rendered).
- One SVG blueprint label ("CAMPANHA HUB") 7px → 13px.

**Re-measured after (all 5 rendered themes; the 2 remaining Phase-2 pages share identical CSS):**
- Root **17px** · body copy **19.5px** (was 8px) · smallest UI text **~11px** monospace (was 5.5px) · **no horizontal overflow** · Holocron step chips **6.31:1** · all `--color-dim` tokens **≥5:1**.

---

## Remaining recommendations (not blocking, not done)

- **`prefers-reduced-motion`** — gate the scanline/starfield/blink animations behind a reduced-motion media query (accessibility + battery). ~10 lines in `base.css`.
- **Inline-style debt** — the ~60 inline `font-size`/`color` values are a maintenance hazard (they bypass the design system and re-broke the contrast fix once). Consider migrating them to utility classes.
- **11px code tokens** — artifact filenames (e.g. `PR-Reviewer.md`) render at 0.65rem ≈ 11px. Readable, but bumping the shared rule to 0.75rem would be cleaner.
