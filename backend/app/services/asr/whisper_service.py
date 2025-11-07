"""Utilities for running speech-to-text inference with OpenAI Whisper."""

from __future__ import annotations

import logging
import threading
from typing import Optional

from faster_whisper import WhisperModel

AVAILABLE_MODELS = {
    "tiny",
    "tiny.en",
    "base",
    "base.en",
    "small",
    "small.en",
    "medium",
    "medium.en",
    "large",
    "large-v1",
    "large-v2",
    "large-v3",
}

logger = logging.getLogger(__name__)


class WhisperService:
    """Thin wrapper around the Whisper model to provide cached inference."""

    def __init__(
        self,
        model_name: str,
        *,
        device: str | None = None,
        compute_type: str | None = None,
    ) -> None:
        self._configured_model_name = model_name
        self._model_name = self._resolve_model_name(model_name)
        self._model_lock = threading.Lock()
        self._device = device or "auto"
        self._compute_type = compute_type or "int8"
        self._model: Optional[WhisperModel] = None

    @staticmethod
    def _resolve_model_name(model_name: str) -> str:
        """Resolve a configured Whisper model name to one recognised by the library."""

        available_models = AVAILABLE_MODELS

        # Provide a couple of friendlier aliases for commonly requested
        # configurations.  The "lightweight" alias now targets the "tiny"
        # family to keep the development footprint as small as possible.
        alias_map = {
            "whisper-lightweight": "tiny",
            "lightweight": "tiny",
        }
        if model_name in alias_map:
            alias_target = alias_map[model_name]
            if alias_target in available_models:
                logger.info(
                    "Normalised Whisper model alias '%s' to '%s'",
                    model_name,
                    alias_target,
                )
                return alias_target

        if model_name in available_models:
            return model_name

        alias_prefix = "whisper-"
        if model_name.startswith(alias_prefix):
            candidate = model_name[len(alias_prefix) :]
            if candidate in available_models:
                logger.info(
                    "Normalised Whisper model name from '%s' to '%s'", model_name, candidate
                )
                return candidate

        raise RuntimeError(
            "Unknown Whisper model '%s'. Available models are: %s"
            % (model_name, ", ".join(sorted(available_models)))
        )

    def _get_model(self) -> WhisperModel:
        if self._model is None:
            with self._model_lock:
                if self._model is None:
                    if self._configured_model_name == self._model_name:
                        logger.info("Loading Whisper model '%s'", self._model_name)
                    else:
                        logger.info(
                            "Loading Whisper model '%s' (configured as '%s')",
                            self._model_name,
                            self._configured_model_name,
                        )
                    self._model = WhisperModel(
                        self._model_name,
                        device=self._device,
                        compute_type=self._compute_type,
                    )
        return self._model

    def transcribe(self, audio_path: str) -> str:
        """Transcribe an audio file located at ``audio_path``.

        Parameters
        ----------
        audio_path:
            Path to the audio file to be transcribed.

        Returns
        -------
        str
            The transcription text returned by Whisper.
        """

        model = self._get_model()
        logger.debug("Starting Whisper transcription for file: %s", audio_path)
        segments, _ = model.transcribe(audio_path)
        text = " ".join(segment.text for segment in segments).strip()
        logger.debug("Completed Whisper transcription for file: %s", audio_path)
        return text

