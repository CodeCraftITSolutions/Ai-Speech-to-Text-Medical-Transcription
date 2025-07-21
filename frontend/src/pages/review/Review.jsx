import { Badge, Button, Card, Input, Table } from "antd";
import { CheckCircle, Clock, FileText, MessageSquare } from "lucide-react";
import React, { useState } from "react";

const { TextArea } = Input;

export const Review = () => {
  const [selectedTranscription, setSelectedTranscription] = useState(null);
  const [reviewComment, setReviewComment] = useState("");

  const pendingReviews = [
    {
      id: "T002",
      patientName: "Emily Davis",
      patientId: "P12346",
      doctor: "Dr. Sarah Johnson",
      date: "2024-01-14",
      specialty: "Cardiology",
      duration: "08:22",
      wordCount: 324,
      priority: "High",
      transcript:
        "Patient presents with chest pain and shortness of breath. Blood pressure is 140 over 90. Heart rate is regular at 72 beats per minute. Lungs are clear to auscultation bilaterally. No murmurs, rubs, or gallops appreciated. Recommend ECG and chest X-ray.",
    },
    {
      id: "T006",
      patientName: "Robert Johnson",
      patientId: "P12350",
      doctor: "Dr. Michael Chen",
      date: "2024-01-14",
      specialty: "Neurology",
      duration: "15:30",
      wordCount: 567,
      priority: "Medium",
      transcript:
        "Patient complains of headaches and dizziness for the past week. Neurological examination shows normal reflexes. No focal deficits noted. Blood pressure within normal limits. Recommend MRI brain and follow-up in two weeks.",
    },
    {
      id: "T007",
      patientName: "Lisa Anderson",
      patientId: "P12351",
      doctor: "Dr. Jennifer Lee",
      date: "2024-01-13",
      specialty: "Orthopedics",
      duration: "12:45",
      wordCount: 445,
      priority: "Low",
      transcript:
        "Patient presents with knee pain after fall. Physical examination reveals swelling and tenderness over the lateral aspect of the right knee. Range of motion is limited due to pain. X-rays show no fracture. Recommend rest, ice, and anti-inflammatory medication.",
    },
  ];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return <Badge color="red" text="High" />;
      case "Medium":
        return <Badge color="orange" text="Medium" />;
      case "Low":
        return <Badge color="green" text="Low" />;
      default:
        return <Badge text={priority} />;
    }
  };

  const approveTranscription = (id) => {
    alert(`Transcription ${id} approved and finalized!`);
    setSelectedTranscription(null);
  };

  const requestChanges = (id) => {
    if (reviewComment.trim()) {
      alert(`Change request sent for transcription ${id}`);
      setSelectedTranscription(null);
      setReviewComment("");
    } else {
      alert("Please add a comment explaining the required changes.");
    }
  };

  const columns = [
    {
      title: "Patient",
      dataIndex: "patientName",
      key: "patientName",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.patientName}</div>
          <div className="text-sm text-gray-500">{record.patientId}</div>
        </div>
      ),
    },
    {
      title: "Doctor",
      dataIndex: "doctor",
      key: "doctor",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.doctor}</div>
          <div className="text-sm text-gray-500">{record.specialty}</div>
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => getPriorityBadge(priority),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button size="small" onClick={() => setSelectedTranscription(record)}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review Queue</h1>
          <p className="text-gray-600">
            Review and approve pending transcriptions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          title="Pending Reviews"
          extra={<Clock className="h-4 w-4 text-orange-600" />}
        >
          <div className="text-2xl font-bold">{pendingReviews.length}</div>
          <p className="text-xs text-gray-500">Awaiting review</p>
        </Card>

        <Card
          title="High Priority"
          extra={<Clock className="h-4 w-4 text-red-600" />}
        >
          <div className="text-2xl font-bold">
            {pendingReviews.filter((r) => r.priority === "High").length}
          </div>
          <p className="text-xs text-gray-500">Urgent reviews</p>
        </Card>

        <Card
          title="Completed Today"
          extra={<CheckCircle className="h-4 w-4 text-green-600" />}
        >
          <div className="text-2xl font-bold">15</div>
          <p className="text-xs text-gray-500">Reviews completed</p>
        </Card>

        <Card
          title="Average Time"
          extra={<Clock className="h-4 w-4 text-blue-600" />}
        >
          <div className="text-2xl font-bold">12m</div>
          <p className="text-xs text-gray-500">Per review</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Pending Reviews"
          extra={`${pendingReviews.length} transcriptions awaiting review`}
        >
          <Table
            columns={columns}
            dataSource={pendingReviews}
            rowKey="id"
            pagination={false}
          />
        </Card>

        <Card
          title="Review Editor"
          extra={
            selectedTranscription
              ? `Reviewing: ${selectedTranscription.patientName}`
              : "Select a transcription to review"
          }
        >
          {selectedTranscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    Patient
                  </div>
                  <div>{selectedTranscription.patientName}</div>
                  <div className="text-sm text-gray-500">
                    {selectedTranscription.patientId}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    Doctor
                  </div>
                  <div>{selectedTranscription.doctor}</div>
                  <div className="text-sm text-gray-500">
                    {selectedTranscription.specialty}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Date</div>
                  <div>
                    {new Date(selectedTranscription.date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    Duration
                  </div>
                  <div>{selectedTranscription.duration}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Transcript</label>
                <TextArea
                  rows={8}
                  value={selectedTranscription.transcript}
                  onChange={(e) =>
                    setSelectedTranscription({
                      ...selectedTranscription,
                      transcript: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Review Comments</label>
                <TextArea
                  rows={4}
                  placeholder="Add comments or notes for the doctor..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="primary"
                  onClick={() => approveTranscription(selectedTranscription.id)}
                  className="flex-1"
                  icon={<CheckCircle className="w-4 h-4 mr-2" />}
                >
                  Approve & Finalize
                </Button>
                <Button
                  onClick={() => requestChanges(selectedTranscription.id)}
                  className="flex-1"
                  icon={<MessageSquare className="w-4 h-4 mr-2" />}
                >
                  Request Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a transcription from the queue to begin reviewing</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
