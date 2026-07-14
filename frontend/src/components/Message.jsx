import React from 'react';
import { User, ShieldAlert } from 'lucide-react';

// A simple local markdown-like parser to render bold text, bullets, and tables beautifully without installing heavy plugins
const formatMessageText = (text) => {
  if (!text) return '';
  
  // Format tables
  if (text.includes('|') && text.includes('\n')) {
    const lines = text.split('\n');
    const tableLines = lines.filter(line => line.trim().startsWith('|'));
    
    if (tableLines.length >= 2) {
      const parsedRows = tableLines.map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
      );
      
      // Check if it has a header separator (like |---|---|)
      const hasHeaderSep = parsedRows[1] && parsedRows[1].every(cell => cell.match(/^-+$/));
      
      const headers = parsedRows[0];
      const rows = hasHeaderSep ? parsedRows.slice(2) : parsedRows.slice(1);
      
      return (
        <div style={{ overflowX: 'auto', margin: '14px 0', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(212, 175, 55, 0.1)', borderBottom: '1px solid var(--border-glass)' }}>
                {headers.map((header, i) => (
                  <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: 'var(--color-gold)' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: rIdx < rows.length - 1 ? '1px solid var(--border-glass)' : 'none', background: rIdx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '10px 14px', color: 'var(--text-primary)' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  // Parse paragraphs, bullets and bold tags
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Skip table lines since we render them above
    if (line.trim().startsWith('|')) return null;

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const content = line.substring(2);
      return (
        <li key={idx} style={{ marginLeft: '20px', marginBottom: '6px', listStyleType: 'square', color: 'var(--text-primary)' }}>
          {renderLineWithInlineFormatting(content)}
        </li>
      );
    }
    
    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      return (
        <div key={idx} style={{ display: 'flex', gap: '8px', marginLeft: '10px', marginBottom: '8px' }}>
          <span style={{ color: 'var(--color-gold)', fontWeight: '600' }}>{numMatch[1]}.</span>
          <span>{renderLineWithInlineFormatting(numMatch[2])}</span>
        </div>
      );
    }

    // Section headers
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} style={{ fontSize: '1.15rem', color: 'var(--color-gold)', margin: '18px 0 8px 0', fontFamily: 'var(--font-serif)' }}>
          {line.substring(4)}
        </h4>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={idx} style={{ fontSize: '1.3rem', color: 'var(--color-gold)', margin: '22px 0 10px 0', fontFamily: 'var(--font-serif)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
          {line.substring(3)}
        </h3>
      );
    }

    // Normal paragraph
    if (line.trim() === '') return <div key={idx} style={{ height: '12px' }} />;
    return (
      <p key={idx} style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
        {renderLineWithInlineFormatting(line)}
      </p>
    );
  });
};

const renderLineWithInlineFormatting = (text) => {
  // Regex to split on bold segments (**text**)
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#fff', fontWeight: '600' }}>{part.slice(2, -2)}</strong>;
    }
    
    // Render inline code / citation backticks `citation`
    const codeParts = part.split(/(`.*?`)/g);
    return codeParts.map((subPart, j) => {
      if (subPart.startsWith('`') && subPart.endsWith('`')) {
        return (
          <code 
            key={`${i}-${j}`} 
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.06)', 
              color: 'var(--color-accent)', 
              padding: '2px 6px', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}
          >
            {subPart.slice(1, -1)}
          </code>
        );
      }
      return subPart;
    });
  });
};

const Message = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.id && message.id.toString().startsWith('sys-');

  if (isSystem) {
    return (
      <div style={{
        alignSelf: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-glass)',
        borderRadius: '12px',
        padding: '16px 20px',
        maxWidth: '85%',
        margin: '12px 0',
        fontSize: '0.9rem',
        animation: 'fadeIn 0.3s ease forwards'
      }}>
        {formatMessageText(message.text)}
      </div>
    );
  }

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
      <div className={`avatar ${isUser ? 'user' : 'assistant'}`}>
        {isUser ? <User size={18} /> : <ShieldAlert size={18} />}
      </div>
      <div className="message-bubble">
        {formatMessageText(message.text)}
      </div>
    </div>
  );
};

export default Message;
