import React from 'react'
import Home from '../home/Home.jsx';
import { useState } from 'react';
import { Header } from '../../components/header/Header';
import { Sidebar } from '../../components/sidebar/Sidebar';

export const Dashboard = () => {
    const [currentPage, setCurrentPage] = useState("home");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const user = "Doctor"

    const renderPage = () => {
      switch (currentPage) {
        case "home":
          return <Home user={user} onNavigate={setCurrentPage} />;
        // case "new-transcription":
        //   return <NewTranscriptionPage user={user} />;
        // case "history":
        //   return <HistoryPage user={user} />;
        // case "review":
        //   return <ReviewPage user={user} />;
        // case "admin":
        //   return <AdminPage user={user} />;
        // case "settings":
        //   return <SettingsPage user={user} />;
        default:
          return <HomePage user={user} onNavigate={setCurrentPage} />;
      }
    };
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
