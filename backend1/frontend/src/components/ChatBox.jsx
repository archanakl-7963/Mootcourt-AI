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
    "Critique our legal standing in this case.",
    "Draft a skeleton argument structure for the Applicant.",
    "What are the major loopholes or risks in the facts of the case?",
    "Generate relevant case precedents or statutory citations."
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
        <div style={{ padding: '0 8px 12px 8px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
            SUGGESTED ENQUIRIES
          </p>
          <div className="suggestions-container">
            {suggestions.map((s, idx) => (
              <div 
                key={idx} 
                className="suggestion-pill"
                onClick={() => setInputValue(s)}
              >
                {s}
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
