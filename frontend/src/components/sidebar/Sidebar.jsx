import { Button } from "antd";
import {
  ChevronLeft,
  Home,
  Mic,
  Settings,
  Shield,
  Stethoscope,
  UserCheck,
} from "lucide-react";
// import { useState } from "react";

export const Sidebar = ({ user, currentPage, onNavigate, isOpen, onToggle }) => {
  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      roles: ["doctor", "transcriptionist", "admin"],
    },
    {
      id: "new-transcription",
      label: "New Transcription",
      icon: Mic,
      roles: ["doctor"],
    },
    {
      id: "history",
      label: "History",
      icon: History,
      roles: ["doctor", "transcriptionist", "admin"],
    },
    {
      id: "review",
      label: "Review Queue",
      icon: UserCheck,
      roles: ["transcriptionist"],
    },
    { id: "admin", label: "Admin Panel", icon: Shield, roles: ["admin"] },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      roles: ["doctor", "transcriptionist", "admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div
      className={`bg-orange-300 border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className={`flex items-center gap-3`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <span className="font-semibold text-gray-900">MedTranscribe</span>
            )}
          </div>
          <Button
            // variant="ghost"
            size="sm"
            onClick={onToggle}
            // className="p-1 h-8 w-8"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform`} />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 h-10"
                    ${!isOpen && "justify-center px-2"}
                    ${isActive && "bg-blue-600 text-white hover:bg-blue-700"}
                    
                  `}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span>{item.label}</span>}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        {isOpen ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {user.role}
              {user.specialty && ` • ${user.specialty}`}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {/* {user.name.charAt(0)} */}
                Rifab
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
