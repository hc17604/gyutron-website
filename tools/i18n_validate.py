#!/usr/bin/env python3
"""Validate the GYUTRON localization scaffold."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
LOCALES_DIR = ROOT / "locales"
CONFIG_PATH = LOCALES_DIR / "i18n.config.json"
RESERVED_KEYS = {"_meta", "__fallbackLocale", "__sourceNamespace", "__todo"}


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def flatten_keys(value: Any, prefix: str = "") -> set[str]:
    if not isinstance(value, dict):
        return {prefix} if prefix else set()

    keys: set[str] = set()
    for key, child in value.items():
        if key in RESERVED_KEYS:
            continue
        child_prefix = f"{prefix}.{key}" if prefix else key
        if isinstance(child, dict):
            keys.update(flatten_keys(child, child_prefix))
        else:
            keys.add(child_prefix)
    return keys


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate locale files.")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Fail when target locales do not mirror source locale keys.",
    )
    args = parser.parse_args()

    errors: list[str] = []
    warnings: list[str] = []
    fallback_namespaces = 0

    if not CONFIG_PATH.exists():
        print(f"Missing config: {CONFIG_PATH}", file=sys.stderr)
        return 1

    config = load_json(CONFIG_PATH)
    source_locale = config["sourceLocale"]
    source_folder = next(
        locale["folder"] for locale in config["locales"] if locale["code"] == source_locale
    )
    namespaces = config["namespaces"]

    source_keys: dict[str, set[str]] = {}
    for namespace in namespaces:
        source_path = LOCALES_DIR / source_folder / f"{namespace}.json"
        if not source_path.exists():
            errors.append(f"Missing source namespace: {source_path}")
            continue
        source_data = load_json(source_path)
        source_keys[namespace] = flatten_keys(source_data)

    for locale in config["locales"]:
        folder = locale["folder"]
        code = locale["code"]
        for namespace in namespaces:
            locale_path = LOCALES_DIR / folder / f"{namespace}.json"
            if not locale_path.exists():
                errors.append(f"Missing locale file for {code}: {locale_path}")
                continue

            data = load_json(locale_path)
            if folder == source_folder:
                continue

            locale_keys = flatten_keys(data)
            missing = sorted(source_keys.get(namespace, set()) - locale_keys)
            extra = sorted(locale_keys - source_keys.get(namespace, set()))
            fallback = data.get("__fallbackLocale")

            if missing:
                message = (
                    f"{code}/{namespace}: {len(missing)} missing source keys "
                    f"(fallback={fallback or 'none'})"
                )
                if args.strict:
                    errors.append(message)
                elif fallback:
                    fallback_namespaces += 1
                else:
                    warnings.append(message)
            if extra:
                message = f"{code}/{namespace}: {len(extra)} extra keys not in source"
                if args.strict:
                    errors.append(message)
                else:
                    warnings.append(message)

    if warnings:
        print("i18n warnings:")
        for warning in warnings:
            print(f"  - {warning}")

    if errors:
        print("i18n errors:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    mode = "strict" if args.strict else "scaffold"
    if fallback_namespaces and not args.strict:
        print(
            f"i18n scaffold note: {fallback_namespaces} planned locale namespaces "
            "currently fall back to English."
        )
    print(f"i18n {mode} check passed for {len(config['locales'])} locales.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
