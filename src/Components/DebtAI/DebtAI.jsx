import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import send from "../../assets/images/send.svg";
import { MdArrowBack, MdAdd, MdChatBubbleOutline, MdDelete, MdWarningAmber, MdMenu, MdClose } from "react-icons/md";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, push, onValue, serverTimestamp, remove } from "firebase/database";
import { app } from "../../firebase";

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
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BotMessage = ({ text, shouldAnimate }) => {
  const [displayResponse, setDisplayResponse] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayResponse(text);
      setCompleted(true);
      return;
    }

    setCompleted(false);
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayResponse(text.slice(0, i + 1));
      i++;
      if (i > text.length) {
        clearInterval(intervalId);
        setCompleted(true);
      }
    }, 15);

    return () => clearInterval(intervalId);
  }, [text, shouldAnimate]);

  return (
    <div className={`text-sm sm:text-base text-gray-900 ${completed ? "" : "typing-cursor"}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          strong: ({node, ...props}) => <span className="font-bold text-purple-900" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc ml-4 my-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-2" {...props} />,
          li: ({node, ...props}) => <li className="mb-1" {...props} />,
          h1: ({node, ...props}) => <h1 className="text-xl font-bold my-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="font-bold my-1" {...props} />,
          code: ({node, ...props}) => <code className="bg-gray-200 rounded px-1 text-xs" {...props} />,
          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
        }}
      >
        {completed ? text : displayResponse}
      </ReactMarkdown>
    </div>
  );
};

function DebtAI() {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getDatabase(app);
  const messagesEndRef = useRef(null);
  const backendURL = import.meta.env.VITE_BACKEND_URL;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
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
          const sessionList = Object.entries(data).map(([key, val]) => ({
            id: key,
            ...val,
          }));
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

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const textToSend = input;
    setInput("");
    
    let activeSessionId = currentSessionId;
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

    setIsTyping(true);

    try {
      const response = await fetch(`${backendURL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          userData: userData || {},
        }),
      });

      const data = await response.json();

      await push(messagesRef, {
        sender: "bot",
        text: data.reply,
        timestamp: serverTimestamp(), 
        isNew: true 
      });

    } catch (error) {
      console.error(error);
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
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
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

        <div className="p-4">
            <button 
                onClick={createNewChat}
                className="flex items-center gap-2 w-full bg-amber-700 hover:bg-amber-600 text-white p-3 rounded-lg transition-colors"
            >
                <MdAdd size={20} />
                <span>New Chat</span>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
            {sessions.map((session) => (
                <div 
                    key={session.id}
                    onClick={() => handleSessionClick(session.id)}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer mb-1 transition-colors ${
                        currentSessionId === session.id ? "bg-gray-800 text-amber-400" : "hover:bg-gray-800 text-gray-300"
                    }`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <MdChatBubbleOutline className="flex-shrink-0" />
                        <span className="truncate text-sm">{session.title || "Untitled Chat"}</span>
                    </div>
                    <button 
                        onClick={(e) => initiateDelete(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1 hover:bg-gray-700 rounded"
                    >
                        <MdDelete size={18} />
                    </button>
                </div>
            ))}
        </div>
      </div>

      <div className="relative flex-1 flex flex-col h-full bg-gradient-to-tr from-[#FAF3E0] via-[#E5D4FF] to-[#C1A7FF]">
        
        <button 
            onClick={() => setShowMobileSidebar(true)}
            className="md:hidden absolute top-4 left-4 z-10 p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm text-gray-800 hover:bg-white"
        >
            <MdMenu size={24} />
        </button>

        {!currentSessionId && messages.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 opacity-60 pointer-events-none px-4 text-center">
                <h1 className="text-4xl font-bold mb-2 text-purple-900">DebtAI</h1>
                <p>Start a new conversation to get help.</p>
             </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 pb-32 flex flex-col gap-4 pt-16 md:pt-4">
          {displayMessages.map((msg, index) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={index}
                className={`max-w-[90%] sm:max-w-[85%] p-4 rounded-2xl shadow-sm ${
                  !isBot
                    ? "bg-purple-700 text-white self-end rounded-br-none"
                    : "bg-white/90 backdrop-blur-sm self-start rounded-bl-none border border-white/50"
                }`}
              >
                {!isBot ? (
                    <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                ) : (
                    <BotMessage text={msg.text} shouldAnimate={msg.shouldAnimate} />
                )}
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

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-tr from-[#e3daf7] via-[#e3d9f2] to-[#f9e0fa] py-4 flex justify-center z-10 border-t border-purple-100">
          <div className="relative w-[95%] sm:w-[90%] sm:max-w-3xl">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder={user ? "Ask about your debt..." : "Please login"}
              disabled={!user || isTyping}
              className="w-full resize-none rounded-3xl p-4 pr-14 border border-purple-200 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-900 placeholder-gray-500 transition-all shadow-sm max-h-32"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!user || isTyping}
              className="absolute right-3 bottom-3 p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:bg-gray-400"
            >
              <img src={send} alt="Send" className="w-5 h-5 invert" /> 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DebtAI;