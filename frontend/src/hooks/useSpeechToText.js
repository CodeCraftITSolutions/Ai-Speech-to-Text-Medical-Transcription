import { useCallback, useEffect, useRef, useState } from "react";

const defaultOptions = {
  continuous: true,
  interimResults: true,
  lang: "en-US",
};

const useSpeechToText = (initialOptions = {}) => {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const restartOnEndRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const optionsRef = useRef({ ...defaultOptions, ...initialOptions });

  useEffect(() => {
    if (typeof window === "undefined") {
      setSupported(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = optionsRef.current.continuous;
    recognition.interimResults = optionsRef.current.interimResults;
    recognition.lang = optionsRef.current.lang;

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalTranscriptRef.current = `${
            finalTranscriptRef.current
          }${text} `;
        } else {
          interimTranscript += text;
        }
      }

      const combinedTranscript = `${
        finalTranscriptRef.current
      }${interimTranscript}`.trim();
      setTranscript(combinedTranscript);
    };

    recognition.onstart = () => {
      setError(null);
      setListening(true);
    };

    recognition.onerror = (event) => {
      if (event?.error === "no-speech") {
        // Browser detected silence, but this isn't fatal.
        return;
      }
      setError(event?.error ?? "speech-recognition-error");
    };

    recognition.onend = () => {
      if (restartOnEndRef.current) {
        try {
          recognition.start();
        } catch (startError) {
          restartOnEndRef.current = false;
          setListening(false);
          setError(startError?.message ?? "speech-recognition-restart-error");
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      restartOnEndRef.current = false;
      recognition.onresult = null;
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch (stopError) {
        if (typeof console !== "undefined") {
          console.warn(
            "Unable to stop speech recognition during cleanup",
            stopError
          );
        }
      }
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback(
    (options = {}) => {
      if (!recognitionRef.current) {
        return;
      }

      const recognition = recognitionRef.current;
      optionsRef.current = { ...optionsRef.current, ...options };

      recognition.continuous = !!optionsRef.current.continuous;
      recognition.interimResults = !!optionsRef.current.interimResults;
      if (optionsRef.current.lang) {
        recognition.lang = optionsRef.current.lang;
      }

      restartOnEndRef.current = true;

      try {
        recognition.start();
      } catch (startError) {
        // Safari throws an InvalidStateError if start is called while active.
        if (startError?.name !== "InvalidStateError") {
          setError(startError?.message ?? "speech-recognition-start-error");
        }
      }
    },
    []
  );

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    restartOnEndRef.current = false;

    try {
      recognitionRef.current.stop();
    } catch (stopError) {
      if (stopError?.name !== "InvalidStateError") {
        setError(stopError?.message ?? "speech-recognition-stop-error");
      }
    }
  }, []);

  const abortListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    restartOnEndRef.current = false;

    try {
      recognitionRef.current.abort();
    } catch (abortError) {
      if (abortError?.name !== "InvalidStateError") {
        setError(abortError?.message ?? "speech-recognition-abort-error");
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
  }, []);

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
