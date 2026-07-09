import React, { createContext, useState, useContext, useEffect } from 'react';

const MootCourtContext = createContext();

export const useMootCourt = () => useContext(MootCourtContext);

export const MootCourtProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [documents, setDocuments] = useState([]);
  const [currentCase, setCurrentCase] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userFullName, setUserFullName] = useState('');
  const [userCourse, setUserCourse] = useState('');
  const [userCollege, setUserCollege] = useState('');
  const [profileImage, setProfileImage] = useState('');

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Welcome, Counsel. I am your AI Co-Counsel. Upload the facts of your case or relevant briefs in the Dashboard, or ask me any legal questions to begin crafting your arguments."
    }
  ]);
  const [isSending, setIsSending] = useState(false);

  // Judge Simulator State
  const [selectedJudge, setSelectedJudge] = useState('chandrachud');
  const [judgeMessages, setJudgeMessages] = useState([]);
  const [isJudgeEvaluating, setIsJudgeEvaluating] = useState(false);
  const [currentScore, setCurrentScore] = useState(null);

  // Custom Session Simulation State
  const [pastSessions, setPastSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [simulationMode, setSimulationMode] = useState('judge');
  const [simulationSide, setSimulationSide] = useState('petitioner');
  const [simulationDispute, setSimulationDispute] = useState('');

  // Memorial Builder State
  const [activeMemorialRole, setActiveMemorialRole] = useState('petitioner'); // 'petitioner' | 'respondent'
  const [activeMemorialSection, setActiveMemorialSection] = useState('statementOfJurisdiction');
  const [isDrafting, setIsDrafting] = useState(false);
  const [memorialDrafts, setMemorialDrafts] = useState({
    petitioner: {
      statementOfJurisdiction: '',
      statementOfFacts: '',
      issuesRaised: '',
      summaryOfArguments: '',
      argumentsAdvanced: '',
      prayer: ''
    },
    respondent: {
      statementOfJurisdiction: '',
      statementOfFacts: '',
      issuesRaised: '',
      summaryOfArguments: '',
      argumentsAdvanced: '',
      prayer: ''
    }
  });

  // Startup: Load authentication session and drafts
  useEffect(() => {
    const savedUser = localStorage.getItem('mootcourt_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed.username);
        setCurrentUserId(parsed.userId);
        setUserFullName(parsed.fullName || parsed.username);
        setUserCourse(parsed.course || "LLB Student");
        setUserCollege(parsed.college || "Law School");
        setProfileImage(parsed.profileImage || "");
        
        // Load their specific history
        fetchUserDocuments(parsed.userId);
        fetchPastSessions(parsed.userId);
      } catch (e) {
        console.error("Error reading saved user session:", e);
      }
    }

    const savedDrafts = localStorage.getItem('mootcourt_memorials');
    if (savedDrafts) {
      try {
        setMemorialDrafts(JSON.parse(savedDrafts));
      } catch (e) {
        console.error("Error reading saved memorials from local storage:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveDraftsToStorage = (newDrafts) => {
    localStorage.setItem('mootcourt_memorials', JSON.stringify(newDrafts));
  };

  const updateMemorialDraft = (role, section, text) => {
    const updated = {
      ...memorialDrafts,
      [role]: {
        ...memorialDrafts[role],
        [section]: text
      }
    };
    setMemorialDrafts(updated);
    saveDraftsToStorage(updated);
  };

  // Auth Operations
  const loginUser = (userId, username, fullName, course, college, profileImg) => {
    setCurrentUser(username);
    setCurrentUserId(userId);
    setUserFullName(fullName || username);
    setUserCourse(course || "LLB Student");
    setUserCollege(college || "Law School");
    setProfileImage(profileImg || "");
    
    localStorage.setItem('mootcourt_user', JSON.stringify({ 
      userId, 
      username,
      fullName: fullName || username,
      course: course || "LLB Student",
      college: college || "Law School",
      profileImage: profileImg || ""
    }));
    
    // Fetch user specific data
    fetchUserDocuments(userId);
    fetchPastSessions(userId);
    setActiveTab('home');
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCurrentUserId(null);
    setUserFullName('');
    setUserCourse('');
    setUserCollege('');
    setProfileImage('');
    localStorage.removeItem('mootcourt_user');
    
    // Reset state
    setDocuments([]);
    setCurrentCase(null);
    setPastSessions([]);
    setActiveSession(null);
    setJudgeMessages([]);
    setCurrentScore(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: "Welcome, Counsel. I am your AI Co-Counsel. Upload the facts of your case or relevant briefs in the Dashboard, or ask me any legal questions to begin crafting your arguments."
      }
    ]);
    setActiveTab('home');
  };

  const uploadProfileImage = async (file) => {
    if (!currentUserId) return { success: false, error: "Auth required." };
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', currentUserId);

    try {
      const response = await fetch('/auth/profile-image', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setProfileImage(data.profileImage);
        
        // Update localStorage
        const savedUser = localStorage.getItem('mootcourt_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          parsed.profileImage = data.profileImage;
          localStorage.setItem('mootcourt_user', JSON.stringify(parsed));
        }
        return { success: true, profileImage: data.profileImage };
      }
      return { success: false, error: data.detail || "Image upload failed." };
    } catch (e) {
      console.error(e);
      return { success: false, error: "Network connection failed." };
    }
  };

  // Fetch documents from SQLite
  const fetchUserDocuments = async (userId) => {
    try {
      const response = await fetch('/documents', {
        headers: { 'X-User-Id': userId }
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
        if (data.documents.length > 0 && !currentCase) {
          setCurrentCase(data.documents[0]);
        }
      }
    } catch (e) {
      console.error("Error loading documents:", e);
    }
  };

  // Fetch past sessions from SQLite
  const fetchPastSessions = async (userId) => {
    if (!userId) return;
    setIsLoadingSessions(true);
    try {
      const response = await fetch('/sessions', {
        headers: { 'X-User-Id': userId }
      });
      const data = await response.json();
      if (data.success) {
        setPastSessions(data.sessions);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Upload PDF Function
  const uploadPDFFile = async (file) => {
    if (!currentUserId) return { success: false, message: "Authentication required." };
    setIsUploading(true);
    const statuses = [
      "Reviewing pleadings...",
      "Analyzing case facts...",
      "Extracting legal controversies...",
      "Indexing precedents in vector database...",
      "Briefing AI judges..."
    ];
    
    let statusIndex = 0;
    setUploadStatus(statuses[statusIndex]);
    const statusInterval = setInterval(() => {
      statusIndex = (statusIndex + 1) % statuses.length;
      setUploadStatus(statuses[statusIndex]);
    }, 1500);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', currentUserId);

    try {
      const response = await fetch('/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      clearInterval(statusInterval);

      if (data.success) {
        // Refresh document briefings list from DB
        await fetchUserDocuments(currentUserId);
        
        // Add co-counsel message about upload success
        setMessages(prev => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            role: 'assistant',
            text: `📝 System Note: I have successfully indexed the case document "${file.name}". You can now ask me questions regarding this case, run a mock trial, or start drafting your memorials.`
          }
        ]);
        
        setIsUploading(false);
        return { success: true, message: data.message };
      } else {
        setIsUploading(false);
        return { success: false, message: data.message || "Failed to process PDF." };
      }
    } catch (error) {
      clearInterval(statusInterval);
      setIsUploading(false);
      console.error("PDF upload error:", error);
      return { success: false, message: "Server connection failed. Make sure the backend is running." };
    }
  };

  // Send Chat Message
  const sendChatMessage = async (text) => {
    if (!text.trim() || !currentUserId) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: data.data.reply
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text: `⚠️ Error: ${data.detail || "Unable to retrieve response from co-counsel."}`
          }
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: "⚠️ Connection to the MootCourt AI backend failed. Please verify that your Python server is running on port 8001."
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const getGradeFromScore = (score) => {
    if (score >= 9.0) return 'A+';
    if (score >= 8.5) return 'A';
    if (score >= 8.0) return 'B+';
    if (score >= 7.0) return 'B';
    if (score >= 6.0) return 'C+';
    if (score >= 5.0) return 'C';
    return 'D';
  };

  const startNewSimulation = async (dispute, side, mode, judge) => {
    if (!currentUserId) return { success: false, error: "Auth required." };
    setIsJudgeEvaluating(true);
    try {
      const response = await fetch('/sessions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({
          dispute_description: dispute,
          side: side,
          mode: mode,
          judge_personality: mode === 'judge' ? judge : null
        })
      });
      const data = await response.json();
      if (data.success) {
        const newSession = {
          id: data.session_id,
          title: dispute.substring(0, 50) + (dispute.length > 50 ? '...' : ''),
          dispute_description: dispute,
          side: side,
          mode: mode,
          judge_personality: judge,
          status: 'active'
        };
        setActiveSession(newSession);
        setJudgeMessages([
          {
            id: `init-${Date.now()}`,
            role: 'assistant',
            text: data.initial_message
          }
        ]);
        setCurrentScore(null);
        fetchPastSessions(currentUserId);
        return { success: true };
      } else {
        return { success: false, error: data.detail || "Failed to start simulation." };
      }
    } catch (error) {
      console.error("Error starting simulation:", error);
      return { success: false, error: "Connection to server failed." };
    } finally {
      setIsJudgeEvaluating(false);
    }
  };

  // Submit Oral Argument to Simulator
  const submitArgumentToJudge = async (argumentText) => {
    if (!argumentText.trim() || !activeSession || !currentUserId) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: argumentText
    };

    setJudgeMessages(prev => [...prev, userMsg]);
    setIsJudgeEvaluating(true);

    try {
      const response = await fetch(`/sessions/${activeSession.id}/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({ message: argumentText }),
      });
      const data = await response.json();
      if (data.success) {
        setJudgeMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: data.reply
          }
        ]);
      } else {
        setJudgeMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text: `⚠️ Error: ${data.detail || "Unable to get rebuttal."}`
          }
        ]);
      }
    } catch (error) {
      console.error("Simulation message error:", error);
      setJudgeMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: "⚠️ Connection to the server failed. Please verify that your Python server is running."
        }
      ]);
    } finally {
      setIsJudgeEvaluating(false);
    }
  };

  // End simulation session and score
  const endSimulationSession = async () => {
    if (!activeSession || !currentUserId) return;
    setIsJudgeEvaluating(true);
    try {
      const response = await fetch(`/sessions/${activeSession.id}/end`, {
        method: 'POST',
        headers: { 'X-User-Id': currentUserId }
      });
      const data = await response.json();
      if (data.success) {
        const scores = data.scores;
        setCurrentScore({
          grade: getGradeFromScore(scores.overall_score),
          points: scores.overall_score,
          feedback: scores.feedback,
          clarity: scores.clarity,
          pushback: scores.pushback,
          reasoning: scores.reasoning,
          persuasiveness: scores.persuasiveness
        });
        setActiveSession(prev => prev ? { ...prev, status: 'completed' } : null);
        fetchPastSessions(currentUserId);
        return { success: true };
      } else {
        return { success: false, error: data.detail || "Failed to score session." };
      }
    } catch (error) {
      console.error("Error ending session:", error);
      return { success: false, error: "Connection to server failed." };
    } finally {
      setIsJudgeEvaluating(false);
    }
  };

  // Load past session history and scores
  const loadSessionDetails = async (sessionId) => {
    if (!currentUserId) return;
    setIsJudgeEvaluating(true);
    try {
      const response = await fetch(`/sessions/${sessionId}`, {
        headers: { 'X-User-Id': currentUserId }
      });
      const data = await response.json();
      if (data.success) {
        setActiveSession(data.session);
        const mappedMessages = data.messages.map((m, idx) => ({
          id: `msg-${idx}-${Date.now()}`,
          role: m.role,
          text: m.content
        }));
        setJudgeMessages(mappedMessages);
        
        if (data.score) {
          const sc = data.score;
          setCurrentScore({
            grade: getGradeFromScore(sc.overall_score),
            points: sc.overall_score,
            feedback: sc.feedback,
            clarity: sc.clarity,
            pushback: sc.pushback,
            reasoning: sc.reasoning,
            persuasiveness: sc.persuasiveness
          });
        } else {
          setCurrentScore(null);
        }
        return { success: true };
      } else {
        return { success: false, error: data.detail || "Failed to load session details." };
      }
    } catch (error) {
      console.error("Error loading session details:", error);
      return { success: false, error: "Connection error." };
    } finally {
      setIsJudgeEvaluating(false);
    }
  };

  // Reset Judge simulator (returns to setup)
  const resetJudgeSimulation = () => {
    setActiveSession(null);
    setJudgeMessages([]);
    setCurrentScore(null);
  };

  // Help Draft Memorial Section
  const draftMemorialSectionAI = async (role, section, instructions) => {
    if (!currentUserId) return { success: false, error: "Authentication required." };
    setIsDrafting(true);
    const docContext = currentCase ? `based on the case details uploaded: Name: ${currentCase.name}` : "";
    
    const draftPrompt = `
You are an expert legal draftsperson assisting in preparing a Moot Court Memorial.
Please draft a professional, standard legal memo section for the ${role.toUpperCase()} (Petitioner/Respondent).
The section requested is: "${section.toUpperCase()}" (e.g. Statement of Facts, Issues Raised, Summary of Arguments, Arguments Advanced, or Prayer).

User instructions: "${instructions}"
${docContext}

Provide a comprehensive, high-quality draft following traditional legal formatting (e.g. bluebook styling, formal headers, legal phrasing). Outline citations and arguments logical flow. 
Write ONLY the content suitable for pasting directly into the memorial draft.
`;

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({ message: draftPrompt }),
      });

      const data = await response.json();
      if (data.success) {
        updateMemorialDraft(role, section, data.data.reply);
        return { success: true };
      } else {
        return { success: false, error: data.detail || "Unable to draft section." };
      }
    } catch (error) {
      console.error("Drafting error:", error);
      return { success: false, error: "Connection error. Make sure backend is running." };
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <MootCourtContext.Provider value={{
      activeTab,
      setActiveTab,
      documents,
      currentCase,
      isUploading,
      uploadStatus,
      uploadPDFFile,
      
      // Authentication
      currentUser,
      currentUserId,
      userFullName,
      userCourse,
      userCollege,
      profileImage,
      uploadProfileImage,
      loginUser,
      logoutUser,

      // Chat
      messages,
      isSending,
      sendChatMessage,
      
      // Judge / Simulation
      selectedJudge,
      setSelectedJudge,
      judgeMessages,
      isJudgeEvaluating,
      currentScore,
      submitArgumentToJudge,
      resetJudgeSimulation,
      activeSession,
      setActiveSession,
      pastSessions,
      isLoadingSessions,
      simulationMode,
      setSimulationMode,
      simulationSide,
      setSimulationSide,
      simulationDispute,
      setSimulationDispute,
      startNewSimulation,
      endSimulationSession,
      loadSessionDetails,
      
      // Memorials
      activeMemorialRole,
      setActiveMemorialRole,
      activeMemorialSection,
      setActiveMemorialSection,
      memorialDrafts,
      updateMemorialDraft,
      isDrafting,
      draftMemorialSectionAI
    }}>
      {children}
    </MootCourtContext.Provider>
  );
};
