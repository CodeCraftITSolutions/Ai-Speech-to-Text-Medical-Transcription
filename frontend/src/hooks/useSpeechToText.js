import { useCallback, useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const defaultOptions = {
  continuous: true,
  interimResults: false,
  lang: "en-US",
};

const useSpeechToText = (initialOptions = {}) => {
  const optionsRef = useRef({ ...defaultOptions, ...initialOptions });
  const restartOnEndRef = useRef(false);
  const [error, setError] = useState(null);

  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    error: recognitionError,
    resetTranscript: resetLibraryTranscript,
  } = useSpeechRecognition();

  const supported =
    browserSupportsSpeechRecognition &&
    (isMicrophoneAvailable === undefined || isMicrophoneAvailable === true);

  useEffect(() => {
    if (!recognitionError) {
      return;
    }

    setError(recognitionError);
  }, [recognitionError]);

  useEffect(() => {
    if (isMicrophoneAvailable === false) {
      restartOnEndRef.current = false;
      setError("speech-recognition-microphone-unavailable");
    }
  }, [isMicrophoneAvailable]);

  useEffect(() => {
    if (!restartOnEndRef.current) {
      return;
    }

    if (isMicrophoneAvailable === false) {
      restartOnEndRef.current = false;
      return;
    }

    if (listening) {
      return;
    }

    try {
      SpeechRecognition.startListening({
        continuous: !!optionsRef.current.continuous,
        interimResults: !!optionsRef.current.interimResults,
        lang: optionsRef.current.lang,
        language: optionsRef.current.lang,
      });
    } catch (startError) {
      restartOnEndRef.current = false;

      if (startError?.name !== "InvalidStateError") {
        setError(startError?.message ?? "speech-recognition-restart-error");
      }
    }
  }, [isMicrophoneAvailable, listening]);

  const startListening = useCallback((options = {}) => {
    optionsRef.current = { ...optionsRef.current, ...options };
    restartOnEndRef.current = true;
    setError(null);

    try {
      SpeechRecognition.startListening({
        continuous: !!optionsRef.current.continuous,
        interimResults: !!optionsRef.current.interimResults,
        lang: optionsRef.current.lang,
        language: optionsRef.current.lang,
      });
    } catch (startError) {
      restartOnEndRef.current = false;

      if (startError?.name !== "InvalidStateError") {
        setError(startError?.message ?? "speech-recognition-start-error");
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    restartOnEndRef.current = false;

    try {
      SpeechRecognition.stopListening();
    } catch (stopError) {
      if (stopError?.name !== "InvalidStateError") {
        setError(stopError?.message ?? "speech-recognition-stop-error");
      }
    }
  }, []);

  const abortListening = useCallback(() => {
    restartOnEndRef.current = false;

    try {
      SpeechRecognition.abortListening();
    } catch (abortError) {
      if (abortError?.name !== "InvalidStateError") {
        setError(abortError?.message ?? "speech-recognition-abort-error");
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    restartOnEndRef.current = false;
    setError(null);
    resetLibraryTranscript();
  }, [resetLibraryTranscript]);

  return {
    supported,
    listening,
    transcript,
    error,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
  };
};

export default useSpeechToText;
