import React from 'react';
import { MootCourtProvider, useMootCourt } from './context/MootCourtContext';
import Header from './components/Header';
import HomeView from './components/HomeView';
import UploadPDF from './components/UploadPDF';
import ChatBox from './components/ChatBox';
import JudgeSimulation from './components/JudgeSimulation';
import MemorialBuilder from './components/MemorialBuilder';
import Login from './components/Login';

function DashboardShell() {
  const { activeTab, currentUser } = useMootCourt();

  if (!currentUser) {
    return <Login />;
  }

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'chat':
        return <ChatBox />;
      case 'judge':
        return <JudgeSimulation />;
      case 'memorial':
        return <MemorialBuilder />;
      case 'documents':
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