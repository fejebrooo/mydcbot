#!/usr/bin/env python3
"""
makegif.py
  Mode 1 (image): python3 makegif.py image <input> <output> [caption]
  Mode 2 (text):  python3 makegif.py text <output> <username> <avatar_path> <message_text>
"""
import sys
import datetime
from PIL import Image, ImageDraw, ImageFont

BOLD    = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
REGULAR = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
FALLBACK_BOLD    = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FALLBACK_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def get_font(size, bold=False):
    paths = [BOLD, FALLBACK_BOLD] if bold else [REGULAR, FALLBACK_REGULAR]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except:
            continue
    return ImageFont.load_default()

def wrap_text(draw, text, font, max_width):
    words = text.split()
    lines, cur = [], []
    for word in words:
        test = " ".join(cur + [word])
        bb = draw.textbbox((0, 0), test, font=font)
        if bb[2] > max_width and cur:
            lines.append(" ".join(cur))
            cur = [word]
        else:
            cur.append(word)
    if cur:
        lines.append(" ".join(cur))
    return lines or [""]

def circle_crop(img, size):
    img = img.convert("RGBA").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size, size), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out

# ── caption bar for image/gif mode ─────────────────────────────────────────
def make_caption_bar(width, text):
    if not text:
        return None
    font_size = max(32, int(width * 0.11))
    font = get_font(font_size, bold=True)
    dummy_draw = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    lines = wrap_text(dummy_draw, text, font, width - 30)
    pad_v   = int(font_size * 0.45)
    line_h  = int(font_size * 1.2)
    bar_h   = pad_v * 2 + line_h * len(lines)
    bar     = Image.new("RGB", (width, bar_h), "white")
    draw    = ImageDraw.Draw(bar)
    y = pad_v
    for line in lines:
        bb  = draw.textbbox((0, 0), line, font=font)
        x   = (width - (bb[2] - bb[0])) // 2
        out = max(2, font_size // 14)
        for dx in range(-out, out + 1):
            for dy in range(-out, out + 1):
                if dx or dy:
                    draw.text((x+dx, y+dy), line, fill="black", font=font)
        draw.text((x, y), line, fill="white", font=font)
        y += line_h
    return bar

# ── Discord message card ────────────────────────────────────────────────────
def make_discord_card(output_path, username, avatar_path, message_text):
    # render at 2× then downscale for crisp anti-aliasing
    S = 2

    BG          = (49,  51,  56,  255)   # Discord dark
    NAME_COLOR  = (255, 255, 255, 255)
    MSG_COLOR   = (220, 221, 222, 255)
    TIME_COLOR  = (148, 155, 164, 255)

    PAD         = 16 * S
    AVATAR_SIZE = 40 * S
    GAP         = 12 * S          # gap between avatar and text
    TOP_PAD     = 10 * S
    BOT_PAD     = 10 * S

    NAME_SIZE   = 17 * S
    MSG_SIZE    = 16 * S
    TIME_SIZE   = 12 * S

    font_name = get_font(NAME_SIZE, bold=True)
    font_msg  = get_font(MSG_SIZE,  bold=False)
    font_time = get_font(TIME_SIZE, bold=False)

    W         = 550 * S
    text_x    = PAD + AVATAR_SIZE + GAP
    max_text_w = W - text_x - PAD

    dummy_draw = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    lines  = wrap_text(dummy_draw, message_text, font_msg, max_text_w)
    name_h = int(NAME_SIZE * 1.25)
    line_h = int(MSG_SIZE  * 1.4)
    msg_h  = len(lines) * line_h

    H = TOP_PAD + max(AVATAR_SIZE, name_h + msg_h) + BOT_PAD

    img  = Image.new("RGBA", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Avatar
    try:
        av = Image.open(avatar_path)
        av_circ = circle_crop(av, AVATAR_SIZE)
        img.paste(av_circ, (PAD, TOP_PAD), av_circ)
    except:
        draw.ellipse((PAD, TOP_PAD, PAD+AVATAR_SIZE, TOP_PAD+AVATAR_SIZE),
                     fill=(100, 100, 110, 255))
        fl = get_font(AVATAR_SIZE // 2, bold=True)
        letter = username[0].upper() if username else "?"
        lb = dummy_draw.textbbox((0, 0), letter, font=fl)
        lw, lh = lb[2]-lb[0], lb[3]-lb[1]
        draw.text((PAD+(AVATAR_SIZE-lw)//2, TOP_PAD+(AVATAR_SIZE-lh)//2),
                  letter, fill=(220,220,225,255), font=fl)

    # Username + timestamp
    y = TOP_PAD
    draw.text((text_x, y), username, fill=NAME_COLOR, font=font_name)
    nb = dummy_draw.textbbox((0, 0), username, font=font_name)
    nw = nb[2] - nb[0]

    now = datetime.datetime.now().strftime("%-I:%M %p")   # e.g. 6:59 PM
    draw.text((text_x + nw + 6*S, y + int(NAME_SIZE * 0.15)),
              now, fill=TIME_COLOR, font=font_time)

    y += name_h

    # Message lines
    for line in lines:
        draw.text((text_x, y), line, fill=MSG_COLOR, font=font_msg)
        y += line_h

    # Downscale 2× for smooth edges
    final = img.resize((W // S, H // S), Image.LANCZOS)

    # Convert to GIF (palette, keep transparency via matte)
    bg_fill = Image.new("RGBA", final.size, BG)
    bg_fill.paste(final, mask=final.split()[3])
    bg_fill.convert("P", palette=Image.ADAPTIVE, colors=255).save(
        output_path, format="GIF"
    )
    print(f"OK:{output_path}")

# ── image / gif with caption bar ───────────────────────────────────────────
def process_image(input_path, output_path, caption):
    img    = Image.open(input_path)
    is_gif = getattr(img, "is_animated", False) or input_path.lower().endswith(".gif")

    if is_gif:
        frames, durations, bar = [], [], None
        try:
            i = 0
            while True:
                img.seek(i)
                frame = img.convert("RGBA")
                w, h  = frame.size
                if bar is None and caption:
                    bar = make_caption_bar(w, caption)
                if bar:
                    combined = Image.new("RGBA", (w, bar.height + h))
                    combined.paste(bar.convert("RGBA"), (0, 0))
                    combined.paste(frame, (0, bar.height))
                else:
                    combined = frame
                frames.append(combined.convert("P", palette=Image.ADAPTIVE, colors=256))
                durations.append(img.info.get("duration", 100))
                i += 1
        except EOFError:
            pass
        if not frames:
            sys.exit("No frames")
        frames[0].save(output_path, save_all=True, append_images=frames[1:],
                       loop=0, duration=durations, format="GIF")
    else:
        frame = img.convert("RGBA")
        w, h  = frame.size
        if caption:
            bar      = make_caption_bar(w, caption)
            combined = Image.new("RGBA", (w, bar.height + h))
            combined.paste(bar.convert("RGBA"), (0, 0))
            combined.paste(frame, (0, bar.height))
        else:
            combined = frame
        combined.convert("P", palette=Image.ADAPTIVE, colors=256).save(
            output_path, format="GIF")

    print(f"OK:{output_path}")

# ── entry point ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Usage: makegif.py <image|text> ...")

    mode = sys.argv[1]

    if mode == "image":
        if len(sys.argv) < 4:
            sys.exit("Usage: makegif.py image <input> <output> [caption]")
        process_image(sys.argv[2], sys.argv[3],
                      sys.argv[4] if len(sys.argv) > 4 else "")

    elif mode == "text":
        if len(sys.argv) < 6:
            sys.exit("Usage: makegif.py text <output> <username> <avatar_path> <message>")
        make_discord_card(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])

    else:
        sys.exit(f"Unknown mode: {mode}")
