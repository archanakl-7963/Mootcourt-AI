import React from 'react';
import { MootCourtProvider, useMootCourt } from './context/MootCourtContext';
import Header from './components/Header';
import HomeView from './components/HomeView';
import BriefingLab from './components/BriefingLab';
import JudgeSimulation from './components/JudgeSimulation';
import UploadPDF from './components/UploadPDF';
import ProfessorDashboard from './components/ProfessorDashboard';
import Login from './components/Login';

function DashboardShell() {
  const { activeTab, currentUser, userRole } = useMootCourt();

  if (!currentUser) {
    return <Login />;
  }

  const renderActiveContent = () => {
    if (userRole === 'professor') {
      return <ProfessorDashboard />;
    }
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'briefing':
        return <BriefingLab />;
      case 'judge':
        return <JudgeSimulation />;
      case 'sessions':
        return <UploadPDF />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Header />
      <main className="main-content" style={{ height: 'calc(100vh - 70px)', overflowY: 'auto' }}>
        {renderActiveContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <MootCourtProvider>
      <DashboardShell />
    </MootCourtProvider>
  );
}

export default App;