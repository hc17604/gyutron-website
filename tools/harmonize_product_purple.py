from __future__ import annotations

import argparse
from pathlib import Path
from PIL import Image

TARGET = (0x4B, 0x2E, 0x83)


def is_purple_accent(r: int, g: int, b: int, a: int) -> bool:
    if a < 24:
        return False
    if b < 70 or r < 35:
        return False
    if g > 105:
        return False
    if b < r * 1.08:
        return False
    if b < g * 1.45:
        return False
    return (max(r, g, b) - min(r, g, b)) >= 35


def harmonize_pixel(r: int, g: int, b: int) -> tuple[int, int, int]:
    # Preserve product lighting while locking hue/family to GYUTRON logo purple.
    source_peak = max(r, g, b)
    scale = source_peak / max(TARGET)
    scale = max(0.5, min(1.15, scale))
    return tuple(max(0, min(255, round(channel * scale))) for channel in TARGET)


def harmonize(input_path: Path, output_path: Path) -> int:
    image = Image.open(input_path).convert("RGBA")
    pixels = image.load()
    changed = 0

    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if is_purple_accent(r, g, b, a):
                nr, ng, nb = harmonize_pixel(r, g, b)
                pixels[x, y] = (nr, ng, nb, a)
                changed += 1

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path)
    return changed


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize GYUTRON generated product purple accents to #4b2e83.")
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()

    changed = harmonize(args.input, args.out)
    print(f"Wrote {args.out} with {changed} accent pixels harmonized to #4b2e83")


if __name__ == "__main__":
    main()
