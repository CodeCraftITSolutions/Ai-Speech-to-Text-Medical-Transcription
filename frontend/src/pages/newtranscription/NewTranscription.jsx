import {
  Button,
  Input,
  Select,
  Switch,
  Card,
  ConfigProvider,
  message,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  Download,
  FileText,
  Mic,
  Save,
  Send,
  Check,
  Square,
  User,
  Volume2,
  Pause,
  Play,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "../../context/UserContext.jsx";
import { useTheme } from "../../context/ThemeContext";
import exportToPdf from "../../utils/exportToPdf.jsx";
import exportToWord from "../../utils/exportToWord.jsx";
import useSpeechToText from "../../hooks/useSpeechToText.js";
import { createTranscription, listReceptionists } from "../../api/client.js";

const { Option } = Select;

export const NewTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [pendingTranscript, setPendingTranscript] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [sendToTranscriptionist, setSendToTranscriptionist] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [receptionistId, setReceptionistId] = useState(null);
  const [receptionists, setReceptionists] = useState([]);
  const [loadingReceptionists, setLoadingReceptionists] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { theme } = useTheme();
  const { callWithAuth } = useUser();

  const {
    supported: speechSupported,
    listening,
    transcript: speechTranscript,
    error: speechError,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
  } = useSpeechToText();

  const intervalRef = useRef();
  const textareaRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sourceNodeRef = useRef(null);

  const formatSpeechErrorMessage = useCallback((code) => {
    if (code === "speech-recognition-microphone-unavailable") {
      return "Microphone access is required for speech recognition.";
    }

    if (typeof code === "string") {
      return `Speech recognition error: ${code}`;
    }

    return "Speech recognition encountered an unexpected error.";
  }, []);

  const stopMicMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch (error) {
        console.warn("Unable to disconnect audio source", error);
      }
      sourceNodeRef.current = null;
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch (error) {
        console.warn("Unable to disconnect analyser", error);
      }
      analyserRef.current = null;
    }

    dataArrayRef.current = null;
    setMicLevel(0);
  }, []);

  const startMicMonitoring = useCallback((stream) => {
    try {
      const AudioContextConstructor =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextConstructor) {
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextConstructor();
      }

      const context = audioContextRef.current;
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      const source = context.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      source.connect(analyser);

      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      const updateMicLevel = () => {
        if (!analyserRef.current || !dataArrayRef.current) {
          return;
        }

        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

        let sumSquares = 0;
        for (let i = 0; i < dataArrayRef.current.length; i += 1) {
          const value = dataArrayRef.current[i] - 128;
          sumSquares += value * value;
        }

        const rms = Math.sqrt(sumSquares / dataArrayRef.current.length);
        const level = Math.min(100, (rms / 128) * 160);
        setMicLevel(level);

        animationFrameRef.current = requestAnimationFrame(updateMicLevel);
      };

      updateMicLevel();
    } catch (error) {
      console.error("Unable to initialize microphone monitoring", error);
    }
  }, []);

  const releaseMediaStream = useCallback(() => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    setLoadingReceptionists(true);
    callWithAuth(listReceptionists)
      .then((data) => {
        if (!active) {
          return;
        }
        if (Array.isArray(data)) {
          setReceptionists(data);
        } else {
          setReceptionists([]);
        }
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        if (!error?.status || (error.status !== 401 && error.status !== 403)) {
          message.error(error?.message || "Failed to load receptionists");
        }
        setReceptionists([]);
      })
      .finally(() => {
        if (active) {
          setLoadingReceptionists(false);
        }
      });

    return () => {
      active = false;
    };
  }, [callWithAuth]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (autoScroll && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [transcript, autoScroll]);

  useEffect(() => {
    if (speechSupported === false) {
      message.error("Speech recognition is not supported in this browser");
    }
  }, [speechSupported]);

  useEffect(() => {
    if (!speechError) {
      return;
    }

    message.error(formatSpeechErrorMessage(speechError));
  }, [speechError, formatSpeechErrorMessage]);

  useEffect(() => {
    setPendingTranscript((speechTranscript ?? "").trim());
  }, [speechTranscript]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      abortListening();
      stopMicMonitoring();
      releaseMediaStream();
    };
  }, [abortListening, releaseMediaStream, stopMicMonitoring]);

  const startRecording = async () => {
    if (!speechSupported) {
      message.error("Speech recognition is not supported in this browser");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      message.error("Microphone recording is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      resetTranscript();
      setTranscript("");
      setPendingTranscript("");
      setRecordingTime(0);

      startMicMonitoring(stream);
      startListening({ continuous: true, interimResults: false });
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Failed to start recording", error);
      message.error(
        error?.message ?? "Unable to access your microphone. Check permissions."
      );
      releaseMediaStream();
    }
  };

  const pauseRecording = () => {
    if (!isRecording) {
      return;
    }

    if (isPaused) {
      try {
        startListening({ continuous: true, interimResults: false });
        if (audioStreamRef.current) {
          startMicMonitoring(audioStreamRef.current);
        }
        setIsPaused(false);
      } catch (error) {
        console.error("Failed to resume recording", error);
        message.error("Unable to resume recording");
      }
    } else {
      try {
        stopListening();
        stopMicMonitoring();
        setIsPaused(true);
      } catch (error) {
        console.error("Failed to pause recording", error);
        message.error("Unable to pause recording");
      }
    }
  };

  const stopRecording = () => {
    if (!isRecording && !listening) {
      message.warning("No active recording to stop");
      return;
    }

    try {
      stopListening();
    } catch (error) {
      console.error("Failed to stop speech recognition", error);
      message.error("Unable to stop speech recognition");
    }

    stopMicMonitoring();
    releaseMediaStream();
    setIsRecording(false);
    setIsPaused(false);
  };

  const discardTranscription = () => {
    resetTranscript();
    setTranscript("");
    setPendingTranscript("");
    setRecordingTime(0);
    setMicLevel(0);
    message.info("Transcription discarded");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const finalizeTranscription = () => {
    message.success("Ai Team Will Handle This Later");
  };

  const confirmTranscript = () => {
    const normalizedTranscript = (pendingTranscript ?? "").trim();

    if (normalizedTranscript.length === 0) {
      message.warning("No transcript available to confirm");
      return;
    }

    setTranscript(normalizedTranscript);
    resetTranscript();
    setPendingTranscript("");
    message.success("Transcript confirmed from the latest recording");
  };

  const saveDraft = async () => {
    const normalizedTranscript = (transcript ?? "").trim();

    if (normalizedTranscript.length === 0) {
      message.warning("No transcript available to save");
      return;
    }

    if (!patientName.trim() || !patientId.trim()) {
      message.warning("Patient name and ID are required to save the transcription");
      return;
    }

    setIsSaving(true);

    try {
      await callWithAuth(createTranscription, {
        patient_identifier: patientId.trim(),
        patient_name: patientName.trim(),
        patient_date_of_birth: dateOfBirth || null,
        doctor_specialty: specialty ? specialty.trim() : null,
        transcript_text: normalizedTranscript,
        receptionist_id: receptionistId ?? null,
      });

      message.success(
        sendToTranscriptionist
          ? "Transcription saved and ready for review"
          : "Transcription saved successfully"
      );
    } catch (error) {
      message.error(error?.message || "Failed to save transcription");
      return;
    } finally {
      setIsSaving(false);
    }

  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="pb-4 sm:pb-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            New Transcription
          </h1>
          <p className="text-muted-foreground">
            Create a new medical transcription
          </p>
        </div>
        <div className="flex gap-2 flex-row sm:flex-col md:flex-row ">
          <Button
            onClick={saveDraft}
            icon={<Save />}
            type="default"
            className="text-xs"
          >
            Save Draft
          </Button>
          <Button
            onClick={finalizeTranscription}
            type="primary"
            icon={<Send />}
            className="text-xs"
            loading={isSaving}
          >
            {sendToTranscriptionist ? "Send to Review" : "Finalize"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        <div className="flex flex-col gap-4">
          <Card
            className="bg-card border-border"
            title={
              <div className="flex items-center gap-2 bg-card border-border">
                <User className="w-5 h-5 text-foreground" />{" "}
                <h3 className=" text-foreground">Patient Information</h3>
              </div>
            }
          >
            <div className="space-y-2 mb-4">
              <p
                className="text-muted-foreground font-medium"
                htmlFor="patientName"
              >
                Patient Name
              </p>
              <ConfigProvider
                theme={{
                  token: {
                    colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
                    colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
                    colorBorder: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                    colorTextPlaceholder:
                      theme === "dark" ? "#888888" : "#bfbfbf",
                    activeBorderColor: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                    hoverBorderColor: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                  },
                }}
              >
                <Input
                  id="patientName"
                  placeholder="Enter patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </ConfigProvider>
            </div>

            <div className="space-y-2 mb-4">
              <p
                className="text-muted-foreground font-medium"
                htmlFor="patientId"
              >
                Patient ID
              </p>
              <ConfigProvider
                theme={{
                  token: {
                    colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
                    colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
                    colorBorder: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                    colorTextPlaceholder:
                      theme === "dark" ? "#888888" : "#bfbfbf",
                    activeBorderColor: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                    hoverBorderColor: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                  },
                }}
              >
                <Input
                  id="patientId"
                  placeholder="Enter patient ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
              </ConfigProvider>
            </div>

            <div className="space-y-2 mb-4">
              <p
                className="text-muted-foreground font-medium"
                htmlFor="dateOfBirth"
              >
                Date of Birth
              </p>
              <ConfigProvider
                theme={{
                  token: {
                    colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
                    colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
                    colorBorder: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                    colorTextPlaceholder:
                      theme === "dark" ? "#888888" : "#bfbfbf",
                    activeBorderColor: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                    hoverBorderColor: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                  },
                }}
              >
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </ConfigProvider>
            </div>

            <div className="space-y-2 mb-4">
              <p
                className="text-muted-foreground font-medium"
                htmlFor="specialty"
              >
                Doctor Specialty
              </p>
              <ConfigProvider
                theme={{
                  token: {
                    colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
                    colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",

                    optionSelectedBg: theme === "dark" ? "#bfbfbf" : "#000000",
                    selectorBg: theme === "dark" ? "#1f1f1f" : "#ffffff",
                    optionSelectedColor:
                      theme === "dark" ? "#0a0a0a" : "#ffffff",
                    optionActiveBg: theme === "dark" ? "#bfbfbf" : "#bfbfbf",
                    colorBgElevated: theme === "dark" ? "#1f1f1f" : "#ffffff",
                  },
                }}
              >
                <Select
                  value={specialty}
                  onChange={(value) => setSpecialty(value)}
                  placeholder="Select specialty"
                  style={{ width: "100%" }}
                >
                  <Option value="cardiology">Cardiology</Option>
                  <Option value="neurology">Neurology</Option>
                  <Option value="orthopedics">Orthopedics</Option>
                  <Option value="internal-medicine">Internal Medicine</Option>
                  <Option value="pediatrics">Pediatrics</Option>
                  <Option value="surgery">Surgery</Option>
                </Select>
              </ConfigProvider>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-muted-foreground font-medium" htmlFor="receptionist">
                Receptionist
              </p>
              <ConfigProvider
                theme={{
                  token: {
                    colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
                    colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
                    colorBorder: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                    colorTextPlaceholder:
                      theme === "dark" ? "#888888" : "#bfbfbf",
                    selectorBg: theme === "dark" ? "#1f1f1f" : "#ffffff",
                    optionActiveBg: theme === "dark" ? "#bfbfbf" : "#bfbfbf",
                    colorBgElevated: theme === "dark" ? "#1f1f1f" : "#ffffff",
                  },
                }}
              >
                <Select
                  allowClear
                  id="receptionist"
                  placeholder="Select receptionist"
                  value={receptionistId ?? undefined}
                  onChange={(value) => setReceptionistId(value ?? null)}
                  loading={loadingReceptionists}
                  notFoundContent={
                    loadingReceptionists ? "Loading..." : "No receptionists available"
                  }
                  style={{ width: "100%" }}
                >
                  {receptionists.map((user) => {
                    const parts = [user.first_name, user.last_name].filter(Boolean);
                    const label = parts.length > 0 ? parts.join(" ") : user.username;
                    return (
                      <Option key={user.id} value={user.id}>
                        {label}
                      </Option>
                    );
                  })}
                </Select>
              </ConfigProvider>
            </div>
          </Card>

          <Card
            className="bg-card border-border"
            title={
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-foreground" />{" "}
                <h3 className="text-foreground">Recording Controls</h3>
              </div>
            }
          >
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-foreground">
                {formatTime(recordingTime)}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                {isRecording && (
                  <span
                    className={`px-3 py-1 rounded text-xs ${
                      isPaused ? "bg-gray-300" : "bg-red-500 text-white"
                    }`}
                  >
                    {isPaused ? "Paused" : "Recording"}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-foreground" />
                <span className="text-sm text-foreground">Mic Level</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              {!isRecording ? (
                <>
                  <Button
                    onClick={startRecording}
                    icon={<Mic />}
                    block
                    disabled={listening || speechSupported === false}
                  >
                    {listening ? "Listening" : "Start"}
                  </Button>
                  <Button
                    onClick={confirmTranscript}
                    icon={<Check />}
                    block
                    disabled={(pendingTranscript ?? "").trim().length === 0}
                  >
                    Confirm Transcript
                  </Button>
                  <Button
                    onClick={discardTranscription}
                    block
                    disabled={(transcript ?? "").trim().length === 0}
                  >
                    Clear Transcript
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={pauseRecording}
                    icon={isPaused ? <Play /> : <Pause />}
                    block
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button
                    onClick={stopRecording}
                    danger
                    icon={<Square className="text-[#ff7875]" />}
                    block
                  >
                    Stop
                  </Button>
                </>
              )}
            </div>
            {!isRecording && (pendingTranscript ?? "").trim().length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                New speech has been captured. Confirm it to update the transcript.
              </p>
            )}
          </Card>

          <Card
            title={<h3 className="text-foreground">Options</h3>}
            className="bg-card border-border"
          >
            <div className="flex items-center justify-between pb-2">
              <p className="font-medium text-foreground" htmlFor="autoScroll">
                Auto-scroll transcript
              </p>
              <ConfigProvider
                theme={{
                  token: {
                    colorTextQuaternary:
                      theme === "dark" ? "#212121" : "#d9d9d9",
                  },
                }}
              >
                <Switch
                  id="autoScroll"
                  checked={autoScroll}
                  onChange={setAutoScroll}
                />
              </ConfigProvider>
            </div>

            <div className="flex items-center justify-between">
              <p
                className="font-medium text-foreground"
                htmlFor="sendToTranscriptionist"
              >
                Send to transcriptionist
              </p>
              <ConfigProvider
                theme={{
                  token: {
                    colorTextQuaternary:
                      theme === "dark" ? "#212121" : "#d9d9d9",
                  },
                }}
              >
                <Switch
                  id="sendToTranscriptionist"
                  checked={sendToTranscriptionist}
                  onChange={setSendToTranscriptionist}
                />
              </ConfigProvider>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card
            className="bg-card border-border"
            title={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-foreground" />{" "}
                  <h3 className="text-foreground">Live Transcript</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    onClick={() =>
                      exportToPdf({
                        patientName,
                        patientId,
                        dateOfBirth,
                        specialty,
                        transcript,
                      })
                    }
                    icon={<Download />}
                    className="text-xs"
                  >
                    PDF
                  </Button>
                  <Button
                    onClick={()=>exportToWord({
                      patientName,
                      patientId,
                      dateOfBirth,
                      specialty,
                      transcript,
                    })}
                    icon={<Download />}
                    className="text-xs"
                  >
                    Word
                  </Button>
                </div>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-blue-500 rounded"></div>
                  <span className="text-foreground">Medical Terms</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-green-500 rounded"></div>
                  <span className="text-foreground">Drug Names</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-red-500 rounded"></div>
                  <span className="text-foreground">Potential Errors</span>
                </div>
              </div>

              <ConfigProvider
                theme={{
                  token: {
                    colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
                    colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
                    colorBorder: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                    colorTextPlaceholder:
                      theme === "dark" ? "#888888" : "#bfbfbf",
                    activeBorderColor: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                    hoverBorderColor: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                  },
                }}
              >
                <TextArea
                  ref={textareaRef}
                  rows={8}
                  placeholder="Confirmed transcription will appear here after you approve it."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[400px] font-mono text-sm leading-relaxed text-background text-foreground bg-card border-border "
                />
              </ConfigProvider>

              <div className="text-sm text-muted-foreground">
                Words:{" "}
                {transcript.split(" ").filter((word) => word.length > 0).length}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
