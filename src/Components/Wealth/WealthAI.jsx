import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MdAdd, MdChatBubbleOutline, MdDelete, MdWarningAmber, MdTranslate, MdDiamond } from "react-icons/md"; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, push, onValue, serverTimestamp, remove, update } from "firebase/database";
import { app } from "../../firebase";
import { LayoutDashboard, ArrowUpRight, Sparkles, TrendingUp, Briefcase } from "lucide-react";
import logo from '../../assets/icons/logo2.png'
import Sidebar from "../ui/Sidebar";

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

export default function WealthAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, sessionId: null });

  const messagesEndRef = useRef(null);
  const auth = getAuth(app);
  const db = getDatabase(app);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        onValue(ref(db, `users/${currentUser.uid}`), (snapshot) => {
          setUserData(snapshot.val());
        });

        onValue(ref(db, `users/${currentUser.uid}/wealthSessions`), (snapshot) => {
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
    if (currentSessionId && user) {
      onValue(ref(db, `users/${user.uid}/wealthSessions/${currentSessionId}/messages`), (snapshot) => {
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

    let sessionId = currentSessionId;
    if (!sessionId) {
      const newSessionRef = push(ref(db, `users/${user.uid}/wealthSessions`), {
        title: text.slice(0, 30) + "...",
        timestamp: serverTimestamp(),
      });
      sessionId = newSessionRef.key;
      setCurrentSessionId(sessionId);
    }

    const newMessage = { text, sender: "user", timestamp: Date.now() };
    push(ref(db, `users/${user.uid}/wealthSessions/${sessionId}/messages`), newMessage);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/wealth-chat`, {
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

      setMessages(prev => [...prev, { text: "", sender: "bot", timestamp: Date.now(), isStreaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        botReply += chunk;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = botReply;
          return newMsgs;
        });
      }

      push(ref(db, `users/${user.uid}/wealthSessions/${sessionId}/messages`), { text: botReply, sender: "bot", timestamp: Date.now() });
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].isStreaming = false;
        return newMsgs;
      });

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { text: "Nexus Error: Link severed.", sender: "bot", timestamp: Date.now() }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden uppercase">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col relative h-full min-w-0">
         <header className="h-24 px-10 border-b border-white/5 flex items-center justify-between bg-[#050505] sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <h1 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                  <TrendingUp className="text-cyan-500" size={20} />
                  Wealth Intelligence
               </h1>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-12 space-y-12 hide-scrollbar pb-64">
            {!currentSessionId && messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
                  <div className="w-24 h-24 bg-cyan-500/10 rounded-[48px] flex items-center justify-center border border-cyan-500/20 shadow-3xl overflow-hidden p-6 text-cyan-500">
                     <Briefcase size={40} />
                  </div>
                  <div className="space-y-4 max-w-xl">
                     <h2 className="text-6xl font-black italic tracking-tighter leading-none">Initialize Wealth<br /><span className="text-cyan-500">Acceleration System</span></h2>
                     <p className="text-stone-400 font-bold text-lg tracking-tight lowercase">Query the elite strategist for portfolio optimization and market alpha.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-10">
                     {["Analyze Stock Portfolio", "Real Estate Strategy 2026", "Crypto Alpha Signals", "Compound Growth Projection"].map(q => (
                        <button key={q} onClick={() => { setInput(q); handleSend(q); }} className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black tracking-widest text-stone-500 transition-all uppercase hover:border-cyan-500/50 hover:text-white">{q}</button>
                     ))}
                  </div>
               </div>
            ) : (
               messages.map((msg, idx) => {
                  const isBot = msg.sender === "bot";
                  return (
                     <div key={idx} className={`flex gap-6 animate-in slide-in-from-bottom-4 duration-500 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border overflow-hidden ${isBot ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500' : 'bg-[#121212] border-white/5'}`}>
                           {isBot ? <Sparkles size={20} /> : <span className="font-black text-xs text-white uppercase">{userData?.name?.[0] || 'U'}</span>}
                        </div>
                        <div className={`space-y-2 max-w-[80%] ${!isBot && 'text-right'}`}>
                           <p className="text-[9px] font-black text-white tracking-widest uppercase mb-2">{isBot ? 'Nexus Strategist' : userData?.name?.split(' ')[0] || 'You'}</p>
                           <div className={`p-8 rounded-[40px] shadow-3xl text-left border ${isBot ? 'bg-[#121212] border-cyan-500/5 rounded-tl-none border-cyan-500/10' : 'bg-white text-black border-white rounded-tr-none'}`}>
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
                  <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg overflow-hidden text-cyan-500">
                     <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <div className="space-y-2 max-w-[80%]">
                     <p className="text-[9px] font-black text-white tracking-widest uppercase mb-2">Nexus Strategist</p>
                     <div className="p-8 rounded-[40px] shadow-3xl text-left border bg-[#121212] border-cyan-500/5 rounded-tl-none border-cyan-500/10 flex items-center gap-3">
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

         <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
            <div className="max-w-4xl mx-auto relative group">
               <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Inquire for wealth strategy..."
                  className="w-full bg-[#121212] border border-white/5 rounded-[40px] p-8 pr-48 text-lg font-bold outline-none focus:border-cyan-500/50 transition-all shadow-3xl placeholder:text-stone-800 placeholder:uppercase placeholder:text-xs placeholder:tracking-[0.2em] resize-none overflow-hidden"
                  rows={2}
                  disabled={isTyping}
               />
               <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  <button onClick={() => handleSend()} disabled={!input.trim() || isTyping} className="w-14 h-14 bg-cyan-500 text-black rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all disabled:opacity-20">
                     <ArrowUpRight size={28} />
                  </button>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
