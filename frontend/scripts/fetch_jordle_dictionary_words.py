#!/usr/bin/env python3
from __future__ import annotations

import json
import string
import sys
import urllib.request
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path

WORD_LENGTH = 6
BASE_URL = "https://www.dictionary.com/games/word-finder/words-that-start-with-{letter}/6-letter"
USER_AGENT = "Mozilla/5.0 (compatible; JaggerWebsiteBot/1.0)"

class WordListParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_word_list = False
        self.word_list_depth = 0
        self.in_link = False
        self.current_text: list[str] = []
        self.words: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        class_name = attrs_dict.get("class", "") or ""
        classes = set(class_name.split())

        if tag == "div" and "word-list" in classes:
            self.in_word_list = True
            self.word_list_depth = 1
            return

        if self.in_word_list and tag == "div":
            self.word_list_depth += 1

        if self.in_word_list and tag == "a":
            self.in_link = True
            self.current_text = []

    def handle_endtag(self, tag: str) -> None:
        if self.in_word_list and tag == "a" and self.in_link:
            word = "".join(self.current_text).strip().lower()
            if len(word) == WORD_LENGTH and word.isalpha():
                self.words.append(word)
            self.in_link = False
            self.current_text = []
            return

        if self.in_word_list and tag == "div":
            self.word_list_depth -= 1
            if self.word_list_depth <= 0:
                self.in_word_list = False
                self.word_list_depth = 0

    def handle_data(self, data: str) -> None:
        if self.in_word_list and self.in_link:
            self.current_text.append(data)

@dataclass
class LetterBucket:
    letter: str
    url: str
    words: list[str]


def fetch_html(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", "ignore")


def fetch_letter(letter: str) -> LetterBucket:
    url = BASE_URL.format(letter=letter)
    parser = WordListParser()
    parser.feed(fetch_html(url))
    unique_words = sorted(set(parser.words))
    if not unique_words:
        raise RuntimeError(f"No words parsed for {letter} from {url}")
    return LetterBucket(letter=letter, url=url, words=unique_words)


def main() -> int:
    repo_root = Path(__file__).resolve().parents[2]
    output_dir = repo_root / "frontend" / "src" / "features" / "games" / "jordle"
    output_dir.mkdir(parents=True, exist_ok=True)

    by_letter: dict[str, dict[str, object]] = {}
    all_words: list[str] = []

    for letter in string.ascii_lowercase:
        bucket = fetch_letter(letter)
        by_letter[letter] = {
            "url": bucket.url,
            "count": len(bucket.words),
            "words": bucket.words,
        }
        all_words.extend(bucket.words)
        print(f"{letter}: {len(bucket.words)} words", file=sys.stderr)

    unique_all_words = sorted(set(all_words))

    combined_payload = {
        "wordLength": WORD_LENGTH,
        "count": len(unique_all_words),
        "words": unique_all_words,
    }
    (output_dir / "dictionary_words_all.json").write_text(
        json.dumps(combined_payload, indent=2) + "\n",
        encoding="utf-8",
    )

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
