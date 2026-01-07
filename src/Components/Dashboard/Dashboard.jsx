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
  ArrowRight,
  PieChart as PieIcon,
  Activity
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
  const [chart2Range, setChart2Range] = useState("Monthly");

  // AI Habit State
  const [dailyHabits, setDailyHabits] = useState([]);
  const [generatingHabit, setGeneratingHabit] = useState(true);

  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getDatabase(app);
  
  // ENV Variables
  const AZURE_KEY = import.meta.env.VITE_AZURE_VISION_KEY;
  const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_VISION_ENDPOINT;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // 1. AUTH & DATA FETCHING
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = ref(db, "users/" + currentUser.uid);
        
        onValue(userRef, (snapshot) => {
           if (snapshot.exists()) {
             const data = snapshot.val();
             
             // --- NEW: CHECK IF SUBSCRIPTION EXPIRED ---
             const now = Date.now();
             if (data.isPremium === true && data.premiumExpiry && now > data.premiumExpiry) {
                 console.log("Subscription expired. Downgrading to free.");
                 // Auto-downgrade in database
                 update(userRef, { 
                     isPremium: false, 
                     plan: "expired" 
                 });
                 // Update local state to reflect change immediately
                 setUserData({ ...data, isPremium: false });
             } else {
                 setUserData(data);
             }

             // Ensure premium field exists for new users
             if (data.isPremium === undefined) {
                update(userRef, { isPremium: false });
             }
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

  // 2. REAL AI HABIT GENERATION
  useEffect(() => {
    const fetchAIHabits = async () => {
        if (!user) return;
        const istDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
        const cachedDate = localStorage.getItem("debtAI_habit_date");
        const cachedHabits = localStorage.getItem("debtAI_habits");

        if (cachedDate === istDate && cachedHabits) {
            setDailyHabits(JSON.parse(cachedHabits));
            setGeneratingHabit(false);
            return;
        }

        setGeneratingHabit(true);
        try {
            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: "Generate 3 distinct, actionable, short financial micro-habits for today. Strictly return them separated by a pipe symbol (|). Example: Check balance|Skip coffee|Cook dinner.",
                    userData: userData || {} 
                })
            });

            if(!response.ok) throw new Error("AI Failed");
            const data = await response.json();
            const rawText = data.reply || "";
            let habits = rawText.split("|").map(h => h.trim());
            if (habits.length < 3) habits = ["Check bank balance.", "No spend day.", "Review subscriptions."];

            setDailyHabits(habits);
            localStorage.setItem("debtAI_habit_date", istDate);
            localStorage.setItem("debtAI_habits", JSON.stringify(habits));
        } catch (error) {
            setDailyHabits(["Track every penny.", "Cook dinner at home.", "Read a finance article."]);
        } finally {
            setGeneratingHabit(false);
        }
    };
    if (!loading && user) fetchAIHabits();
  }, [loading, user]);

  const handleHabitClick = (habitText) => {
    navigate('/debtai', { state: { autoPrompt: `I want to execute this habit today: "${habitText}". Give me a specific plan.` } });
  };

  // --- DATA HELPERS (FIXED) ---
  
  // 1. Get Debt Free Date
  const getDebtFreeDate = () => {
    if (!userData || !userData.debts) return "Calculating...";
    // Filter only UNPAID debts
    const debtsArray = Object.values(userData.debts).filter(d => d.status !== 'paid');
    const totalDebt = debtsArray.reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);
    const disposableIncome = (userData.income - userData.expenses);
    if (disposableIncome <= 0) return "Unknown";
    const monthsToFreedom = Math.ceil(totalDebt / disposableIncome);
    const date = new Date();
    date.setMonth(date.getMonth() + monthsToFreedom);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // 2. Get Urgent Debt (FIXED: Filters Paid & preserves ID)
  const getUrgentDebt = () => {
    if (!userData || !userData.debts) return null;
    
    // Map object to array AND keep key as 'id'
    const debtsArray = Object.entries(userData.debts)
        .map(([key, val]) => ({ id: key, ...val }))
        .filter(d => d.status !== 'paid'); // Strict filter

    if (debtsArray.length === 0) return null;

    // Sort by stress (highest first), then interest rate
    return debtsArray.reduce((prev, current) => {
        const stressOrder = { "Extreme": 4, "High": 3, "Medium": 2, "Low": 1 };
        const prevScore = stressOrder[prev.stressLevel] || 0;
        const currScore = stressOrder[current.stressLevel] || 0;
        return (prevScore > currScore) ? prev : current;
    });
  };
  
  const urgentDebt = getUrgentDebt();

  // 3. Mark Debt as Paid
  const handleMarkPaid = async (debtId) => {
      if(!debtId) return;
      if(window.confirm("Mark this debt as paid? Great job!")) {
          await update(ref(db, `users/${user.uid}/debts/${debtId}`), { status: "paid" });
      }
  };

  // --- CHART LOGIC ---
  const getWeeklyTrend = () => {
    if (!userData || !userData.transactions) return Array(7).fill({ day: "", amount: 0, percent: 0 });
    const transactions = Object.values(userData.transactions);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push({ date: d.toISOString().split('T')[0], day: days[d.getDay()], amount: 0 });
    }
    transactions.forEach(t => {
        const tDate = t.date ? t.date.split('T')[0] : "";
        const dayEntry = last7Days.find(d => d.date === tDate);
        if (dayEntry) dayEntry.amount += parseFloat(t.amount);
    });
    const maxSpend = Math.max(...last7Days.map(d => d.amount));
    return last7Days.map(d => ({ ...d, percent: maxSpend > 0 ? (d.amount / maxSpend) * 100 : 0 }));
  };
  const trendData = getWeeklyTrend();

  const getCategoryBreakdown = () => {
    if (!userData || !userData.transactions) return [];
    const now = new Date();
    const transactions = Object.values(userData.transactions).filter(t => {
      const tDate = new Date(t.date);
      const diffDays = Math.ceil(Math.abs(now - tDate) / (1000 * 60 * 60 * 24));
      if (chart2Range === "Weekly") return diffDays <= 7;
      if (chart2Range === "Monthly") return diffDays <= 30;
      return true;
    });
    
    if (transactions.length === 0) return [];
    const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const grouped = transactions.reduce((acc, curr) => {
      const cat = curr.category || "Others";
      acc[cat] = (acc[cat] || 0) + parseFloat(curr.amount);
      return acc;
    }, {});
    const colors = { "Food": "bg-emerald-500", "Rent": "bg-[#30302e]", "Transport": "bg-blue-500", "Entertainment": "bg-orange-400", "Others": "bg-stone-400", "Scanned Bill": "bg-purple-500" };
    return Object.keys(grouped).map(cat => ({
      label: cat, amount: `$${grouped[cat].toFixed(0)}`, percent: `${Math.round((grouped[cat] / total) * 100)}%`, color: colors[cat] || "bg-stone-400", rawPercent: (grouped[cat] / total) * 100 
    })).sort((a,b) => b.rawPercent - a.rawPercent);
  };
  const categoryData = getCategoryBreakdown();

  // --- PREMIUM CHART DATA CALC ---
  const getDebtDistribution = () => {
      if(!userData || !userData.debts) return [];
      const activeDebts = Object.values(userData.debts).filter(d => d.status !== 'paid');
      const total = activeDebts.reduce((sum, d) => sum + parseFloat(d.amount), 0);
      return activeDebts.map(d => ({
          name: d.name,
          value: parseFloat(d.amount),
          percent: ((parseFloat(d.amount) / total) * 100)
      })).sort((a,b) => b.value - a.value).slice(0, 4); // Top 4
  };
  const debtDistribution = getDebtDistribution();

  // --- BILL SCANNING ---
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
        const response = await fetch(url, { method: "POST", headers: { "Ocp-Apim-Subscription-Key": AZURE_KEY, "Content-Type": "application/octet-stream" }, body: arrayBuffer });
        if (!response.ok) throw new Error(`Azure API Error: ${response.status}`);
        const data = await response.json();
        const detectedAmount = extractAmountFromOCR(data);
        if (detectedAmount) { await saveBillToFirebase(detectedAmount); alert(`Success! Scanned bill for $${detectedAmount}`); } 
        else { alert("Could not detect a clear total amount."); }
    } catch (error) { console.error("Upload failed:", error); alert("Failed to upload bill."); } 
    finally { setIsScanning(false); }
  };

  const extractAmountFromOCR = (data) => {
    const fullText = data.readResult?.content;
    if (!fullText) return null;
    const matches = fullText.match(/[0-9,]+\.[0-9]{2}/g);
    if (matches) { const numbers = matches.map(m => parseFloat(m.replace(/,/g, ''))); if (numbers.length > 0) return Math.max(...numbers); }
    return null;
  };

  const saveBillToFirebase = async (amount) => {
    if (!user) return;
    const expenseData = { amount: parseFloat(amount), category: "Scanned Bill", date: new Date().toISOString(), description: "Auto-scanned via Azure" };
    await push(ref(db, `users/${user.uid}/transactions`), expenseData);
    const currentExpenses = parseFloat(userData?.expenses || 0);
    await update(ref(db, `users/${user.uid}`), { expenses: currentExpenses + parseFloat(amount) });
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#f8ecdd]"><Loader2 className="animate-spin text-[#5B2D2D]" size={48} /></div>;

  const isPremium = userData?.isPremium === true;

  return (
    <div className="flex min-h-screen bg-[#f8ecdd] font-sans selection:bg-[#5B2D2D] selection:text-white relative">
      
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
          
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#5B2D2D] mb-2">Let's Start <br /> Strong!</h1>
              <p className="text-[#30302e] opacity-70">
                Hello, {userData?.name || "User"}. {isPremium && <span className="inline-flex items-center gap-1 bg-[#5B2D2D] text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ml-2"><Crown size={10} /> PRO</span>}
              </p>
            </div>

            <div className="flex gap-4 flex-wrap">
              <button onClick={() => setShowExpenseModal(true)} className={quickActionStyle}>
                <div className={`w-16 h-16 flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-800 rounded-[24px]`}>{<Plus />}</div>
                <div className="whitespace-nowrap ml-2"><span>Add Expense</span></div>
              </button>
              <label className={quickActionStyle}>
                <div className="w-16 h-16 flex items-center justify-center shrink-0 bg-orange-100 text-orange-800 rounded-[24px]"><ScanLine /></div>
                <div className="whitespace-nowrap ml-2"><span>Scan Bill</span></div>
                <input type="file" accept="image/*" disabled={isScanning} className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
              </label>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-[30px] shadow-sm border border-white/40">
              <div className="flex justify-between items-end mb-4">
                <div><h3 className="text-xl font-bold text-[#5B2D2D]">Monthly Budget</h3><p className="text-sm text-stone-500">You've spent {Math.round((userData?.expenses / userData?.income) * 100) || 0}%</p></div>
                <div className="w-10 h-10 rounded-full bg-[#edffd9] flex items-center justify-center text-[#5B2D2D]"><TrendingUp size={20} /></div>
              </div>
              <div className="w-full h-4 bg-stone-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min((userData?.expenses / userData?.income) * 100, 100)}%` }}></div></div>
              <div className="flex justify-between mt-2 text-sm font-bold text-stone-600"><span>${userData?.expenses || 0} spent</span><span>${userData?.income || 0} limit</span></div>
            </div>
          </div>

          <div className="flex flex-col gap-6 h-full">
            <div className="flex justify-end gap-3 flex-wrap md:flex-nowrap">
                {!isPremium && (
                    <button onClick={() => setShowPricingModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(250,204,21,0.6)] hover:shadow-[0_0_25px_rgba(250,204,21,0.8)] hover:scale-105 transition-all animate-pulse duration-[2000ms] border border-white/30"><Zap size={20} fill="currentColor" /><span className="uppercase tracking-wide text-sm text-shadow-sm">Upgrade PRO</span></button>
                )}
                <button onClick={() => navigate("/profile")} className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-full shadow-sm text-[#5B2D2D] font-bold hover:shadow-md transition-all border border-white/40"><div className="w-8 h-8 rounded-full bg-[#f8ecdd] flex items-center justify-center text-[#5B2D2D]"><User size={18} /></div><span className="hidden md:inline">Profile</span></button>
            </div>

            <div onClick={() => navigate('/debtai')} className="relative group cursor-pointer h-full min-h-[250px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#30302e] to-[#141414] rounded-[35px] p-8 flex flex-col justify-between shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-[#f8ecdd] text-sm font-medium tracking-widest uppercase">DebtAI Assistant</span></div>
                <div className="space-y-4"><h2 className="text-3xl text-white font-light">"How can I save <span className="text-emerald-400 font-bold">$200</span>?"</h2><p className="text-stone-400 text-sm">Tap to chat with your financial data.</p></div>
                <div className="w-full h-12 bg-white/10 rounded-full flex items-center px-4 backdrop-blur-md border border-white/5"><span className="text-stone-400 text-sm">Ask anything...</span><div className="ml-auto w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black"><ArrowUpRight size={16} /></div></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* --- AI DAILY HABITS --- */}
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-purple-100 text-purple-600 rounded-xl shadow-sm"><Sparkles size={24} /></div><div><h3 className="text-xl font-bold text-[#5B2D2D]">Daily AI Habits</h3><p className="text-sm text-stone-500">Rapid debt-elimination strategies.</p></div>{!isPremium && <div className="ml-auto hidden sm:flex items-center gap-2 bg-stone-100 border border-stone-200 px-3 py-1 rounded-full"><Lock size={12} className="text-stone-400"/><span className="text-xs font-bold text-stone-500">2 Locked</span></div>}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => handleHabitClick(dailyHabits[0] || "Track spending")} className="bg-white p-6 rounded-[30px] border border-stone-100 shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:shadow-md transition-all cursor-pointer hover:border-emerald-200">
                    {generatingHabit ? <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 gap-3"><Loader2 size={24} className="text-[#5B2D2D] animate-spin" /><span className="text-xs font-bold text-[#5B2D2D] animate-pulse">Consulting AI...</span></div> : <><div className="text-[#5B2D2D] font-medium text-lg leading-relaxed relative z-10">"{dailyHabits[0] || "Track your spending today."}"</div><div className="flex justify-between items-end mt-4"><span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">Top Priority <ArrowRight size={10}/></span><div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors"><Sparkles size={16} /></div></div></>}
                </div>
                {[1, 2].map((i) => (
                    <div key={i} onClick={() => { isPremium ? handleHabitClick(dailyHabits[i]) : setShowPricingModal(true) }} className={`bg-white p-6 rounded-[30px] border border-stone-100 shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden group cursor-pointer transition-all ${isPremium ? 'hover:border-emerald-200 hover:shadow-md' : 'hover:border-yellow-400'}`}>
                        {isPremium ? (
                             <><div className="text-[#5B2D2D] font-medium text-lg leading-relaxed">"{dailyHabits[i]}"</div><div className="flex justify-end mt-4"><span className="text-xs font-bold text-emerald-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Execute <ArrowRight size={12}/></span></div></>
                        ) : (
                            <><div className="text-[#5B2D2D] font-medium text-lg leading-relaxed blur-[6px] select-none opacity-40">"Premium Content Locked."</div><div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-3 p-4 bg-white/30 backdrop-blur-[1px] group-hover:bg-white/10 transition-all"><div className="bg-[#5B2D2D] text-white p-3 rounded-full shadow-xl"><Lock size={20} /></div><span className="text-xs font-bold text-[#5B2D2D] bg-white border border-stone-200 px-4 py-2 rounded-full shadow-sm">Unlock Habit</span></div></>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* ALERTS SECTION (Corrected Logic) */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-[#5B2D2D] mb-6 flex items-center gap-2"><AlertTriangle className="text-orange-500" /> Attention Needed</h3>
          {urgentDebt ? (
             <div className="bg-orange-50 border border-orange-100 p-6 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="flex gap-4 items-center">
                 <div className="p-3 bg-white rounded-full text-orange-600 shadow-sm"><DollarSign size={24} /></div>
                 <div>
                   <h4 className="font-bold text-[#5B2D2D]">{urgentDebt.name} Payment</h4>
                   <p className="text-sm text-stone-500">Due: {urgentDebt.dueDate} • Interest: {urgentDebt.interestRate}%</p>
                 </div>
               </div>
               <button onClick={() => handleMarkPaid(urgentDebt.id)} className="px-6 py-3 bg-[#5B2D2D] text-[#f8ecdd] rounded-full font-bold text-sm hover:bg-stone-800 transition-colors cursor-pointer">Mark as Paid</button>
             </div>
           ) : (
             <div className="p-6 bg-emerald-100 font-semibold border border-emerald-300 rounded-[24px] text-emerald-800">No pending debts! You are doing great.</div>
           )}
        </div>

        {/* ANALYTICS CHARTS */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-[#5B2D2D]">Analytics</h3>
            <div className="bg-white p-1 rounded-full flex gap-1 shadow-sm overflow-x-auto max-w-full">
              {["Weekly", "Monthly", "Yearly"].map((range) => (
                <button key={range} onClick={() => setChart2Range(range)} className={`px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap ${chart2Range === range ? "bg-[#2b2b28] text-[#f8ecdd] shadow-sm" : "text-stone-600 hover:bg-stone-100"}`}>{range}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: SVG Trend */}
            <div className="bg-white py-6 px-10 rounded-[30px] h-64 shadow-sm border border-stone-100 flex flex-col relative z-0 overflow-visible">
              <h4 className="text-stone-500 font-bold text-sm mb-6">Weekly Spending Trend</h4>
              <div className="flex-1 relative w-full mb-6 z-0">
                <svg className="absolute inset-0 w-full h-full overflow-visible z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline fill="none" stroke="#5B2D2D" strokeWidth="1.5" vectorEffect="non-scaling-stroke" points={trendData.map((d, i) => { const divisor = trendData.length > 1 ? trendData.length - 1 : 1; const x = (i / divisor) * 100; const y = 100 - d.percent; return `${x},${y}`; }).join(" ")} />
                </svg>
                {trendData.map((d, i) => {
                  const divisor = trendData.length > 1 ? trendData.length - 1 : 1;
                  const leftPos = (i / divisor) * 100;
                  const bottomPos = d.percent;
                  return (
                    <div key={i} className="absolute group z-10 w-10 h-10 flex items-center justify-center cursor-pointer -translate-x-1/2 translate-y-1/2" style={{ left: `${leftPos}%`, bottom: `${bottomPos}%` }}>
                      <div className="absolute w-full h-full bg-emerald-500/20 rounded-full scale-50 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100"></div>
                      <div className="relative z-10 w-3 h-3 bg-emerald-500 rounded-full border-[1px] border-white shadow-[0_2px_5px_rgba(16,185,129,0.3)] transition-all duration-300 group-hover:scale-125 group-hover:bg-emerald-600"></div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 pointer-events-none whitespace-nowrap z-30">
                        <div className="bg-[#30302e] text-[#f8ecdd] text-[10px] font-bold py-1.5 px-2.5 rounded-lg shadow-xl">${d.amount.toFixed(0)}</div>
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#30302e] absolute left-1/2 -translate-x-1/2 top-full"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Expense List */}  
            <div className="bg-white p-6 rounded-[30px] min-h-[16rem] shadow-sm border border-stone-100">
              <div className="flex justify-between items-center mb-4"><h4 className="text-stone-500 font-bold text-sm">Category Breakdown</h4></div>
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                 {categoryData.length > 0 ? (categoryData.map((item, index) => (<ExpenseItem key={index} label={item.label} amount={item.amount} percent={item.percent} widthVal={`${item.rawPercent}%`} color={item.color} />))) : (<div className="flex flex-col items-center justify-center h-40 text-stone-400 gap-2"><p className="text-sm italic">No expenses found.</p><p className="text-xs">Use "Add Expense" to start.</p></div>)}
              </div>
            </div>
          </div>
        </div>

        {/* --- NEW: PREMIUM ANALYTICS (Pie Chart & Health) --- */}
        <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-xl shadow-sm"><Crown size={24} /></div>
                <div><h3 className="text-xl font-bold text-[#5B2D2D]">Pro Analytics</h3><p className="text-sm text-stone-500">Advanced debt visualization & health score.</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Premium Chart 1: Debt Distribution (Pie) */}
                <div onClick={() => !isPremium && setShowPricingModal(true)} className={`bg-white p-6 rounded-[30px] h-72 shadow-sm border border-stone-100 relative overflow-hidden ${!isPremium ? 'cursor-pointer group' : ''}`}>
                    <h4 className="text-stone-500 font-bold text-sm mb-4 flex items-center gap-2"><PieIcon size={16}/> Debt Distribution</h4>
                    
                    {isPremium ? (
                        debtDistribution.length > 0 ? (
                            <div className="flex items-center justify-center h-48 gap-8">
                                {/* Simple CSS Pie Chart */}
                                <div className="w-32 h-32 rounded-full relative bg-stone-100" style={{ background: `conic-gradient(
                                    #ef4444 0% ${debtDistribution[0]?.percent || 0}%, 
                                    #f97316 ${debtDistribution[0]?.percent || 0}% ${(debtDistribution[0]?.percent || 0) + (debtDistribution[1]?.percent || 0)}%,
                                    #eab308 ${(debtDistribution[0]?.percent || 0) + (debtDistribution[1]?.percent || 0)}% 100%
                                )`}}>
                                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center font-bold text-stone-400 text-xs">TOTAL</div>
                                </div>
                                <div className="space-y-2">
                                    {debtDistribution.map((d, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-stone-600">
                                            <div className={`w-3 h-3 rounded-full ${i===0 ? 'bg-red-500' : i===1 ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                                            <span>{d.name} ({Math.round(d.percent)}%)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : <div className="flex items-center justify-center h-40 text-stone-400">No debt data available.</div>
                    ) : (
                        // LOCKED STATE
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm z-10 gap-3">
                            <Lock size={32} className="text-[#5B2D2D]"/>
                            <button className="px-6 py-2 bg-[#5B2D2D] text-white rounded-full font-bold text-sm hover:scale-105 transition-transform">Unlock Analytics</button>
                        </div>
                    )}
                </div>

                {/* Premium Chart 2: Health Score */}
                <div onClick={() => !isPremium && setShowPricingModal(true)} className={`bg-white p-6 rounded-[30px] h-72 shadow-sm border border-stone-100 relative overflow-hidden ${!isPremium ? 'cursor-pointer group' : ''}`}>
                    <h4 className="text-stone-500 font-bold text-sm mb-4 flex items-center gap-2"><Activity size={16}/> Financial Health Score</h4>
                    
                    {isPremium ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <div className="relative w-40 h-24 overflow-hidden mb-4">
                                <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[15px] border-emerald-100 border-t-emerald-500 transform rotate-[-45deg]"></div>
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
                                    <div className="text-4xl font-bold text-[#5B2D2D]">85</div>
                                    <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Excellent</div>
                                </div>
                            </div>
                            <p className="text-xs text-stone-400 text-center max-w-[200px]">Based on your debt-to-income ratio and spending habits.</p>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm z-10 gap-3">
                            <Lock size={32} className="text-[#5B2D2D]"/>
                            <button className="px-6 py-2 bg-[#5B2D2D] text-white rounded-full font-bold text-sm hover:scale-105 transition-transform">Unlock Score</button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

const ExpenseItem = ({ label, amount, percent, widthVal, color }) => (
  <div className="flex items-center gap-4">
    <div className={`w-3 h-3 rounded-full ${color}`}></div>
    <div className="flex-1">
      <div className="flex justify-between text-sm font-bold text-[#5B2D2D]"><span>{label}</span><span>{amount}</span></div>
      <div className="w-full h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden"><div style={{ width: widthVal || percent }} className={`h-full ${color} rounded-full`}></div></div>
    </div>
  </div>
);

export default Dashboard;