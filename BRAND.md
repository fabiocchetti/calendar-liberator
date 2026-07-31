# Brand Identity — CalendarLiberator

Minimal, flat, honest. No gradients, no shadows, no animations.

## Logo

A white calendar glyph on a solid brand-purple rounded tile, containing a
chain link snapped in two — the liberation concept. The link is drawn whole
and the gap is punched through it, so the two pieces stay aligned and read
instantly even at small sizes.

- Source: generated programmatically by `scripts/generate_icons.py`
- Icon master: `assets/logo-512.png`
- Full lockup (icon + wordmark): `assets/logo-horizontal.png` (dark text,
  for light backgrounds) and `assets/logo-horizontal-white.png` (white text,
  for dark backgrounds)
- Icon sizes: `icons/icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`

The wordmark "CalendarLiberator" is set in San Francisco (the system font),
regular weight, no tracking tricks — the same typeface the product UI uses.

To regenerate after changing the design or palette:

```bash
python3 -m venv .venv
.venv/bin/pip install Pillow
.venv/bin/python scripts/generate_icons.py
```

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| Primary | `#5B50D6` | Brand color, primary button, links, progress |
| Primary hover | `#4C43BC` | Hover state |
| Primary active | `#3F389F` | Pressed state |
| Primary soft | `#EEEDFA` | Subtle tint backgrounds |
| Surface | `#FFFFFF` | Cards, popup background |
| Background | `#F7F6FB` | Secondary areas, status bar |
| Border | `#E1DFEE` | Default borders |
| Border strong | `#C7C4DF` | Hover borders |
| Text | `#1C1B29` | Primary text |
| Text muted | `#63617A` | Secondary text, labels |
| Success | `#2E7D5B` | Success states |
| Error | `#C33F3F` | Error states |

Dark mode adapts the same hues (primary becomes `#8B83E4`, surfaces shift to
`#1B1A24` / `#14131B`). See `popup.css` custom properties for the full set.

## Typography

- **Product UI and wordmark:** native system stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
  The extension should feel like a citizen of the user's operating system, not a website —
  and the logo speaks the same typeface as the product.
- **Store / marketing copy:** same system stack. If a distinct brand voice is ever needed
  for headings, use [Inter](https://rsms.me/inter/) (SIL Open Font License), weights 600/700.

## Voice

Direct and factual. The extension does one thing; say what it does, don't
oversell it. Avoid words like "amazing", "revolutionary", "seamless".
