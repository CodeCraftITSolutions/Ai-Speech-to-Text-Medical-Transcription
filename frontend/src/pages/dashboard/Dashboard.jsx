import React from 'react'
import {Home} from '../home/Home.jsx';
import { useState } from 'react';
import { Header } from '../../components/header/Header';
import { Sidebar } from '../../components/sidebar/Sidebar';
import { NewTranscription } from '../newtranscription/NewTranscription.jsx';
import { History } from '../history/History.jsx';
import { Review } from '../review/Review.jsx';
import { Admin } from '../admin/Admin.jsx';
import { Settings } from '../settings/Settings.jsx';

export const Dashboard = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = {
    name: "Rifab Ahamed",
    role: "doctor", // doctor | transcriptionist | admin
    specialty: "Cardiology", // Optional, only for doctors
  };


  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home user={user} onNavigate={setCurrentPage} />;
      case "new-transcription":
        return <NewTranscription user={user} />;
      case "history":
        return <History user={user} />;
      case "review":
        return <Review user={user} />;
      case "admin":
        return <Admin user={user} />;
      case "settings":
        return <Settings user={user} />;
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
        <Header
          user={user}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto p-6">{renderPage()}</main>
      </div>
    </div>
  );
};
