#!/usr/bin/env python3
"""
makegif.py — adds a bold black-on-white caption to an image or GIF
Usage: python3 makegif.py <input_path> <output_path> [caption text]
"""
import sys
import os
from PIL import Image, ImageDraw, ImageFont

FONT_PATHS = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    "/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf",
]


def get_font(size):
    for path in FONT_PATHS:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()


def wrap_text(draw, text, font, max_width):
    words = text.upper().split()
    lines = []
    current = []
    for word in words:
        test = " ".join(current + [word])
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] > max_width - 40 and current:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    return lines


def make_caption_bar(width, text):
    if not text:
        return None

    font_size = max(36, int(width * 0.13))
    font = get_font(font_size)

    dummy = Image.new("RGB", (1, 1))
    draw = ImageDraw.Draw(dummy)
    lines = wrap_text(draw, text.upper(), font, width)

    padding_v = int(font_size * 0.5)
    line_gap = int(font_size * 0.15)
    line_height = font_size + line_gap
    bar_height = padding_v * 2 + line_height * len(lines)

    bar = Image.new("RGB", (width, bar_height), "white")
    draw = ImageDraw.Draw(bar)

    y = padding_v
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        text_w = bbox[2] - bbox[0]
        x = (width - text_w) // 2
        for dx, dy in [(-2,0),(2,0),(0,-2),(0,2),(-1,-1),(1,-1),(-1,1),(1,1)]:
            draw.text((x + dx, y + dy), line, fill=(30, 30, 30), font=font)
        draw.text((x, y), line, fill="black", font=font)
        y += line_height

    return bar


def process(input_path, output_path, caption):
    img = Image.open(input_path)
    is_gif = getattr(img, "is_animated", False) or input_path.lower().endswith(".gif")

    if is_gif:
        frames = []
        durations = []
        bar = None
        try:
            i = 0
            while True:
                img.seek(i)
                frame = img.convert("RGBA")
                w, h = frame.size
                if bar is None and caption:
                    bar = make_caption_bar(w, caption)
                if bar:
                    bar_rgba = bar.convert("RGBA")
                    combined = Image.new("RGBA", (w, bar.height + h))
                    combined.paste(bar_rgba, (0, 0))
                    combined.paste(frame, (0, bar.height))
                else:
                    combined = frame
                frames.append(combined.convert("P", palette=Image.ADAPTIVE, colors=256))
                try:
                    dur = img.info.get("duration", 100)
                except Exception:
                    dur = 100
                durations.append(dur)
                i += 1
        except EOFError:
            pass

        if not frames:
            sys.exit("No frames found in GIF")

        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            loop=0,
            duration=durations,
            format="GIF",
        )
    else:
        frame = img.convert("RGBA")
        w, h = frame.size
        if caption:
            bar = make_caption_bar(w, caption)
            combined = Image.new("RGBA", (w, bar.height + h))
            combined.paste(bar.convert("RGBA"), (0, 0))
            combined.paste(frame, (0, bar.height))
        else:
            combined = frame
        combined.convert("P", palette=Image.ADAPTIVE, colors=256).save(
            output_path, format="GIF"
        )

    print(f"OK:{output_path}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: makegif.py <input> <output> [caption]")
        sys.exit(1)
    inp = sys.argv[1]
    out = sys.argv[2]
    cap = sys.argv[3] if len(sys.argv) > 3 else ""
    process(inp, out, cap)
