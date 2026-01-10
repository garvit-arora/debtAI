import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import send from "../../assets/images/send.svg";
import { SpeechConfig, AudioConfig, SpeechRecognizer, ResultReason } from "microsoft-cognitiveservices-speech-sdk";
import { MdArrowBack, MdAdd, MdChatBubbleOutline, MdDelete, MdWarningAmber, MdMenu, MdClose, MdTranslate, MdMic, MdStop, MdStar, MdDiamond } from "react-icons/md"; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, push, onValue, serverTimestamp, remove, update } from "firebase/database";
import { app } from "../../firebase";

// ... (ConfirmationModal and BotMessage components remain exactly the same)
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform scale-100 transition-transform">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
             <MdWarningAmber size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-500 mb-6 text-sm">{message}</p>
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-colors">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BotMessage = ({ text, shouldAnimate }) => {
  const [displayResponse, setDisplayResponse] = useState("");
  const [completed, setCompleted] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const translatorKey = import.meta.env.VITE_AZURE_TRANSLATOR_KEY;
  const translatorEndpoint = import.meta.env.VITE_AZURE_TRANSLATOR_ENDPOINT;
  const speechRegion = import.meta.env.VITE_AZURE_REGION;

  useEffect(() => {
    const safeText = text || "⚠️ (No response text)";
    if (!shouldAnimate) {
      setDisplayResponse(safeText);
      setCompleted(true);
      return;
    }
    setCompleted(false);
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayResponse(safeText.slice(0, i + 1));
      i++;
      if (i > safeText.length) {
        clearInterval(intervalId);
        setCompleted(true);
      }
    }, 15);
    return () => clearInterval(intervalId);
  }, [text, shouldAnimate]);

  const handleTranslate = async () => {
    if (translatedText) {
      setShowTranslation(!showTranslation);
      return;
    }
    setIsTranslating(true);
    try {
      const response = await fetch(`${translatorEndpoint}/translate?api-version=3.0&to=hi`, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": translatorKey,
          "Ocp-Apim-Subscription-Region": speechRegion,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ Text: text }]),
      });
      const data = await response.json();
      if (data && data[0]?.translations?.[0]) {
        setTranslatedText(data[0].translations[0].text);
        setShowTranslation(true);
      }
    } catch (error) {
      console.error("Translation Error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const textToShow = showTranslation && translatedText ? translatedText : (completed ? (text || "⚠️ (No response text)") : displayResponse);

  return (
    <div className="flex flex-col">
      <div className={`text-sm sm:text-base text-gray-900 ${completed ? "" : "typing-cursor"}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            strong: ({node, ...props}) => <span className="font-bold text-purple-900" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc ml-4 my-2" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-2" {...props} />,
            li: ({node, ...props}) => <li className="mb-1" {...props} />,
            h1: ({node, ...props}) => <h1 className="text-xl font-bold my-2" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="font-bold my-1" {...props} />,
            code: ({node, ...props}) => <code className="bg-gray-200 rounded px-1 text-xs" {...props} />,
            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
          }}>
          {textToShow}
        </ReactMarkdown>
      </div>
      {completed && (
        <div className="mt-2 flex justify-end border-t border-gray-200 pt-1">
          <button onClick={handleTranslate} disabled={isTranslating} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-1 rounded transition-colors">
            <MdTranslate size={14} />
            <span>{isTranslating ? "Translating..." : showTranslation ? "Show Original" : "Translate (Hindi)"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

function DebtAI() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const auth = getAuth(app);
  const db = getDatabase(app);
  const messagesEndRef = useRef(null);
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
  const speechRegion = import.meta.env.VITE_AZURE_REGION;

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // Constants for Limit
  const FREE_LIMIT = 15;
  const usageCount = userData?.usageCount || 0;
  const remainingPrompts = Math.max(0, FREE_LIMIT - usageCount);
  const isPremium = userData?.isPremium === true;

  // Auto-send logic
  useEffect(() => {
    if (user && location.state?.autoPrompt && !isTyping) {
        const prompt = location.state.autoPrompt;
        window.history.replaceState({}, document.title);
        handleSend(prompt);
    }
  }, [user, location.state]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const { conversations, ...profileData } = data;
          setUserData(profileData);
        }
      });
      return () => unsubscribe();
    }
  }, [user, db]);

  useEffect(() => {
    if (user) {
      const sessionsRef = ref(db, `users/${user.uid}/conversations`);
      const unsubscribe = onValue(sessionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const sessionList = Object.entries(data).map(([key, val]) => ({ id: key, ...val }));
          sessionList.sort((a, b) => b.createdAt - a.createdAt);
          setSessions(sessionList);
        } else {
          setSessions([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user, db]);

  useEffect(() => {
    if (user && currentSessionId) {
      const messagesRef = ref(db, `users/${user.uid}/conversations/${currentSessionId}/messages`);
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const loadedMsgs = Object.values(data);
          const processedMsgs = loadedMsgs.map(m => ({ ...m, shouldAnimate: false }));
          setMessages(processedMsgs);
        } else {
          setMessages([]);
        }
      });
      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [user, currentSessionId, db]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSpeechToText = () => {
    if (isListening) return;
    setIsListening(true);
    try {
      const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
      const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
      recognizer.recognizeOnceAsync(
        (result) => {
          if (result.reason === ResultReason.RecognizedSpeech) {
            setInput((prev) => (prev ? prev + " " + result.text : result.text));
          }
          setIsListening(false);
          recognizer.close();
        },
        (error) => {
          console.error("Speech Recognition Error: ", error);
          setIsListening(false);
          recognizer.close();
        }
      );
    } catch (e) {
      console.error("SDK Error:", e);
      setIsListening(false);
    }
  };

  const createNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setShowMobileSidebar(false);
  };

  const handleSessionClick = (id) => {
    setCurrentSessionId(id);
    setShowMobileSidebar(false);
  }

  const initiateDelete = (e, sessionId) => {
    e.stopPropagation();
    setChatToDelete(sessionId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (chatToDelete && user) {
      await remove(ref(db, `users/${user.uid}/conversations/${chatToDelete}`));
      if(currentSessionId === chatToDelete) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    }
    setIsModalOpen(false);
    setChatToDelete(null);
  };

  const handleSend = async (manualText = null) => {
    const textToSend = manualText || input;

    if (!textToSend.trim() || !user) return;

    // 1. CHECK LIMIT
    if (!isPremium && usageCount >= FREE_LIMIT) {
        alert(`Limit Reached!\n\nYou have used ${FREE_LIMIT}/${FREE_LIMIT} free prompts. Please upgrade to Premium to continue.`);
        return;
    }

    setInput("");
    setIsTyping(true);

    try {
        let activeSessionId = currentSessionId;
        
        // 2. INCREMENT COUNTER
        await update(ref(db, `users/${user.uid}`), {
            usageCount: usageCount + 1
        });

        if (!activeSessionId) {
            const newSessionRef = await push(ref(db, `users/${user.uid}/conversations`), {
                createdAt: serverTimestamp(),
                title: textToSend.slice(0, 30) + "..."
            });
            activeSessionId = newSessionRef.key;
            setCurrentSessionId(activeSessionId);
        }

        const tempUserMsg = { sender: "user", text: textToSend, shouldAnimate: false };
        setMessages(prev => [...prev, tempUserMsg]);

        const messagesRef = ref(db, `users/${user.uid}/conversations/${activeSessionId}/messages`);
        
        await push(messagesRef, {
            sender: "user",
            text: textToSend,
            timestamp: serverTimestamp(),
            shouldAnimate: false
        });

        const response = await fetch(`${backendURL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: textToSend,
                userData: userData || {},
            }),
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        const aiText = data.reply || "Error: No reply text received.";

        await push(messagesRef, {
            sender: "bot",
            text: aiText,
            timestamp: serverTimestamp(), 
            isNew: true 
        });
        
    } catch (error) {
        console.error(">>> CRITICAL ERROR IN HANDLESEND:", error);
        setMessages(prev => [...prev, { 
            sender: "bot", 
            text: `System Error: ${error.message}. Check F12 Console.`, 
            shouldAnimate: false 
        }]);
    } finally {
        setIsTyping(false);
    }
  };

  const displayMessages = messages.map((msg, index) => {
    const isRecent = (Date.now() - (msg.timestamp || Date.now())) < 10000;
    const shouldAnimate = msg.sender === 'bot' && isRecent && (index === messages.length - 1);
    return { ...msg, shouldAnimate };
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FAF3E0] relative">
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Chat?"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
      />
      
      {showMobileSidebar && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setShowMobileSidebar(false)} />
      )}
       <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${showMobileSidebar ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-lg">Chat History</h2>
            <div className="flex gap-2">
                <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white cursor-pointer" title="Back to Dashboard">
                    <MdArrowBack size={24} />
                </button>
                <button onClick={() => setShowMobileSidebar(false)} className="text-gray-400 hover:text-white md:hidden" title="Close Menu">
                    <MdClose size={24} />
                </button>
            </div>
        </div>
        
        {/* SIDEBAR USAGE INDICATOR */}
        {user && userData && !isPremium && (
            <div className="mx-4 mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                    <span>Free Plan</span>
                    <span>{usageCount}/{FREE_LIMIT}</span>
                </div>
                <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${ usageCount >= FREE_LIMIT ? 'bg-red-500' : 'bg-amber-500'}`} 
                        style={{ width: `${Math.min((usageCount / FREE_LIMIT) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>
        )}

        <div className="p-4">
            <button onClick={createNewChat} className="flex items-center gap-2 w-full bg-amber-700 hover:bg-amber-600 text-white p-3 rounded-lg transition-colors">
                <MdAdd size={20} />
                <span>New Chat</span>
            </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
            {sessions.map((session) => (
                <div key={session.id} onClick={() => handleSessionClick(session.id)} className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer mb-1 transition-colors ${currentSessionId === session.id ? "bg-gray-800 text-amber-400" : "hover:bg-gray-800 text-gray-300"}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <MdChatBubbleOutline className="flex-shrink-0" />
                        <span className="truncate text-sm">{session.title || "Untitled Chat"}</span>
                    </div>
                    <button onClick={(e) => initiateDelete(e, session.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1 hover:bg-gray-700 rounded">
                        <MdDelete size={18} />
                    </button>
                </div>
            ))}
        </div>
      </div>

      <div className="relative flex-1 flex flex-col h-full bg-gradient-to-tr from-[#FAF3E0] via-[#E5D4FF] to-[#C1A7FF]">
        <button onClick={() => setShowMobileSidebar(true)} className="md:hidden absolute top-4 left-4 z-10 p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm text-gray-800 hover:bg-white">
            <MdMenu size={24} />
        </button>

        {!currentSessionId && messages.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 opacity-60 pointer-events-none px-4 text-center">
                <h1 className="text-4xl font-bold mb-2 text-purple-900">DebtAI</h1>
                <p>Start a new conversation to get help.</p>
             </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 pb-44 flex flex-col gap-4 pt-16 md:pt-4">
          {displayMessages.map((msg, index) => {
            const isBot = msg.sender === "bot";
            return (
              <div key={index} className={`max-w-[90%] sm:max-w-[85%] p-4 rounded-2xl shadow-sm ${!isBot ? "bg-purple-700 text-white self-end rounded-br-none" : "bg-white/90 backdrop-blur-sm self-start rounded-bl-none border border-white/50"}`}>
                {!isBot ? <div className="whitespace-pre-wrap break-words">{msg.text}</div> : <BotMessage text={msg.text} shouldAnimate={msg.shouldAnimate} />}
              </div>
            );
          })}
          {isTyping && (
             <div className="bg-white/50 backdrop-blur-sm self-start rounded-2xl rounded-bl-none p-4 shadow-sm animate-pulse">
                <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-tr from-[#e3daf7] via-[#e3d9f2] to-[#f9e0fa] py-4 flex justify-center z-10 border-t border-purple-100">
          <div className="relative w-[95%] sm:w-[90%] sm:max-w-3xl flex flex-col gap-2">
            
            {/* NEW: PROMPT COUNT AND PREMIUM CTA */}
            {user && !isPremium && (
                <div className="flex justify-between items-center px-4 py-2 bg-white/60 backdrop-blur-md rounded-2xl border border-purple-100 shadow-sm text-xs sm:text-sm mx-1">
                    <span className={`font-medium ${remainingPrompts === 0 ? "text-red-600" : "text-gray-700"}`}>
                        {remainingPrompts} / {FREE_LIMIT} prompts remaining
                    </span>
                    <button 
                        onClick={() => navigate('/premium')} 
                        className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white pl-2 pr-3 py-1.5 rounded-full font-bold shadow-sm hover:shadow-md transition-all hover:scale-105"
                    >
                        <MdDiamond size={16} />
                        Get Premium
                    </button>
                </div>
            )}

            <div className="relative w-full">
                <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder={isListening ? "Listening..." : (user ? (remainingPrompts > 0 || isPremium ? "Ask about your debt..." : "Limit reached. Upgrade to continue.") : "Please login")}
                disabled={!user || isTyping || isListening || (!isPremium && remainingPrompts === 0)}
                className={`w-full resize-none rounded-3xl p-4 pr-24 border bg-white/70 focus:bg-white focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-500 transition-all shadow-sm max-h-32 ${isListening ? "border-red-400 ring-2 ring-red-100" : "border-purple-200 focus:ring-purple-400"} ${(!isPremium && remainingPrompts === 0) ? "opacity-60 cursor-not-allowed" : ""}`}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                    }
                }}
                />
                <div className="absolute right-3 bottom-4 flex gap-2">
                    <button type="button" onClick={handleSpeechToText} disabled={!user || isTyping} className={`p-2 rounded-full transition-all ${isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-gray-200 hover:bg-gray-300"}`} title="Speak to type">
                        {isListening ? <MdStop size={20} className="text-white" /> : <MdMic size={20} className="text-gray-700" />}
                    </button>
                    <button type="button" onClick={() => handleSend()} disabled={!user || isTyping || isListening} className="p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:bg-gray-400">
                    <img src={send} alt="Send" className="w-5 h-5 invert" /> 
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DebtAI;