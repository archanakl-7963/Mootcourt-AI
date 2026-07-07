import React, { useState } from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import { 
  Sparkles, 
  Download, 
  Copy, 
  ChevronRight,
  RefreshCw,
  Check
} from 'lucide-react';

const MemorialBuilder = () => {
  const {
    activeMemorialRole,
    setActiveMemorialRole,
    activeMemorialSection,
    setActiveMemorialSection,
    memorialDrafts,
    updateMemorialDraft,
    isDrafting,
    draftMemorialSectionAI,
    currentCase
  } = useMootCourt();

  const [aiInstructions, setAiInstructions] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const sections = [
    { id: 'statementOfJurisdiction', label: 'Statement of Jurisdiction' },
    { id: 'statementOfFacts', label: 'Statement of Facts' },
    { id: 'issuesRaised', label: 'Issues Raised' },
    { id: 'summaryOfArguments', label: 'Summary of Arguments' },
    { id: 'argumentsAdvanced', label: 'Arguments Advanced' },
    { id: 'prayer', label: 'Prayer for Relief' }
  ];

  const handleCopy = () => {
    const textToCopy = memorialDrafts[activeMemorialRole][activeMemorialSection] || '';
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    const textContent = memorialDrafts[activeMemorialRole][activeMemorialSection] || '';
    if (!textContent) return;

    const element = document.createElement("a");
    const file = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `MootCourt_Memorial_${activeMemorialRole}_${activeMemorialSection}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAiDraftSubmit = async () => {
    if (!aiInstructions.trim() || isDrafting) return;
    await draftMemorialSectionAI(activeMemorialRole, activeMemorialSection, aiInstructions);
    setAiInstructions('');
  };

  const handleSuggestionClick = (suggestion) => {
    setAiInstructions(suggestion);
  };

  const activeContent = memorialDrafts[activeMemorialRole][activeMemorialSection] || '';

  const aiSuggestions = {
    statementOfJurisdiction: [
      "Draft a Statement of Jurisdiction invoking Article 32 of the Constitution of India (Writ Petition).",
      "Draft a Statement of Jurisdiction invoking Article 226 of the Constitution of India (High Court Writ).",
      "Draft jurisdiction for a commercial suit under Section 9 of the Code of Civil Procedure (CPC)."
    ],
    statementOfFacts: [
      "Draft a structured, objective Statement of Facts based on the uploaded brief.",
      "Summarize the facts focusing on contractual breaches.",
      "Highlight the key dates and events in a chronological summary."
    ],
    issuesRaised: [
      "Formulate 2 key constitutional issues regarding jurisdiction.",
      "Draft legal issues focused on the breach of contract and damages.",
      "Refine my issues list to match Supreme Court advocacy standards."
    ],
    summaryOfArguments: [
      "Draft a concise Summary of Arguments for our side.",
      "Outline the 3 main pillars of our defense/claim.",
      "Write a summary that highlights the statutory loopholes."
    ],
    argumentsAdvanced: [
      "Expand on Issue 1: statutory interpretation of the liability clause.",
      "Draft legal arguments citing relevant constitutional precedents.",
      "Build a rebuttal framework challenging the respondent's standing."
    ],
    prayer: [
      "Draft a formal Prayer for Relief requesting injunction and costs.",
      "Draft a standard prayer asking for specific performance and damages.",
      "Structure a prayer seeking declaration of unconstitutionality."
    ]
  };

  return (
    <div className="memorial-workspace animate-fade-in">
      {/* Left Pane: Legal Memorial Editor */}
      <div className="editor-pane">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', padding: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn ${activeMemorialRole === 'petitioner' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveMemorialRole('petitioner')}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Petitioner Memorial
              </button>
              <button 
                className={`btn ${activeMemorialRole === 'respondent' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveMemorialRole('respondent')}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Respondent Memorial
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={handleCopy} disabled={!activeContent} title="Copy Draft">
                {copySuccess ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
              </button>
              <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={handleDownload} disabled={!activeContent} title="Download Draft">
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* Section Selector Selectors */}
          <div className="memorial-tabs">
            {sections.map((sec) => (
              <button
                key={sec.id}
                className={`memorial-tab-btn ${activeMemorialSection === sec.id ? 'active' : ''}`}
                onClick={() => setActiveMemorialSection(sec.id)}
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              >
                {sec.label}
              </button>
            ))}
          </div>

          <textarea
            className="memorial-textarea"
            placeholder={`Draft your ${sections.find(s => s.id === activeMemorialSection)?.label} for the ${activeMemorialRole}... Use the AI Assistant on the right to auto-generate a baseline draft based on your uploaded case facts.`}
            value={activeContent}
            onChange={(e) => updateMemorialDraft(activeMemorialRole, activeMemorialSection, e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Word Count: {activeContent ? activeContent.split(/\s+/).filter(Boolean).length : 0} words</span>
            <span>Draft automatically saved to local storage</span>
          </div>

        </div>
      </div>

      {/* Right Pane: AI Assistant Drafting */}
      <div className="assistant-pane glass-panel" style={{ padding: '20px' }}>
        <div className="assistant-header" style={{ padding: '0 0 16px 0', marginBottom: '16px' }}>
          <Sparkles size={20} color="var(--color-gold)" />
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>AI Draft Assistant</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {currentCase ? `Using facts from: ${currentCase.name}` : "Upload a brief for fact-aware drafting"}
            </span>
          </div>
        </div>

        <div className="assistant-body" style={{ padding: '0' }}>
          
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Drafting Suggestions
            </h4>
            <div className="prompt-chips">
              {aiSuggestions[activeMemorialSection].map((suggestion, idx) => (
                <button
                  key={idx}
                  className="prompt-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isDrafting}
                >
                  <ChevronRight size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Custom Drafting Instructions
            </h4>
            
            <textarea
              className="memorial-textarea"
              style={{ flex: 'none', height: '100px', fontSize: '0.9rem', fontFamily: 'inherit', padding: '12px' }}
              placeholder={`E.g., "Draft the ${sections.find(s => s.id === activeMemorialSection)?.label} focusing heavily on the breach of contract clause."`}
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              disabled={isDrafting}
            />

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              onClick={handleAiDraftSubmit}
              disabled={!aiInstructions.trim() || isDrafting}
            >
              {isDrafting ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Drafting Legal Arguments...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Section Draft
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemorialBuilder;
