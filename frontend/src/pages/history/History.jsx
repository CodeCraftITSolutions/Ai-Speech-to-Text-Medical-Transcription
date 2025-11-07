import { Button, Card, Select, Table, Tag } from "antd";
import { Calendar, Download, RefreshCcw } from "lucide-react";
import React, { useMemo, useState } from "react";

import useJobsData from "../../hooks/useJobsData.js";

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

export const History = () => {
  const { jobs, loading, stats, lastUpdated, refresh, statusBreakdown } =
    useJobsData();
  const [statusFilter, setStatusFilter] = useState("all");

  const statusOptions = useMemo(() => {
    const options = [
      { value: "all", label: "All statuses" },
      { value: "completed", label: "Completed" },
      { value: "processing", label: "Processing" },
      { value: "pending", label: "Pending" },
      { value: "failed", label: "Failed" },
    ];

    const hasUnknown = Array.from(statusBreakdown.keys()).some(
      (status) => !options.find((option) => option.value === status)
    );

    return hasUnknown
      ? [...options, { value: "unknown", label: "Unknown" }]
      : options;
  }, [statusBreakdown]);

  const filteredJobs = useMemo(() => {
    if (statusFilter === "all") {
      return jobs;
    }
    const normalised = statusFilter.toLowerCase();
    return jobs.filter(
      (job) => normaliseStatus(job.status) === normalised || (!job.status && normalised === "unknown")
    );
  }, [jobs, statusFilter]);

  const tableData = useMemo(
    () =>
      filteredJobs.map((job) => ({
        key: job.id,
        id: job.id,
        type: job.type,
        status: job.status,
        input_uri: job.input_uri,
        output_uri: job.output_uri,
        created_at: job.created_at,
        updated_at: job.updated_at,
      })),
    [filteredJobs]
  );

  const columns = [
    {
      title: "Job",
      dataIndex: "id",
      key: "id",
      render: (value, record) => (
        <div>
          <div className="font-medium text-foreground">#{value}</div>
          <div className="text-sm text-muted-foreground">
            {record.type ?? "Transcription"}
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
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (date ? new Date(date).toLocaleString() : "—"),
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => (date ? new Date(date).toLocaleString() : "—"),
    },
    {
      title: "Input",
      dataIndex: "input_uri",
      key: "input_uri",
      ellipsis: true,
      render: (value) => value || "—",
    },
    {
      title: "Output",
      dataIndex: "output_uri",
      key: "output_uri",
      ellipsis: true,
      render: (value) =>
        value ? (
          <Button
            type="link"
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            icon={<Download size={14} />}
          >
            Download
          </Button>
        ) : (
          "—"
        ),
    },
  ];

  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleString()
    : "Never";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Transcription Jobs
          </h1>
          <p className="text-muted-foreground">
            Track the status of submitted transcription jobs.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
            className="min-w-[160px]"
          />
          <Button
            icon={<RefreshCcw size={16} />}
            onClick={refresh}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border" title="Total Jobs">
          <div className="text-2xl font-semibold text-foreground">
            {stats.total}
          </div>
          <p className="text-xs text-muted-foreground">
            Submitted to the processing queue
          </p>
        </Card>
        <Card className="bg-card border-border" title="In Queue">
          <div className="text-2xl font-semibold text-foreground">
            {stats.inQueue}
          </div>
          <p className="text-xs text-muted-foreground">
            Pending or processing
          </p>
        </Card>
        <Card className="bg-card border-border" title="Completed">
          <div className="text-2xl font-semibold text-foreground">
            {stats.completed}
          </div>
          <p className="text-xs text-muted-foreground">
            Jobs with available transcripts
          </p>
        </Card>
        <Card className="bg-card border-border" title="Failed">
          <div className="text-2xl font-semibold text-foreground">
            {stats.failed}
          </div>
          <p className="text-xs text-muted-foreground">
            Requires attention
          </p>
        </Card>
      </div>

      <Card
        className="bg-card border-border overflow-x-auto"
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-foreground">Job History</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              Updated {lastUpdatedLabel}
            </span>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={tableData}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 768 }}
          locale={{
            emptyText: loading ? "Loading jobs..." : "No jobs available",
          }}
        />
      </Card>
    </div>
  );
};
