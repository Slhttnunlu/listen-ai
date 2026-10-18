import pytest

from app.text import split_text


def test_split_text_prefers_sentence_boundaries_and_preserves_offsets():
    text = "Birinci cümle burada. İkinci cümle biraz daha uzun. Üçüncü cümle."

    segments = split_text(text, max_chars=40)

    assert [segment.text for segment in segments] == [
        "Birinci cümle burada.",
        "İkinci cümle biraz daha uzun.",
        "Üçüncü cümle.",
    ]
    assert all(text[segment.start : segment.end] == segment.text for segment in segments)
    assert all(len(segment.text) <= 40 for segment in segments)


def test_split_text_uses_paragraph_and_whitespace_boundaries():
    text = "İlk paragraf kısa.\n\nİkinci paragrafta noktalama olmadan pek çok kelime var"

    segments = split_text(text, max_chars=38)

    assert segments[0].text == "İlk paragraf kısa."
    assert "".join(segment.text.replace(" ", "") for segment in segments) == text.replace(
        " ", ""
    ).replace("\n", "")


def test_split_text_hard_splits_a_single_oversized_word():
    text = "a" * 90

    segments = split_text(text, max_chars=32)

    assert "".join(segment.text for segment in segments) == text
    assert [len(segment.text) for segment in segments] == [32, 32, 26]


def test_split_text_ignores_blank_input():
    assert split_text(" \n\t ", max_chars=32) == []


def test_split_text_rejects_an_unsafe_limit():
    with pytest.raises(ValueError):
        split_text("Merhaba", max_chars=31)
