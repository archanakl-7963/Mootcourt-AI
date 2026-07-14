import React, { useState, useRef } from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import ChatBox from './ChatBox';
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
  BookOpen
} from 'lucide-react';

const BriefingLab = () => {
  const { 
    documents, 
    isUploading, 
    uploadStatus, 
    uploadPDFFile,
    currentCase,
    setCurrentCase
  } = useMootCourt();
  
  const [activeUploadTab, setActiveUploadTab] = useState('file'); // 'file' or 'text'
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Paste Raw Text Form State
  const [rawTitle, setRawTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [isSubmittingText, setIsSubmittingText] = useState(false);

  const fileInputRef = useRef(null);

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
      setErrorMessage("Error: Only PDF and TXT documents are supported.");
      setSuccessMessage('');
      return;
    }
    
    setErrorMessage('');
    setSuccessMessage('');
    
    const result = await uploadPDFFile(file);
    if (result.success) {
      setSuccessMessage("Brief uploaded successfully and queued for background indexing!");
      // Automatically select this document as current active case
      const newDoc = { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` };
      setCurrentCase(newDoc);
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

  // Paste Text Submit Handler
  const handlePasteSubmit = async (e) => {
    e.preventDefault();
    if (!rawTitle.trim() || !rawText.trim()) {
      setErrorMessage("Error: Please provide a title and paste some legal text.");
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmittingText(true);

    try {
      // Create a virtual text file from the pasted raw string
      const fileObj = new File(
        [rawText], 
        `${rawTitle.trim().replace(/\s+/g, '_')}.txt`, 
        { type: 'text/plain' }
      );

      const result = await uploadPDFFile(fileObj);
      if (result.success) {
        setSuccessMessage("Raw legal text indexed successfully!");
        setRawTitle('');
        setRawText('');
        setCurrentCase({ name: fileObj.name, size: `${(fileObj.size / 1024).toFixed(1)} KB` });
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to index pasted text.");
    } finally {
      setIsSubmittingText(false);
    }
  };

  // Filter Documents based on search query
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
      
      {/* LEFT COLUMN: Upload & Briefing Library */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflowY: 'auto',
        paddingRight: '6px',
        height: '100%'
      }}>
        {/* Upload Panel */}
        <div className="glass-panel" style={{ padding: '20px', flexShrink: 0 }}>
          <h3 className="panel-title" style={{ fontSize: '1.05rem', marginBottom: '16px' }}>
            <Scale size={18} color="var(--color-gold)" /> Index Case Details
          </h3>

          {/* Upload Method Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '16px',
            border: '1px solid var(--border-glass)'
          }}>
            <button
              onClick={() => { setActiveUploadTab('file'); setErrorMessage(''); setSuccessMessage(''); }}
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
              onClick={() => { setActiveUploadTab('text'); setErrorMessage(''); setSuccessMessage(''); }}
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
              <FileSignature size={14} /> Paste Case Text
            </button>
            <button
              onClick={() => { setActiveUploadTab('landmark'); setErrorMessage(''); setSuccessMessage(''); }}
              style={{
                flex: 1,
                background: activeUploadTab === 'landmark' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                border: 'none',
                color: activeUploadTab === 'landmark' ? 'var(--color-gold)' : 'rgba(255,255,255,0.6)',
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
              <Sparkles size={14} /> Landmark Cases
            </button>
          </div>

          {/* Tab Content 1: Drag & Drop Files */}
          {activeUploadTab === 'file' && (
            isUploading ? (
              <div className="legal-loader-container" style={{ padding: '24px 0' }}>
                <div className="gavel-pulse"><Scale size={32} /></div>
                <p className="loader-status" style={{ fontSize: '0.82rem', marginTop: '12px' }}>{uploadStatus}</p>
              </div>
            ) : (
              <div 
                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                style={{ padding: '24px', minHeight: '130px' }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept=".pdf,.txt"
                />
                <div className="upload-icon-wrapper" style={{ width: '40px', height: '40px', marginBottom: '8px' }}>
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Drag & drop case brief</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 0 10px 0' }}>
                    Supports PDF and TXT files up to 25MB
                  </p>
                </div>
                <button className="btn btn-secondary" type="button" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}>
                  Browse files
                </button>
              </div>
            )
          )}

          {/* Tab Content 2: Paste Raw Text */}
          {activeUploadTab === 'text' && (
            isSubmittingText ? (
              <div className="legal-loader-container" style={{ padding: '24px 0' }}>
                <div className="gavel-pulse"><Scale size={32} /></div>
                <p className="loader-status" style={{ fontSize: '0.82rem', marginTop: '12px' }}>Indexing raw text...</p>
              </div>
            ) : (
              <form onSubmit={handlePasteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Case Reference / Title (e.g. Solis vs Solaris)"
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
                  placeholder="Paste legal text, contract terms, or case facts here..."
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
                  <Plus size={14} /> Index Raw Text
                </button>
              </form>
            )
          )}

          {/* Tab Content 3: Landmark Cases Library */}
          {activeUploadTab === 'landmark' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {[
                {
                  title: "Kesavananda Bharati v. State of Kerala (1973)",
                  desc: "Defines the 'Basic Structure Doctrine' of the Indian Constitution.",
                  facts: "Kesavananda Bharati challenging Kerala land reform acts under Article 26 regarding right to manage religiously owned property. The Supreme Court ruled that Parliament can amend any part of the Constitution, including Fundamental Rights, provided they do not alter or destroy its 'Basic Structure'."
                },
                {
                  title: "Maneka Gandhi v. Union of India (1978)",
                  desc: "Article 21 and the 'Procedure Established by Law' expansion.",
                  facts: "Maneka Gandhi's passport impounded by the Government under Regional Passport Act without reasons. The Supreme Court held that the procedure established by law under Article 21 must be fair, just, and reasonable, incorporating the American due process doctrine into Indian fundamental rights."
                },
                {
                  title: "K.S. Puttaswamy v. Union of India (2017)",
                  desc: "Right to Privacy declared a Fundamental Right under Article 21.",
                  facts: "Justice K.S. Puttaswamy challenging the constitutional validity of Aadhaar biometric card system. The 9-judge bench unanimously ruled that the Right to Privacy is a fundamental right protected under Article 21, Article 14, and Article 19 of the Constitution of India."
                }
              ].map((c, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    textAlign: 'left'
                  }}
                >
                  <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>{c.title}</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>{c.desc}</p>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '4px 10px', fontSize: '0.7rem', alignSelf: 'flex-start' }}
                    onClick={async () => {
                      setErrorMessage('');
                      setSuccessMessage('');
                      const fileObj = new File([c.facts], `LANDMARK_${c.title.split(' ')[0]}.txt`, { type: 'text/plain' });
                      const res = await uploadPDFFile(fileObj);
                      if (res.success) {
                        setSuccessMessage(`Landmark case "${c.title.split(' ')[0]}" loaded successfully!`);
                        setCurrentCase({ name: fileObj.name, size: `${(fileObj.size / 1024).toFixed(1)} KB` });
                      } else {
                        setErrorMessage(res.message);
                      }
                    }}
                  >
                    Index Case ➔
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Error and Success Notifications */}
          {errorMessage && (
            <div style={{ 
              marginTop: '12px', 
              padding: '10px 14px', 
              backgroundColor: 'rgba(239, 68, 68, 0.08)', 
              border: '1px solid rgba(239, 68, 68, 0.15)', 
              borderRadius: '6px', 
              color: 'var(--color-danger)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={14} />
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div style={{ 
              marginTop: '12px', 
              padding: '10px 14px', 
              backgroundColor: 'rgba(16, 185, 129, 0.08)', 
              border: '1px solid rgba(16, 185, 129, 0.15)', 
              borderRadius: '6px', 
              color: 'var(--color-success)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={14} />
              {successMessage}
            </div>
          )}
        </div>

        {/* Briefing Library List */}
        <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h3 className="panel-title" style={{ fontSize: '1.05rem', marginBottom: '14px', flexShrink: 0 }}>
            <BookOpen size={18} color="var(--color-gold)" /> Briefing Library
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
            marginBottom: '14px',
            flexShrink: 0
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search indexed briefs..."
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

          {/* Library scrollable list */}
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredDocs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                No indexed legal briefs found.
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
                      padding: '12px',
                      background: isSelected ? 'rgba(212, 175, 55, 0.05)' : 'rgba(255,255,255,0.01)',
                      border: isSelected ? '1px solid var(--color-gold)' : '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    className="action-card-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <FileText size={16} color={isSelected ? "var(--color-gold)" : "rgba(255,255,255,0.5)"} />
                      <div style={{ overflow: 'hidden' }}>
                        <span style={{ 
                          display: 'block', 
                          fontSize: '0.82rem', 
                          fontWeight: '600', 
                          color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.85)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {doc.name}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{doc.size}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: '700',
                        color: 'var(--color-success)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Active Brief
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AI Consultation Workspace (ChatBox) */}
      <div style={{ height: '100%' }}>
        {currentCase ? (
          <ChatBox />
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
              marginBottom: '20px',
              boxShadow: '0 0 20px rgba(212,175,55,0.1)'
            }}>
              <Scale size={28} color="var(--color-gold)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>
              Consultation Workspace Locked
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '360px', lineHeight: '1.5', margin: 0 }}>
              Please upload a new case brief or select an existing document from the Briefing Library on the left to begin consulting with your AI Co-Counsel.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default BriefingLab;
