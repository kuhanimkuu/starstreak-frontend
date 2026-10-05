"""Convert light-theme Tailwind colour classes to the Night-sky tokens.

Usage: python scripts/light-to-night.py <file.jsx> [...]
Only class *tokens* are rewritten (word-boundary matches, any variant prefix
such as hover:/focus: is preserved); text content is never touched.
"""
import re
import sys

MAP = {
    # surfaces
    "bg-white": "bg-night-800",
    "bg-white/80": "bg-night-800/80",
    "bg-white/70": "bg-night-800/70",
    "bg-gray-50": "bg-night-850",
    "bg-gray-100": "bg-night-700",
    "bg-gray-200": "bg-night-600",
    "from-gray-50": "from-night-900",
    "from-gray-100": "from-night-850",
    "to-white": "to-night-900",
    "via-white": "via-night-900",
    "to-gray-200": "to-night-700",
    # text
    "text-gray-900": "text-star",
    "text-gray-800": "text-star",
    "text-gray-700": "text-mist",
    "text-gray-600": "text-mist",
    "text-gray-500": "text-dust",
    "text-gray-400": "text-dust",
    "text-black": "text-star",
    # borders
    "border-gray-50": "border-line",
    "border-gray-100": "border-line",
    "border-gray-200": "border-line",
    "border-gray-300": "border-night-600",
    "divide-gray-50": "divide-line",
    "divide-gray-100": "divide-line",
    "divide-gray-200": "divide-line",
    "ring-gray-200": "ring-line",
    "placeholder-gray-400": "placeholder-dust",
    # status tints (light backgrounds → translucent on night)
    "bg-red-50": "bg-red-500/10",
    "bg-red-100": "bg-red-500/15",
    "text-red-600": "text-red-400",
    "text-red-700": "text-red-300",
    "text-red-800": "text-red-300",
    "border-red-200": "border-red-500/30",
    "bg-green-50": "bg-green-500/10",
    "bg-green-100": "bg-green-500/15",
    "text-green-600": "text-green-400",
    "text-green-700": "text-green-300",
    "text-green-800": "text-green-300",
    "border-green-200": "border-green-500/30",
    "bg-orange-50": "bg-flare/10",
    "bg-orange-100": "bg-flare/15",
    "text-orange-600": "text-flare",
    "text-orange-700": "text-flare",
    "border-orange-200": "border-flare/30",
    "bg-amber-50": "bg-amber-500/10",
    "text-amber-600": "text-amber-400",
    "border-amber-200": "border-amber-500/30",
    "bg-yellow-100": "bg-yellow-500/15",
    "text-yellow-700": "text-yellow-300",
    "bg-blue-50": "bg-blue-500/10",
    "text-blue-700": "text-blue-300",
    "border-blue-200": "border-blue-500/30",
}


def convert(text):
    for old, new in MAP.items():
        text = re.sub(r"(?<![\w/-])" + re.escape(old) + r"(?![\w/-])", new, text)
    return text


if __name__ == "__main__":
    for path in sys.argv[1:]:
        src = open(path, encoding="utf-8").read()
        out = convert(src)
        if out != src:
            open(path, "w", encoding="utf-8", newline="\n").write(out)
            print("converted", path)
