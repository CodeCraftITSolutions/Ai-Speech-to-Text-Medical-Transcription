import {
  Button,
  Card,
  ConfigProvider,
  Input,
  Table,
  Tag,
  message,
} from "antd";
import {
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  RefreshCcw,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import useJobsData from "../../hooks/useJobsData.js";
import { useTheme } from "../../context/ThemeContext";

const { TextArea } = Input;

const normaliseStatus = (status) =>
  typeof status === "string" ? status.toLowerCase() : "";

const formatStatus = (status) => {
  const value = normaliseStatus(status);
  if (!value) {
    return "Unknown";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const statusColor = (status) => {
  switch (normaliseStatus(status)) {
    case "completed":
      return "green";
    case "processing":
      return "blue";
    case "failed":
      return "red";
    default:
      return "gold";
  }
};

const getJobTimestamp = (job) => job.updated_at ?? job.created_at;

export const Review = () => {
  const { theme } = useTheme();
  const { jobs, loading, stats, refresh } = useJobsData();
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [reviewComment, setReviewComment] = useState("");
  const [transcriptNotes, setTranscriptNotes] = useState("");

  const queueJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const status = normaliseStatus(job.status);
        return status === "completed" || status === "processing" || status === "pending";
      }),
    [jobs]
  );

  const readyForReview = useMemo(
    () => queueJobs.filter((job) => normaliseStatus(job.status) === "completed"),
    [queueJobs]
  );

  const inProgress = useMemo(
    () => queueJobs.filter((job) => normaliseStatus(job.status) !== "completed"),
    [queueJobs]
  );

  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return jobs.filter((job) => {
      if (normaliseStatus(job.status) !== "completed") {
        return false;
      }
      const timestamp = getJobTimestamp(job);
      if (!timestamp) {
        return false;
      }
      const jobDate = new Date(timestamp);
      if (Number.isNaN(jobDate.getTime())) {
        return false;
      }
      return jobDate.toDateString() === today;
    });
  }, [jobs]);

  const selectedJob = useMemo(
    () => queueJobs.find((job) => job.id === selectedJobId) ?? null,
    [queueJobs, selectedJobId]
  );

  useEffect(() => {
    setReviewComment("");
    setTranscriptNotes("");
  }, [selectedJobId]);

  const columns = [
    {
      title: "Job",
      dataIndex: "id",
      key: "id",
      render: (_, job) => (
        <div>
          <div className="font-medium text-foreground">#{job.id}</div>
          <div className="text-sm text-muted-foreground">
            {job.type ?? "Transcription"}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColor(status)}>{formatStatus(status)}</Tag>
      ),
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (value, job) => {
        const timestamp = value ?? job.created_at;
        return timestamp ? new Date(timestamp).toLocaleString() : "—";
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, job) => (
        <Button size="small" onClick={() => setSelectedJobId(job.id)}>
          Review
        </Button>
      ),
    },
  ];

  const approveJob = () => {
    if (!selectedJob) {
      return;
    }
    message.success(`Job #${selectedJob.id} approved for delivery.`);
    setSelectedJobId(null);
  };

  const requestChanges = () => {
    if (!selectedJob) {
      return;
    }
    if (!reviewComment.trim()) {
      message.warning("Please add review comments before requesting changes.");
      return;
    }
    message.success(`Change request submitted for job #${selectedJob.id}.`);
    setSelectedJobId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Review Queue
          </h1>
          <p className="text-muted-foreground">
            Review and approve pending transcription jobs.
          </p>
        </div>
        <Button
          icon={<RefreshCcw size={16} />}
          onClick={refresh}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="bg-card border-border"
          title={
            <div className="flex items-center justify-between bg-card border-border">
              <h3 className="text-foreground">Pending Reviews</h3>
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          }
        >
          <div className="text-2xl font-bold text-foreground">
            {readyForReview.length}
          </div>
          <p className="text-xs text-muted-foreground">Awaiting reviewer</p>
        </Card>

        <Card
          className="bg-card border-border"
          title={
            <div className="flex items-center justify-between bg-card border-border">
              <h3 className="text-foreground">In Progress</h3>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          }
        >
          <div className="text-2xl font-bold text-foreground">
            {inProgress.length}
          </div>
          <p className="text-xs text-muted-foreground">Jobs still processing</p>
        </Card>

        <Card
          className="bg-card border-border"
          title={
            <div className="flex items-center justify-between bg-card border-border">
              <h3 className="text-foreground">Completed Today</h3>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          }
        >
          <div className="text-2xl font-bold text-foreground">
            {completedToday.length}
          </div>
          <p className="text-xs text-muted-foreground">Ready for quality check</p>
        </Card>

        <Card
          className="bg-card border-border"
          title={
            <div className="flex items-center justify-between bg-card border-border">
              <h3 className="text-foreground">Failed Jobs</h3>
              <FileText className="h-4 w-4 text-red-600" />
            </div>
          }
        >
          <div className="text-2xl font-bold text-foreground">{stats.failed}</div>
          <p className="text-xs text-muted-foreground">Needs follow-up</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="bg-card border-border overflow-x-auto md:min-w-[410px]"
          title={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card border-border">
              <h3 className="text-foreground">Pending Reviews</h3>
              <p className="text-muted-foreground text-sm">
                {`${queueJobs.length} jobs awaiting review`}
              </p>
            </div>
          }
        >
          <ConfigProvider
            theme={{
              token: {
                colorBgContainer: theme === "dark" ? "#212121" : "#ffffff",
                colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
                optionSelectedBg: theme === "dark" ? "#bfbfbf" : "#000000",
                selectorBg: theme === "dark" ? "#1f1f1f" : "#ffffff",
                optionSelectedColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
                optionActiveBg: theme === "dark" ? "#bfbfbf" : "#bfbfbf",
                colorBgElevated: theme === "dark" ? "#1f1f1f" : "#ffffff",
              },
            }}
          >
            <Table
              columns={columns}
              dataSource={queueJobs}
              rowKey="id"
              loading={loading}
              pagination={false}
              className="w-[700px] sm:w-full"
              locale={{
                emptyText: loading
                  ? "Loading jobs..."
                  : "No jobs currently awaiting review",
              }}
            />
          </ConfigProvider>
        </Card>

        <ConfigProvider
          theme={{
            token: {
              bodyPadding: "12px",
              headerPadding: "12px",
            },
          }}
        >
          <Card
            className="bg-card border-border"
            title={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card border-border">
                <h3 className="text-foreground">Review Workspace</h3>
                <p className="text-muted-foreground text-sm">
                  {selectedJob
                    ? `Reviewing job #${selectedJob.id}`
                    : "Select a job to begin"}
                </p>
              </div>
            }
          >
            {selectedJob ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:p-4 bg-background rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-foreground">Job ID</div>
                    <div className="text-muted-foreground">#{selectedJob.id}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Status</div>
                    <Tag color={statusColor(selectedJob.status)}>
                      {formatStatus(selectedJob.status)}
                    </Tag>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Type</div>
                    <div className="text-muted-foreground">
                      {selectedJob.type ?? "Transcription"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Updated</div>
                    <div className="text-muted-foreground">
                      {(() => {
                        const timestamp = getJobTimestamp(selectedJob);
                        return timestamp
                          ? new Date(timestamp).toLocaleString()
                          : "—";
                      })()}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-sm font-medium text-foreground">
                      Output
                    </div>
                    {selectedJob.output_uri ? (
                      <Button
                        type="link"
                        href={selectedJob.output_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-0"
                      >
                        Open transcription output
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Output not yet available for this job.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Transcript Notes
                  </label>
                  <ConfigProvider
                    theme={{
                      token: {
                        colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
                        colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
                        colorBorder: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                        colorTextPlaceholder:
                          theme === "dark" ? "#888888" : "#bfbfbf",
                        activeBorderColor:
                          theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                        hoverBorderColor:
                          theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                      },
                    }}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Document any corrections or observations..."
                      value={transcriptNotes}
                      onChange={(e) => setTranscriptNotes(e.target.value)}
                    />
                  </ConfigProvider>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Review Comments
                  </label>
                  <ConfigProvider
                    theme={{
                      token: {
                        colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
                        colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
                        colorBorder: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                        colorTextPlaceholder:
                          theme === "dark" ? "#888888" : "#bfbfbf",
                        activeBorderColor:
                          theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                        hoverBorderColor:
                          theme === "dark" ? "#bfbfbf" : "#d9d9d9",
                      },
                    }}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Add comments or instructions for the requester..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                  </ConfigProvider>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="primary"
                    onClick={approveJob}
                    className="flex-1"
                    icon={<CheckCircle className="w-4 h-4 mr-2" />}
                    disabled={loading}
                  >
                    Approve for Delivery
                  </Button>
                  <Button
                    onClick={requestChanges}
                    className="flex-1"
                    icon={<MessageSquare className="w-4 h-4 mr-2" />}
                    disabled={loading}
                  >
                    Request Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a transcription job from the queue to begin reviewing.
                </p>
              </div>
            )}
          </Card>
        </ConfigProvider>
      </div>
    </div>
  );
};
