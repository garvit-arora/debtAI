import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SpeechConfig, AudioConfig, SpeechRecognizer, ResultReason } from "microsoft-cognitiveservices-speech-sdk";
import { MdAdd, MdChatBubbleOutline, MdDelete, MdWarningAmber, MdMenu, MdClose, MdTranslate, MdMic, MdStop, MdDiamond } from "react-icons/md"; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, push, onValue, serverTimestamp, remove, update } from "firebase/database";
import { app } from "../../firebase";
import { BrainCircuit, LayoutDashboard, ArrowUpRight, User, Sparkles } from "lucide-react";
import PricingModal from "../Premium/Premium";
import { usePopup } from "../../context/PopupContext";
import logo from '../../assets/icons/logo2.png'

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-[48px] p-10 w-full max-w-sm shadow-3xl text-center uppercase tracking-tight">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
             <MdWarningAmber size={32} />
          </div>
          <h3 className="text-2xl font-black italic tracking-tighter mb-2 text-white">{title}</h3>
          <p className="text-stone-500 font-bold text-xs mb-8 leading-relaxed px-4">{message}</p>
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-black text-[10px] tracking-widest bg-white/5 text-stone-500 hover:text-white transition-all uppercase">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-4 rounded-2xl font-black text-[10px] tracking-widest bg-rose-500 text-white hover:bg-rose-600 transition-all uppercase">Delete</button>
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
      <div className="flex justify-end pt-2">
        <button
          onClick={() => translateText()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-cyan-500 transition-colors"
        >
          <MdTranslate size={14} />
          {isTranslating ? "Translating..." : (showTranslation ? "Show Original" : "Hindi")}
        </button>
      </div>
      
      <div className="prose prose-invert prose-p:my-2 prose-h1:my-4 prose-h2:my-3 prose-h3:my-2 prose-ul:my-2 prose-li:my-0 max-w-none text-[15px] font-medium tracking-tight text-white leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {showTranslation && translatedText ? translatedText : text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default function DebtAI() {
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        onValue(ref(db, `users/${currentUser.uid}`), (snapshot) => {
          const data = snapshot.val();
          setUserData(data);
          setIsPremium(data?.isPremium || false);
          setRemainingPrompts(data?.remainingPrompts ?? 20);
        });

        onValue(ref(db, `users/${currentUser.uid}/chatSessions`), (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setSessions(Object.entries(data).map(([id, s]) => ({ id, ...s })).sort((a,b) => b.timestamp - a.timestamp));
          } else setSessions([]);
        });
      } else navigate("/login");
    });
    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (location.state?.prompt && user && messages.length === 0) {
      handleSend(location.state.prompt);
    }
  }, [location.state, user]);

  useEffect(() => {
    if (currentSessionId && user) {
      onValue(ref(db, `users/${user.uid}/chatSessions/${currentSessionId}/messages`), (snapshot) => {
        const data = snapshot.val();
        if (data) setMessages(Object.values(data));
      });
    }
  }, [currentSessionId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (forcedInput = null) => {
    const text = forcedInput || input;
    if (!text.trim() || !user || isTyping) return;
    if (!isPremium && remainingPrompts <= 0) return setShowPricingModal(true);

    let sessionId = currentSessionId;
    if (!sessionId) {
      const newSessionRef = push(ref(db, `users/${user.uid}/chatSessions`), {
        title: text.slice(0, 30) + "...",
        timestamp: serverTimestamp(),
      });
      sessionId = newSessionRef.key;
      setCurrentSessionId(sessionId);
    }

    const newMessage = { text, sender: "user", timestamp: Date.now() };
    const userMsgRef = push(ref(db, `users/${user.uid}/chatSessions/${sessionId}/messages`), newMessage);
    setInput("");
    setIsTyping(true);

    if (!isPremium) update(ref(db, `users/${user.uid}`), { remainingPrompts: remainingPrompts - 1 });

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          userData: userData,
          messages: messages.slice(-5).map(m => ({ role: m.sender === "bot" ? "assistant" : "user", content: m.text })),
        }),
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botReply = "";

      // Add an initial empty bot message
      setMessages(prev => [...prev, { text: "", sender: "bot", timestamp: Date.now(), isStreaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        botReply += chunk;
        
        // Update the last message (the streaming one)
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = botReply;
          return newMsgs;
        });
      }

      // Finalize the message in database
      push(ref(db, `users/${user.uid}/chatSessions/${sessionId}/messages`), { text: botReply, sender: "bot", timestamp: Date.now() });
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].isStreaming = false;
        return newMsgs;
      });

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { text: "Protocol Error: Connection lost.", sender: "bot", timestamp: Date.now() }]);
    } finally { 
      setIsTyping(false); 
    }
  };

  const handleSpeech = () => {
    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_REGION;
    const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
    const recognizer = new SpeechRecognizer(speechConfig, AudioConfig.fromDefaultMicrophoneInput());
    setIsListening(true);
    recognizer.recognizeOnceAsync((result) => {
      if (result.reason === ResultReason.RecognizedSpeech) setInput(result.text);
      setIsListening(false);
      recognizer.close();
    });
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden uppercase">
      {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} />}
      <ConfirmationModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, sessionId: null })}
        onConfirm={async () => {
           await remove(ref(db, `users/${user.uid}/chatSessions/${deleteModal.sessionId}`));
           if(currentSessionId === deleteModal.sessionId) { setCurrentSessionId(null); setMessages([]); }
           setDeleteModal({ open: false, sessionId: null });
        }}
        title="Delete Session"
        message="This conversation will be permanently removed."
      />

      {/* SIDEBAR */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-80 bg-[#0d0d0d] border-r border-white/5 z-50 flex flex-col p-6 transition-transform duration-500 ease-in-out ${showMobileSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
         <div className="mb-12">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-stone-500 hover:text-white w-full">
               <LayoutDashboard size={18} />
               <span className="text-[10px] font-black tracking-widest">Dashboard</span>
            </button>
         </div>

         <button onClick={() => { setCurrentSessionId(null); setMessages([]); setShowMobileSidebar(false); }} className="w-full py-5 bg-white text-black rounded-[24px] flex items-center justify-center gap-3 text-[10px] font-black tracking-widest shadow-2xl active:scale-95 transition-all mb-10">
            <MdAdd size={20} /> New Chat
         </button>

         <div className="flex-1 overflow-y-auto space-y-2 pr-2 hide-scrollbar">
            <p className="text-[9px] font-black text-stone-800 tracking-widest mb-4 px-2 uppercase">Your Conversations</p>
            {sessions.map((s) => (
               <div key={s.id} onClick={() => { setCurrentSessionId(s.id); setShowMobileSidebar(false); }} className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${currentSessionId === s.id ? "bg-white text-black border-white" : "border-transparent hover:bg-white/5 text-stone-400"}`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                     <MdChatBubbleOutline size={16} />
                     <span className="truncate text-[10px] font-black tracking-tight">{s.title}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, sessionId: s.id }); }} className="opacity-0 group-hover:opacity-100 hover:text-rose-500 p-1"><MdDelete size={14} /></button>
               </div>
            ))}
         </div>
      </aside>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col relative h-full">
         <header className="h-24 px-10 border-b border-white/5 flex items-center justify-between bg-[#050505] sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <button onClick={() => setShowMobileSidebar(true)} className="md:hidden p-2 text-stone-400"><MdMenu size={24} /></button>
               <h1 className="text-xl font-black italic tracking-tighter uppercase">AI Helper</h1>
            </div>
            {!isPremium && user && (
               <button onClick={() => setShowPricingModal(true)} className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 px-6 py-2 rounded-full text-[9px] font-black tracking-widest hover:bg-cyan-500/20 transition-all uppercase">
                  <MdDiamond size={16} /> {remainingPrompts} Credits
               </button>
            )}
         </header>

         <div className="flex-1 overflow-y-auto p-12 space-y-12 hide-scrollbar pb-64">
            {!currentSessionId && messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
                  <div className="w-24 h-24 bg-white/5 rounded-[48px] flex items-center justify-center border border-white/10 shadow-3xl overflow-hidden p-4">
                     <img src={logo} alt="DebtAI" className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-4 max-w-xl">
                     <h2 className="text-6xl font-black italic tracking-tighter leading-none">How can I help you,<br /><span className="text-cyan-500"> {userData?.name?.split(' ')[0] || "User"}?</span></h2>
                     <p className="text-stone-400 font-bold text-lg tracking-tight">Ask me anything about your debts, savings, or investment strategy.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-10">
                     {["How to pay off a 12% loan?", "Analyze my savings rate", "Stocks vs Mutual Funds", "Create a debt snowball plan"].map(q => (
                        <button key={q} onClick={() => { setInput(q); handleSend(q); }} className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black tracking-widest text-stone-500 transition-all uppercase">{q}</button>
                     ))}
                  </div>
               </div>
            ) : (
               messages.map((msg, idx) => {
                  const isBot = msg.sender === "bot";
                  return (
                     <div key={idx} className={`flex gap-6 animate-in slide-in-from-bottom-4 duration-500 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border overflow-hidden ${isBot ? 'bg-[#121212] border-white/5' : 'bg-[#121212] border-white/5'}`}>
                           {isBot ? (
                              <img src={logo} className="w-full h-full object-contain p-2" alt="AI Agent" />
                           ) : (
                              userData?.profileImg ? (
                                <img src={userData.profileImg} className="w-full h-full object-cover" alt="User" />
                              ) : (
                                <span className="font-black text-xs text-white uppercase">{userData?.name?.[0] || 'U'}</span>
                              )
                           )}
                        </div>
                        <div className={`space-y-2 max-w-[80%] ${!isBot && 'text-right'}`}>
                           <p className="text-[9px] font-black text-white tracking-widest uppercase mb-2">{isBot ? 'DebtAI Agent' : userData?.name?.split(' ')[0] || 'You'}</p>
                           <div className={`p-8 rounded-[40px] shadow-3xl text-left border ${isBot ? 'bg-[#121212] border-white/5 rounded-tl-none' : 'bg-white text-black border-white rounded-tr-none'}`}>
                              {isBot ? <BotMessage text={msg.text} /> : <p className="text-base font-medium tracking-tight leading-relaxed">{msg.text}</p>}
                           </div>
                           <p className="text-[9px] font-bold text-white uppercase pt-3">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                     </div>
                  );
               })
            )}
            
            {isTyping && (!messages[messages.length-1]?.isStreaming) && (
               <div className="flex gap-6 animate-in slide-in-from-bottom-4 duration-500 items-start">
                  <div className="w-12 h-12 bg-[#121212] border border-white/5 rounded-2xl flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
                     <img src={logo} className="w-full h-full object-contain p-2 opacity-50 animate-pulse" alt="AI Agent" />
                  </div>
                  <div className="space-y-2 max-w-[80%]">
                     <p className="text-[9px] font-black text-white tracking-widest uppercase mb-2">DebtAI Agent</p>
                     <div className="p-8 rounded-[40px] shadow-3xl text-left border bg-[#121212] border-white/5 rounded-tl-none flex items-center gap-3">
                        <div className="flex space-x-1">
                           <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                           <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                           <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-xs font-bold text-stone-500 tracking-widest uppercase">Thinking..</span>
                     </div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* INPUT AREA */}
         <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
            <div className="max-w-4xl mx-auto relative group">
               <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={isListening ? "Listening..." : "Tell me about your debts or goals..."}
                  className="w-full bg-[#121212] border border-white/5 rounded-[40px] p-8 pr-48 text-lg font-bold outline-none focus:border-white/20 transition-all shadow-3xl placeholder:text-stone-800 placeholder:uppercase placeholder:text-xs placeholder:tracking-[0.2em] resize-none overflow-hidden"
                  rows={2}
                  disabled={isTyping || isListening}
               />
               <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  <button onClick={handleSpeech} className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${isListening ? 'bg-rose-500 border-rose-500 animate-pulse text-white' : 'bg-white/5 border-white/5 text-stone-600 hover:text-white'}`}>
                     {isListening ? <MdStop size={24} /> : <MdMic size={24} />}
                  </button>
                  <button onClick={() => handleSend()} disabled={!input.trim() || isTyping} className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all disabled:opacity-20">
                     <ArrowUpRight size={28} />
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}