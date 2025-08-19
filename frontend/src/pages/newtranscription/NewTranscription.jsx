import {
  Badge,
  Button,
  Input,
  Select,
  Switch,
  Card,
  ConfigProvider,
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
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import exportToPdf from "../../utils/exportToPdf.jsx";
import exportToWord from "../../utils/exportToWord.jsx";

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

  const { theme } = useTheme();

  const intervalRef = useRef();
  const textareaRef = useRef(null);

  const simulateTranscription = () => {
    const medicalPhrases = [
      "Patient presents with chest pain and shortness of breath.",
      "Blood pressure is 140 over 90.",
      "Heart rate is regular at 72 beats per minute.",
      "Lungs are clear to auscultation bilaterally.",
      "No murmurs, rubs, or gallops appreciated.",
      "Abdomen is soft, non-tender, non-distended.",
      "Extremities show no edema or cyanosis.",
      "Neurological examination is within normal limits.",
      "Recommend ECG and chest X-ray.",
      "Patient advised to follow up in one week.",
    ];

    let phraseIndex = 0;
    const transcriptionInterval = setInterval(() => {
      if (phraseIndex < medicalPhrases.length && isRecording && !isPaused) {
        setTranscript((prev) => {
          const newText =
            prev + (prev ? " " : "") + medicalPhrases[phraseIndex];
          phraseIndex++;
          return newText;
        });

        setMicLevel(Math.random() * 100);

        if (autoScroll && textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      } else {
        clearInterval(transcriptionInterval);
      }
    }, 2000);

    return transcriptionInterval;
  };

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      const transcriptionInterval = simulateTranscription();

      return () => {
        clearInterval(transcriptionInterval);
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, isPaused, autoScroll]);

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    setIsPaused(!isPaused);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setMicLevel(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const saveDraft = () => {
    alert("Draft saved successfully!");
  };

  const finalizeTranscription = () => {
    if (sendToTranscriptionist) {
      alert("Transcription sent to transcriptionist for review!");
    } else {
      alert("Transcription finalized!");
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
                <Button onClick={startRecording} icon={<Mic />} block>
                  Start
                </Button>
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
