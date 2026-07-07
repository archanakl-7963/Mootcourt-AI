import React, { useRef } from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import { 
  FileText, 
  MessageSquare, 
  Gavel, 
  TrendingUp, 
  MapPin, 
  Sparkles, 
  BookOpen, 
  Cpu, 
  Award,
  ArrowRight,
  Scale,
  Camera
} from 'lucide-react';

const HomeView = () => {
  const { 
    setActiveTab, 
    currentUser, 
    userFullName, 
    userCourse, 
    userCollege, 
    profileImage, 
    uploadProfileImage,
    documents,
    pastSessions 
  } = useMootCourt();

  const fileInputRef = useRef(null);

  const handleAction = (tabId) => {
    setActiveTab(tabId);
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const res = await uploadProfileImage(file);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <div style={{
      padding: '30px 40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
      background: '#040810',
      minHeight: 'calc(100vh - 70px)',
      color: '#ffffff',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflowX: 'hidden'
    }} className="animate-fade-in">
      
      {/* 1. Hero / Welcome Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(21, 34, 62, 0.5) 0%, rgba(5, 10, 20, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '30px',
        position: 'relative',
        minHeight: '380px'
      }}>
        {/* Flag Tricolor background glow behind center */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '25%',
          width: '50%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, rgba(205, 162, 80, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Left Side: Copy and Actions */}
        <div style={{ flex: '1.2', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(205, 162, 80, 0.08)',
            border: '1px solid rgba(205, 162, 80, 0.25)',
            padding: '6px 14px',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: '700',
            color: 'var(--color-gold)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            ⚖️ Your Intelligent Partner for Moot Court Excellence
          </div>
          
          <h1 style={{
            fontSize: '2.8rem',
            lineHeight: '1.2',
            fontWeight: '800',
            marginBottom: '16px',
            fontFamily: 'var(--font-serif)'
          }}>
            AI That Understands Law.<br />
            <span style={{ color: '#ff9933' }}>You Argue.</span> <span style={{ color: '#128807' }}>We Empower.</span>
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '32px',
            maxWidth: '520px'
          }}>
            Upload your case brief, ask questions, get legal insights, and sharpen your arguments with the power of AI.
          </p>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => handleAction('judge')}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #15223e 0%, #0c1221 100%)',
                border: '1px solid var(--border-gold)',
                padding: '12px 24px',
                fontSize: '0.95rem',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              + New Session <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => handleAction('documents')}
              className="btn btn-secondary"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px 24px',
                fontSize: '0.95rem',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              📤 Upload PDF
            </button>
          </div>
        </div>

        {/* Center: Golden Lion Capital */}
        <div style={{ 
          flex: '0.8', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 1 
        }}>
          <img 
            src="/indian_judiciary_seal.jpg" 
            alt="Lion Capital of Ashoka" 
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '3px solid var(--color-gold)',
              boxShadow: '0 0 35px rgba(205, 162, 80, 0.4)',
              objectFit: 'cover',
              marginBottom: '14px'
            }}
          />
          <span style={{
            fontSize: '1rem',
            fontWeight: '700',
            color: 'var(--color-gold)',
            letterSpacing: '0.12em',
            fontFamily: 'var(--font-serif)',
            display: 'block'
          }}>
            सत्यमेव जयते
          </span>
          <span style={{
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: '600',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            SATYAMEVA JAYATE
          </span>
        </div>

        {/* Right Side: Ambedkar Quote Callout */}
        <div style={{ 
          flex: '1', 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'flex-end',
          zIndex: 1 
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '320px',
            position: 'relative'
          }}>
            <span style={{
              fontSize: '2.5rem',
              color: 'var(--color-gold)',
              fontFamily: 'serif',
              position: 'absolute',
              top: '10px',
              left: '16px',
              lineHeight: 0,
              opacity: 0.3
            }}>“</span>
            <p style={{
              fontSize: '0.88rem',
              lineHeight: '1.5',
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '0 0 12px 14px',
              fontStyle: 'italic'
            }}>
              Justice is the soul of democracy and strengthens the foundation of liberty.
            </p>
            <p style={{
              fontSize: '0.8rem',
              fontWeight: '600',
              color: 'var(--color-gold)',
              textAlign: 'right',
              margin: 0
            }}>
              – Dr. B. R. Ambedkar
            </p>
          </div>
        </div>
      </div>

      {/* 2. Advocate Profile Banner */}
      <div style={{
        background: '#07101f',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '40px'
      }}>
        {/* Left: Bio info & Avatar upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1.2' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept="image/*" 
          />
          <div 
            onClick={handleAvatarClick}
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              cursor: 'pointer',
              overflow: 'hidden',
              border: '2px solid var(--color-gold)'
            }}
            className="avatar-container-hover"
            title="Upload new profile photo"
          >
            <img 
              src={profileImage || "/ananya_profile.jpg"} 
              alt="Advocate Profile" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {/* Camera hover overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s'
            }} className="avatar-overlay-hover">
              <Camera size={20} color="var(--color-gold)" />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', margin: '0 0 4px 0' }}>
              {userFullName || currentUser || "Archana K L"}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              {userCourse || "LLB Student"}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="var(--color-gold)" /> {userCollege || "Government Law College"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Law Student / Advocate Stats card */}
        <div style={{ 
          flex: '1.8', 
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          paddingLeft: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '30px'
        }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Moot Court Progress & Advocate Archives
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0, maxWidth: '400px' }}>
              Practicing litigation arguments, indexing case law files, and generating Supreme Court memorials.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '30px', flexShrink: 0 }}>
            {/* Stat 1 */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', display: 'block', lineHeight: 1 }}>
                {documents ? documents.length : 0}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Briefs Indexed</span>
            </div>
            {/* Stat 2 */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', display: 'block', lineHeight: 1 }}>
                {pastSessions ? pastSessions.length : 0}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Simulations</span>
            </div>
            {/* Stat 3 */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-gold)', display: 'block', lineHeight: 1 }}>
                {pastSessions && pastSessions.length > 0 ? "Active" : "Awaiting"}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Court Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '20px'
      }}>
        {/* Card 1: Upload */}
        <div 
          onClick={() => handleAction('documents')}
          style={{
            background: 'rgba(25, 118, 210, 0.04)',
            border: '1px solid rgba(25, 118, 210, 0.15)',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.25s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '190px'
          }}
          className="action-card-hover"
        >
          <div>
            <div style={{ color: '#2196f3', marginBottom: '16px' }}><FileText size={28} /></div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>Upload Case Brief</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Upload PDF documents of your case briefs and let AI understand and analyze them for you.
            </p>
          </div>
          <div style={{ textAlign: 'right', color: '#2196f3' }}><ArrowRight size={16} /></div>
        </div>

        {/* Card 2: Ask */}
        <div 
          onClick={() => handleAction('chat')}
          style={{
            background: 'rgba(76, 175, 80, 0.04)',
            border: '1px solid rgba(76, 175, 80, 0.15)',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.25s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '190px'
          }}
          className="action-card-hover"
        >
          <div>
            <div style={{ color: '#4caf50', marginBottom: '16px' }}><MessageSquare size={28} /></div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>Ask Legal Questions</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Ask any question about your case, get relevant legal insights, precedents, and analysis instantly.
            </p>
          </div>
          <div style={{ textAlign: 'right', color: '#4caf50' }}><ArrowRight size={16} /></div>
        </div>

        {/* Card 3: Moot */}
        <div 
          onClick={() => handleAction('judge')}
          style={{
            background: 'rgba(255, 152, 0, 0.04)',
            border: '1px solid rgba(255, 152, 0, 0.15)',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.25s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '190px'
          }}
          className="action-card-hover"
        >
          <div>
            <div style={{ color: '#ff9800', marginBottom: '16px' }}><Gavel size={28} /></div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>Moot Like a Pro</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Practice arguments, counter questions, and improve your legal reasoning with AI feedback.
            </p>
          </div>
          <div style={{ textAlign: 'right', color: '#ff9800' }}><ArrowRight size={16} /></div>
        </div>

        {/* Card 4: Track */}
        <div 
          onClick={() => handleAction('sessions')}
          style={{
            background: 'rgba(156, 39, 176, 0.04)',
            border: '1px solid rgba(156, 39, 176, 0.15)',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.25s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '190px'
          }}
          className="action-card-hover"
        >
          <div>
            <div style={{ color: '#9c27b0', marginBottom: '16px' }}><TrendingUp size={28} /></div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>Track & Improve</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Analyze your performance, track progress, and become a better moot court advocate.
            </p>
          </div>
          <div style={{ textAlign: 'right', color: '#9c27b0' }}><ArrowRight size={16} /></div>
        </div>

        {/* Card 5: Inspiration */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #091325 0%, #03060c 100%)',
            border: '1px solid rgba(205, 162, 80, 0.2)',
            borderRadius: '12px',
            padding: '24px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '190px'
          }}
        >
          {/* Subtle scales watermark overlay */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            opacity: 0.04,
            color: 'var(--color-gold)',
            pointerEvents: 'none'
          }}>
            <Scale size={90} />
          </div>

          <div>
            <div style={{ color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={12} /> Inspiration
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.4', fontStyle: 'italic', margin: 0 }}>
              "The law is not just a subject, it's a tool for justice. Use AI. Understand deeply. Argue fearlessly. Make an impact."
            </p>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: '600' }}>
            – Your Journey, Your Justice ➔
          </div>
        </div>
      </div>

      {/* 4. Footer Panel */}
      <footer style={{
        marginTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        {/* Quote */}
        <div style={{ maxWidth: '340px', lineHeight: '1.4' }}>
          "The goal of the law is not to punish but to produce justice and to preserve the rights of each."
          <span style={{ display: 'block', color: 'var(--color-gold)', marginTop: '4px', fontWeight: '600' }}>– Cicero</span>
        </div>

        {/* Feature badges */}
        <div style={{ display: 'flex', gap: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} color="var(--color-gold)" />
            <div>
              <span style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>Indian Constitution</span>
              <span>Rooted in Justice</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="var(--color-gold)" />
            <div>
              <span style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>AI-Powered</span>
              <span>Intelligent & Reliable</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={16} color="var(--color-gold)" />
            <div>
              <span style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>Built for Future</span>
              <span>Innovate. Advocate. Lead.</span>
            </div>
          </div>
        </div>

        {/* Flag badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>Built with ❤️ in India</span>
            <span>By a future engineer, for future leaders.</span>
          </div>
          <span style={{ fontSize: '1.8rem' }}>🇮🇳</span>
        </div>
      </footer>

    </div>
  );
};

export default HomeView;
