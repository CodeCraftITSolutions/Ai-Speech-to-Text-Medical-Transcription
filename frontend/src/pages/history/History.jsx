import { Button, Card, Table, Tag, message } from "antd";
import { Calendar, Download, RefreshCcw } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "../../context/UserContext.jsx";
import { listJobs } from "../../api/client";

export const History = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { callWithAuth, isAuthenticated } = useUser();

  const fetchJobs = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    setLoading(true);
    try {
      const response = await callWithAuth(listJobs);
      setJobs(Array.isArray(response) ? response : []);
    } catch (error) {
      message.error(error?.message ?? "Unable to load jobs");
    } finally {
      setLoading(false);
    }
  }, [callWithAuth, isAuthenticated]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const statusColor = useCallback((status) => {
    switch (status) {
      case "completed":
        return "green";
      case "processing":
        return "blue";
      case "failed":
        return "red";
      default:
        return "gold";
    }
  }, []);

  const tableData = useMemo(
    () =>
      jobs.map((job) => ({
        key: job.id,
        id: job.id,
        type: job.type,
        status: job.status,
        input_uri: job.input_uri,
        output_uri: job.output_uri,
        created_at: job.created_at,
        updated_at: job.updated_at,
      })),
    [jobs]
  );

  const columns = [
    {
      title: "Job ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (value) => value ?? "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) =>
        date ? new Date(date).toLocaleString() : "—",
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) =>
        date ? new Date(date).toLocaleString() : "—",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Transcription Jobs</h1>
          <p className="text-muted-foreground">Track the status of submitted transcription jobs.</p>
        </div>
        <Button icon={<RefreshCcw size={16} />} onClick={fetchJobs} loading={loading}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border" title="Total Jobs">
          <div className="text-2xl font-semibold text-foreground">{jobs.length}</div>
          <p className="text-xs text-muted-foreground">Submitted to the processing queue</p>
        </Card>
        <Card className="bg-card border-border" title="Completed">
          <div className="text-2xl font-semibold text-foreground">
            {jobs.filter((job) => job.status === "completed").length}
          </div>
          <p className="text-xs text-muted-foreground">Jobs with available transcripts</p>
        </Card>
        <Card className="bg-card border-border" title="Pending">
          <div className="text-2xl font-semibold text-foreground">
            {jobs.filter((job) => job.status !== "completed" && job.status !== "failed").length}
          </div>
          <p className="text-xs text-muted-foreground">Awaiting processing</p>
        </Card>
      </div>

      <Card
        className="bg-card border-border overflow-x-auto"
        title={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-foreground">Job History</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              Updated {new Date().toLocaleString()}
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
          locale={{ emptyText: loading ? "Loading jobs..." : "No jobs available" }}
        />
      </Card>
    </div>
  );
};
