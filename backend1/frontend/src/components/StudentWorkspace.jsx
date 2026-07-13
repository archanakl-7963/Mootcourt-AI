import React, { useState, useRef } from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import ChatBox from './ChatBox';
import JudgeSimulation from './JudgeSimulation';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Scale, 
  AlertTriangle, 
  Search, 
  Plus, 
  FileSignature, 
  Sparkles,
  BookOpen,
  MessageSquare
} from 'lucide-react';

const StudentWorkspace = () => {
  const { 
    documents, 
    isUploading, 
    uploadStatus, 
    uploadPDFFile,
    currentCase,
    setCurrentCase
  } = useMootCourt();
  
  const [workspaceTab, setWorkspaceTab] = useState('study'); // 'study' or 'practice'
  const [uploadTab, setUploadTab] = useState('file'); // 'file', 'text', or 'historic'
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Text Facts State
  const [factTitle, setFactTitle] = useState('');
  const [factText, setFactText] = useState('');
  const [isSavingFacts, setIsSavingFacts] = useState(false);

  const fileInputRef = useRef(null);

  // File Upload
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
      setErrorMsg("Error: Please upload a PDF or TXT file only.");
      setSuccessMsg('');
      return;
    }
    
    setErrorMsg('');
    setSuccessMsg('');
    
    const result = await uploadPDFFile(file);
    if (result.success) {
      setSuccessMsg("Case details saved and indexed in AI memory!");
      const newDoc = { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` };
      setCurrentCase(newDoc);
    } else {
      setErrorMsg(result.message);
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

  // Text Facts Submission
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!factTitle.trim() || !factText.trim()) {
      setErrorMsg("Error: Please enter a case title and write the case facts.");
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSavingFacts(true);

    try {
      const fileObj = new File(
        [factText], 
        `${factTitle.trim().replace(/\s+/g, '_')}.txt`, 
        { type: 'text/plain' }
      );

      const result = await uploadPDFFile(fileObj);
      if (result.success) {
        setSuccessMsg("Case facts saved successfully!");
        setFactTitle('');
        setFactText('');
        setCurrentCase({ name: fileObj.name, size: `${(fileObj.size / 1024).toFixed(1)} KB` });
      } else {
        setErrorMsg(result.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save case facts.");
    } finally {
      setIsSavingFacts(false);
    }
  };

  // Filter list
  const filteredDocs = documents ? documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.2fr 1.8fr',
      gap: '24px',
      padding: '24px 32px',
      background: '#040810',
      height: 'calc(100vh - 70px)',
      color: '#ffffff',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden'
    }} className="animate-fade-in">
      
      {/* LEFT COLUMN: Case Fact Selectors & List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflowY: 'auto',
        paddingRight: '6px',
        height: '100%'
      }}>
        {/* Case Upload Box */}
        <div className="glass-panel" style={{ padding: '20px', flexShrink: 0 }}>
          <h3 className="panel-title" style={{ fontSize: '1.02rem', marginBottom: '14px' }}>
            📁 Load Case Facts
          </h3>

          {/* Selector Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '16px',
            border: '1px solid var(--border-glass)'
          }}>
            <button
              onClick={() => { setUploadTab('file'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                background: uploadTab === 'file' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                border: 'none',
                color: uploadTab === 'file' ? 'var(--color-gold)' : 'rgba(255,255,255,0.6)',
                fontSize: '0.78rem',
                fontWeight: '600',
                padding: '8px 4px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Upload PDF
            </button>
            <button
              onClick={() => { setUploadTab('text'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                background: uploadTab === 'text' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                border: 'none',
                color: uploadTab === 'text' ? 'var(--color-gold)' : 'rgba(255,255,255,0.6)',
                fontSize: '0.78rem',
                fontWeight: '600',
                padding: '8px 4px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Paste Facts
            </button>
            <button
              onClick={() => { setUploadTab('historic'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                background: uploadTab === 'historic' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                border: 'none',
                color: uploadTab === 'historic' ? 'var(--color-gold)' : 'rgba(255,255,255,0.6)',
                fontSize: '0.78rem',
                fontWeight: '600',
                padding: '8px 4px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Historic Cases
            </button>
          </div>

          {/* Upload PDF */}
          {uploadTab === 'file' && (
            isUploading ? (
              <div className="legal-loader-container" style={{ padding: '20px 0' }}>
                <div className="gavel-pulse"><Scale size={28} /></div>
                <p className="loader-status" style={{ fontSize: '0.8rem', marginTop: '10px' }}>{uploadStatus}</p>
              </div>
            ) : (
              <div 
                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                style={{ padding: '20px', minHeight: '120px' }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept=".pdf,.txt"
                />
                <UploadCloud size={24} style={{ color: 'var(--color-gold)', marginBottom: '8px' }} />
                <h4 style={{ fontSize: '0.85rem', marginBottom: '2px', fontWeight: '700' }}>Upload case PDF file</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', margin: '0 0 10px 0' }}>PDF or TXT formats</p>
                <button className="btn btn-secondary" type="button" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Browse computer</button>
              </div>
            )
          )}

          {/* Paste Facts */}
          {uploadTab === 'text' && (
            isSavingFacts ? (
              <div className="legal-loader-container" style={{ padding: '20px 0' }}>
                <div className="gavel-pulse"><Scale size={28} /></div>
                <p className="loader-status" style={{ fontSize: '0.8rem', marginTop: '10px' }}>Saving case details...</p>
              </div>
            ) : (
              <form onSubmit={handleTextSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Case Name / Title (e.g. Ramesh vs State)"
                  value={factTitle}
                  onChange={(e) => setFactTitle(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    outline: 'none'
                  }}
                />
                <textarea
                  placeholder="Type or paste case facts, arguments, or laws here..."
                  rows={3}
                  value={factText}
                  onChange={(e) => setFactText(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', justifyContent: 'center' }}
                  disabled={!factTitle.trim() || !factText.trim()}
                >
                  Save Case Facts
                </button>
              </form>
            )
          )}

          {/* Historic Cases */}
          {uploadTab === 'historic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '2px' }}>
              {[
                {
                  title: "Kesavananda Bharati v. State of Kerala (1973)",
                  facts: "Kesavananda Bharati challenging Kerala land reform acts under Article 26 regarding right to manage religiously owned property. The Supreme Court ruled that Parliament can amend any part of the Constitution, including Fundamental Rights, provided they do not alter or destroy its 'Basic Structure'."
                },
                {
                  title: "Maneka Gandhi v. Union of India (1978)",
                  facts: "Maneka Gandhi's passport impounded by the Government under Regional Passport Act without reasons. The Supreme Court held that the procedure established by law under Article 21 must be fair, just, and reasonable, incorporating the American due process doctrine into Indian fundamental rights."
                },
                {
                  title: "K.S. Puttaswamy v. Union of India (2017)",
                  facts: "Justice K.S. Puttaswamy challenging the constitutional validity of Aadhaar biometric card system. The 9-judge bench unanimously ruled that the Right to Privacy is a fundamental right protected under Article 21, Article 14, and Article 19 of the Constitution of India."
                }
              ].map((c, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    textAlign: 'left'
                  }}
                >
                  <h4 style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>{c.title.split(' v. ')[0]}</h4>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '3px 8px', fontSize: '0.68rem', alignSelf: 'flex-start' }}
                    onClick={async () => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      const fileObj = new File([c.facts], `HISTORIC_${c.title.split(' ')[0]}.txt`, { type: 'text/plain' });
                      const res = await uploadPDFFile(fileObj);
                      if (res.success) {
                        setSuccessMsg(`Loaded case facts for ${c.title.split(' ')[0]}!`);
                        setCurrentCase({ name: fileObj.name, size: `${(fileObj.size / 1024).toFixed(1)} KB` });
                      } else {
                        setErrorMsg(res.message);
                      }
                    }}
                  >
                    Load Facts ➔
                  </button>
                </div>
              ))}
            </div>
          )}

          {errorMsg && <div style={{ marginTop: '10px', color: 'var(--color-danger)', fontSize: '0.76rem' }}>⚠️ {errorMsg}</div>}
          {successMsg && <div style={{ marginTop: '10px', color: 'var(--color-success)', fontSize: '0.76rem' }}>✓ {successMsg}</div>}
        </div>

        {/* Case List */}
        <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h3 className="panel-title" style={{ fontSize: '1.02rem', marginBottom: '12px' }}>
            📚 My Cases List
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-glass)',
            borderRadius: '6px',
            padding: '6px 12px',
            marginBottom: '12px'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search case name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '0.78rem',
                width: '100%'
              }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredDocs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic', textAlign: 'center', marginTop: '10px' }}>
                No case facts loaded yet.
              </p>
            ) : (
              filteredDocs.map((doc, idx) => {
                const isSelected = currentCase && currentCase.name === doc.name;
                return (
                  <div
                    key={idx}
                    onClick={() => setCurrentCase(doc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px',
                      background: isSelected ? 'rgba(212, 175, 55, 0.04)' : 'rgba(255,255,255,0.01)',
                      border: isSelected ? '1px solid var(--color-gold)' : '1px solid var(--border-glass)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    className="action-card-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <FileText size={14} color={isSelected ? "var(--color-gold)" : "rgba(255,255,255,0.4)"} />
                      <span style={{ 
                        fontSize: '0.78rem', 
                        fontWeight: '600', 
                        color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.8)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {doc.name.replace('LANDMARK_', '').replace('.txt', '').replace('_', ' ')}
                      </span>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: '0.6rem', color: 'var(--color-success)', background: 'rgba(16,185,129,0.1)', padding: '2px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        Selected
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AI Tools workspace */}
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {currentCase ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tool Selection Tabs */}
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '6px'
            }}>
              <button
                onClick={() => setWorkspaceTab('study')}
                style={{
                  flex: 1,
                  background: workspaceTab === 'study' ? 'var(--color-gold)' : 'transparent',
                  border: 'none',
                  color: workspaceTab === 'study' ? '#040810' : '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  padding: '10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <MessageSquare size={16} /> 💬 Study & Ask AI
              </button>
              <button
                onClick={() => setWorkspaceTab('practice')}
                style={{
                  flex: 1,
                  background: workspaceTab === 'practice' ? 'var(--color-gold)' : 'transparent',
                  border: 'none',
                  color: workspaceTab === 'practice' ? '#040810' : '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  padding: '10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Scale size={16} /> ⚖️ Practice Courtroom
              </button>
            </div>

            {/* Display Active Tool */}
            <div style={{ flex: 1, height: 'calc(100% - 60px)', overflow: 'hidden' }}>
              {workspaceTab === 'study' ? (
                <ChatBox />
              ) : (
                <JudgeSimulation />
              )}
            </div>
          </div>
        ) : (
          <div className="chat-container animate-fade-in" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1.5px solid var(--color-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Scale size={26} color="var(--color-gold)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '6px' }}>
              Workspace Locked
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: '1.4', margin: 0 }}>
              Please load or select a case factsheet from the list on the left to start studying or practice mock trials.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentWorkspace;
