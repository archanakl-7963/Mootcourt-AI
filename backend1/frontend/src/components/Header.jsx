import React from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import { Sun, LogOut } from 'lucide-react';

const Header = () => {
  const { activeTab, setActiveTab, currentUser, logoutUser, userFullName, userCourse, profileImage } = useMootCourt();

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'chat', label: 'Co-Counsel' },
    { id: 'judge', label: 'Judge Simulator' },
    { id: 'memorial', label: 'Memorials' },
    { id: 'documents', label: 'Documents' },
    { id: 'sessions', label: 'My Sessions' }
  ];

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '70px',
      padding: '0 32px',
      background: '#040810',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%'
    }}>
      {/* Left side: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
        <img 
          src="/indian_judiciary_seal.jpg" 
          alt="MootCourt AI Logo" 
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1.5px solid var(--color-gold)',
            objectFit: 'cover'
          }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{
            fontSize: '1.25rem',
            fontFamily: 'var(--font-serif)',
            fontWeight: '800',
            letterSpacing: '0.05em',
            margin: 0,
            background: 'linear-gradient(135deg, #ffffff 30%, var(--color-gold) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            MOOT COURT AI
          </h1>
          <span style={{
            fontSize: '0.62rem',
            color: 'var(--color-gold)',
            fontWeight: '700',
            letterSpacing: '0.18em',
            textTransform: 'uppercase'
          }}>
            ARGUE. ANALYZE. WIN.
          </span>
        </div>
      </div>

      {/* Middle: Menu Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === item.id ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.65)',
              fontSize: '0.88rem',
              fontWeight: activeTab === item.id ? '700' : '500',
              padding: '6px 0',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            {item.label}
            {activeTab === item.id && (
              <span style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: 'var(--color-gold)',
                borderRadius: '2px'
              }} />
            )}
          </button>
        ))}
      </nav>

      {/* Right side: Theme and Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Theme Toggle (Decorative Sun) */}
        <div style={{
          color: 'rgba(255, 255, 255, 0.6)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.04)',
          transition: 'all 0.2s'
        }} className="header-icon-hover">
          <Sun size={18} />
        </div>

        {/* User Profile Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '100px',
          position: 'relative'
        }}>
          <img 
            src={profileImage || "/ananya_profile.jpg"} 
            alt="User Profile" 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid var(--color-gold)'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: '600',
              color: '#ffffff',
              lineHeight: '1.2'
            }}>
              {userFullName || currentUser || "Ananya Menon"}
            </span>
            <span style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              lineHeight: '1.2'
            }}>
              {userCourse || "LLB Student"}
            </span>
          </div>

          {/* Logout overlay icon */}
          <button 
            onClick={logoutUser}
            title="Sign Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(239, 68, 68, 0.7)',
              cursor: 'pointer',
              marginLeft: '8px',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              outline: 'none'
            }}
            className="logout-btn-hover"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
