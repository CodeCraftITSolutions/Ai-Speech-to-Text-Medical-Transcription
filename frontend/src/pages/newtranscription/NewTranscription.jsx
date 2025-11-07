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
  Square,
  User,
  Volume2,
  Pause,
  Play,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import exportToPdf from "../../utils/exportToPdf.jsx";
import exportToWord from "../../utils/exportToWord.jsx";
import { useUser } from "../../context/UserContext.jsx";
import { createJob, uploadTranscription } from "../../api/client";

const { Option } = Select;

export const NewTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [sendToTranscriptionist, setSendToTranscriptionist] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const { theme } = useTheme();
  const { callWithAuth, isAuthenticated } = useUser();

  const intervalRef = useRef();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sourceNodeRef = useRef(null);

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
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.warn("Failed to stop media recorder during cleanup", error);
        }
      }

      stopMicMonitoring();
      releaseMediaStream();
    };
  }, [releaseMediaStream, stopMicMonitoring]);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      message.error("Microphone recording is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTranscript("");
      setRecordingTime(0);
      setAudioFile(null);

      if (typeof MediaRecorder === "undefined") {
        message.error("MediaRecorder is not supported in this browser");
        releaseMediaStream();
        return;
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        try {
          const mimeType = recorder.mimeType || "audio/webm";
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          audioChunksRef.current = [];

          if (blob.size === 0) {
            message.warning("Recorded audio was empty");
            return;
          }

          const extension =
            mimeType?.split(";")[0]?.split("/")?.[1] ?? "webm";
          const filename = `recording-${Date.now()}.${extension}`;
          const recordedFile = new File([blob], filename, { type: mimeType });
          setAudioFile(recordedFile);
          setAwaitingConfirmation(true);
        } catch (error) {
          console.error("Failed to process recorded audio", error);
          message.error("Unable to process recorded audio");
        }
        mediaRecorderRef.current = null;
      });

      recorder.start();
      startMicMonitoring(stream);
      setIsRecording(true);
      setIsPaused(false);
      setAwaitingConfirmation(false);
    } catch (error) {
      console.error("Failed to start recording", error);
      message.error(
        error?.message ?? "Unable to access your microphone. Check permissions."
      );
      releaseMediaStream();
    }
  };

  const pauseRecording = () => {
    if (!mediaRecorderRef.current) {
      return;
    }

    if (isPaused) {
      try {
        mediaRecorderRef.current.resume();
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
        mediaRecorderRef.current.pause();
        stopMicMonitoring();
        setIsPaused(true);
      } catch (error) {
        console.error("Failed to pause recording", error);
        message.error("Unable to pause recording");
      }
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) {
      message.warning("No active recording to stop");
      return;
    }

    try {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
      message.error("Unable to stop recording");
    }

    stopMicMonitoring();
    releaseMediaStream();
    setIsRecording(false);
    setIsPaused(false);
  };

  const confirmTranscription = async () => {
    if (!audioFile) {
      message.warning("No audio recording available for transcription");
      return;
    }

    if (!isAuthenticated) {
      message.error("You must be logged in to transcribe audio");
      return;
    }

    setTranscribing(true);
    try {
      const response = await callWithAuth(uploadTranscription, audioFile);
      const transcriptText = response?.transcript ?? "";
      setTranscript(transcriptText);

      if ((transcriptText ?? "").trim().length === 0) {
        message.warning("Transcription completed but no speech was detected");
      } else {
        message.success(response?.detail ?? "Transcription completed");
      }

      setAwaitingConfirmation(false);
    } catch (error) {
      console.error("Failed to transcribe audio", error);
      message.error(error?.message ?? "Unable to transcribe audio");
    } finally {
      setTranscribing(false);
    }
  };

  const discardTranscription = () => {
    setTranscript("");
    setRecordingTime(0);
    setAudioFile(null);
    setMicLevel(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    message.info("Transcription discarded");
    setAwaitingConfirmation(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const saveDraft = () => {
    message.success("Draft saved successfully");
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setAudioFile(file ?? null);
    if (file) {
      message.info(`Selected file: ${file.name}`);
      setTranscript("");
      setAwaitingConfirmation(true);
    } else {
      setAwaitingConfirmation(false);
    }
  };

  const finalizeTranscription = async () => {
    if (!isAuthenticated) {
      message.error("You must be logged in to submit audio");
      return;
    }

    if (!audioFile) {
      message.warning("Please select an audio file to upload");
      return;
    }

    setUploading(true);
    try {
      const uploadResponse = await callWithAuth(uploadTranscription, audioFile);
      message.success(uploadResponse?.detail ?? "Audio uploaded successfully");

      await callWithAuth(createJob, {
        type: "transcription",
        input_uri: uploadResponse?.filename ?? audioFile.name,
      });

      message.success(
        sendToTranscriptionist
          ? "Transcription submitted for review"
          : "Transcription job created"
      );

      setIsRecording(false);
      setIsPaused(false);
      setMicLevel(0);
      setTranscript("");
      setRecordingTime(0);
      setAudioFile(null);
      setAwaitingConfirmation(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      message.error(error?.message ?? "Unable to submit transcription");
    } finally {
      setUploading(false);
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
            loading={uploading}
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
            <div className="space-y-2 mt-4">
              <p className="text-muted-foreground font-medium">Audio File</p>
              <ConfigProvider
                theme={{
                  token: {
                    colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
                    colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
                    colorBorder: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                    colorTextPlaceholder: theme === "dark" ? "#888888" : "#bfbfbf",
                  },
                }}
              >
                <Input
                  type="file"
                  accept="audio/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </ConfigProvider>
              {audioFile ? (
                <div className="text-sm text-foreground break-words">
                  {audioFile.name}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Supported formats: WAV, MP3, M4A</p>
              )}
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
                awaitingConfirmation ? (
                  <>
                    <Button onClick={discardTranscription} block>
                      Discard
                    </Button>
                    <Button
                      type="primary"
                      onClick={confirmTranscription}
                      block
                      loading={transcribing}
                    >
                      Confirm Transcription
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={startRecording}
                    icon={<Mic />}
                    block
                    disabled={awaitingConfirmation}
                  >
                    Start
                  </Button>
                )
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
                  placeholder="Transcription will appear here as you speak..."
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
