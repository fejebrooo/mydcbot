#!/usr/bin/env python3
"""
makegif.py
  Mode 1 (image): python3 makegif.py image <input> <output> [caption]
  Mode 2 (text):  python3 makegif.py text <output> <username> <avatar_path> <message_text>
"""
import sys
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageOps

FONT_PATHS = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    "/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf",
]
FONT_PATHS_REGULAR = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    "/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf",
]

def get_font(size, bold=True):
    paths = FONT_PATHS if bold else FONT_PATHS_REGULAR
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except:
            continue
    return ImageFont.load_default()

def wrap_text(draw, text, font, max_width):
    words = text.split()
    lines = []
    current = []
    for word in words:
        test = " ".join(current + [word])
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] > max_width and current:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    return lines if lines else [""]

def make_caption_bar(width, text):
    if not text:
        return None
    font_size = max(32, int(width * 0.11))
    font = get_font(font_size, bold=True)
    dummy = Image.new("RGB", (1, 1))
    draw = ImageDraw.Draw(dummy)
    lines = wrap_text(draw, text, font, width - 30)
    padding_v = int(font_size * 0.45)
    line_height = int(font_size * 1.2)
    bar_height = padding_v * 2 + line_height * len(lines)
    bar = Image.new("RGB", (width, bar_height), "white")
    draw = ImageDraw.Draw(bar)
    y = padding_v
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        text_w = bbox[2] - bbox[0]
        x = (width - text_w) // 2
        outline = max(2, font_size // 14)
        for dx in range(-outline, outline + 1):
            for dy in range(-outline, outline + 1):
                if dx != 0 or dy != 0:
                    draw.text((x + dx, y + dy), line, fill="black", font=font)
        draw.text((x, y), line, fill="white", font=font)
        y += line_height
    return bar

def circle_crop(img, size):
    img = img.convert("RGBA").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    result = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    result.paste(img, (0, 0), mask)
    return result

def make_discord_message_gif(output_path, username, avatar_path, message_text):
    # Discord dark theme colors
    BG_COLOR = (49, 51, 56)          # Discord dark bg
    CARD_COLOR = (47, 49, 54)        # slightly different card
    USERNAME_COLOR = (255, 255, 255)
    MESSAGE_COLOR = (220, 221, 222)
    TIMESTAMP_COLOR = (148, 155, 164)

    W = 600
    PADDING = 20
    AVATAR_SIZE = 44
    font_name = get_font(18, bold=True)
    font_msg = get_font(17, bold=False)
    font_time = get_font(13, bold=False)

    dummy = Image.new("RGB", (1, 1))
    draw_dummy = ImageDraw.Draw(dummy)

    # Wrap message text
    max_text_w = W - PADDING * 2 - AVATAR_SIZE - 14
    msg_lines = wrap_text(draw_dummy, message_text, font_msg, max_text_w)

    line_h = 22
    top_padding = PADDING
    bottom_padding = PADDING
    name_h = 24
    msg_h = len(msg_lines) * line_h
    H = top_padding + AVATAR_SIZE + bottom_padding
    H = max(H, top_padding + name_h + msg_h + bottom_padding + 10)

    img = Image.new("RGBA", (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Load and circle-crop avatar
    try:
        av = Image.open(avatar_path)
        av_circle = circle_crop(av, AVATAR_SIZE)
        img.paste(av_circle, (PADDING, PADDING), av_circle)
    except:
        # fallback grey circle
        draw.ellipse(
            (PADDING, PADDING, PADDING + AVATAR_SIZE, PADDING + AVATAR_SIZE),
            fill=(100, 100, 100)
        )

    text_x = PADDING + AVATAR_SIZE + 14
    y = PADDING + 2

    # Username
    draw.text((text_x, y), username, fill=USERNAME_COLOR, font=font_name)
    name_bbox = draw_dummy.textbbox((0, 0), username, font=font_name)
    name_w = name_bbox[2] - name_bbox[0]

    # Timestamp next to name
    import datetime
    now = datetime.datetime.now().strftime("Today at %I:%M %p")
    draw.text((text_x + name_w + 10, y + 3), now, fill=TIMESTAMP_COLOR, font=font_time)

    y += name_h + 2

    # Message lines
    for line in msg_lines:
        draw.text((text_x, y), line, fill=MESSAGE_COLOR, font=font_msg)
        y += line_h

    # Save as GIF
    img.convert("P", palette=Image.ADAPTIVE, colors=256).save(
        output_path, format="GIF"
    )
    print(f"OK:{output_path}")

def process_image(input_path, output_path, caption):
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
                except:
                    dur = 100
                durations.append(dur)
                i += 1
        except EOFError:
            pass
        if not frames:
            sys.exit("No frames found in GIF")
        frames[0].save(
            output_path, save_all=True, append_images=frames[1:],
            loop=0, duration=durations, format="GIF",
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
        combined.convert("P", palette=Image.ADAPTIVE, colors=256).save(output_path, format="GIF")

    print(f"OK:{output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: makegif.py <mode> ...")
        sys.exit(1)

    mode = sys.argv[1]

    if mode == "image":
        # image <input> <output> [caption]
        if len(sys.argv) < 4:
            sys.exit("Usage: makegif.py image <input> <output> [caption]")
        inp = sys.argv[2]
        out = sys.argv[3]
        cap = sys.argv[4] if len(sys.argv) > 4 else ""
        process_image(inp, out, cap)

    elif mode == "text":
        # text <output> <username> <avatar_path> <message>
        if len(sys.argv) < 6:
            sys.exit("Usage: makegif.py text <output> <username> <avatar_path> <message>")
        out = sys.argv[2]
        uname = sys.argv[3]
        avatar = sys.argv[4]
        msg = sys.argv[5]
        make_discord_message_gif(out, uname, avatar, msg)

    else:
        sys.exit(f"Unknown mode: {mode}")