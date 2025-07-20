import { Badge, Button, Input, Select, Table, Dropdown, Menu } from "antd";
import {
  Download,
  Edit,
  Eye,
  FileText,
  Search,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import React, { useState } from "react";

const { Option } = Select;

export const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const transcriptions = [
    {
      id: "T001",
      patientName: "John Smith",
      patientId: "P12345",
      doctor: "Dr. Sarah Johnson",
      date: "2024-01-15",
      status: "Completed",
      specialty: "Cardiology",
      duration: "12:34",
      wordCount: 456,
    },
    {
      id: "T002",
      patientName: "Emily Davis",
      patientId: "P12346",
      doctor: "Dr. Sarah Johnson",
      date: "2024-01-14",
      status: "In Review",
      specialty: "Cardiology",
      duration: "08:22",
      wordCount: 324,
    },
    {
      id: "T003",
      patientName: "Michael Brown",
      patientId: "P12347",
      doctor: "Dr. Sarah Johnson",
      date: "2024-01-14",
      status: "Draft",
      specialty: "Internal Medicine",
      duration: "15:45",
      wordCount: 678,
    },
    {
      id: "T004",
      patientName: "Sarah Wilson",
      patientId: "P12348",
      doctor: "Dr. Sarah Johnson",
      date: "2024-01-13",
      status: "Completed",
      specialty: "Neurology",
      duration: "09:18",
      wordCount: 389,
    },
    {
      id: "T005",
      patientName: "David Lee",
      patientId: "P12349",
      doctor: "Dr. Sarah Johnson",
      date: "2024-01-12",
      status: "Completed",
      specialty: "Orthopedics",
      duration: "11:56",
      wordCount: 512,
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return <Badge color="green" text="Completed"/>;
      case "In Review":
        return <Badge color="yellow" text="In Review" />;
      case "Draft":
        return <Badge color="gray" text="Draft" />;
      default:
        return <Badge text={status} />;
    }
  };

  const filteredTranscriptions = transcriptions.filter((transcription) => {
    const matchesSearch =
      transcription.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transcription.patientId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transcription.specialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || transcription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportTranscription = (id, format) => {
    alert(`Exporting transcription ${id} as ${format}`);
  };

  const viewTranscription = (id) => {
    alert(`Viewing transcription ${id}`);
  };

  const editTranscription = (id) => {
    alert(`Editing transcription ${id}`);
  };

  const columns = [
    {
      title: "Patient",
      dataIndex: "patientName",
      key: "patientName",
      render: (text, record) => (
        <div>
          <div className="font-medium">{record.patientName}</div>
          <div className="text-gray-500">{record.patientId}</div>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: "Specialty",
      dataIndex: "specialty",
      key: "specialty",
      render: (text) => <Badge count={text}/>,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Words",
      dataIndex: "wordCount",
      key: "wordCount",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusBadge(status),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => {
        const menu = {
          items: [
            {
              key: "1",
              label: (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Eye size={16} /> View
                </span>
              ),
              onClick: () => viewTranscription(record.id),
            },
            {
              key: "2",
              label: (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Edit size={16} /> Edit
                </span>
              ),
              onClick: () => editTranscription(record.id),
              disabled: record.status === "Completed",
            },
            {
              key: "3",
              label: (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Download size={16} /> Export PDF
                </span>
              ),
              onClick: () => exportTranscription(record.id, "PDF"),
            },
            {
              key: "4",
              label: (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Download size={16} /> Export Word
                </span>
              ),
              onClick: () => exportTranscription(record.id, "Word"),
            },
          ],
        };

        return (
          <Dropdown menu={menu} trigger={["click"]}>
            <Button icon={<MoreHorizontal size={16} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transcription History</h1>
          <p className="text-gray-600">View and manage your transcriptions</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by patient name, ID, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 30 }}
          />
        </div>

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
        >
          <Option value="all">All Status</Option>
          <Option value="Completed">Completed</Option>
          <Option value="In Review">In Review</Option>
          <Option value="Draft">Draft</Option>
        </Select>

        <Select
          value={dateFilter}
          onChange={setDateFilter}
          style={{ width: 160 }}
        >
          <Option value="all">All Time</Option>
          <Option value="today">Today</Option>
          <Option value="week">This Week</Option>
          <Option value="month">This Month</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredTranscriptions}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};
