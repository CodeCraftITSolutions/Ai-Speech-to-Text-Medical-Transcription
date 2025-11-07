// src/pages/settings/Settings.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Button,
  Card,
  ConfigProvider,
  Input,
  Select,
  Switch,
  Tabs,
  message,
} from "antd";
import {
  Bell,
  Lock,
  Mic,
  Palette,
  Save,
  User as UserIcon,
} from "lucide-react";
import PhoneNumberInput from "../../components/phoneNumberInput/PhoneNumberInput";
import { useUser } from "../../context/UserContext.jsx";
import { useTheme } from "../../context/ThemeContext";
import { updateCurrentUser } from "../../api/client";

const { Option } = Select;

/* --------------------------- Memoized subcomponents -------------------------- */

const ProfileCard = React.memo(function ProfileCard({
  themeMode,
  user,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phoneNumber,
  handlePhoneChange,
}) {
  const username = user?.username ?? "";

  return (
    <Card title="Profile Information" extra={<UserIcon className="w-5 h-5" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        <Input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <Input className="mb-2" placeholder="Username" value={username} disabled />
      </div>

      <div className="mb-2">
        {user?.role === "doctor" && (
          <Select
            defaultValue={user?.specialty?.toLowerCase()}
            className="mt-4 w-full"
          >
            <Option value="cardiology">Cardiology</Option>
            <Option value="neurology">Neurology</Option>
            <Option value="orthopedics">Orthopedics</Option>
            <Option value="internal-medicine">Internal Medicine</Option>
            <Option value="pediatrics">Pediatrics</Option>
            <Option value="surgery">Surgery</Option>
          </Select>
        )}
      </div>

      <PhoneNumberInput value={phoneNumber} onChange={handlePhoneChange} />
    </Card>
  );
});

const SecurityCard = React.memo(function SecurityCard() {
  return (
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
});

const AudioCard = React.memo(function AudioCard({ themeMode }) {
  return (
    <Card title="Audio Configuration" extra={<Mic className="w-5 h-5" />}>
      <div className="flex flex-col gap-2">
        <Select defaultValue="default" className="w-full mt-2">
          <Option value="default">Default System Microphone</Option>
          <Option value="usb">USB Headset Microphone</Option>
          <Option value="bluetooth">Bluetooth Headset</Option>
        </Select>

        <Select defaultValue="high" className="w-full mt-4">
          <Option value="low">Low (16kHz)</Option>
          <Option value="medium">Medium (22kHz)</Option>
          <Option value="high">High (44kHz)</Option>
        </Select>

        <Select defaultValue="medium" className="w-full mt-4">
          <Option value="off">Off</Option>
          <Option value="low">Low</Option>
          <Option value="medium">Medium</Option>
          <Option value="high">High</Option>
        </Select>
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
});

const PreferencesCard = React.memo(function PreferencesCard({
  themeMode,
  toggleTheme,
}) {
  return (
    <Card title="Application Preferences" extra={<Palette className="w-5 h-5" />}>
      <div className="flex justify-between items-center my-2">
        <span>Dark Mode</span>
        <Switch checked={themeMode === "dark"} onChange={toggleTheme} />
      </div>

      <div className="flex flex-col gap-2">
        <Select defaultValue="pdf" className="w-full mt-4">
          <Option value="pdf">PDF</Option>
          <Option value="docx">Microsoft Word</Option>
          <Option value="txt">Plain Text</Option>
        </Select>

        <Select defaultValue="en" className="w-full mt-4">
          <Option value="en">English</Option>
          <Option value="es">Spanish</Option>
          <Option value="fr">French</Option>
        </Select>

        <Select defaultValue="est" className="w-full mt-4">
          <Option value="est">Eastern Time (EST)</Option>
          <Option value="cst">Central Time (CST)</Option>
          <Option value="mst">Mountain Time (MST)</Option>
          <Option value="pst">Pacific Time (PST)</Option>
        </Select>
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
});

const NotificationsCard = React.memo(function NotificationsCard({
  notifications,
  setNotifications,
}) {
  return (
    <Card title="Notification Preferences" extra={<Bell className="w-5 h-5" />}>
      <div className="flex justify-between items-center mt-2">
        <span>Email Notifications</span>
        <Switch
          checked={notifications.email}
          onChange={(checked) =>
            setNotifications((p) => ({ ...p, email: checked }))
          }
        />
      </div>

      <div className="flex justify-between items-center mt-4">
        <span>Push Notifications</span>
        <Switch
          checked={notifications.push}
          onChange={(checked) =>
            setNotifications((p) => ({ ...p, push: checked }))
          }
        />
      </div>

      <h4 className="font-medium mt-6">Notification Types</h4>

      <div className="flex justify-between items-center mt-4">
        <span>Transcription Complete</span>
        <Switch
          checked={notifications.transcriptionComplete}
          onChange={(checked) =>
            setNotifications((p) => ({ ...p, transcriptionComplete: checked }))
          }
        />
      </div>

      <div className="flex justify-between items-center mt-4">
        <span>Review Required</span>
        <Switch
          checked={notifications.reviewRequired}
          onChange={(checked) =>
            setNotifications((p) => ({ ...p, reviewRequired: checked }))
          }
        />
      </div>

      <div className="flex justify-between items-center mt-4">
        <span>System Updates</span>
        <Switch
          checked={notifications.systemUpdates}
          onChange={(checked) =>
            setNotifications((p) => ({ ...p, systemUpdates: checked }))
          }
        />
      </div>
    </Card>
  );
});

/* ---------------------------------- Page ---------------------------------- */

export const Settings = () => {
  const { user, callWithAuth, refreshUser } = useUser();
  const { theme: themeMode, toggleTheme } = useTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    transcriptionComplete: true,
    reviewRequired: true,
    systemUpdates: false,
  });

  // Initialize form state from user
  useEffect(() => {
    if (!user) {
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      return;
    }
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhoneNumber(user.phoneNumber ?? "");
  }, [user]);

  const handlePhoneChange = useCallback((full) => {
    setPhoneNumber(full);
  }, []);

  const saveSettings = useCallback(async () => {
    if (!user) {
      message.error("You need to be signed in to update your settings.");
      return;
    }
    try {
      setSaving(true);
      const normalizedPhone = phoneNumber?.replace(/\s+/g, "");
      await callWithAuth(updateCurrentUser, {
        first_name: firstName?.trim() || null,
        last_name: lastName?.trim() || null,
        phone_number: normalizedPhone ? normalizedPhone : null,
      });
      await refreshUser();
      message.success("Settings saved successfully!");
    } catch (error) {
      message.error(error?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [user, phoneNumber, firstName, lastName, callWithAuth, refreshUser]);

  /* ----------------------- Stable theme token objects ---------------------- */
  const rootThemeTokens = useMemo(
    () => ({
      colorBgContainer: themeMode === "dark" ? "#1f1f1f" : "#ffffff",
      colorText: themeMode === "dark" ? "#ffffff" : "#0a0a0a",
      colorBorder: themeMode === "dark" ? "#bfbfbf" : "#d9d9d9",
      colorTextPlaceholder: themeMode === "dark" ? "#888888" : "#bfbfbf",
      activeBorderColor: themeMode === "dark" ? "#bfbfbf" : "#d9d9d9",
      hoverBorderColor: themeMode === "dark" ? "#bfbfbf" : "#d9d9d9",
      itemColor: "rgb(250,219,20)",
      itemHoverColor: "rgb(114,46,209)",
    }),
    [themeMode]
  );

  /* ------------------------- Stable Tabs items array ------------------------ */
  const tabItems = useMemo(
    () => [
      {
        key: "profile",
        label: "Profile",
        children: (
          <ProfileCard
            themeMode={themeMode}
            user={user}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            phoneNumber={phoneNumber}
            handlePhoneChange={handlePhoneChange}
          />
        ),
      },
      {
        key: "security",
        label: "Security",
        children: <SecurityCard />,
      },
      {
        key: "audio",
        label: "Audio",
        children: <AudioCard themeMode={themeMode} />,
      },
      {
        key: "preferences",
        label: "Preferences",
        children: (
          <PreferencesCard themeMode={themeMode} toggleTheme={toggleTheme} />
        ),
      },
      {
        key: "notifications",
        label: "Notifications",
        children: (
          <NotificationsCard
            notifications={notifications}
            setNotifications={setNotifications}
          />
        ),
      },
    ],
    [
      themeMode,
      user,
      firstName,
      lastName,
      phoneNumber,
      handlePhoneChange,
      toggleTheme,
      notifications,
    ]
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
        <Button
          onClick={saveSettings}
          icon={<Save className="w-4 h-4" />}
          loading={saving}
          disabled={saving || !user}
        >
          Save Changes
        </Button>
      </div>

      <ConfigProvider theme={{ token: rootThemeTokens }}>
        <Tabs
          defaultActiveKey="profile"
          destroyInactiveTabPane={false}
          items={tabItems}
        />
      </ConfigProvider>
    </div>
  );
};
