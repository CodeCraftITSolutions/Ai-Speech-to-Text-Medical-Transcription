import pytest

from app.services.asr import whisper_service


def test_resolve_model_name_alias(monkeypatch):
    monkeypatch.setattr(
        whisper_service,
        "AVAILABLE_MODELS",
        {"tiny", "tiny.en"},
        raising=False,
    )

    service = whisper_service.WhisperService("whisper-tiny")

    assert service._model_name == "tiny"


def test_resolve_model_name_lightweight_alias(monkeypatch):
    monkeypatch.setattr(
        whisper_service,
        "AVAILABLE_MODELS",
        {"tiny", "tiny.en"},
        raising=False,
    )

    service = whisper_service.WhisperService("whisper-lightweight")

    assert service._model_name == "tiny"


def test_resolve_model_name_invalid(monkeypatch):
    monkeypatch.setattr(
        whisper_service,
        "AVAILABLE_MODELS",
        {"tiny", "tiny.en"},
        raising=False,
    )

    with pytest.raises(RuntimeError) as exc:
        whisper_service.WhisperService._resolve_model_name("unknown-model")

    assert "Unknown Whisper model 'unknown-model'" in str(exc.value)
