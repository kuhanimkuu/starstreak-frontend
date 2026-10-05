"""Convert the ops console's dark-grey/orange Tailwind classes to Night-sky tokens.

Usage: python scripts/grey-to-night.py <file.jsx> [...]
Rewrites class tokens only (any variant prefix such as hover:/focus: and any
/opacity suffix is preserved). Text content is never touched.
"""
import re
import sys

GRAY = {
    "bg": {"950": "night-950", "900": "night-850", "850": "night-850", "800": "night-800",
           "700": "night-700", "600": "night-600", "500": "night-500"},
    "border": {"900": "line", "800": "line", "700": "night-600", "600": "night-500", "500": "night-500"},
    "divide": {"800": "line", "700": "night-600"},
    "ring": {"800": "line", "700": "night-600"},
    "text": {"100": "star", "200": "star", "300": "mist", "400": "mist", "500": "dust", "600": "dust", "700": "night-500"},
    "placeholder": {"400": "dust", "500": "dust", "600": "dust"},
    "from": {"900": "night-850", "800": "night-800"},
    "to": {"900": "night-850", "800": "night-800"},
}

ORANGE = {"300": "amber", "400": "flare-soft", "500": "flare", "600": "flare-deep",
          "700": "flare-deep", "800": "flare-deep", "900": "flare-deep", "950": "flare-deep"}

TOKEN = re.compile(
    r"(?<![\w-])((?:[a-z0-9-]+:)*)(bg|text|border|divide|ring|placeholder|from|to|via)-(gray|orange)-(\d{2,3})(/\d+)?(?![\w-])"
)


def repl(m):
    variants, util, hue, shade, opacity = m.groups()
    opacity = opacity or ""
    if hue == "gray":
        new = GRAY.get(util, {}).get(shade)
    else:
        new = ORANGE.get(shade)
    if not new:
        return m.group(0)
    return f"{variants}{util}-{new}{opacity}"


def convert(text):
    text = TOKEN.sub(repl, text)
    text = re.sub(r"(?<![\w-])((?:[a-z0-9-]+:)*)text-white(?![\w/-])", r"\1text-star", text)
    return text


if __name__ == "__main__":
    for path in sys.argv[1:]:
        src = open(path, encoding="utf-8").read()
        out = convert(src)
        if out != src:
            open(path, "w", encoding="utf-8").write(out)
            print("converted", path)
