#!/usr/bin/env python3
"""Build only the GYUTRON shop and its three locale mirrors.

This wrapper deliberately limits writes to these paths:
  shop/                  public/shop/
  de/shop/               public/de/shop/
  ja/shop/               public/ja/shop/

It reuses the safe template renderer from ``build_i18n.py`` but never iterates
main-site templates.  Do not replace this with the legacy full-site generator.
"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

from build_i18n import (
    CONFIG,
    PUBLIC,
    ROOT,
    TEMPLATES,
    apply_locale_directives,
    load_locale,
    referenced_keys,
    render,
    resolve_includes,
)


SHOP_TEMPLATES = TEMPLATES / "shop"
SHOP_ASSETS = ("shop.css", "shop.js", "shop-i18n.js")


def iter_shop_templates() -> list[Path]:
    if not SHOP_TEMPLATES.exists():
        return []
    return sorted(p for p in SHOP_TEMPLATES.rglob("*.html") if p.is_file())


def audit_keys(templates: list[Path], locales: dict[str, dict[str, str]]) -> list[str]:
    keys: set[str] = set()
    for template in templates:
        rel = template.relative_to(TEMPLATES).as_posix()
        expanded = apply_locale_directives(
            resolve_includes(template.read_text(encoding="utf-8")), "en", rel
        )
        keys |= referenced_keys(expanded)

    report: list[str] = []
    for locale, data in locales.items():
        for key in sorted(keys - set(data)):
            report.append(f"locale {locale}: missing key '{key}'")
    return report


def copy_asset(source: Path, destination: Path) -> bool:
    if source.resolve() == destination.resolve():
        return False
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)
    return True


def build(check_only: bool = False) -> int:
    templates = iter_shop_templates()
    if not templates:
        print("No templates/shop/*.html files found.")
        return 1

    locales = {code: load_locale(code) for code in CONFIG}
    report = audit_keys(templates, locales)
    if report:
        print(f"shop i18n CHECK FAIL ({len(report)}):")
        for item in report[:80]:
            print("  " + item)
        return 1

    if check_only:
        print(f"shop i18n CHECK PASS — {len(templates)} pages x {len(locales)} locales.")
        return 0

    html_written = 0
    asset_copies = 0
    render_report: list[str] = []
    canonical_assets = ROOT / "shop"

    for locale, conf in CONFIG.items():
        data = locales[locale]
        locale_root = ROOT / conf["dir"] if conf["dir"] else ROOT
        source_out_dir = locale_root / "shop"
        public_out_dir = PUBLIC / conf["dir"] / "shop" if conf["dir"] else PUBLIC / "shop"

        for template in templates:
            rel = template.relative_to(TEMPLATES)
            rendered = render(
                template.read_text(encoding="utf-8"),
                locale,
                data,
                render_report,
                f"{locale}/{rel.as_posix()}",
                rel.as_posix(),
            )
            page_rel = rel.relative_to("shop")
            source_page = source_out_dir / page_rel
            public_page = public_out_dir / page_rel
            source_page.parent.mkdir(parents=True, exist_ok=True)
            public_page.parent.mkdir(parents=True, exist_ok=True)
            source_page.write_text(rendered, encoding="utf-8", newline="")
            shutil.copyfile(source_page, public_page)
            html_written += 2

        for asset_name in SHOP_ASSETS:
            asset_source = canonical_assets / asset_name
            if not asset_source.exists():
                print(f"Missing canonical shop asset: {asset_source}")
                return 1
            asset_copies += int(copy_asset(asset_source, source_out_dir / asset_name))
            asset_copies += int(copy_asset(asset_source, public_out_dir / asset_name))

    missing = sorted(set(item for item in render_report if "missing key" in item))
    if missing:
        print(f"shop build completed with {len(missing)} missing keys:")
        for item in missing[:80]:
            print("  " + item)
        return 1

    print(
        f"shop build OK — {len(templates)} pages x {len(locales)} locales "
        f"({html_written} HTML writes, {asset_copies} asset copies); main site untouched."
    )
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="audit shop locale keys; write nothing")
    sys.exit(build(check_only=parser.parse_args().check))
