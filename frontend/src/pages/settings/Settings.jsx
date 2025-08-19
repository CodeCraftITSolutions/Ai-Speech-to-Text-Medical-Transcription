import {
  Button,
  Card,
  ConfigProvider,
  Input,
  Select,
  Switch,
  Tabs,
} from "antd";
import {
  Bell,
  Eye,
  EyeOff,
  Lock,
  Mic,
  Palette,
  Save,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import PhoneInput from "react-phone-input-2";
import PhoneNumberInput from "../../components/phoneNumberInput/PhoneNumberInput";
import { useUser } from "../../context/UserContext";

const { Option } = Select;



export const Settings = () => {
  const { user } = useUser();
  // const [showPassword, setShowPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    transcriptionComplete: true,
    reviewRequired: true,
    systemUpdates: false,
  });

  const saveSettings = () => {
    alert("Settings saved successfully!");
  };

  const handlePhoneChange = (fullNumber) => {
    console.log("Phone:", fullNumber);
  };

  const ProfileCard = () => (
    <Card
      title="Profile Information"
      extra={<User className="w-5 h-5" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        <Input
          placeholder="First Name"
          defaultValue={user.name.split(" ")[0]}
        />
        <Input
          placeholder="Last Name"
          defaultValue={user.name.split(" ").slice(1).join(" ")}
        />
      </div>
      <div className="mb-2">
        <Input
          className="mb-2"
          placeholder="Email Address"
          defaultValue={user.email}
        />
      </div>

      <div className="mb-2">
        {user.role === "doctor" && (
          <ConfigProvider
            theme={{
              token: {
                colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
                colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",

                optionSelectedBg: theme === "dark" ? "#bfbfbf" : "#000000",
                selectorBg: theme === "dark" ? "#1f1f1f" : "#ffffff",
                optionSelectedColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
                optionActiveBg: theme === "dark" ? "#bfbfbf" : "#bfbfbf",
                colorBgElevated: theme === "dark" ? "#1f1f1f" : "#ffffff",
              },
            }}
          >
            <Select
              defaultValue={user.specialty?.toLowerCase()}
              className="mt-4 w-full"
            >
              <Option value="cardiology">Cardiology</Option>
              <Option value="neurology">Neurology</Option>
              <Option value="orthopedics">Orthopedics</Option>
              <Option value="internal-medicine">Internal Medicine</Option>
              <Option value="pediatrics">Pediatrics</Option>
              <Option value="surgery">Surgery</Option>
            </Select>
          </ConfigProvider>
        )}
      </div>

      <PhoneNumberInput onChange={handlePhoneChange} />
    </Card>
  );

  const SecurityCard = () => (
    <Card title="Password & Security" extra={<Lock className="w-5 h-5" />}>
      <Input.Password placeholder="Current Password" className="mt-2" />
      <Input.Password placeholder="New Password" className="mt-4" />
      <Input.Password placeholder="Confirm New Password" className="mt-4" />

      <div className="flex justify-between items-center mt-4">
        <span>Two-Factor Authentication</span>
        <Switch />
      </div>
      <div className="flex justify-between items-center mt-4">
        <span>Login Notifications</span>
        <Switch defaultChecked />
      </div>
    </Card>
  );

  const AudioCard = () => (
    <Card title="Audio Configuration" extra={<Mic className="w-5 h-5" />}>
      <div className="flex flex-col gap-2">
        <ConfigProvider
          theme={{
            token: {
              colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
              colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
              optionSelectedBg: theme === "dark" ? "#bfbfbf" : "#000000",
              selectorBg: theme === "dark" ? "#1f1f1f" : "#ffffff",
              optionSelectedColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
              optionActiveBg: theme === "dark" ? "#bfbfbf" : "#bfbfbf",
              colorBgElevated: theme === "dark" ? "#757575" : "#ffffff",
            },
          }}
        >
          <Select defaultValue="default" className="w-full mt-2">
            <Option value="default">Default System Microphone</Option>
            <Option value="usb">USB Headset Microphone</Option>
            <Option value="bluetooth">Bluetooth Headset</Option>
          </Select>
        </ConfigProvider>
        <ConfigProvider
          theme={{
            token: {
              colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
              colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
              optionSelectedBg: theme === "dark" ? "#bfbfbf" : "#000000",
              selectorBg: theme === "dark" ? "#1f1f1f" : "#ffffff",
              optionSelectedColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
              optionActiveBg: theme === "dark" ? "#bfbfbf" : "#bfbfbf",
              colorBgElevated: theme === "dark" ? "#757575" : "#ffffff",
            },
          }}
        >
          <Select defaultValue="high" className="w-full mt-4">
            <Option value="low">Low (16kHz)</Option>
            <Option value="medium">Medium (22kHz)</Option>
            <Option value="high">High (44kHz)</Option>
          </Select>
        </ConfigProvider>
        <ConfigProvider
          theme={{
            token: {
              colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
              colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
              optionSelectedBg: theme === "dark" ? "#bfbfbf" : "#000000",
              selectorBg: theme === "dark" ? "#1f1f1f" : "#ffffff",
              optionSelectedColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
              optionActiveBg: theme === "dark" ? "#bfbfbf" : "#bfbfbf",
              colorBgElevated: theme === "dark" ? "#757575" : "#ffffff",
            },
          }}
        >
          <Select defaultValue="medium" className="w-full mt-4">
            <Option value="off">Off</Option>
            <Option value="low">Low</Option>
            <Option value="medium">Medium</Option>
            <Option value="high">High</Option>
          </Select>
        </ConfigProvider>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span>Auto-gain Control</span>
        <Switch defaultChecked />
      </div>
      <div className="flex justify-between items-center mt-4">
        <span>Echo Cancellation</span>
        <Switch defaultChecked />
      </div>
    </Card>
  );

  const PreferencesCard = () => (
    <Card
      title="Application Preferences"
      extra={<Palette className="w-5 h-5" />}
    >
      <div className="flex justify-between items-center my-2">
        <span>Dark Mode</span>
        <Switch checked={theme === "dark"} onChange={toggleTheme} />
      </div>
      <div className="flex flex-col gap-2">
        <ConfigProvider
          theme={{
            token: {
              colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
              colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
              optionSelectedBg: theme === "dark" ? "#bfbfbf" : "#000000",
              selectorBg: theme === "dark" ? "#1f1f1f" : "#ffffff",
              optionSelectedColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
              optionActiveBg: theme === "dark" ? "#bfbfbf" : "#bfbfbf",
              colorBgElevated: theme === "dark" ? "#757575" : "#ffffff",
            },
          }}
        >
          <Select defaultValue="pdf" className="w-full mt-4">
            <Option value="pdf">PDF</Option>
            <Option value="docx">Microsoft Word</Option>
            <Option value="txt">Plain Text</Option>
          </Select>
        </ConfigProvider>
        <ConfigProvider
          theme={{
            token: {
              colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
              colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
              optionSelectedBg: theme === "dark" ? "#bfbfbf" : "#000000",
              selectorBg: theme === "dark" ? "#1f1f1f" : "#ffffff",
              optionSelectedColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
              optionActiveBg: theme === "dark" ? "#bfbfbf" : "#bfbfbf",
              colorBgElevated: theme === "dark" ? "#757575" : "#ffffff",
            },
          }}
        >
          <Select defaultValue="en" className="w-full mt-4">
            <Option value="en">English</Option>
            <Option value="es">Spanish</Option>
            <Option value="fr">French</Option>
          </Select>
        </ConfigProvider>
        <ConfigProvider
          theme={{
            token: {
              colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
              colorText: theme === "dark" ? "#ffffff" : "#0a0a0a",
              optionSelectedBg: theme === "dark" ? "#bfbfbf" : "#000000",
              selectorBg: theme === "dark" ? "#1f1f1f" : "#ffffff",
              optionSelectedColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
              optionActiveBg: theme === "dark" ? "#bfbfbf" : "#bfbfbf",
              colorBgElevated: theme === "dark" ? "#757575" : "#ffffff",
            },
          }}
        >
          <Select defaultValue="est" className="w-full mt-4">
            <Option value="est">Eastern Time (EST)</Option>
            <Option value="cst">Central Time (CST)</Option>
            <Option value="mst">Mountain Time (MST)</Option>
            <Option value="pst">Pacific Time (PST)</Option>
          </Select>
        </ConfigProvider>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span>Auto-save Drafts</span>
        <Switch defaultChecked />
      </div>
      <div className="flex justify-between items-center mt-4">
        <span>Show Medical Term Highlights</span>
        <Switch defaultChecked />
      </div>
    </Card>
  );

  const NotificationsCard = () => (
    <Card title="Notification Preferences" extra={<Bell className="w-5 h-5" />}>
      <div className="flex justify-between items-center mt-2">
        <span>Email Notifications</span>
        <Switch
          checked={notifications.email}
          onChange={(checked) =>
            setNotifications({ ...notifications, email: checked })
          }
        />
      </div>
      <div className="flex justify-between items-center mt-4">
        <span>Push Notifications</span>
        <Switch
          checked={notifications.push}
          onChange={(checked) =>
            setNotifications({ ...notifications, push: checked })
          }
        />
      </div>
      <h4 className="font-medium mt-6">Notification Types</h4>
      <div className="flex justify-between items-center mt-4">
        <span>Transcription Complete</span>
        <Switch
          checked={notifications.transcriptionComplete}
          onChange={(checked) =>
            setNotifications({
              ...notifications,
              transcriptionComplete: checked,
            })
          }
        />
      </div>
      <div className="flex justify-between items-center mt-4">
        <span>Review Required</span>
        <Switch
          checked={notifications.reviewRequired}
          onChange={(checked) =>
            setNotifications({
              ...notifications,
              reviewRequired: checked,
            })
          }
        />
      </div>
      <div className="flex justify-between items-center mt-4">
        <span>System Updates</span>
        <Switch
          checked={notifications.systemUpdates}
          onChange={(checked) =>
            setNotifications({
              ...notifications,
              systemUpdates: checked,
            })
          }
        />
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>
        <Button onClick={saveSettings} icon={<Save className="w-4 h-4" />}>
          Save Changes
        </Button>
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
        <Tabs defaultActiveKey="profile"
           items=
          {[
            {
              key: "profile",
              label: "Profile",
              children: <ProfileCard />,
            },
            {
              key: "security",
              label: "Security",
              children: <SecurityCard />,
            },
            {
              key: "audio",
              label: "Audio",
              children: <AudioCard />,
            },
            {
              key: "preferences",
              label: "Preferences",
              children: <PreferencesCard />,
            },
            {
              key: "notifications",
              label: "Notifications",
              children: <NotificationsCard />,
            },
          ]}/>

      </ConfigProvider>
    </div>
  );
};
