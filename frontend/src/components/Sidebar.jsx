import React from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import { 
  Gavel, 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Scale, 
  Activity,
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { activeTab, setActiveTab, currentCase, currentUser, logoutUser } = useMootCourt();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Files', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Co-Counsel', icon: MessageSquare },
    { id: 'judge', label: 'Judge Simulation', icon: Gavel },
    { id: 'memorial', label: 'Memorial Builder', icon: FileText }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img 
          src="/indian_judiciary_seal.jpg" 
          alt="Indian Court Seal" 
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '1.5px solid var(--color-gold)',
            boxShadow: '0 0 8px rgba(205, 162, 80, 0.3)',
            objectFit: 'cover',
            flexShrink: 0
          }} 
        />
        <div className="logo-text">
          <h1>MootCourt AI</h1>
          <span>Advocate Workspace</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {currentUser && (
          <div 
            className="menu-item"
            onClick={logoutUser}
            style={{ 
              color: 'var(--color-danger)', 
              border: '1px solid rgba(239, 68, 68, 0.15)', 
              borderRadius: '8px', 
              padding: '10px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s',
              fontSize: '0.85rem'
            }}
          >
            <LogOut size={16} strokeWidth={1.8} />
            <span style={{ fontWeight: '500' }}>Sign Out ({currentUser})</span>
          </div>
        )}

        <div className="case-status-card" style={{ marginTop: '0' }}>
          <div className="case-status-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={12} color="#d4af37" />
              Active Case Brief
            </span>
          </div>
          <div className="case-status-value">
            {currentCase ? currentCase.name : "No Case Loaded"}
          </div>
          {currentCase && (
            <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>
              {currentCase.chunks} chunks • {currentCase.characters} chars
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
