import React, { useState, useEffect, useRef } from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import Message from './Message';
import { Send, Scale, RefreshCw } from 'lucide-react';

const ChatBox = () => {
  const { messages, isSending, sendChatMessage, currentCase } = useMootCourt();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = () => {
    if (!inputValue.trim() || isSending) return;
    sendChatMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    {
      title: "Statutory Analysis",
      desc: "Examine statutory provisions and relevant acts for this case.",
      prompt: "Analyze the uploaded case files and summarize all relevant statutory provisions, acts, and specific legal sections involved in this dispute."
    },
    {
      title: "Precedent Research",
      desc: "Retrieve key Indian Supreme Court case laws and precedents.",
      prompt: "Examine key Indian Supreme Court case laws and historical precedents that are highly relevant to the facts and issues in this dispute."
    },
    {
      title: "Petitioner Pleadings",
      desc: "Draft a structured Summary of Arguments for the Petitioner.",
      prompt: "Draft a structured, formal Summary of Arguments on behalf of the Petitioner/Plaintiff based on the case brief facts."
    },
    {
      title: "Respondent Pleadings",
      desc: "Draft a structured Summary of Arguments for the Respondent.",
      prompt: "Draft a structured, formal Summary of Arguments on behalf of the Respondent/Defendant based on the case brief facts."
    }
  ];

  return (
    <div className="chat-container animate-fade-in">
      <div className="chat-header">
        <Scale size={24} color="var(--color-gold)" />
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>AI Co-Counsel Consultation</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {currentCase ? `Consulting on: ${currentCase.name}` : "General Legal Consultation Mode"}
          </span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {isSending && (
          <div className="message-wrapper assistant">
            <div className="avatar assistant">
              <RefreshCw className="animate-spin" size={18} style={{ animation: 'spin 2s linear infinite' }} />
            </div>
            <div className="message-bubble" style={{ color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Deliberating legal research...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 20px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '16px' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-gold)', marginBottom: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ⚖️ Select a Formal Legal Inquiry to Begin
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {suggestions.map((s, idx) => (
              <div 
                key={idx} 
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  textAlign: 'left'
                }}
                className="action-card-hover"
                onClick={() => {
                  sendChatMessage(s.prompt);
                }}
              >
                <div style={{ color: 'var(--color-gold)', fontSize: '0.88rem', fontWeight: '700' }}>
                  {s.title}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.35', margin: 0 }}>
                  {s.desc}
                </div>
                <div style={{ color: 'var(--color-gold)', fontSize: '0.7rem', fontWeight: '600', alignSelf: 'flex-end', marginTop: '6px' }}>
                  Execute Query ➔
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          placeholder={currentCase ? "Consult co-counsel about this case..." : "Ask any legal theory or upload a case brief to begin..."}
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

// Simple inline spin keyframe animation injected
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 1.5s linear infinite;
  }
`;
document.head.appendChild(styleTag);

export default ChatBox;
