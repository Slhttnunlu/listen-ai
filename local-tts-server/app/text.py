from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class TextSegment:
    text: str
    start: int
    end: int


_BOUNDARY_PATTERNS = (
    re.compile(r"\n\s*\n"),
    re.compile(r"(?<=[.!?…])\s+"),
    re.compile(r"(?<=[;:])\s+"),
    re.compile(r"\s+"),
)


def _best_break(text: str, start: int, hard_end: int, minimum_end: int) -> int:
    window = text[start:hard_end]
    for pattern in _BOUNDARY_PATTERNS:
        candidates = [start + match.end() for match in pattern.finditer(window)]
        usable = [candidate for candidate in candidates if candidate >= minimum_end]
        if usable:
            return usable[-1]
    return hard_end


def split_text(text: str, *, max_chars: int = 350) -> list[TextSegment]:
    """Split text without breaking words when a usable boundary exists.

    Offsets refer to the original input, allowing a future segment manifest to map
    audio back to the editor without returning or logging the user's text.
    """

    if max_chars < 32:
        raise ValueError("max_chars must be at least 32")

    segments: list[TextSegment] = []
    cursor = 0
    text_length = len(text)

    while cursor < text_length:
        while cursor < text_length and text[cursor].isspace():
            cursor += 1
        if cursor >= text_length:
            break

        hard_end = min(cursor + max_chars, text_length)
        if hard_end < text_length:
            minimum_end = cursor + max(1, int(max_chars * 0.5))
            end = _best_break(text, cursor, hard_end, minimum_end)
        else:
            end = hard_end

        content_end = end
        while content_end > cursor and text[content_end - 1].isspace():
            content_end -= 1

        if content_end == cursor:
            content_end = hard_end
            end = hard_end

        segments.append(
            TextSegment(
                text=text[cursor:content_end],
                start=cursor,
                end=content_end,
            )
        )
        cursor = end

    return segments
