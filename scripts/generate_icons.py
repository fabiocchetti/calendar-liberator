#!/usr/bin/env python3
"""Generate CalendarLiberator brand assets.

Flat, minimal design: solid brand-purple rounded tile with a white calendar
glyph containing a broken chain — the "liberation" concept.

Draws at 8x supersampling and downscales with LANCZOS for crisp edges.
Details are simplified at small sizes so the glyph stays legible at 16px.

Usage: .venv/bin/python scripts/generate_icons.py
Outputs:
  icons/icon-{16,32,48,128}.png   extension icons (referenced by manifest.json)
  assets/logo-512.png             icon master for store listings
  assets/logo-horizontal.png      full logo (icon + wordmark, dark text)
  assets/logo-horizontal-white.png  full logo for dark backgrounds
"""

from PIL import Image, ImageDraw, ImageFont
import os

BRAND = (91, 80, 214, 255)      # #5B50D6
WHITE = (255, 255, 255, 255)
INK = (28, 27, 41, 255)         # #1C1B29

SUPER = 8  # supersampling factor

# San Francisco (system font on macOS) for the wordmark
SF_FONT = "/System/Library/Fonts/SFNS.ttf"


def draw_chain(d, u, stroke, cy=58):
    """Draw a broken chain link: a single stadium outline snapped in two.

    The link is drawn whole, then a band of tile color punches the gap, so
    the two pieces stay perfectly aligned — instantly readable as "broken"
    even at small sizes. Geometry in the 100x100 design space, centered on
    (50, cy). Drawn horizontal; the caller rotates it -45° (classic
    "broken link" diagonal).
    """
    sw = int(round(stroke * u))

    # The link: one stadium-shaped outline
    d.rounded_rectangle(
        [30 * u, cy * u - 10 * u, 70 * u, cy * u + 10 * u],
        radius=10 * u,
        outline=WHITE,
        width=sw,
    )

    # The break: punch a band of tile color through the middle
    d.rectangle(
        [45 * u, cy * u - 13 * u, 55 * u, cy * u + 13 * u],
        fill=BRAND,
    )


def draw_icon(size):
    s = size * SUPER
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    u = s / 100.0  # 1% of canvas

    # --- Tile: rounded square, solid brand purple -------------------------
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=22 * u, fill=BRAND)

    # --- Calendar glyph ----------------------------------------------------
    if size <= 16:
        stroke = 10.0
        body = [20, 27, 80, 79]
        show_chain = False
    elif size <= 32:
        stroke = 8.0
        body = [18, 25, 82, 81]
        show_chain = True
    else:
        stroke = 6.5
        body = [18, 24, 82, 82]
        show_chain = True

    sw = int(round(stroke * u))

    # Binder rings
    ring_w = stroke * 0.85 * u
    for cx in (36, 64):
        d.rounded_rectangle(
            [cx * u - ring_w / 2, 14 * u, cx * u + ring_w / 2, 30 * u],
            radius=ring_w / 2,
            fill=WHITE,
        )

    # Body outline
    d.rounded_rectangle(
        [body[0] * u, body[1] * u, body[2] * u, body[3] * u],
        radius=11 * u,
        outline=WHITE,
        width=sw,
    )

    # Header divider line
    header_y = (40 if size <= 16 else 38) * u
    d.line(
        [body[0] * u + sw / 2, header_y, body[2] * u - sw / 2, header_y],
        fill=WHITE,
        width=sw,
    )

    # --- Broken chain (the liberated link) ---------------------------------
    # Omitted at 16px, where it would just be noise.
    if show_chain:
        chain = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        cd = ImageDraw.Draw(chain)
        chain_stroke = stroke * (1.15 if size <= 32 else 1.0)
        draw_chain(cd, u, chain_stroke)
        chain = chain.rotate(-45, center=(50 * u, 58 * u), resample=Image.BICUBIC)
        img.alpha_composite(chain)

    return img.resize((size, size), Image.LANCZOS)


def draw_lockup(text_color, out_path, icon_size=256, font_size=150):
    """Full logo: icon tile + 'CalendarLiberator' wordmark."""
    icon = draw_icon(icon_size * SUPER // 8)  # already supersampled internally
    icon = icon.resize((icon_size, icon_size), Image.LANCZOS)

    font = ImageFont.truetype(SF_FONT, font_size)

    # Measure text
    probe = Image.new("RGBA", (10, 10))
    pd = ImageDraw.Draw(probe)
    bbox = pd.textbbox((0, 0), "CalendarLiberator", font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

    gap = int(icon_size * 0.28)
    pad = 10  # transparent padding around the composition
    W = icon_size + gap + tw + pad * 2
    H = max(icon_size, th) + pad * 2

    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    img.alpha_composite(icon, (pad, (H - icon_size) // 2))

    d = ImageDraw.Draw(img)
    tx = pad + icon_size + gap
    ty = (H - th) // 2 - bbox[1]
    d.text((tx, ty), "CalendarLiberator", font=font, fill=text_color)

    img.save(out_path)
    print(f"  {out_path}")


def main():
    os.makedirs("icons", exist_ok=True)
    os.makedirs("assets", exist_ok=True)

    for size in (16, 32, 48, 128):
        path = f"icons/icon-{size}.png"
        draw_icon(size).save(path)
        print(f"  {path}")

    # Large master for store listings / documentation
    draw_icon(512).save("assets/logo-512.png")
    print("  assets/logo-512.png")

    # Full lockups
    draw_lockup(INK, "assets/logo-horizontal.png")
    draw_lockup(WHITE, "assets/logo-horizontal-white.png")


if __name__ == "__main__":
    main()
