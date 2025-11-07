import { useCallback, useEffect, useSyncExternalStore } from "react";

const defaultOptions = {
  continuous: true,
  interimResults: false,
  lang: "en-US",
};

let recognition = null;
let recognitionOptions = { ...defaultOptions };
let finalTranscript = "";
let shouldRestart = false;
let recognitionInitialized = false;

let storeState = {
  transcript: "",
  listening: false,
  browserSupportsSpeechRecognition: true,
  isMicrophoneAvailable: true,
  error: null,
};

const subscribers = new Set();

const emit = () => {
  subscribers.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      if (typeof console !== "undefined") {
        console.warn("Speech recognition subscriber error", error);
      }
    }
  });
};

const setState = (partialState) => {
  storeState = { ...storeState, ...partialState };
  emit();
};

const getSnapshot = () => storeState;

const applyRecognitionOptions = () => {
  if (!recognition) {
    return;
  }

  recognition.continuous = !!recognitionOptions.continuous;
  recognition.interimResults = !!recognitionOptions.interimResults;
  const languageOption =
    recognitionOptions.lang ?? recognitionOptions.language ?? "";
  if (languageOption) {
    recognition.lang = languageOption;
  }
};

const createRecognition = () => {
  if (recognition || recognitionInitialized) {
    return recognition;
  }

  recognitionInitialized = true;

  if (typeof window === "undefined") {
    setState({ browserSupportsSpeechRecognition: false });
    return null;
  }

  const SpeechRecognitionConstructor =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) {
    setState({ browserSupportsSpeechRecognition: false });
    return null;
  }

  recognition = new SpeechRecognitionConstructor();
  applyRecognitionOptions();

  recognition.onstart = () => {
    setState({ listening: true, error: null, isMicrophoneAvailable: true });
  };

  recognition.onresult = (event) => {
    if (!event?.results) {
      return;
    }

    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const text = result?.[0]?.transcript ?? "";

      if (result.isFinal) {
        finalTranscript = `${finalTranscript}${text} `;
      } else {
        interimTranscript += text;
      }
    }

    const combinedTranscript = `${finalTranscript}${interimTranscript}`.trim();
    setState({ transcript: combinedTranscript });
  };

  recognition.onerror = (event) => {
    const errorCode = event?.error;

    if (errorCode === "no-speech") {
      return;
    }

    if (errorCode === "not-allowed" || errorCode === "service-not-allowed") {
      shouldRestart = false;
      setState({
        error: errorCode ?? "speech-recognition-permission-error",
        isMicrophoneAvailable: false,
      });
      return;
    }

    setState({ error: errorCode ?? "speech-recognition-error" });
  };

  recognition.onend = () => {
    setState({ listening: false });

    if (shouldRestart) {
      applyRecognitionOptions();
      try {
        recognition.start();
      } catch (startError) {
        shouldRestart = false;
        setState({
          error: startError?.message ?? "speech-recognition-restart-error",
        });
      }
    }
  };

  return recognition;
};

const startListeningInternal = () => {
  if (!recognition) {
    return;
  }

  applyRecognitionOptions();

  try {
    recognition.start();
  } catch (startError) {
    if (startError?.name !== "InvalidStateError") {
      throw startError;
    }
  }
};

const SpeechRecognition = {
  startListening(options = {}) {
    recognitionOptions = { ...recognitionOptions, ...options };
    const recognitionInstance = createRecognition();

    if (!recognitionInstance) {
      shouldRestart = false;
      return;
    }

    shouldRestart = true;
    setState({ error: null, isMicrophoneAvailable: true });

    try {
      startListeningInternal();
    } catch (startError) {
      shouldRestart = false;
      setState({
        error: startError?.message ?? "speech-recognition-start-error",
      });
    }
  },
  stopListening() {
    shouldRestart = false;

    if (!recognition) {
      return;
    }

    try {
      recognition.stop();
    } catch (stopError) {
      if (stopError?.name !== "InvalidStateError") {
        setState({
          error: stopError?.message ?? "speech-recognition-stop-error",
        });
      }
    }
  },
  abortListening() {
    shouldRestart = false;

    if (!recognition) {
      return;
    }

    try {
      recognition.abort();
    } catch (abortError) {
      if (abortError?.name !== "InvalidStateError") {
        setState({
          error: abortError?.message ?? "speech-recognition-abort-error",
        });
      }
    }
  },
  getRecognition() {
    return recognition;
  },
  hasRecognitionSupport() {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  },
};

const useSpeechRecognition = () => {
  const snapshot = useSyncExternalStore(
    (listener) => {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
    getSnapshot,
    getSnapshot,
  );

  const resetTranscript = useCallback(() => {
    finalTranscript = "";
    setState({ transcript: "" });
  }, []);

  useEffect(() => {
    createRecognition();

    return () => {
      shouldRestart = false;
      if (recognition) {
        try {
          recognition.stop();
        } catch (stopError) {
          if (stopError?.name !== "InvalidStateError") {
            if (typeof console !== "undefined") {
              console.warn(
                "Unable to stop speech recognition during cleanup",
                stopError,
              );
            }
          }
        }
      }
    };
  }, []);

  return {
    transcript: snapshot.transcript,
    listening: snapshot.listening,
    browserSupportsSpeechRecognition: snapshot.browserSupportsSpeechRecognition,
    isMicrophoneAvailable: snapshot.isMicrophoneAvailable,
    error: snapshot.error,
    resetTranscript,
  };
};

export { useSpeechRecognition };

Object.defineProperty(SpeechRecognition, "browserSupportsSpeechRecognition", {
  get() {
    return SpeechRecognition.hasRecognitionSupport();
  },
});

export default SpeechRecognition;
