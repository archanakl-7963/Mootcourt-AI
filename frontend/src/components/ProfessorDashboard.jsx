import React, { useState, useEffect, useRef } from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import { 
  Users, 
  Award, 
  BookOpen, 
  UploadCloud, 
  FileSignature, 
  Plus, 
  CheckCircle, 
  AlertTriangle,
  Scale,
  Search,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

const ProfessorDashboard = () => {
  const { currentUserId, uploadPDFFile } = useMootCourt();
  
  // Ledger and scores state
  const [scorecards, setScorecards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ledgerError, setLedgerError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload custom moot problem state
  const [activeUploadTab, setActiveUploadTab] = useState('file'); // 'file' or 'text'
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [rawTitle, setRawTitle] = useState('');
  const [rawText, setRawText] = useState('');

  // Selected Scorecard for Modal Detail
  const [selectedScorecard, setSelectedScorecard] = useState(null);

  const fileInputRef = useRef(null);
  const localFileInputRef = useRef(null);

  // Fetch Class Scorecards from DB
  const fetchLedger = async () => {
    setIsLoading(true);
    setLedgerError('');
    try {
      const response = await fetch('/sessions/professor/ledger', {
        method: 'GET',
        headers: {
          'x-user-id': currentUserId
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setScorecards(data.scorecards);
      } else {
        setLedgerError(data.detail || "Failed to load class ledger.");
      }
    } catch (err) {
      console.error(err);
      setLedgerError("Network error. Could not reach database ledger.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  // File Upload Handlers
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
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isTxt = file.type === "text/plain" || file.name.endsWith(".txt");
    
    if (!isPdf && !isTxt) {
      setUploadError("Error: Only PDF and TXT documents are supported.");
      setUploadSuccess('');
      return;
    }
    
    setUploadError('');
    setUploadSuccess('');
    setIsUploading(true);
    
    const result = await uploadPDFFile(file);
    setIsUploading(false);
    if (result.success) {
      setUploadSuccess(`Moot problem "${file.name}" indexed and assigned to class successfully!`);
    } else {
      setUploadError(result.message);
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

  // Paste Text Handler
  const handlePasteSubmit = async (e) => {
    e.preventDefault();
    if (!rawTitle.trim() || !rawText.trim()) {
      setUploadError("Error: Please provide a title and paste some legal text.");
      return;
    }

    setUploadError('');
    setUploadSuccess('');
    setIsUploading(true);

    try {
      const fileObj = new File(
        [rawText], 
        `ASSIGNMENT_${rawTitle.trim().replace(/\s+/g, '_')}.txt`, 
        { type: 'text/plain' }
      );

      const result = await uploadPDFFile(fileObj);
      if (result.success) {
        setUploadSuccess(`Pasted assignment "${rawTitle}" published successfully!`);
        setRawTitle('');
        setRawText('');
      } else {
        setUploadError(result.message);
      }
    } catch (err) {
      console.error(err);
      setUploadError("Failed to publish raw text.");
    } finally {
      setIsUploading(false);
    }
  };

  // Filter Scorecards
  const filteredScorecards = scorecards.filter(card => 
    card.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.case_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      overflowY: 'auto'
    }} className="animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Users size={24} color="var(--color-gold)" /> Professor Grading & Assignment Portal
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
          Publish new moot court problems, review student trial transcripts, and evaluate advocate scorecard grades.
        </p>
      </div>

      {/* Grid: Left - Upload, Right - Scorecard Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Upload/Publish Problems */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="panel-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
            <UploadCloud size={18} color="var(--color-gold)" /> Publish Moot Problem
          </h3>

          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '16px',
            border: '1px solid var(--border-glass)'
          }}>
            <button
              onClick={() => { setActiveUploadTab('file'); setUploadError(''); setUploadSuccess(''); }}
              style={{
                flex: 1,
                background: activeUploadTab === 'file' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                border: 'none',
                color: activeUploadTab === 'file' ? 'var(--color-gold)' : 'rgba(255,255,255,0.6)',
                fontSize: '0.8rem',
                fontWeight: '600',
                padding: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <UploadCloud size={14} /> Upload Case File
            </button>
            <button
              onClick={() => { setActiveUploadTab('text'); setUploadError(''); setUploadSuccess(''); }}
              style={{
                flex: 1,
                background: activeUploadTab === 'text' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                border: 'none',
                color: activeUploadTab === 'text' ? 'var(--color-gold)' : 'rgba(255,255,255,0.6)',
                fontSize: '0.8rem',
                fontWeight: '600',
                padding: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FileSignature size={14} /> Paste Moot Case
            </button>
          </div>

          {activeUploadTab === 'file' && (
            isUploading ? (
              <div className="legal-loader-container" style={{ padding: '24px 0' }}>
                <div className="gavel-pulse"><Scale size={32} /></div>
                <p className="loader-status" style={{ fontSize: '0.82rem', marginTop: '12px' }}>Publishing assignment...</p>
              </div>
            ) : (
              <div 
                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => localFileInputRef.current.click()}
                style={{ padding: '28px', minHeight: '140px' }}
              >
                <input 
                  type="file" 
                  ref={localFileInputRef}
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept=".pdf,.txt"
                />
                <div className="upload-icon-wrapper" style={{ width: '40px', height: '40px', marginBottom: '8px' }}>
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Upload brief assignment</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 12px 0' }}>
                    PDF or TXT formats
                  </p>
                </div>
                <button className="btn btn-secondary" type="button" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={(e) => {
                  e.stopPropagation();
                  localFileInputRef.current.click();
                }}>
                  Browse files
                </button>
              </div>
            )
          )}

          {activeUploadTab === 'text' && (
            isUploading ? (
              <div className="legal-loader-container" style={{ padding: '24px 0' }}>
                <div className="gavel-pulse"><Scale size={32} /></div>
                <p className="loader-status" style={{ fontSize: '0.82rem', marginTop: '12px' }}>Publishing assignment...</p>
              </div>
            ) : (
              <form onSubmit={handlePasteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Assignment Title (e.g. State of UP vs Ramesh)"
                  value={rawTitle}
                  onChange={(e) => setRawTitle(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
                <textarea
                  placeholder="Paste the moot facts or case details here..."
                  rows={4}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'monospace'
                  }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '8px', fontSize: '0.8rem', justifyContent: 'center' }}
                  disabled={!rawTitle.trim() || !rawText.trim()}
                >
                  <Plus size={14} /> Publish & Assign
                </button>
              </form>
            )
          )}

          {uploadError && (
            <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px', color: 'var(--color-danger)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={14} />
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '6px', color: 'var(--color-success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={14} />
              {uploadSuccess}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Student Scorecards Ledger */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="panel-title" style={{ fontSize: '1.1rem', margin: 0 }}>
              <Award size={18} color="var(--color-gold)" /> Class Performance Ledger
            </h3>
            
            {/* Search bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-glass)',
              borderRadius: '6px',
              padding: '6px 12px',
              width: '260px'
            }}>
              <Search size={14} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search student or case..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <RefreshCw className="animate-spin" size={24} color="var(--color-gold)" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 12px auto' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Querying scorecard records...</p>
            </div>
          ) : ledgerError ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-danger)' }}>
              ⚠️ {ledgerError}
            </div>
          ) : filteredScorecards.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
              No student mock trial scorecards found.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--color-gold)' }}>
                    <th style={{ padding: '12px 8px' }}>Student Name</th>
                    <th style={{ padding: '12px 8px' }}>College / Course</th>
                    <th style={{ padding: '12px 8px' }}>Moot Case Title</th>
                    <th style={{ padding: '12px 8px' }}>Judge</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Grade</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Score</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScorecards.map((card, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>{card.student_name}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'block' }}>{card.college}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{card.course}</span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>{card.case_title}</td>
                      <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>{card.judge}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '700', color: 'var(--color-gold)', fontSize: '0.9rem' }}>
                        {card.overall_score >= 8.5 ? 'A+' : card.overall_score >= 7.0 ? 'A' : card.overall_score >= 5.0 ? 'B' : 'C'}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '700' }}>{Number(card.overall_score).toFixed(1)}/10</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setSelectedScorecard(card)}
                          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        >
                          <BookOpen size={12} /> View Critique
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED SCORECARD MODAL VIEWER */}
      {selectedScorecard && (
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
            {/* Close Button */}
            <button 
              onClick={() => setSelectedScorecard(null)}
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
            <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '24px' }}>
              <span style={{ color: 'var(--color-gold)', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Official Advocacy Performance Critique
              </span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', margin: '4px 0 0 0' }}>
                Student: {selectedScorecard.student_name}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {selectedScorecard.college} • {selectedScorecard.course}
              </span>
            </div>

            {/* Scorecard Performance Bars */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Score</span>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-gold)', marginTop: '4px' }}>
                  {Number(selectedScorecard.overall_score).toFixed(1)}/10
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>Clarity</span>
                    <span>{selectedScorecard.clarity}/10</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                    <div style={{ width: `${selectedScorecard.clarity * 10}%`, height: '100%', background: 'var(--color-gold)' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>Pushback</span>
                    <span>{selectedScorecard.pushback}/10</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                    <div style={{ width: `${selectedScorecard.pushback * 10}%`, height: '100%', background: 'var(--color-gold)' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Critique Feedback */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} color="var(--color-gold)" /> Judicial Feedback & Transcripts Summary
              </h4>
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '0.8rem',
                lineHeight: '1.5',
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {selectedScorecard.feedback}
              </div>
            </div>

            <button 
              onClick={() => setSelectedScorecard(null)}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '24px', padding: '12px' }}
            >
              Close Ledger Entry
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfessorDashboard;
