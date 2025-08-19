import {
  Badge,
  Button,
  Card,
  ConfigProvider,
  Dropdown,
  Input,
  Menu,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
} from "antd";
import {
  Activity,
  BarChart3,
  Database,
  Edit,
  Mic,
  MoreHorizontal,
  Plus,
  Shield,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import React from "react";
import { useTheme } from "../../context/ThemeContext";

const { Option } = Select;

export const Admin = () => {
  // const [showAddUser, setShowAddUser] = useState(false);
  
const { theme } = useTheme();
  const users = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@hospital.com",
      role: "doctor",
      specialty: "Cardiology",
      status: "Active",
      lastLogin: "2024-01-15 09:30",
      transcriptions: 156,
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      email: "michael.chen@hospital.com",
      role: "doctor",
      specialty: "Neurology",
      status: "Active",
      lastLogin: "2024-01-15 08:45",
      transcriptions: 89,
    },
    {
      id: "3",
      name: "Alice Smith",
      email: "alice.smith@hospital.com",
      role: "transcriptionist",
      specialty: null,
      status: "Active",
      lastLogin: "2024-01-15 10:15",
      transcriptions: 234,
    },
    {
      id: "4",
      name: "Bob Wilson",
      email: "bob.wilson@hospital.com",
      role: "transcriptionist",
      specialty: null,
      status: "Inactive",
      lastLogin: "2024-01-10 16:20",
      transcriptions: 67,
    },
  ];

  const analytics = {
    totalTranscriptions: 1247,
    monthlyGrowth: 12.5,
    averageAccuracy: 94.2,
    systemUptime: 99.8,
    activeUsers: 23,
    storageUsed: 67.3,
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "doctor":
        return <Badge color="blue" text="Doctor" />;
      case "transcriptionist":
        return <Badge color="green" text="Transcriptionist" />;
      case "admin":
        return <Badge color="purple" text="Admin" />;
      default:
        return <Badge text={role} />;
    }
  };

  const getStatusBadge = (status) => {
    return status === "Active" ? (
      <Badge color="green" text="Active" />
    ) : (
      <Badge color="red" text="Inactive" />
    );
  };

  const menu = [
        {
          key: "1",
          icon: <Edit className="w-4 h-4" />,
          label: "Edit User",
        },
        {
          key: "2",
          icon: <Shield className="w-4 h-4" />,
          label: "Reset Password",
        },
        {
          key: "3",
          danger: true,
          icon: <Trash2 className="w-4 h-4" />,
          label: "Delete User",
        },
      ]


  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.name}</div>
          {record.specialty && (
            <div className="text-sm text-gray-500">{record.specialty}</div>
          )}
        </div>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => getRoleBadge(role),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusBadge(status),
    },
    { title: "Last Login", dataIndex: "lastLogin", key: "lastLogin" },
    {
      title: "Transcriptions",
      dataIndex: "transcriptions",
      key: "transcriptions",
    },
    {
      title: "Actions",
      key: "action",
      align: "right",
      render: () => (
        <Dropdown menu={{ items: menu }} trigger={["click"]}>
          <Button icon={<MoreHorizontal size={16} />} />
        </Dropdown>
      ),
    },
  ];

  const tabItems = [
    {
      key: "1",
      label: "User Management",
      children: (
        <div className="overflow-x-auto ">
          <div className="min-w-[1000px]">
            <Card
              title="User Management"
              // extra={
              //   <Button onClick={() => setShowAddUser(true)}>
              //     <Plus className="w-4 h-4 mr-2" />
              //     Add User
              //   </Button>
              // }
            >
              <Table dataSource={users} columns={columns} rowKey="id" />
            </Card>
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "System Settings",
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="ASR Engine Configuration">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <label>Primary ASR Engine</label>
                <Select defaultValue="whisper" style={{ width: "100%" }}>
                  <Option value="whisper">OpenAI Whisper</Option>
                  <Option value="aws">AWS Transcribe Medical</Option>
                  <Option value="google">Google Speech-to-Text</Option>
                </Select>
              </div>
              <div>
                <label>Medical Vocabulary</label>
                <Select defaultValue="comprehensive" style={{ width: "100%" }}>
                  <Option value="basic">Basic Medical Terms</Option>
                  <Option value="comprehensive">Comprehensive Medical</Option>
                  <Option value="specialty">Specialty Specific</Option>
                </Select>
              </div>
              <div className="flex justify-between items-center">
                <label>Real-time Processing</label>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                <label>Auto-punctuation</label>
                <Switch defaultChecked />
              </div>
            </Space>
          </Card>

          <Card title="Security Settings">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div className="flex justify-between items-center">
                <label>Two-Factor Authentication</label>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                <label>HIPAA Compliance Mode</label>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                <label>Audit Logging</label>
                <Switch defaultChecked />
              </div>
              <div>
                <label>Session Timeout (minutes)</label>
                <Input type="number" defaultValue={30} />
              </div>
              <div>
                <label>Password Policy</label>
                <Select defaultValue="strong" style={{ width: "100%" }}>
                  <Option value="basic">Basic (8+ characters)</Option>
                  <Option value="strong">Strong (12+ chars, mixed case)</Option>
                  <Option value="enterprise">
                    Enterprise (16+ chars, complex)
                  </Option>
                </Select>
              </div>
            </Space>
          </Card>
        </div>
      ),
    },
    {
      key: "3",
      label: "Analytics",
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Usage Statistics">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Daily Active Users</span>
                <span className="font-bold">23</span>
              </div>
              <div className="flex justify-between">
                <span>Transcriptions Today</span>
                <span className="font-bold">47</span>
              </div>
              <div className="flex justify-between">
                <span>Average Session Duration</span>
                <span className="font-bold">24m</span>
              </div>
              <div className="flex justify-between">
                <span>Peak Usage Time</span>
                <span className="font-bold">10:00 AM</span>
              </div>
            </div>
          </Card>

          <Card title="Performance Metrics">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Average Response Time</span>
                <span className="font-bold">1.2s</span>
              </div>
              <div className="flex justify-between">
                <span>Transcription Accuracy</span>
                <span className="font-bold">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Error Rate</span>
                <span className="font-bold">0.3%</span>
              </div>
              <div className="flex justify-between">
                <span>System Load</span>
                <span className="font-bold">67%</span>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: "4",
      label: "System Logs",
      children: (
        <Card title="System Logs">
          <div className="space-y-2 font-mono text-sm">
            <div
              className={`p-2 rounded ${
                theme === "dark" ? "bg-green-800" : "bg-green-50"
              }`}
            >
              <span className="text-green-600">[INFO]</span> 2024-01-15 10:30:15
              - User login: sarah.johnson@hospital.com
            </div>
            <div
              className={`p-2 rounded ${
                theme === "dark" ? "bg-blue-800" : "bg-blue-50"
              }`}
            >
              <span className="text-blue-600">[INFO]</span> 2024-01-15 10:28:42
              - Transcription completed: T001
            </div>
            <div
              className={`p-2 rounded ${
                theme === "dark" ? "bg-yellow-800" : "bg-yellow-50"
              }`}
            >
              <span className="text-yellow-600">[WARN]</span> 2024-01-15
              10:25:33 - High CPU usage detected: 85%
            </div>
            <div
              className={`p-2 rounded ${
                theme === "dark" ? "bg-green-800" : "bg-green-50"
              }`}
            >
              <span className="text-green-600">[INFO]</span> 2024-01-15 10:22:18
              - Database backup completed
            </div>
            <div
              className={`p-2 rounded ${
                theme === "dark" ? "bg-red-800" : "bg-red-50"
              }`}
            >
              <span className="text-red-600">[ERROR]</span> 2024-01-15 10:15:07
              - ASR service timeout for user ID: 3
            </div>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, system settings, and analytics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className="bg-card border-border"
          title={
            <div className="flex items-center justify-between">
              <h3 className="text-foreground">Total Users</h3>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          }
        >
          <div className="text-2xl font-bold text-foreground">
            {users.length}
          </div>
          <p className="text-xs text-muted-foreground">Active accounts</p>
        </Card>
        <Card
          className="bg-card border-border"
          title={
            <div className="flex items-center justify-between">
              <h3 className="text-foreground">Transcriptions</h3>
              <Mic className="h-4 w-4 text-green-600" />
            </div>
          }
        >
          <div className="text-2xl font-bold text-foreground">
            {analytics.totalTranscriptions}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </Card>
        {/* <Card
          className="bg-card border-border"
          title={
            <div className="flex items-center justify-between">
              <h3 className="text-foreground">Growth</h3>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          }
        >
          <div className="text-2xl font-bold text-foreground">
            +{analytics.monthlyGrowth}%
          </div>
          <p className="text-xs text-muted-foreground">vs last month</p>
        </Card> */}
        <Card
          className="bg-card border-border"
          title={
            <div className="flex items-center justify-between">
              <h3 className="text-foreground">Accuracy</h3>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
          }
        >
          <div className="text-2xl font-bold text-foreground">
            {analytics.averageAccuracy}%
          </div>
          <p className="text-xs text-muted-foreground">Average accuracy</p>
        </Card>
        {/* <Card
          className="bg-card border-border"
          title={
            <div className="flex items-center justify-between">
              <h3 className="text-foreground">Uptime</h3>
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          }
        >
          <div className="text-2xl font-bold text-foreground">
            {analytics.systemUptime}%
          </div>
          <p className="text-xs text-muted-foreground">System uptime</p>
        </Card> */}
        {/* <Card
          className="bg-card border-border"
          title={
            <div className="flex items-center justify-between">
              <h3 className="text-foreground">Storage</h3>
              <Database className="h-4 w-4 text-red-600" />
            </div>
          }
        >
          <div className="text-2xl font-bold text-foreground">
            {analytics.storageUsed}%
          </div>
          <p className="text-xs text-muted-foreground">Storage used</p>
        </Card> */}
      </div>
      <ConfigProvider
        theme={{
          token: {
            colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
            colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
            colorBorder: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
            colorTextPlaceholder: theme === "dark" ? "#888888" : "#bfbfbf",
            activeBorderColor: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
            hoverBorderColor: theme === "dark" ? "#bfbfbf" : "#d9d9d9",
            itemColor: "rgb(250,219,20)",
            itemHoverColor: "rgb(114,46,209)",
          },
        }}
      >
        <Tabs items={tabItems} />
      </ConfigProvider>
    </div>
  );
};
