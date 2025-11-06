import { Button, ConfigProvider, Dropdown, Switch, message } from "antd";
import { User, Settings, LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

export const Header = ({ onLogout, user }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      onLogout?.();
    } catch (error) {
      message.error(error?.message ?? "Unable to logout");
    }
  };

  const firstName = user?.name?.split(" ")[0] ?? user?.username ?? "there";

  const menuItems = [
    {
      key: "profile",
      label: (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 mr-2" />
          Profile
        </div>
      ),
    },
    {
      key: "settings",
      label: (
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </div>
      ),
    },

    {
      key: "theme",
      label: (
        <div
          className="flex items-center justify-between gap-2 w-full"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>Dark Mode</span>
          </div>
          <Switch
            size="small"
            checked={theme === "dark"}
            onChange={toggleTheme}
            onClick={(checked, event) => event.stopPropagation()}
          />
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <div className="flex items-center gap-2">
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </div>
      ),
    },
  ];

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "profile":
        navigate("/dashboard/profile");
        break;
      case "settings":
        navigate("/dashboard/settings");
        break;
      case "logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <header className="bg-background border-b border-border px-1 md:px-6 py-2 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="xs:text-sm md:text-xl font-semibold text-foreground">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
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
          <Dropdown
            menu={{ items: menuItems, onClick: handleMenuClick }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button type="text" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:inline text-foreground">{user?.name ?? user?.username ?? "User"}</span>
            </Button>
          </Dropdown>
        </ConfigProvider>
      </div>
    </header>
  );
};
