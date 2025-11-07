import pytest

from app.services.asr import whisper_service


def test_resolve_model_name_alias(monkeypatch):
    monkeypatch.setattr(
        whisper_service.whisper,
        "available_models",
        lambda: ["tiny", "small", "large"],
    )

    service = whisper_service.WhisperService("whisper-small")

    assert service._model_name == "small"


def test_resolve_model_name_lightweight_alias(monkeypatch):
    monkeypatch.setattr(
        whisper_service.whisper,
        "available_models",
        lambda: ["tiny", "small", "large"],
    )

    service = whisper_service.WhisperService("whisper-lightweight")

    assert service._model_name == "small"


def test_resolve_model_name_invalid(monkeypatch):
    monkeypatch.setattr(
        whisper_service.whisper,
        "available_models",
        lambda: ["tiny", "large"],
    )

    with pytest.raises(RuntimeError) as exc:
        whisper_service.WhisperService._resolve_model_name("unknown-model")

    assert "Unknown Whisper model 'unknown-model'" in str(exc.value)
