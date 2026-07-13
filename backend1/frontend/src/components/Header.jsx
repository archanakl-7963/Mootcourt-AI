import React, { useState } from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import { Sun, LogOut, Scale } from 'lucide-react';

const Header = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    logoutUser, 
    userFullName, 
    userCourse, 
    profileImage,
    language,
    setLanguage,
    userRole,
    setUserRole
  } = useMootCourt();
  
  const [showGuide, setShowGuide] = useState(false);

  const menuItems = userRole === 'student' ? [
    { id: 'home', label: 'Home' },
    { id: 'briefing', label: 'Briefing Lab' },
    { id: 'judge', label: 'Courtroom Practice' },
    { id: 'memorial', label: 'Memorial Builder' },
    { id: 'sessions', label: 'Pleadings Archive' }
  ] : [
    { id: 'home', label: 'Home' },
    { id: 'professor', label: 'Professor Portal' }
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



      {/* Right side: Theme and Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Language Switcher */}
        <button 
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'var(--color-gold)',
            fontSize: '0.78rem',
            fontWeight: '700',
            padding: '6px 12px',
            borderRadius: '100px',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s'
          }}
          className="action-card-hover"
        >
          🌐 {language === 'en' ? 'English' : 'हिन्दी'}
        </button>

        {/* Role Toggle Switcher */}
        <button 
          onClick={() => {
            const nextRole = userRole === 'student' ? 'professor' : 'student';
            setUserRole(nextRole);
            setActiveTab(nextRole === 'student' ? 'home' : 'professor');
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: '700',
            padding: '6px 12px',
            borderRadius: '100px',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s'
          }}
          className="action-card-hover"
        >
          👤 Role: {userRole === 'student' ? 'Student' : 'Professor'}
        </button>

        {/* User Guide Button */}
        <button 
          onClick={() => setShowGuide(true)}
          style={{
            background: 'transparent',
            border: '1.5px solid var(--color-gold)',
            color: 'var(--color-gold)',
            fontSize: '0.78rem',
            fontWeight: '700',
            padding: '6px 14px',
            borderRadius: '100px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          className="action-card-hover"
        >
          📖 User Guide
        </button>

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

      {showGuide && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(2, 4, 8, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#07101f',
            border: '2px solid var(--color-gold)',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '32px',
            position: 'relative',
            boxShadow: '0 0 40px rgba(205, 162, 80, 0.2)'
          }}>
            {/* Close button */}
            <button 
              onClick={() => setShowGuide(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              ✕
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '24px' }}>
              <Scale size={28} color="var(--color-gold)" />
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>MootCourt AI - Advocate's User Guide</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: '600' }}>STEP-BY-STEP LITIGATION PREPARATION</span>
              </div>
            </div>

            {/* Modal Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ background: 'rgba(41, 182, 246, 0.1)', color: '#29b6f6', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700', fontSize: '0.82rem', border: '1px solid rgba(41, 182, 246, 0.3)' }}>
                  1
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>Case Indexing & Landmark Library (Briefing Lab)</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                    In the <strong>Briefing Lab</strong>, upload a PDF, paste custom facts, or select the **Landmark Cases** tab to load landmark disputes (e.g. *Kesavananda Bharati*) instantly. Select any brief on the left to set it as active.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-gold)', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700', fontSize: '0.82rem', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  2
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>Bilingual Consultation (English & हिन्दी)</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                    Toggle the <strong>🌐 Language</strong> button in the header. The AI Co-Counsel and simulated Judges will adapt their responses and grading feedback to your preferred language (English or Hindi).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ background: 'rgba(156, 39, 176, 0.1)', color: '#d81b60', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700', fontSize: '0.82rem', border: '1px solid rgba(156, 39, 176, 0.3)' }}>
                  3
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>Oral Advocacy Speech-to-Text (Courtroom Practice)</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                    Inside <strong>Courtroom Practice</strong>, tap the **Microphone (🎙️)** button next to the input area to speak your pleadings. The app transcribes your voice in real time for hands-free advocacy training.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ background: 'rgba(230, 81, 0, 0.1)', color: '#ff9800', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700', fontSize: '0.82rem', border: '1px solid rgba(230, 81, 0, 0.3)' }}>
                  4
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>Professor Portal & Grading Ledger</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                    Click **Role: Student** in the header to switch to **Professor**. In this portal, professors can upload custom class assignments and inspect the scorecard grades and performance metrics of their entire class.
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowGuide(false)}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '28px', padding: '12px' }}
            >
              Understand & Begin
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
