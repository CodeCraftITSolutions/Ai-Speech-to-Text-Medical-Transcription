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
import React, { useMemo } from "react";
import { useNavigate } from "react-router";

import useJobsData from "../../hooks/useJobsData.js";
import { useUser } from "../../context/UserContext.jsx";

const normaliseStatus = (status) =>
  typeof status === "string" ? status.toLowerCase() : "";

const formatStatus = (status) => {
  const value = normaliseStatus(status);
  if (!value) {
    return "Unknown";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getTimestamp = (job) => job.updated_at ?? job.created_at;

const formatNumber = (value) => Number(value ?? 0).toLocaleString();

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const role = user?.role ?? "assistant";
  const { jobs, stats, recentJobs, loading } = useJobsData();

  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return jobs.filter((job) => {
      if (normaliseStatus(job.status) !== "completed") {
        return false;
      }
      const timestamp = getTimestamp(job);
      if (!timestamp) {
        return false;
      }
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) {
        return false;
      }
      return date.toDateString() === today;
    }).length;
  }, [jobs]);

  const completedThisMonth = useMemo(() => {
    const now = new Date();
    return jobs.filter((job) => {
      if (normaliseStatus(job.status) !== "completed") {
        return false;
      }
      const timestamp = getTimestamp(job);
      if (!timestamp) {
        return false;
      }
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) {
        return false;
      }
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }).length;
  }, [jobs]);

  const inProgressCount = useMemo(
    () =>
      jobs.filter((job) => {
        const status = normaliseStatus(job.status);
        return status === "processing" || status === "pending";
      }).length,
    [jobs]
  );

  const recentActivityData = useMemo(
    () =>
      recentJobs.map((job) => {
        const status = normaliseStatus(job.status);
        const timestamp = getTimestamp(job);
        return {
          id: job.id,
          title: `Job #${job.id}`,
          description: job.type ?? "Transcription job",
          status: formatStatus(status),
          isCompleted: status === "completed",
          date: timestamp ? new Date(timestamp).toLocaleString() : "—",
        };
      }),
    [recentJobs]
  );

  const dashboardCards = useMemo(() => {
    const { total, inQueue, completed, failed, readyForReview } = stats;

    switch (role) {
      case "doctor":
        return [
          {
            title: "Today's Transcriptions",
            value: formatNumber(completedToday),
            description: `${formatNumber(completedThisMonth)} completed this month`,
            icon: FileText,
            color: "text-blue-600",
          },
          {
            title: "Pending Reviews",
            value: formatNumber(readyForReview),
            description: `${formatNumber(inQueue)} still processing`,
            icon: Clock,
            color: "text-orange-600",
          },
          {
            title: "Total Jobs",
            value: formatNumber(total),
            description: `${formatNumber(completed)} completed overall`,
            icon: TrendingUp,
            color: "text-green-600",
          },
        ];
      case "transcriptionist":
        return [
          {
            title: "Review Queue",
            value: formatNumber(readyForReview),
            description: `${formatNumber(inProgressCount)} in progress`,
            icon: UserCheck,
            color: "text-blue-600",
          },
          {
            title: "Completed Today",
            value: formatNumber(completedToday),
            description: `${formatNumber(completedThisMonth)} this month`,
            icon: FileText,
            color: "text-green-600",
          },
          {
            title: "Active Jobs",
            value: formatNumber(inQueue),
            description: `${formatNumber(failed)} needing attention`,
            icon: Clock,
            color: "text-purple-600",
          },
        ];
      case "admin":
        return [
          {
            title: "Total Jobs",
            value: formatNumber(total),
            description: `${formatNumber(completed)} completed to date`,
            icon: BarChart3,
            color: "text-blue-600",
          },
          {
            title: "Ready for Review",
            value: formatNumber(readyForReview),
            description: `${formatNumber(inQueue)} still queued`,
            icon: UserCheck,
            color: "text-green-600",
          },
          {
            title: "Failed Jobs",
            value: formatNumber(failed),
            description: "Requires follow-up",
            icon: Shield,
            color: "text-orange-600",
          },
        ];
      default:
        return [];
    }
  }, [
    stats,
    role,
    completedToday,
    completedThisMonth,
    inProgressCount,
  ]);

  const quickActions = useMemo(() => {
    switch (role) {
      case "doctor":
        return [
          {
            title: "Start New Transcription",
            description: "Begin a new patient recording",
            icon: Mic,
            action: () => navigate("new-transcription"),
            primary: true,
          },
          {
            title: "View History",
            description: "Browse past transcriptions",
            icon: History,
            action: () => navigate("/dashboard/history"),
            primary: false,
          },
        ];
      case "transcriptionist":
        return [
          {
            title: "Review Queue",
            description: "Review pending transcriptions",
            icon: UserCheck,
            action: () => navigate("/dashboard/review"),
            primary: true,
          },
          {
            title: "View History",
            description: "Browse completed work",
            icon: History,
            action: () => navigate("/dashboard/history"),
            primary: false,
          },
        ];
      case "admin":
        return [
          {
            title: "Admin Panel",
            description: "Manage users and system",
            icon: Shield,
            action: () => navigate("/dashboard/admin"),
            primary: true,
          },
          {
            title: "View Analytics",
            description: "System usage reports",
            icon: BarChart3,
            action: () => navigate("/dashboard/history"),
            primary: false,
          },
        ];
      default:
        return [];
    }
  }, [navigate, role]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="bg-card border-border md:w-72 lg:w-auto">
              <div className="flex items-center gap-4">
                <Icon className={`w-6 sm:w-8 h-6 sm:h-8 ${card.color}`} />
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    {card.value}
                  </p>
                  <p className="text-muted-foreground">{card.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Divider className="my-6" />
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="bg-card hover:shadow-md transition-shadow border-border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      action.primary
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="w-3 sm:w-5 h-3 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-foreground">
                      {action.title}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                      {action.description}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={action.action}
                  className={`w-full my-1 ${
                    action.primary ? "btn-primary" : "btn-outline"
                  }`}
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
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Card className="w-full bg-card border-border">
          <div className="space-y-4">
            {recentActivityData.length > 0 ? (
              recentActivityData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 mb-1 border-gray-200 border-b"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.isCompleted
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{item.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                {loading ? "Loading activity..." : "No recent activity yet."}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
