import { Button, Card, Divider } from "antd";
import {
  BarChart3,
  Clock,
  FileText,
  History,
  Mic,
  Shield,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import React from "react";

export const Home = ({ user, onNavigate }) => {
  const getDashboardCards = () => {
    switch (user.role) {
      case "doctor":
        return [
          {
            title: "Today's Transcriptions",
            value: "12",
            description: "+3 from yesterday",
            icon: FileText,
            color: "text-blue-600",
          },
          {
            title: "Pending Reviews",
            value: "4",
            description: "Awaiting transcriptionist",
            icon: Clock,
            color: "text-orange-600",
          },
          {
            title: "This Month",
            value: "156",
            description: "Total transcriptions",
            icon: TrendingUp,
            color: "text-green-600",
          },
        ];
      case "transcriptionist":
        return [
          {
            title: "Review Queue",
            value: "8",
            description: "Pending reviews",
            icon: UserCheck,
            color: "text-blue-600",
          },
          {
            title: "Completed Today",
            value: "15",
            description: "+2 from yesterday",
            icon: FileText,
            color: "text-green-600",
          },
          {
            title: "Average Time",
            value: "12m",
            description: "Per transcription",
            icon: Clock,
            color: "text-purple-600",
          },
        ];
      case "admin":
        return [
          {
            title: "Total Users",
            value: "45",
            description: "12 doctors, 8 transcriptionists",
            icon: Shield,
            color: "text-blue-600",
          },
          {
            title: "System Usage",
            value: "89%",
            description: "This month",
            icon: BarChart3,
            color: "text-green-600",
          },
          {
            title: "Active Sessions",
            value: "23",
            description: "Currently online",
            icon: TrendingUp,
            color: "text-orange-600",
          },
        ];
      default:
        return [];
    }
  };

  const getQuickActions = () => {
    switch (user.role) {
      case "doctor":
        return [
          {
            title: "Start New Transcription",
            description: "Begin a new patient recording",
            icon: Mic,
            action: () => onNavigate("new-transcription"),
            primary: true,
          },
          {
            title: "View History",
            description: "Browse past transcriptions",
            icon: History,
            action: () => onNavigate("history"),
            primary: false,
          },
        ];
      case "transcriptionist":
        return [
          {
            title: "Review Queue",
            description: "Review pending transcriptions",
            icon: UserCheck,
            action: () => onNavigate("review"),
            primary: true,
          },
          {
            title: "View History",
            description: "Browse completed work",
            icon: History,
            action: () => onNavigate("history"),
            primary: false,
          },
        ];
      case "admin":
        return [
          {
            title: "Admin Panel",
            description: "Manage users and system",
            icon: Shield,
            action: () => onNavigate("admin"),
            primary: true,
          },
          {
            title: "View Analytics",
            description: "System usage reports",
            icon: BarChart3,
            action: () => onNavigate("history"),
            primary: false,
          },
        ];
      default:
        return [];
    }
  };

  const recentActivityData = [
  { patient: "John Smith", date: "2 hours ago", status: "Completed", type: "Cardiology Consultation" },
  { patient: "Sarah Johnson", date: "4 hours ago", status: "In Review", type: "Follow-up Visit" },
  { patient: "Michael Brown", date: "1 day ago", status: "Completed", type: "Initial Assessment" },
];

  const dashboardCards = getDashboardCards();
  const quickActions = getQuickActions();
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} style={{ width: 300 }}>
              <div className="flex items-center gap-4">
                <Icon className={`w-8 h-8 ${card.color}`} />
                <div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-gray-500">{card.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Divider className="my-6" />
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className=" hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      action.primary
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold"> {action.title}</h3>
                    <p className="text-gray-500">{action.description}</p>
                  </div>
                </div>
                <Button
                  onClick={action.action}
                  variant={action.primary ? "default" : "outline"}
                  className="w-full my-1"
                >
                  {action.primary ? "Get Started" : "View"}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
      <Divider className="my-6" />
      <div>
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Card className="w-full">
          <div className="space-y-4">
            {recentActivityData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 mb-1 border-gray-200 border-b"
              >
                <div>
                  <p className="font-medium">{item.patient}</p>
                  <p className="text-sm text-gray-500">{item.type}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
