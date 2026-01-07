import React, { useState, useEffect } from "react";
import Footer from "../ui/Footer";
import Sidebar from "../ui/Sidebar";
import ExpenseInputForm from "../ui/ExpenseInputForm";
import PricingModal from "../Premium/Premium"; 
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, push, update, onValue } from "firebase/database";
import { app } from "../../firebase";
import {
  Plus,
  ScanLine,
  ArrowUpRight,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  User,
  Loader2,
  Sparkles,
  Lock,
  Crown,
  Zap,
  RefreshCw
} from "lucide-react";

const quickActionStyle =
  "relative h-16 w-48 text-sm font-bold text-[#5B2D2D] bg-white rounded-[24px] transition-all duration-300 flex items-center overflow-hidden shadow-sm hover:shadow-md cursor-pointer active:scale-95";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false); 
  const [isScanning, setIsScanning] = useState(false);

  // REAL AI Habit State
  const [dailyHabits, setDailyHabits] = useState([]);
  const [generatingHabit, setGeneratingHabit] = useState(true);

  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getDatabase(app);
  
  // ENV Variables
  const AZURE_KEY = import.meta.env.VITE_AZURE_VISION_KEY;
  const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_VISION_ENDPOINT;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // Ensure this is set

  // 1. AUTH & DATA FETCHING
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = ref(db, "users/" + currentUser.uid);
        onValue(userRef, (snapshot) => {
           if (snapshot.exists()) {
             setUserData(snapshot.val());
           } else {
             navigate("/onboarding");
           }
           setLoading(false);
        });
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate, db]);

  // 2. REAL AI HABIT GENERATION (With Daily Caching)
  useEffect(() => {
    const fetchAIHabits = async () => {
        if (!user) return;

        // A. CHECK CACHE FIRST (Don't waste money on API calls on every refresh)
        const todayStr = new Date().toDateString(); // "Thu Jan 08 2026"
        const cachedDate = localStorage.getItem("debtAI_habit_date");
        const cachedHabits = localStorage.getItem("debtAI_habits");

        if (cachedDate === todayStr && cachedHabits) {
            console.log("Loading habits from cache...");
            setDailyHabits(JSON.parse(cachedHabits));
            setGeneratingHabit(false);
            return;
        }

        // B. IF NEW DAY, CALL AI
        console.log("Generating fresh habits from AI...");
        try {
            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // Specific System Prompt to get array-like format
                    prompt: "Generate 3 distinct, actionable, short financial micro-habits for today to help save money or manage debt. Strictly return them separated by a pipe symbol (|). Example: Check balance|Skip coffee|Cook dinner. Do not add numbering or extra text.",
                    userData: userData || {} 
                })
            });

            if(!response.ok) throw new Error("AI Failed");

            const data = await response.json();
            const rawText = data.reply || "";
            
            // Clean and split the response
            let habits = rawText.split("|").map(h => h.trim());
            
            // Fallback if AI hallucinates format
            if (habits.length < 3) {
                habits = [
                    "Review your subscriptions today.",
                    "Wait 24 hours before any non-essential purchase.",
                    "Check your credit utilization ratio."
                ];
            }

            setDailyHabits(habits);
            
            // Save to Cache
            localStorage.setItem("debtAI_habit_date", todayStr);
            localStorage.setItem("debtAI_habits", JSON.stringify(habits));

        } catch (error) {
            console.error("Habit Gen Error:", error);
            // Fallback so UI doesn't break
            setDailyHabits(["Track every penny today.", "Cook dinner at home.", "Read a finance article."]);
        } finally {
            setGeneratingHabit(false);
        }
    };

    if (!loading && user) {
        fetchAIHabits();
    }
  }, [loading, user]);

  // --- DATA HELPERS (Keep existing) ---
  const getDebtFreeDate = () => {
    if (!userData || !userData.debts) return "Calculating...";
    const debtsArray = userData.debts ? (Array.isArray(userData.debts) ? userData.debts : Object.values(userData.debts)) : [];
    const totalDebt = debtsArray.reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);
    const disposableIncome = (userData.income - userData.expenses);
    if (disposableIncome <= 0) return "Unknown";
    const monthsToFreedom = Math.ceil(totalDebt / disposableIncome);
    const date = new Date();
    date.setMonth(date.getMonth() + monthsToFreedom);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getUrgentDebt = () => {
    if (!userData || !userData.debts) return null;
    const debtsArray = userData.debts ? (Array.isArray(userData.debts) ? userData.debts : Object.values(userData.debts)) : [];
    if (debtsArray.length === 0) return null;
    return debtsArray.reduce((prev, current) => (prev.stress > current.stress) ? prev : current);
  };
  
  const urgentDebt = getUrgentDebt();

  // --- BILL SCANNING (Keep existing) ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) await processBillImage(file);
  };

  const processBillImage = async (file) => {
    setIsScanning(true);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const cleanEndpoint = AZURE_ENDPOINT.replace(/\/+$/, ""); 
        const url = `${cleanEndpoint}/computervision/imageanalysis:analyze?api-version=2023-10-01&features=read`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Ocp-Apim-Subscription-Key": AZURE_KEY,
                "Content-Type": "application/octet-stream"
            },
            body: arrayBuffer 
        });

        if (!response.ok) throw new Error(`Azure API Error: ${response.status}`);
        
        const data = await response.json();
        const detectedAmount = extractAmountFromOCR(data);

        if (detectedAmount) {
            await saveBillToFirebase(detectedAmount);
            alert(`Success! Scanned bill for $${detectedAmount}`);
        } else {
            alert("Could not detect a clear total amount.");
        }
    } catch (error) {
        console.error("Scanning failed:", error);
        alert("Failed to process bill.");
    } finally {
        setIsScanning(false);
    }
  };

  const extractAmountFromOCR = (data) => {
    const fullText = data.readResult?.content;
    if (!fullText) return null;
    const decimalMoneyRegex = /[0-9,]+\.[0-9]{2}/g;
    const matches = fullText.match(decimalMoneyRegex);
    if (matches) {
        const numbers = matches.map(m => parseFloat(m.replace(/,/g, '')));
        if (numbers.length > 0) return Math.max(...numbers);
    }
    return null;
  };

  const saveBillToFirebase = async (amount) => {
    if (!user) return;
    const expenseData = {
        amount: parseFloat(amount),
        category: "Scanned Bill",
        date: new Date().toISOString(),
        description: "Auto-scanned via Azure"
    };
    await push(ref(db, `users/${user.uid}/transactions`), expenseData);
    const currentExpenses = parseFloat(userData?.expenses || 0);
    await update(ref(db, `users/${user.uid}`), { expenses: currentExpenses + parseFloat(amount) });
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#f8ecdd]"><Loader2 className="animate-spin text-[#5B2D2D]" size={48} /></div>;

  const isPremium = userData?.isPremium === true;

  return (
    <div className="flex min-h-screen bg-[#f8ecdd] font-sans selection:bg-[#5B2D2D] selection:text-white relative">
      
      {/* MODALS */}
      {showExpenseModal && <ExpenseInputForm onClose={() => setShowExpenseModal(false)} />}
      {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} />}

      {isScanning && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm">
             <div className="bg-white p-6 rounded-2xl flex flex-col items-center shadow-2xl">
                <Loader2 className="animate-spin text-orange-500 mb-2" size={40} />
                <h3 className="font-bold text-gray-800">Reading Receipt...</h3>
             </div>
        </div>
      )}

      <div className="z-50 hidden md:block"><Sidebar /></div>

      <main className="flex-1 ml-0 md:ml-28 p-6 md:p-12 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* HEADING */}
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#5B2D2D] mb-2">
                Let's Start <br /> Strong!
              </h1>
              <p className="text-[#30302e] opacity-70">
                Hello, {userData?.name || "User"}. You are on track to be debt-free by {getDebtFreeDate()}.
              </p>
            </div>

            {/* QUICK ACTIONS */}
            <div className="flex gap-4 flex-wrap">
              <button onClick={() => setShowExpenseModal(true)} className={quickActionStyle}>
                <div className={`w-16 h-16 flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-800 rounded-[24px]`}>
                  {<Plus />}
                </div>
                <div className="whitespace-nowrap ml-2"><span>Add Expense</span></div>
              </button>

              <label className={quickActionStyle}>
                <div className="w-16 h-16 flex items-center justify-center shrink-0 bg-orange-100 text-orange-800 rounded-[24px]">
                  <ScanLine />
                </div>
                <div className="whitespace-nowrap ml-2"><span>Scan Bill</span></div>
                <input type="file" accept="image/*" disabled={isScanning} className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
              </label>
            </div>

            {/* PROGRESS BAR */}
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-[30px] shadow-sm border border-white/40">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#5B2D2D]">Monthly Budget</h3>
                  <p className="text-sm text-stone-500">You've spent {Math.round((userData?.expenses / userData?.income) * 100) || 0}% of your income</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#edffd9] flex items-center justify-center text-[#5B2D2D]"><TrendingUp size={20} /></div>
              </div>
              <div className="w-full h-4 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min((userData?.expenses / userData?.income) * 100, 100)}%` }}></div>
              </div>
              <div className="flex justify-between mt-2 text-sm font-bold text-stone-600">
                <span>${userData?.expenses || 0} spent</span>
                <span>${userData?.income || 0} limit</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: UPGRADE BUTTON & AI CARD */}
          <div className="flex flex-col gap-6 h-full">
            
            {/* TOP BAR WITH BRIGHT UPGRADE BUTTON */}
            <div className="flex justify-end gap-3 flex-wrap md:flex-nowrap">
                {!isPremium && (
                    <button 
                        onClick={() => setShowPricingModal(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-white font-bold rounded-full shadow-[0_0_15px_rgba(255,140,0,0.5)] hover:shadow-[0_0_25px_rgba(255,140,0,0.7)] hover:scale-105 transition-all animate-pulse duration-[2000ms]"
                    >
                        <Zap size={20} fill="currentColor" />
                        <span className="uppercase tracking-wide text-sm">Upgrade PRO</span>
                    </button>
                )}
                <button onClick={() => navigate("/profile")} className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-full shadow-sm text-[#5B2D2D] font-bold hover:shadow-md transition-all border border-white/40">
                    <div className="w-8 h-8 rounded-full bg-[#f8ecdd] flex items-center justify-center text-[#5B2D2D]"><User size={18} /></div>
                    <span className="hidden md:inline">Profile</span>
                </button>
            </div>

            <div onClick={() => navigate('/debtai')} className="relative group cursor-pointer h-full min-h-[250px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#30302e] to-[#141414] rounded-[35px] p-8 flex flex-col justify-between shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[#f8ecdd] text-sm font-medium tracking-widest uppercase">DebtAI Assistant</span>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl text-white font-light">"How can I save <span className="text-emerald-400 font-bold">$200</span>?"</h2>
                  <p className="text-stone-400 text-sm">Tap to chat with your financial data.</p>
                </div>
                <div className="w-full h-12 bg-white/10 rounded-full flex items-center px-4 backdrop-blur-md border border-white/5">
                  <span className="text-stone-400 text-sm">Ask anything...</span>
                  <div className="ml-auto w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black"><ArrowUpRight size={16} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* --- AI DAILY HABITS SECTION --- */}
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl shadow-sm">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#5B2D2D]">Daily AI Habits</h3>
                    <p className="text-sm text-stone-500">Fresh financial micro-actions generated for {new Date().toLocaleDateString('en-US', { weekday: 'long' })}.</p>
                </div>
                {/* LOCKED BADGE */}
                {!isPremium && (
                    <div className="ml-auto hidden sm:flex items-center gap-2 bg-stone-100 border border-stone-200 px-3 py-1 rounded-full">
                        <Lock size={12} className="text-stone-400"/>
                        <span className="text-xs font-bold text-stone-500">2 Locked</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* HABIT 1: ALWAYS FREE */}
                <div className="bg-white p-6 rounded-[30px] border border-stone-100 shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:shadow-md transition-all">
                    {generatingHabit ? (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 gap-3">
                             <Loader2 size={24} className="text-[#5B2D2D] animate-spin" />
                             <span className="text-xs font-bold text-[#5B2D2D] animate-pulse">Consulting AI...</span>
                         </div>
                    ) : (
                        <>
                            <div className="text-[#5B2D2D] font-medium text-lg leading-relaxed relative z-10">
                                "{dailyHabits[0] || "Track your spending today."}"
                            </div>
                            <div className="flex justify-between items-end mt-4">
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md uppercase tracking-wider">Top Priority</span>
                                <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                    <Sparkles size={16} />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* HABIT 2: LOCKED */}
                <div className="bg-white p-6 rounded-[30px] border border-stone-100 shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden">
                    {isPremium ? (
                         <div className="text-[#5B2D2D] font-medium text-lg leading-relaxed">"{dailyHabits[1]}"</div>
                    ) : (
                        <>
                            {/* BLURRED CONTENT */}
                            <div className="text-[#5B2D2D] font-medium text-lg leading-relaxed blur-[6px] select-none opacity-40">
                                "Check your credit score utilization ratio today and ensure it is below thirty percent."
                            </div>
                            
                            {/* LOCK OVERLAY */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-3 p-4 bg-white/10">
                                <div className="bg-[#5B2D2D] text-white p-3 rounded-full shadow-xl">
                                    <Lock size={20} />
                                </div>
                                <button 
                                    onClick={() => setShowPricingModal(true)} 
                                    className="text-xs font-bold text-[#5B2D2D] bg-white border border-stone-200 px-4 py-2 rounded-full shadow-sm hover:scale-105 transition-transform"
                                >
                                    Unlock Habit
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* HABIT 3: LOCKED */}
                <div className="bg-white p-6 rounded-[30px] border border-stone-100 shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden">
                    {isPremium ? (
                         <div className="text-[#5B2D2D] font-medium text-lg leading-relaxed">"{dailyHabits[2]}"</div>
                    ) : (
                        <>
                            <div className="text-[#5B2D2D] font-medium text-lg leading-relaxed blur-[6px] select-none opacity-40">
                                "Automate a $5 transfer to your savings account immediately."
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-3 p-4 bg-white/10">
                                <div className="bg-[#5B2D2D] text-white p-3 rounded-full shadow-xl">
                                    <Lock size={20} />
                                </div>
                                <button 
                                    onClick={() => setShowPricingModal(true)} 
                                    className="text-xs font-bold text-[#5B2D2D] bg-white border border-stone-200 px-4 py-2 rounded-full shadow-sm hover:scale-105 transition-transform"
                                >
                                    Unlock Habit
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* ALERTS SECTION (Existing) */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-[#5B2D2D] mb-6 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" /> Attention Needed
          </h3>
          {urgentDebt ? (
             <div className="bg-orange-50 border border-orange-100 p-6 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="flex gap-4 items-center">
                 <div className="p-3 bg-white rounded-full text-orange-600 shadow-sm"><DollarSign size={24} /></div>
                 <div>
                   <h4 className="font-bold text-[#5B2D2D]">{urgentDebt.name} Payment</h4>
                   <p className="text-sm text-stone-500">Est. Min Pay: ${urgentDebt.estimatedMinPayment}. Stress: {urgentDebt.stress}/10.</p>
                 </div>
               </div>
               <button className="px-6 py-3 bg-[#5B2D2D] text-[#f8ecdd] rounded-full font-bold text-sm hover:bg-stone-800 transition-colors">Mark as Paid</button>
             </div>
           ) : (
             <div className="p-6 bg-emerald-100 font-semibold border border-emerald-300 rounded-[24px] text-emerald-800">No urgent debts found! Great job.</div>
           )}
        </div>

        {/* ANALYTICS SECTION (Placeholder for Charts) */}
        <div className="bg-white p-6 rounded-[30px] shadow-sm border border-stone-100 h-64 flex items-center justify-center text-stone-400 font-medium">
            (Analytics Charts Area - Keep your existing charts here)
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default Dashboard;