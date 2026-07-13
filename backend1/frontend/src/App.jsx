import React from 'react';
import { MootCourtProvider, useMootCourt } from './context/MootCourtContext';
import Header from './components/Header';
import StudentWorkspace from './components/StudentWorkspace';
import ProfessorDashboard from './components/ProfessorDashboard';
import Login from './components/Login';

function DashboardShell() {
  const { currentUser, userRole } = useMootCourt();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Header />
      <main className="main-content" style={{ height: 'calc(100vh - 70px)', overflowY: 'auto' }}>
        {userRole === 'professor' ? <ProfessorDashboard /> : <StudentWorkspace />}
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