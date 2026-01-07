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
  const [chart2Range, setChart2Range] = useState("Monthly");

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

  // CHART 1 LOGIC (Last 7 Days Trend)
  const getWeeklyTrend = () => {
    if (!userData || !userData.transactions) return Array(7).fill({ day: "", amount: 0, percent: 0 });

    const transactions = Object.values(userData.transactions);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = [];

    // 1. Generate last 7 days array (dates and labels)
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayLabel = days[d.getDay()];
        last7Days.push({ date: dateString, day: dayLabel, amount: 0 });
    }

    transactions.forEach(t => {
        const tDate = t.date; // Assuming transaction date is stored as YYYY-MM-DD
        const dayEntry = last7Days.find(d => d.date === tDate);
        if (dayEntry) {
            dayEntry.amount += parseFloat(t.amount);
        }
    });

    // 3. Find max spend to calculate bar height percentages
    const maxSpend = Math.max(...last7Days.map(d => d.amount));
    
    // 4. Add percentage property
    return last7Days.map(d => ({
        ...d,
        percent: maxSpend > 0 ? (d.amount / maxSpend) * 100 : 0
    }));
  };

  const trendData = getWeeklyTrend();

  // CHART 2 FILTERING LOGIC
  const filterTransactions = (transactions) => {
    if (!transactions) return [];
    
    const now = new Date();
    const transactionList = Object.values(transactions);

    return transactionList.filter(t => {
      const tDate = new Date(t.date);
      const diffTime = Math.abs(now - tDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (chart2Range === "Weekly") return diffDays <= 7;
      if (chart2Range === "Monthly") return diffDays <= 30;
      if (chart2Range === "Yearly") return diffDays <= 365;
      return true;
    });
  };

  const [selectedFile, setSelectedFile] = useState(null);

  // When user picks a file
  const handleFileChange = (e) => {
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
        console.error("Upload failed:", error);
        alert("Failed to upload bill.");
    }
  };

  // const [showCamera, setShowCamera] = useState(false);
   
  //Process transactions to get category percentages
  const getCategoryBreakdown = () => {
    if (!userData || !userData.transactions) return [];

    // Apply the filter first
    const filteredTransactions = filterTransactions(userData.transactions);
    
    // If no transactions match the filter (e.g., no expenses this week), return empty
    if (filteredTransactions.length === 0) return [];

    const total = filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Group by category
    const grouped = filteredTransactions.reduce((acc, curr) => {
      const cat = curr.category || "Others";
      acc[cat] = (acc[cat] || 0) + parseFloat(curr.amount);
      return acc;
    }, {});

    // Convert to array and format for display
    const colors = {
      "Food": "bg-emerald-500",
      "Rent": "bg-[#30302e]",
      "Transport": "bg-blue-500",
      "Entertainment": "bg-orange-400",
      "Others": "bg-stone-400"
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

        <div>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-[#5B2D2D]">
              Analytics
            </h3>

            <div className="bg-white p-1 rounded-full flex gap-1 shadow-sm overflow-x-auto max-w-full">
              {["Weekly", "Monthly", "Yearly"].map((range) => (
                <button
                  key={range}
                  onClick={() => setChart2Range(range)}
                  className={`
                    px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap
                    ${chart2Range === range 
                      ? "bg-[#2b2b28] text-[#f8ecdd] shadow-sm" 
                      : "text-stone-600 hover:bg-stone-100"}
                  `}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
            {/* <div className="bg-white p-6 rounded-[30px] h-64 shadow-sm border border-stone-100 flex flex-col">
              <h4 className="text-stone-500 font-bold text-sm mb-4">
                Weekly Spending Trend
              </h4>
              
              <div className="flex-1 flex items-end justify-between gap-2 px-2">
                {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                  <div
                    key={i}
                    className="w-full bg-emerald-100 rounded-t-lg relative group"
                  >
                   
                    <div
                      style={{ height: `${h}%` }}
                      className="absolute bottom-0 w-full bg-[#5B2D2D] rounded-t-lg transition-all duration-1000 group-hover:bg-emerald-500"
                    ></div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-2 text-xs text-stone-400 font-bold">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div> */}

            {/* Chart 1: Spending Trend (Hybrid Fix + Enhanced Dots) */}
            <div className="bg-white py-6 px-10 rounded-[30px] h-64 shadow-sm border border-stone-100 flex flex-col relative z-0 overflow-visible">
              <h4 className="text-stone-500 font-bold text-sm mb-6">
                Weekly Spending Trend
              </h4>

              {/* Graph Container */}
              <div className="flex-1 relative w-full mb-6 z-0">
                
                {/* LAYER 1: The SVG Line (Background) */}
                <svg
                  className="absolute inset-0 w-full h-full overflow-visible z-0"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke="#5B2D2D"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    points={trendData.map((d, i) => {
                      const divisor = trendData.length > 1 ? trendData.length - 1 : 1;
                      const x = (i / divisor) * 100;
                      const y = 100 - d.percent;
                      return `${x},${y}`;
                    }).join(" ")}
                  />
                </svg>

                {/* LAYER 2: HTML Dots & Tooltips (Foreground) */}
                {trendData.map((d, i) => {
                  const divisor = trendData.length > 1 ? trendData.length - 1 : 1;
                  const leftPos = (i / divisor) * 100;
                  const bottomPos = d.percent;

                  return (
                    <div
                      key={i}
                      // Increased w-8 h-8 creates a larger invisible hover target
                      className="absolute group z-10 w-10 h-10 flex items-center justify-center cursor-pointer -translate-x-1/2 translate-y-1/2"
                      style={{
                        left: `${leftPos}%`,
                        bottom: `${bottomPos}%`,
                      }}
                    >
                      {/* ENHANCED DOT STRUCTURE */}
                      
                      {/* 1. The Glow Ring (Expands on hover) */}
                      <div className="absolute w-full h-full bg-emerald-500/20 rounded-full scale-50 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100"></div>
                      
                      {/* 2. The Main Dot (Solid center) */}
                      <div className="relative z-10 w-3 h-3 bg-emerald-500 rounded-full border-[1px] border-white shadow-[0_2px_5px_rgba(16,185,129,0.3)] transition-all duration-300 group-hover:scale-125 group-hover:bg-emerald-600"></div>


                      {/* The Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 pointer-events-none whitespace-nowrap z-30">
                        <div className="bg-[#30302e] text-[#f8ecdd] text-[10px] font-bold py-1.5 px-2.5 rounded-lg shadow-xl">
                          ${d.amount.toFixed(0)}
                        </div>
                        {/* Little triangle arrow */}
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#30302e] absolute left-1/2 -translate-x-1/2 top-full"></div>
                      </div>
                    </div>
                  );
                })}
                
                {/* LAYER 3: X-Axis Labels */}
                <div className="absolute top-full w-full flex justify-between text-xs text-stone-400 font-bold mt-2">
                  {trendData.map((d, i) => (
                    // Negative margins ensure the text centers exactly under the dot's center point
                    <div key={i} className="w-10 text-center -ml-5 first:ml-0 last:-ml-10 first:text-left last:text-right">
                        {d.day}
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Chart 2: Expense Breakdown */}  
            <div className="bg-white p-6 rounded-[30px] min-h-[16rem] shadow-sm border border-stone-100">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-stone-500 font-bold text-sm">Where your money went</h4>
                 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                   {chart2Range} View
                 </span>
              </div>
              
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                 {categoryData.length > 0 ? (
                    categoryData.map((item, index) => (
                      <ExpenseItem 
                        key={index}
                        label={item.label} 
                        amount={item.amount} 
                        percent={item.percent}
                        widthVal={`${item.rawPercent}%`} 
                        color={item.color} 
                      />
                    ))
                 ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-stone-400 gap-2">
                       <p className="text-sm italic">No expenses found for this {chart2Range.toLowerCase()}.</p>
                       <p className="text-xs">Use "Add Expense" to start tracking.</p>
                    </div>
                 )}

              </div>
            </div>


          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default Dashboard;