import React, { useState, useRef } from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Scale, 
  Layers, 
  Info,
  Calendar,
  AlertTriangle,
  Award,
  ChevronRight
} from 'lucide-react';

const UploadPDF = () => {
  const { 
    documents, 
    isUploading, 
    uploadStatus, 
    uploadPDFFile,
    currentCase,
    pastSessions,
    loadSessionDetails,
    setActiveTab
  } = useMootCourt();
  
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErrorMessage("Error: Only PDF documents are supported.");
      setSuccessMessage('');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    const result = await uploadPDFFile(file);
    if (result.success) {
      setSuccessMessage(result.message);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-hero" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '24px', 
        padding: '30px 40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(205, 162, 80, 0.12)', 
            border: '1px solid rgba(205, 162, 80, 0.25)', 
            padding: '4px 12px', 
            borderRadius: '100px', 
            fontSize: '0.75rem', 
            fontWeight: '600', 
            color: 'var(--color-gold)', 
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            🇮🇳 Satyameva Jayate • Truth Alone Triumphs
          </div>
          <h2 className="hero-title" style={{ margin: 0 }}>MootCourt AI Workspace</h2>
          <p className="hero-desc" style={{ marginTop: '8px', maxWidth: '650px', fontSize: '0.9rem' }}>
            Upload mock cases, legal pleadings, statutes, or case fact briefs. Our AI indexes the contents, split into structured knowledge nodes, enabling real-time litigation simulation.
          </p>
        </div>
        <img 
          src="/indian_judiciary_seal.jpg" 
          alt="Indian Court Seal" 
          style={{
            width: '105px',
            height: '105px',
            borderRadius: '50%',
            border: '2.5px solid var(--color-gold)',
            boxShadow: '0 0 25px rgba(205, 162, 80, 0.5)',
            objectFit: 'cover',
            flexShrink: 0
          }} 
        />
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Upload zone and details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel">
            <div className="glass-panel-header">
              <h3 className="panel-title">
                <UploadCloud size={22} />
                Upload Legal Document
              </h3>
            </div>
            
            {isUploading ? (
              <div className="legal-loader-container">
                <div className="gavel-pulse">
                  <Scale size={40} />
                </div>
                <div className="loader-bar-bg">
                  <div className="loader-bar-fill"></div>
                </div>
                <p className="loader-status">{uploadStatus}</p>
              </div>
            ) : (
              <div 
                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept=".pdf"
                />
                <div className="upload-icon-wrapper">
                  <UploadCloud size={32} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Drag and drop your case file</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Supports PDF documents up to 25MB
                  </p>
                </div>
                <button className="btn btn-secondary" type="button" onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}>
                  Browse Files
                </button>
              </div>
            )}

            {errorMessage && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px 16px', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                borderRadius: '8px', 
                color: 'var(--color-danger)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={16} />
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px 16px', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.2)', 
                borderRadius: '8px', 
                color: 'var(--color-success)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={16} />
                {successMessage}
              </div>
            )}
          </div>

          {currentCase && (
            <div className="glass-panel">
              <div className="glass-panel-header">
                <h3 className="panel-title">
                  <Info size={22} />
                  Case Intelligence Summary
                </h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Below are the metrics compiled from the parsed litigation context. These details have been vectorized to facilitate contextual co-counsel replies.
              </p>
              
              <div className="metadata-grid">
                <div className="metadata-card">
                  <div className="meta-icon-wrapper">
                    <FileText size={20} />
                  </div>
                  <div className="meta-card-label">Source Document</div>
                  <div className="meta-card-value" style={{ fontSize: '0.85rem' }}>{currentCase.name}</div>
                </div>

                <div className="metadata-card">
                  <div className="meta-icon-wrapper">
                    <Layers size={20} />
                  </div>
                  <div className="meta-card-label">Semantic Nodes</div>
                  <div className="meta-card-value">{currentCase.chunks} Chunks</div>
                </div>

                <div className="metadata-card">
                  <div className="meta-icon-wrapper">
                    <Calendar size={20} />
                  </div>
                  <div className="meta-card-label">Date Indexed</div>
                  <div className="meta-card-value">{currentCase.date}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Uploaded documents database */}
        <div className="glass-panel">
          <div className="glass-panel-header">
            <h3 className="panel-title">
              <FileText size={22} />
              Briefing Library
            </h3>
          </div>
          
          {documents.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 12px' }}>
              <div className="empty-state-icon">
                <FileText size={32} />
              </div>
              <p style={{ fontSize: '0.85rem' }}>No documents uploaded. Upload a case brief to populate your library.</p>
            </div>
          ) : (
            <div className="document-list">
              {documents.map((doc, idx) => (
                <div key={idx} className="document-item">
                  <div className="doc-info">
                    <FileText size={20} color="var(--color-gold)" />
                    <div style={{ minWidth: 0 }}>
                      <div className="doc-name">{doc.name}</div>
                      <div className="doc-meta">Size: {doc.size} • {doc.characters} Chars</div>
                    </div>
                  </div>
                  <div className="doc-badge">Indexed</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Simulation Sessions History */}
      <div className="glass-panel" style={{ marginTop: '24px' }}>
        <div className="glass-panel-header">
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={22} color="var(--color-gold)" />
            Advocate Simulation Archives
          </h3>
        </div>
        
        {pastSessions.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 12px', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ marginBottom: '12px', opacity: 0.5 }}>
              <Scale size={32} color="var(--text-muted)" />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No mock trials recorded yet. Visit the Moot Court Arena to begin your first session!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pastSessions.map((session) => (
              <div 
                key={session.id} 
                className="document-item"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.01)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
                  <div className="avatar assistant" style={{ background: session.status === 'completed' ? 'rgba(212,175,55,0.1)' : 'rgba(59,130,246,0.1)', color: session.status === 'completed' ? 'var(--color-gold)' : 'var(--color-primary)', width: '36px', height: '36px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    <Scale size={18} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {session.title}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: '600' }}>{session.mode}</span>
                      <span>•</span>
                      <span style={{ textTransform: 'uppercase' }}>{session.side}</span>
                      <span>•</span>
                      <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {session.status === 'completed' ? (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Grade</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-gold)' }}>
                        {session.overall_score ? `${Number(session.overall_score).toFixed(1)}/10` : 'N/A'}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)', border: '1px solid rgba(59, 130, 246, 0.2)', textTransform: 'uppercase' }}>
                      In Progress
                    </span>
                  )}
                  
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={async () => {
                      await loadSessionDetails(session.id);
                      setActiveTab('judge');
                    }}
                  >
                    {session.status === 'completed' ? 'Review Grade' : 'Resume Arena'}
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPDF;
