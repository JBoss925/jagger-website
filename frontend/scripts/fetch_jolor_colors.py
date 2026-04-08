#!/usr/bin/env python3

from __future__ import annotations

import html
import json
import random
import re
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

URLS = [
    "https://en.wikipedia.org/wiki/List_of_colors:_A%E2%80%93F",
    "https://en.wikipedia.org/wiki/List_of_colors:_G%E2%80%93M",
    "https://en.wikipedia.org/wiki/List_of_colors:_N%E2%80%93Z",
]

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "src" / "features" / "games" / "jolor"
ALL_COLORS_PATH = OUTPUT_DIR / "all_colors.json"
SHUFFLED_COLORS_PATH = OUTPUT_DIR / "shuffled_colors.json"
SHUFFLE_SEED = 9252026


def strip_tags(value: str) -> str:
    value = re.sub(r"<br\s*/?>", " ", value, flags=re.IGNORECASE)
    value = re.sub(r"<[^>]+>", "", value)
    return html.unescape(value).replace("\xa0", " ").strip()


def normalize_hex(value: str) -> str | None:
    match = re.search(r"#([0-9A-Fa-f]{6})\b", value)
    if not match:
      return None
    return f"#{match.group(1).upper()}"


class ColorTableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_target_table = False
        self.target_table_found = False
        self.in_row = False
        self.current_row: list[str] = []
        self.current_cell: list[str] = []
        self.capture_cell = False
        self.colors: list[dict[str, object]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_map = dict(attrs)

        if tag == "table" and not self.target_table_found:
            class_name = attrs_map.get("class") or ""
            if "wikitable" in class_name and "sortable" in class_name:
                self.in_target_table = True
                self.target_table_found = True
            return

        if not self.in_target_table:
            return

        if tag == "tr":
            self.in_row = True
            self.current_row = []
            return

        if self.in_row and tag == "td":
            self.capture_cell = True
            self.current_cell = []

    def handle_endtag(self, tag: str) -> None:
        if not self.in_target_table:
            return

        if self.in_row and tag == "td" and self.capture_cell:
            self.capture_cell = False
            self.current_row.append("".join(self.current_cell))
            self.current_cell = []
            return

        if tag == "tr" and self.in_row:
            self._finish_row()
            self.in_row = False
            self.current_row = []
            return

        if tag == "table" and self.in_target_table:
            self.in_target_table = False

    def handle_data(self, data: str) -> None:
        if self.capture_cell:
            self.current_cell.append(data)

    def _finish_row(self) -> None:
        if len(self.current_row) < 2:
            return

        name = strip_tags(self.current_row[0])
        hex_value = normalize_hex(self.current_row[1])
        if not name or not hex_value:
            return

        rgb = [int(hex_value[index:index + 2], 16) for index in (1, 3, 5)]
        self.colors.append({
            "name": name,
            "hex": hex_value,
            "rgb": rgb,
        })


def fetch_html(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8", errors="replace")


def main() -> None:
    seen: set[tuple[str, str]] = set()
    all_colors: list[dict[str, object]] = []

    for url in URLS:
        parser = ColorTableParser()
        parser.feed(fetch_html(url))
        for entry in parser.colors:
            key = (str(entry["name"]).lower(), str(entry["hex"]))
            if key in seen:
                continue
            seen.add(key)
            all_colors.append(entry)

    all_colors.sort(key=lambda entry: (str(entry["name"]).lower(), str(entry["hex"])))

    shuffled_colors = list(all_colors)
    random.Random(SHUFFLE_SEED).shuffle(shuffled_colors)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ALL_COLORS_PATH.write_text(json.dumps(all_colors, indent=2) + "\n", encoding="utf-8")
    SHUFFLED_COLORS_PATH.write_text(json.dumps(shuffled_colors, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote {len(all_colors)} colors to {ALL_COLORS_PATH}")
    print(f"Wrote {len(shuffled_colors)} shuffled colors to {SHUFFLED_COLORS_PATH}")


if __name__ == "__main__":
    main()
