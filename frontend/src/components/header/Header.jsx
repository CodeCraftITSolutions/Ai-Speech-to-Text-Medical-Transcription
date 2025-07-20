import { Button, Dropdown, Switch } from "antd";
import { User, Settings, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export const Header = ({ onLogout, user }) => {
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("user");
    onLogout();
  };

  const menuItems = [
    {
      key: "profile",
      label: (
        <div className="flex items-center gap-2 ">
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
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            <span>Dark Mode</span>
          </div>
          <Switch
            size="small"
            checked={theme === "dark"}
            onChange={toggleTheme}
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
        <div className="flex items-center gap-2" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </div>
      ),
    },
  ];

  return (
    <header className="bg-background border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <MenuIcon className="w-5 h-5" />
          </Button> */}

          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Welcome back,
              {user.name.split(" ")[0]}
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
        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button type="text" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden md:inline text-foreground">
              {user.name}
            </span>
          </Button>
        </Dropdown>
      </div>
    </header>
  );
};
