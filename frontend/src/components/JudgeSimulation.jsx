import React, { useState, useEffect, useRef } from 'react';
import { useMootCourt } from '../context/MootCourtContext';
import Message from './Message';
import { 
  Gavel, 
  RefreshCw, 
  Send, 
  Trophy, 
  Play, 
  Scale, 
  Users, 
  Timer, 
  BookOpen, 
  Sparkles,
  Award,
  ArrowLeft,
  XCircle,
  Mic,
  MicOff
} from 'lucide-react';

const JudgeSimulation = () => {
  const {
    selectedJudge,
    setSelectedJudge,
    judgeMessages,
    isJudgeEvaluating,
    currentScore,
    submitArgumentToJudge,
    resetJudgeSimulation,
    activeSession,
    startNewSimulation,
    endSimulationSession,
    simulationMode,
    setSimulationMode,
    simulationSide,
    setSimulationSide,
    simulationDispute,
    setSimulationDispute,
    language
  } = useMootCourt();

  const [argumentInput, setArgumentInput] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [setupError, setSetupError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const lastMessageTextRef = useRef('');

  // Speech Synthesis triggers whenever judgeMessages list receives a new assistant response
  useEffect(() => {
    if (judgeMessages.length > 0) {
      const lastMsg = judgeMessages[judgeMessages.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.text !== lastMessageTextRef.current) {
        lastMessageTextRef.current = lastMsg.text;
        
        if (isVoiceEnabled) {
          window.speechSynthesis.cancel();
          const cleanText = lastMsg.text
            .replace(/\*+/g, '')
            .replace(/#+/g, '')
            .replace(/`+/g, '')
            .replace(/\[.*?\]\(.*?\)/g, '')
            .trim();

          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  }, [judgeMessages, isVoiceEnabled, language]);

  // Mute voice if simulation exits
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setArgumentInput(prev => prev ? prev + " " + transcript : transcript);
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const sampleProblems = [
    {
      id: 'contract',
      title: "Contractual Dispute: Tech Startup vs Enterprise",
      desc: "A technology startup sues an enterprise client for $150,000 in unpaid software license fees. The client countersues for $200,000, claiming delayed delivery of critical modules caused significant operational losses."
    },
    {
      id: 'trademark',
      title: "Trademark Dilution: Solis vs Solaris Cosmetics",
      desc: "A premium organic cosmetic brand 'Solis' sues a new competitor 'Solaris Organic' for trademark infringement and dilution, alleging the name is deceptively similar and causes customer confusion in premium retail outlets."
    },
    {
      id: 'privacy',
      title: "Constitutional Privacy vs Government Surveillance Directive",
      desc: "A citizens' privacy group challenges a government digital directive requiring end-to-end encrypted messaging services to implement a 'traceability' backdoor to identify originators of malicious messages."
    }
  ];

  const judgeProfiles = [
    {
      id: 'chandrachud',
      name: "Justice Chandrachud",
      philosophy: "Progressive / Constitutional Morality",
      desc: "Former CJI. Prioritizes privacy, gender rights, and fundamental liberties. Analytical, progressive, and relies heavily on constitutional morality."
    },
    {
      id: 'krishnaiyer',
      name: "Justice Krishna Iyer",
      philosophy: "Social Justice & Activism",
      desc: "Pioneer of human rights and legal aid. Speaks in rich, poetic prose. Prioritizes substantive social justice over procedural technicalities."
    },
    {
      id: 'bhagwati',
      name: "Justice Bhagwati",
      philosophy: "PIL Pioneer / Human Rights",
      desc: "Father of PIL (Public Interest Litigation) in India. Relaxes procedural constraints to secure basic human rights and protects the underprivileged."
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [judgeMessages, isJudgeEvaluating]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (activeSession && activeSession.status === 'active') {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!simulationDispute.trim()) {
      setSetupError("Please enter a legal dispute description or select one from the library.");
      return;
    }
    setSetupError('');
    let finalDispute = simulationDispute;
    if (language === 'hi') {
      finalDispute += " [Instruction: Please conduct the entire trial, ask all questions, and provide all scorecard evaluation feedback in Hindi (हिन्दी) language. Converse directly in Hindi.]";
    }
    const result = await startNewSimulation(
      finalDispute,
      simulationSide,
      simulationMode,
      selectedJudge
    );
    if (!result.success) {
      setSetupError(result.error);
    }
  };

  const handleSend = () => {
    if (!argumentInput.trim() || isJudgeEvaluating) return;
    submitArgumentToJudge(argumentInput);
    setArgumentInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectSampleProblem = (prob) => {
    setSimulationDispute(prob.desc);
    setSetupError('');
  };

  // Render Setup View
  if (!activeSession) {
    return (
      <div className="dashboard-container animate-fade-in" style={{ paddingBottom: '40px' }}>
        <div className="dashboard-hero" style={{ padding: '24px 32px' }}>
          <h2 className="hero-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Gavel size={28} />
            Moot Court Practice Arena
          </h2>
          <p className="hero-desc">
            Prepare yourself for real litigation. Set up your dispute details, pick your side, select your opponent mode, and begin a strict interactive trial session.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '24px' }}>
          {/* Left Column: Dispute Briefing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel">
              <div className="glass-panel-header">
                <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={20} color="var(--color-gold)" />
                  Problem Case Library
                </h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Select a pre-designed legal challenge, or write your own custom dispute below.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sampleProblems.map((prob) => (
                  <div 
                    key={prob.id} 
                    className="document-item" 
                    onClick={() => selectSampleProblem(prob)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s', border: simulationDispute === prob.desc ? '1px solid var(--color-gold)' : '1px solid var(--border-glass)' }}
                  >
                    <div className="doc-info">
                      <Scale size={18} color={simulationDispute === prob.desc ? "var(--color-gold)" : "var(--text-muted)"} />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: simulationDispute === prob.desc ? 'var(--color-gold)' : 'var(--text-primary)' }}>{prob.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prob.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel">
              <div className="glass-panel-header">
                <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale size={20} color="var(--color-gold)" />
                  Dispute Fact Sheet
                </h3>
              </div>
              <textarea
                className="memorial-textarea"
                style={{ height: '180px', fontSize: '0.9rem' }}
                placeholder="Describe the facts, legal provisions, and controversy of the case here to feed the AI simulation..."
                value={simulationDispute}
                onChange={(e) => {
                  setSimulationDispute(e.target.value);
                  setSetupError('');
                }}
              />
            </div>
          </div>

          {/* Right Column: Settings & Personalities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel-header">
                <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="var(--color-gold)" />
                  Trial Configuration
                </h3>
              </div>

              {/* Side Selection */}
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Select Your Role</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button 
                    className={`btn ${simulationSide === 'petitioner' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSimulationSide('petitioner')}
                    style={{ justifyContent: 'center' }}
                  >
                    Petitioner / Appellant
                  </button>
                  <button 
                    className={`btn ${simulationSide === 'respondent' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSimulationSide('respondent')}
                    style={{ justifyContent: 'center' }}
                  >
                    Respondent / Defense
                  </button>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Select Opponent Mode</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button 
                    className={`btn ${simulationMode === 'judge' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSimulationMode('judge')}
                    style={{ justifyContent: 'center' }}
                  >
                    AI Judge (Mode 1)
                  </button>
                  <button 
                    className={`btn ${simulationMode === 'counsel' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSimulationMode('counsel')}
                    style={{ justifyContent: 'center' }}
                  >
                    Opposing Counsel (Mode 2)
                  </button>
                </div>
              </div>

              {/* Judge Personality Selection (Only if Mode is Judge) */}
              {simulationMode === 'judge' && (
                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Bench Composition</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {judgeProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        onClick={() => setSelectedJudge(profile.id)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: selectedJudge === profile.id ? '1px solid var(--color-gold)' : '1px solid var(--border-glass)',
                          background: selectedJudge === profile.id ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.85rem', color: selectedJudge === profile.id ? 'var(--color-gold)' : 'var(--text-primary)' }}>{profile.name}</span>
                          <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{profile.philosophy}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.3' }}>{profile.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {setupError && (
                <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '4px' }}>⚠️ {setupError}</p>
              )}

              <button 
                className="btn btn-primary animate-pulse" 
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem', marginTop: '10px' }}
                onClick={handleStart}
                disabled={isJudgeEvaluating}
              >
                {isJudgeEvaluating ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Assembling Bench...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Convene Courtroom Session
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Scorecard View (If Completed)
  if (activeSession.status === 'completed' && currentScore) {
    return (
      <div className="dashboard-container animate-fade-in" style={{ paddingBottom: '40px' }}>
        <div className="glass-panel" style={{ borderColor: 'var(--color-gold)', padding: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Moot Court Evaluation</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginTop: '4px' }}>Official Trial Scorecard</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Case Reference: {activeSession.title}</p>
            </div>
            
            <button className="btn btn-secondary" onClick={resetJudgeSimulation}>
              <ArrowLeft size={16} />
              Return to Lobby
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
            
            {/* Left: Detailed critique */}
            <div>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={18} color="var(--color-gold)" />
                Judicial Evaluation & Feedback
              </h3>
              
              <div 
                className="scorecard-critique-box"
                style={{ 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-glass)', 
                  borderRadius: '12px', 
                  padding: '20px', 
                  fontSize: '0.9rem', 
                  lineHeight: '1.6', 
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {currentScore.feedback}
              </div>
            </div>

            {/* Right: Scores and Grades */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Overall Grade Card */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-around', 
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(255,255,255,0.01) 100%)', 
                  border: '1px solid var(--color-gold)', 
                  borderRadius: '16px', 
                  padding: '24px' 
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Performance Grade</div>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-primary)', marginTop: '4px' }}>{currentScore.grade}</div>
                </div>
                <div style={{ height: '50px', width: '1px', background: 'var(--border-glass)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Composite Score</div>
                  <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-gold)', marginTop: '4px' }}>
                    {Number(currentScore.points).toFixed(1)}
                    <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '400' }}>/10</span>
                  </div>
                </div>
              </div>

              {/* Metrics Slider / Bars */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', marginBottom: '4px' }}>
                  Core Advocate Competencies
                </h4>
                
                {[
                  { label: "Clarity of Argument", value: currentScore.clarity },
                  { label: "Handling of Pushback", value: currentScore.pushback },
                  { label: "Use of Legal Reasoning", value: currentScore.reasoning },
                  { label: "Overall Persuasiveness", value: currentScore.persuasiveness }
                ].map((metric, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      <span>{metric.label}</span>
                      <span style={{ fontWeight: '600', color: 'var(--color-gold)' }}>{metric.value}/10</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${(metric.value / 10) * 100}%`, 
                          height: '100%', 
                          background: 'var(--color-gold)', 
                          borderRadius: '4px',
                          boxShadow: '0 0 10px rgba(212,175,55,0.4)',
                          transition: 'width 1s ease-out'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                onClick={resetJudgeSimulation}
              >
                <RefreshCw size={16} />
                Prepare Next Brief
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Active Simulation Stage View
  return (
    <div className="dashboard-container animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Simulation Stage Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid var(--border-glass)', 
          borderRadius: '12px', 
          padding: '16px 24px', 
          marginBottom: '20px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="avatar assistant" style={{ background: 'var(--color-gold)', color: '#0b0f19', width: '40px', height: '40px' }}>
            <Gavel size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              {activeSession.mode === 'judge' ? `AI Bench - Justice ${selectedJudge.toUpperCase()}` : 'Opposing Counsel Simulator'}
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginTop: '2px' }}>
              {activeSession.title}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Mode & Side badges */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-gold)', border: '1px solid rgba(212, 175, 55, 0.2)', textTransform: 'uppercase' }}>
              {activeSession.side}
            </span>
            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)', border: '1px solid rgba(59, 130, 246, 0.2)', textTransform: 'uppercase' }}>
              {activeSession.mode}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <Timer size={16} />
            <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{formatTime(seconds)}</span>
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ 
              borderColor: 'rgba(239, 68, 68, 0.3)', 
              color: 'var(--color-danger)',
              padding: '6px 12px',
              fontSize: '0.8rem'
            }} 
            onClick={resetJudgeSimulation}
          >
            <XCircle size={14} />
            Abandon Trial
          </button>
        </div>
      </div>

      {/* Courtroom Work Area: Chat Dialogue and Etiquette Sidebar side-by-side */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left: Message Stage */}
        <div className="courtroom-stage" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="glass-panel-header" style={{ marginBottom: '0' }}>
            <h3 className="panel-title" style={{ fontSize: '1rem' }}>
              <Scale size={16} />
              Courtroom Dialogue Record
            </h3>
          </div>

          <div style={{ height: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
            {judgeMessages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            {isJudgeEvaluating && (
              <div className="message-wrapper assistant">
                <div className="avatar assistant">
                  <RefreshCw className="animate-spin" size={18} />
                </div>
                <div className="message-bubble" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Evaluating your legal pleadings and preparing rebuttal...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="courtroom-podium"></div>
        </div>

        {/* Right: Collapsible Etiquette & Protocol Reference */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} /> Court Etiquette & Protocol
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: '700', color: '#ffffff', display: 'block', marginBottom: '2px' }}>Formal Address</span>
                Begin your response with: <br />
                <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '4px', color: 'var(--color-gold)', fontSize: '0.72rem' }}>"May it please the Court, my submissions are..."</code>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: '700', color: '#ffffff', display: 'block', marginBottom: '2px' }}>Introducing Arguments</span>
                Use standard legal phrasing: <br />
                <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '4px', color: 'var(--color-gold)', fontSize: '0.72rem' }}>"We humbly submit that..."</code> or <br />
                <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '4px', color: 'var(--color-gold)', fontSize: '0.72rem' }}>"It is the contention of the Counsel that..."</code>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: '700', color: '#ffffff', display: 'block', marginBottom: '2px' }}>Responding to Judges</span>
                Always be respectful under pushback: <br />
                <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '4px', color: 'var(--color-gold)', fontSize: '0.72rem' }}>"Respectfully, My Lord, our position is..."</code>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '10px', marginTop: '10px' }}>
            💡 Tip: Cite legal provisions and precedents to support your arguments.
          </div>
        </div>
      </div>

      {/* Input panel & End session */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Chat input box */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div className="chat-input-container" style={{ padding: '12px', flex: 1 }}>
            <textarea
              className="chat-input"
              placeholder={activeSession.mode === 'judge' ? "May it please the Court, addressing the Judge's concern..." : "Counsel, my rebuttal is as follows..."}
              rows={2}
              value={argumentInput}
              onChange={(e) => setArgumentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isJudgeEvaluating}
              style={{ minHeight: '60px' }}
            />
            {/* Voice Assistant Toggle */}
            <button
              onClick={() => {
                const newVal = !isVoiceEnabled;
                setIsVoiceEnabled(newVal);
                if (!newVal) {
                  window.speechSynthesis.cancel();
                }
              }}
              style={{ 
                alignSelf: 'flex-end', 
                width: '44px', 
                height: '44px', 
                marginRight: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: isVoiceEnabled ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)',
                border: isVoiceEnabled ? '1px solid var(--color-gold)' : '1px solid var(--border-glass)',
                color: isVoiceEnabled ? 'var(--color-gold)' : 'rgba(255,255,255,0.7)',
                outline: 'none',
                transition: 'all 0.2s',
                fontSize: '1.1rem'
              }}
              title={isVoiceEnabled ? "Voice Assistant: ON (AI reads out loud)" : "Voice Assistant: OFF (AI muted)"}
            >
              {isVoiceEnabled ? '🔊' : '🔇'}
            </button>

            <button
              onClick={toggleRecording}
              disabled={isJudgeEvaluating}
              style={{ 
                alignSelf: 'flex-end', 
                width: '44px', 
                height: '44px', 
                marginRight: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                border: isRecording ? '1px solid #ef4444' : '1px solid var(--border-glass)',
                color: isRecording ? '#ef4444' : 'rgba(255,255,255,0.7)',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              title={isRecording ? "Listening... Click to stop" : "Speak argument (Speech-to-Text)"}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!argumentInput.trim() || isJudgeEvaluating}
              style={{ alignSelf: 'flex-end', width: '44px', height: '44px' }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Action card: End Session & Grade */}
        <div 
          className="glass-panel" 
          style={{ 
            borderColor: 'var(--color-gold)', 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '16px', 
            padding: '20px',
            textAlign: 'left' 
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="avatar assistant" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-gold)', width: '40px', height: '40px', flexShrink: 0 }}>
              <Trophy size={20} />
            </div>
            <div>
              <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>Conclude Proceedings</h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0, maxWidth: '180px' }}>
                Submit transcript to receive your scorecard.
              </p>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            style={{ padding: '10px 16px', fontSize: '0.85rem', flexShrink: 0 }}
            onClick={endSimulationSession}
            disabled={isJudgeEvaluating || judgeMessages.length < 2}
            title={judgeMessages.length < 2 ? "Please send at least one argument first" : ""}
          >
            {isJudgeEvaluating ? (
              <RefreshCw className="animate-spin" size={14} />
            ) : (
              <>
                <Award size={14} /> Scorecard
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default JudgeSimulation;
