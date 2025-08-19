import { Button } from "antd";
import {
  ChevronLeft,
  Home,
  Mic,
  Settings,
  Shield,
  Stethoscope,
  UserCheck,
  History,
} from "lucide-react";
import { useUser } from "../context/UserContext.jsx";
import { NavLink } from "react-router-dom";
// import { useState } from "react";

export const Sidebar = ({
  // currentPage,
  // onNavigate,
  isOpen,
  onToggle,
}) => {
  // const location = useLocation();
  const { user } = useUser();
  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/dashboard",
      roles: ["doctor", "transcriptionist", "admin"],
    },
    {
      id: "new-transcription",
      label: "New Transcription",
      icon: Mic,
      path: "/dashboard/new-transcription",
      roles: ["doctor"],
    },
    {
      id: "history",
      label: "History",
      icon: History,
      path: "/dashboard/history",
      roles: ["doctor", "transcriptionist", "admin"],
    },
    {
      id: "review",
      label: "Review Queue",
      icon: UserCheck,
      path: "/dashboard/review",
      roles: ["transcriptionist", "doctor"],
    },
    {
      id: "admin",
      label: "Admin Panel",
      icon: Shield,
      path: "/dashboard/admin",
      roles: ["admin"],
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
      roles: ["doctor", "transcriptionist", "admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div
      className={`bg-background border-r border-border transition-all duration-300 flex flex-col ${
        isOpen ? "w-48" : "w-14"
      }`}
    >
      {/* Header */}
      <div className="p-2 md:p-4 border-b border-border">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className={`flex items-center gap-3`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <span className="font-semibold text-foreground">
                MedTranscribe
              </span>
            )}
          </div>
          <div className=" w-full flex justify-end">
            <div
              // variant="ghost"
              size="sm"
              onClick={onToggle}
              className="cursor-pointer p-2 rounded-full bg-accent hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft
                className={`text-foreground w-4 h-4 transition-transform ${
                  !isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 sm:p-4 flex flex-col items-center">
        <ul className="space-y-2 flex flex-col items-start">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `${
                      isOpen
                        ? "w-44 justify-start gap-1 h-8 pl-2 text-md"
                        : "justify-center px-2 w-full h-8"
                    } flex items-center rounded transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-muted-foreground hover:bg-accent"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span className="ml-2">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        {isOpen ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground truncate">
              {user.name}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {user.role}
              {user.specialty && ` • ${user.specialty}`}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-foreground">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
