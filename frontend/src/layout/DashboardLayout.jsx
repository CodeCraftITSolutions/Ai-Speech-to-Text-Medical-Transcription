import React, { useEffect, useState } from "react";
import { Header } from "../layout/Header.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useUser();

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          onLogout={logout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto p-2 sm:p-6">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
