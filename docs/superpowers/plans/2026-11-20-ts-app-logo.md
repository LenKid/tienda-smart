# Tienda Smart TS App Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the approved Tienda Smart TS monogram as a standalone 512px SVG app icon.

**Architecture:** Add one self-contained SVG in `assets/images/` using vector shapes, the approved dark/blue/white/green palette, and no external font or raster dependency.

**Tech Stack:** SVG 1.1-compatible markup.

**Spec:** `docs/superpowers/specs/2026-11-20-ts-app-logo-design.md`

## Global Constraints

- Canvas: 512 × 512 viewBox.
- Background: rounded dark square using `#111827`.
- Monogram: blue T using `#208AEF` and white S using `#FFFFFF`.
- Accent: small green dot using `#4ADE80`.
- Preserve at least 48 px of safe space around the monogram.
- Use vector paths and shapes only.

## Review Focus

- Small-size clarity: the T and S must remain distinguishable at 32 px.
- Safe-area overlap: no monogram shape should touch or clip the outer edge.
- Color accuracy: preserve the exact approved palette values.
- SVG portability: no external fonts, stylesheets, scripts, or embedded images.
- Icon rendering: the root should have `viewBox="0 0 512 512"` and preserve a square shape.

---

### Task 1: Create the Tienda Smart SVG

**Files:**
- Create: `assets/images/tienda-smart-logo.svg`

**Interfaces:**
- Consumes: the approved palette and geometry in the design spec.
- Produces: a standalone SVG at `assets/images/tienda-smart-logo.svg`.

- [ ] **Step 1: Create the SVG document**

Create `assets/images/tienda-smart-logo.svg` with:

- `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title desc">`.
- `<title id="title">Tienda Smart logo</title>`.
- `<desc id="desc">Interlocking blue and white TS monogram on a dark rounded square with a green accent.</desc>`.
- A rounded dark square background.
- A blue T shape and white S shape scaled to maintain the 48 px safe area.
- A single green dot accent.

- [ ] **Step 2: Verify SVG structure**

Run:

```powershell
$svg = Get-Content assets/images/tienda-smart-logo.svg -Raw
$svg.Contains('viewBox="0 0 512 512"')
$svg.Contains('#208AEF')
$svg.Contains('#FFFFFF')
$svg.Contains('#4ADE80')
$svg.Contains('#111827')
$svg -notmatch '<(?:image|text|foreignObject)\b'
```

Expected: each palette and structure check prints `True`, and the final check prints `True`.

- [ ] **Step 3: Render visual checks**

Open the SVG directly in the browser or VS Code preview and inspect it at 512, 128, 64, and 32 px.

Expected: the monogram remains recognizable and the green dot remains secondary.

- [ ] **Step 4: Commit the logo**

Run:

```powershell
git add assets/images/tienda-smart-logo.svg
git diff --cached --check
git diff --cached --stat
git -c core.editor=true commit -m "feat: add Tienda Smart app logo" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Expected: the SVG is committed without whitespace errors.
