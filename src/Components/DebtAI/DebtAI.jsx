import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import send from "../../assets/images/send.svg";
import { SpeechConfig, AudioConfig, SpeechRecognizer, ResultReason } from "microsoft-cognitiveservices-speech-sdk";
import { MdArrowBack, MdAdd, MdChatBubbleOutline, MdDelete, MdWarningAmber, MdMenu, MdClose, MdTranslate, MdMic, MdStop, MdDiamond } from "react-icons/md"; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, push, onValue, serverTimestamp, remove, update } from "firebase/database";
import { app } from "../../firebase";
import { useTheme } from "../../context/ThemeContext";
import { BrainCircuit, LayoutDashboard, Sun, Moon, ArrowUpRight } from "lucide-react";
import PricingModal from "../Premium/Premium";
import { usePopup } from "../../context/PopupContext";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity">
      <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-sm shadow-2xl transition-all">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500 transition-colors">
             <MdWarningAmber size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-muted font-medium mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-4 w-full">
            <button onClick={onClose} className="btn-secondary flex-1 py-3 text-sm">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-3 rounded-full font-bold text-white bg-red-500 hover:bg-red-600 transition-colors text-sm">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BotMessage = ({ text }) => {
  const [translatedText, setTranslatedText] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const translatorKey = import.meta.env.VITE_AZURE_TRANSLATOR_KEY;
  const translatorEndpoint = import.meta.env.VITE_AZURE_TRANSLATOR_ENDPOINT;

  const translateText = async (targetLang = "hi") => {
    if (translatedText) {
      setShowTranslation(!showTranslation);
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch(`${translatorEndpoint}/translate?api-version=3.0&to=${targetLang}`, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": translatorKey,
          "Ocp-Apim-Subscription-Region": import.meta.env.VITE_AZURE_REGION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ text }]),
      });
      const data = await response.json();
      setTranslatedText(data[0].translations[0].text);
      setShowTranslation(true);
    } catch (error) {
      console.error("Translation Error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed font-medium">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
      
      {showTranslation && translatedText && (
        <div className="mt-4 p-6 bg-secondary border border-border rounded-2xl animate-in fade-in slide-in-from-top-2">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Translated Architecture</div>
            <div className="text-lg leading-relaxed">{translatedText}</div>
        </div>
      )}

      <button
        onClick={() => translateText()}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors"
      >
        <MdTranslate size={14} />
        {isTranslating ? "Processing..." : (showTranslation ? "Hide Translation" : "Translate to Hindi")}
      </button>
    </div>
  );
};

function DebtAI() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { showPopup } = usePopup();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [remainingPrompts, setRemainingPrompts] = useState(20);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, sessionId: null });

  const messagesEndRef = useRef(null);
  const auth = getAuth(app);
  const db = getDatabase(app);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        onValue(ref(db, `users/${currentUser.uid}`), (snapshot) => {
          const data = snapshot.val();
          setUserData(data);
          setIsPremium(data?.isPremium || false);
          setRemainingPrompts(data?.remainingPrompts ?? 20);
        });

        onValue(ref(db, `users/${currentUser.uid}/chatSessions`), (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const sortedSessions = Object.entries(data)
              .map(([id, session]) => ({ id, ...session }))
              .sort((a, b) => b.timestamp - a.timestamp);
            setSessions(sortedSessions);
          } else {
            setSessions([]);
          }
        });
      }
    });

    if (location.state?.autoPrompt) {
        setInput(location.state.autoPrompt);
        // We delay the actual handleSend slightly to ensure user is loaded
        setTimeout(() => handleSend(location.state.autoPrompt), 500);
    }

    return () => unsubscribeAuth();
  }, [auth, db, location]);

  useEffect(() => {
    if (currentSessionId && user) {
      onValue(ref(db, `users/${user.uid}/chatSessions/${currentSessionId}/messages`), (snapshot) => {
        const data = snapshot.val();
        if (data) setMessages(Object.values(data));
      });
    }
  }, [currentSessionId, user, db]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (forcedInput = null) => {
    const messageText = forcedInput || input;
    if (!messageText.trim() || !user || isTyping) return;
    if (!isPremium && remainingPrompts <= 0) return showPopup({ title: "Inquiry Capacity", message: "Standard capacity reached. Please upgrade to Pro Tier for extended architecture sessions.", type: "warning" });

    let sessionId = currentSessionId;
    if (!sessionId) {
      const newSessionRef = push(ref(db, `users/${user.uid}/chatSessions`), {
        title: messageText.slice(0, 30) + "...",
        timestamp: serverTimestamp(),
      });
      sessionId = newSessionRef.key;
      setCurrentSessionId(sessionId);
    }

    const newMessage = { text: messageText, sender: "user", timestamp: Date.now() };
    push(ref(db, `users/${user.uid}/chatSessions/${sessionId}/messages`), newMessage);
    setInput("");
    setIsTyping(true);

    if (!isPremium) {
      update(ref(db, `users/${user.uid}`), { remainingPrompts: remainingPrompts - 1 });
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: messageText,
          messages: [{ role: "system", content: "You are DebtAI, a calm, empathetic financial architect. Your goal is to simplify complex financial patterns into human sentences without judgment." }, ...messages.map(m => ({ role: m.sender === "bot" ? "assistant" : "user", content: m.text })), { role: "user", content: messageText }],
        }),
      });

      const botReply = await response.text();
      push(ref(db, `users/${user.uid}/chatSessions/${sessionId}/messages`), {
        text: botReply,
        sender: "bot",
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeechToText = () => {
    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_REGION;
    
    const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = "en-US";
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    setIsListening(true);
    recognizer.recognizeOnceAsync((result) => {
      if (result.reason === ResultReason.RecognizedSpeech) {
        setInput(result.text);
      }
      setIsListening(false);
      recognizer.close();
    });
  };

  const initiateDelete = (e, id) => {
      e.stopPropagation();
      setDeleteModal({ open: true, sessionId: id });
  };

  const confirmDelete = async () => {
      if(!user || !deleteModal.sessionId) return;
      await remove(ref(db, `users/${user.uid}/chatSessions/${deleteModal.sessionId}`));
      if(currentSessionId === deleteModal.sessionId) {
          setCurrentSessionId(null);
          setMessages([]);
      }
      setDeleteModal({ open: false, sessionId: null });
  };

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden font-sans relative">
      {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} />}
      <ConfirmationModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, sessionId: null })}
        onConfirm={confirmDelete}
        title="Purge Intelligence Session?"
        message="This action will permanently delete this conversation from the architectural logs."
      />

      <div className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity ${showMobileSidebar ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setShowMobileSidebar(false)} />
      
      <aside className={`fixed md:relative inset-y-0 left-0 w-80 bg-background border-r border-border z-50 flex flex-col p-6 transition-transform duration-300 ${showMobileSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="flex flex-col gap-6 mb-10">
            <button 
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 px-5 py-4 bg-secondary/50 hover:bg-secondary rounded-2xl transition-all border border-border group"
            >
                <LayoutDashboard size={20} className="text-muted group-hover:text-foreground transition-colors" />
                <span className="text-sm font-bold tracking-tight">Return to Dashboard</span>
            </button>
            <div className="flex items-center justify-end px-2">
                <button onClick={() => setShowMobileSidebar(false)} className="md:hidden p-2 hover:bg-secondary rounded-xl transition-colors"><MdClose size={20} /></button>
            </div>
        </div>
        <button onClick={() => { setCurrentSessionId(null); setMessages([]); setShowMobileSidebar(false); }} className="btn-primary w-full py-4 flex items-center justify-center gap-2 mb-8 text-sm uppercase tracking-widest shadow-xl"><MdAdd size={20} /> New Architecture</button>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 hide-scrollbar">
            {sessions.map((session) => (
                <div key={session.id} onClick={() => { setCurrentSessionId(session.id); setShowMobileSidebar(false); }} className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${currentSessionId === session.id ? "bg-foreground text-background border-foreground shadow-lg" : "border-transparent hover:bg-secondary"}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <MdChatBubbleOutline className="shrink-0" size={18} />
                        <span className="truncate text-sm font-bold tracking-tight">{session.title}</span>
                    </div>
                    <button onClick={(e) => initiateDelete(e, session.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-1.5 transition-all"><MdDelete size={16} /></button>
                </div>
            ))}
        </div>
      </aside>

      <div className="relative flex-1 flex flex-col h-full">
        <header className="absolute top-0 w-full p-4 flex items-center justify-between z-10 md:hidden bg-background/80 backdrop-blur-md border-b border-border">
            <button onClick={() => setShowMobileSidebar(true)} className="p-2 hover:bg-secondary rounded-xl transition-colors"><MdMenu size={24} /></button>
            <h1 className="text-lg font-bold tracking-tight">DebtAI Intelligence</h1>
            <div className="w-10 h-10"></div> 
        </header>

        {!currentSessionId && messages.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-0">
                <div className="w-20 h-20 bg-foreground/5 rounded-[32px] flex items-center justify-center mb-8 border border-border"><BrainCircuit className="text-foreground" size={40} /></div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">How can I assist <br /><span className="text-foreground/40 italic"> {userData?.name || "your architecture"}?</span></h1>
                <p className="text-muted text-xl font-medium max-w-lg">I have indexed your financial pattern. Pose any inquiry regarding optimization or strategy.</p>
             </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 pb-48 space-y-8 pt-24 md:pt-12 scroll-smooth">
          {messages.map((msg, index) => {
            const isBot = msg.sender === "bot";
            return (
              <div key={index} className={`flex flex-col w-full animate-in slide-in-from-bottom-2 ${!isBot ? "items-end" : "items-start"}`}>
                <div className={`flex items-center gap-2 mb-2 px-4 opacity-40 uppercase tracking-[0.2em] font-black text-[9px]`}>
                   <span>{isBot ? 'Architect' : userData?.name || 'User'}</span>
                   <span className="opacity-40">•</span>
                   <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-[32px] transition-all relative ${!isBot ? "bg-foreground text-background shadow-xl rounded-tr-none" : "bg-card border border-border light-mode-shadow rounded-tl-none"}`}>
                    <div className={`text-base leading-relaxed tracking-tight ${!isBot ? "font-bold" : "font-medium"}`}>
                        {!isBot ? msg.text : <BotMessage text={msg.text} />}
                    </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <footer className="absolute bottom-0 left-0 w-full p-6 md:p-10 flex flex-col items-center bg-gradient-to-t from-background via-background to-transparent z-10">
          <div className="w-full max-w-4xl space-y-4">
            {user && !isPremium && (
                <div className="flex justify-between items-center px-5 py-2.5 bg-card/60 backdrop-blur-lg rounded-2xl border border-border shadow-sm mx-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${remainingPrompts === 0 ? "text-red-500" : "opacity-60"}`}>
                        Capacity: {remainingPrompts} inquiries remaining
                    </span>
                    <button onClick={() => setShowPricingModal(true)} className="flex items-center gap-2 bg-foreground text-background px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all">
                        <MdDiamond size={14} /> Extended Access
                    </button>
                </div>
            )}

            <div className="relative group">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    placeholder={isListening ? "Listening..." : (user ? (remainingPrompts > 0 || isPremium ? "Input inquiry regarding financial architecture..." : "Standard capacity reached. Upgrade for entry.") : "Session Unauthorized")}
                    disabled={!user || isTyping || isListening || (!isPremium && remainingPrompts === 0)}
                    className={`w-full resize-none rounded-[32px] p-6 pr-32 border border-border bg-card/50 backdrop-blur-xl focus:bg-card focus:outline-none focus:ring-4 focus:ring-foreground/5 text-lg transition-all light-mode-shadow placeholder:opacity-40 font-medium ${isListening ? "border-red-500 ring-4 ring-red-500/10" : ""} ${(!isPremium && remainingPrompts === 0) ? "opacity-40 cursor-not-allowed" : ""}`}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <div className="absolute right-4 bottom-3 flex gap-4">
                    <button type="button" onClick={handleSpeechToText} disabled={!user || isTyping} className={`p-4 rounded-[20px] transition-all shadow-sm flex items-center justify-center ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-card text-muted hover:text-foreground border border-border"}`}>
                        {isListening ? <MdStop size={24} /> : <MdMic size={24} />}
                    </button>
                    <button type="button" onClick={() => handleSend()} disabled={!user || isTyping || isListening} className="p-4 bg-foreground text-background rounded-[20px] transition-all shadow-xl hover:opacity-90 disabled:opacity-20 flex items-center justify-center border border-foreground/10">
                        <ArrowUpRight size={24} /> 
                    </button>
                </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default DebtAI;