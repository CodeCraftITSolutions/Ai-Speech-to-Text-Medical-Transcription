"""Utilities for running speech-to-text inference with OpenAI Whisper."""

from __future__ import annotations

import logging
import threading
from typing import Optional

import whisper

logger = logging.getLogger(__name__)


class WhisperService:
    """Thin wrapper around the Whisper model to provide cached inference."""

    def __init__(self, model_name: str) -> None:
        self._model_name = model_name
        self._model_lock = threading.Lock()
        self._model: Optional[whisper.Whisper] = None

    def _get_model(self) -> whisper.Whisper:
        if self._model is None:
            with self._model_lock:
                if self._model is None:
                    logger.info("Loading Whisper model '%s'", self._model_name)
                    self._model = whisper.load_model(self._model_name)
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
        result = model.transcribe(audio_path)
        text = result.get("text", "")
        logger.debug("Completed Whisper transcription for file: %s", audio_path)
        return text.strip()

