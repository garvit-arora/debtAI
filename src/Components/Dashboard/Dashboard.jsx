import React, { useState, useEffect, useMemo } from "react";
import Footer from "../ui/Footer";
import Sidebar from "../ui/Sidebar";
import ExpenseInputForm from "../ui/ExpenseInputForm";
import PricingModal from "../Premium/Premium"; 
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../firebase";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  ComposedChart
} from 'recharts';
import {
  Plus,
  User,
  Loader2,
  Lock,
  History,
  TrendingDown,
  Activity,
  ShieldCheck,
  Zap,
  TrendingUp,
  PieChart as PieIcon,
  LayoutGrid,
  Trophy,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp as Surge,
  ArrowUpRight,
  Target
} from "lucide-react";
import { useMode } from "../../context/ModeContext";

const ALL_HABITS = [
  "Limit extra spending to ₹500 today to pay off debt faster.",
  "Transfer ₹100 to your debt now—every little bit counts.",
  "Cancel one unused subscription today to save money.",
  "Log your spending as soon as you buy something.",
  "Try not to use your credit card for the next 24 hours.",
  "Check prices at two places before buying anything over ₹1,000."
];

const DashboardCard = ({ children, className = "" }) => (
  <div className={`bg-[#121212] border border-white/5 rounded-[40px] p-8 transition-all hover:border-white/10 ${className}`}>
    {children}
  </div>
);

const SummaryCard = ({ title, value, change, colorClass = "text-white" }) => (
  <DashboardCard className="flex flex-col justify-between h-44">
    <div>
      <h3 className="text-2xl font-black text-stone-200 uppercase tracking-tighter mb-4 leading-none">{title}</h3>
      <h2 className={`text-xl font-bold tracking-tighter ${colorClass}`}>{value}</h2>
    </div>
    {change && (
      <div className="flex items-center gap-2">
         <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${change.startsWith('+') || change.includes("Wealth") || change.includes("Safe") ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
           {change}
         </span>
      </div>
    )}
  </DashboardCard>
);

const HabitBox = ({ habit, isLocked, onPricingClick, index }) => (
  <div onClick={() => isLocked && onPricingClick()} className={`relative overflow-hidden group border border-white/5 p-8 rounded-[32px] cursor-pointer transition-all h-full ${isLocked ? 'bg-black/60' : 'bg-white/5 hover:bg-white/10'}`}>
    <div className="flex justify-between items-start mb-6">
       <span className={`text-4xl font-black italic ${isLocked ? 'text-stone-900' : 'text-cyan-500'}`}>0{index + 1}</span>
       {isLocked && <Lock size={14} className="text-stone-900" />}
    </div>
    <div className={`${isLocked ? 'blur-[4px] opacity-40' : ''}`}>
       <p className="text-sm font-black text-stone-300 group-hover:text-white transition-colors leading-relaxed tracking-wide lowercase">{habit}</p>
    </div>
  </div>
);

const AnalyticWidget = ({ title, icon: Icon, children, className = "" }) => (
  <DashboardCard className={className}>
    <div className="flex items-center gap-4 mb-10">
       <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <Icon size={18} className="text-stone-500" />
       </div>
       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">{title}</h4>
    </div>
    {children}
  </DashboardCard>
);

export default function Dashboard() {
  const { mode, switchMode } = useMode();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dailyHabits, setDailyHabits] = useState([]);

  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getDatabase(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        onValue(ref(db, "users/" + currentUser.uid), (snapshot) => {
          if (snapshot.exists()) {
             const data = snapshot.val();
             setUserData(data);
             processStats(data);
             generateDailyHabits();
          } else navigate("/onboarding");
          setLoading(false);
        });
      } else navigate("/login");
    });
    return () => unsubscribe();
  }, []);

  const generateDailyHabits = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    let seed = 0;
    for (let i = 0; i < dateStr.length; i++) seed += dateStr.charCodeAt(i);
    const shuffled = [...ALL_HABITS].sort(() => (seed % 10 - 5));
    setDailyHabits(shuffled.slice(0, 3));
  };

  const processStats = (data) => {
    const transactions = data.transactions ? Object.values(data.transactions) : [];
    const debts = data.debts ? Object.values(data.debts) : [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // 1. Calculate REAL current total debt from DB
    const currentTotalDebt = debts.reduce((s,d) => s + (parseFloat(d.remainingAmount || d.amount) || 0), 0);
    
    // 2. Map last 14 days
    let areaData = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setHours(0,0,0,0);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        
        // Sum expenses and debt payments for this specific day
        let dailyExpense = 0;
        let dailyDebtPayment = 0;
        
        transactions.forEach(t => {
           if(t.date && t.date.startsWith(ds)) {
              dailyExpense += parseFloat(t.amount);
              // Check if category is related to debt
              const cat = t.category?.toLowerCase() || "";
              if(cat.includes('debt') || cat.includes('loan') || cat.includes('emi')) {
                 dailyDebtPayment += parseFloat(t.amount);
              }
           }
        });

        areaData.push({ 
          date: ds, 
          name: days[d.getDay()], 
          income: (parseFloat(data.income) / 30) || 0, 
          expenses: dailyExpense, 
          payment: dailyDebtPayment,
          debtBalance: 0 // to be calculated below
        });
    }
    
    // 3. Backward plot debt reduction velocity
    // Today's balance is currentTotalDebt. Previous days were currentTotalDebt + sum(payments since then)
    let runningBalance = currentTotalDebt;
    for(let i = 13; i >= 0; i--) {
       areaData[i].debtBalance = Math.max(0, runningBalance);
       // Add back the payment made on this day to get previous day's balance
       runningBalance += areaData[i].payment;
    }

    setChartData(areaData);

    const categoryTotals = transactions.reduce((acc, t) => {
       acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
       return acc;
    }, {});
    const pie = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
    setPieData(pie.length > 0 ? pie : [{ name: 'No Data', value: 1 }]);
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-white" size={48} /></div>;

  const activeDebts = Object.values(userData?.debts || {}).filter(d => d.status !== 'paid');
  const totalOwed = activeDebts.reduce((s,d) => s + parseFloat(d.remainingAmount || d.amount || 0), 0);
  
  const investments = Object.values(userData?.investments || {});
  const totalInvested = investments.reduce((s, i) => s + parseFloat(i.amount || 0), 0);

  const income = parseFloat(userData?.income) || 0;
  const debtIncomeRatio = income > 0 ? Math.round((totalOwed / (income * 12)) * 100) : 0;
  
  // Calculate real savings rate: (Income - Total Expenses this month) / Income
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = Object.values(userData?.transactions || {}).filter(t => t.date?.startsWith(currentMonth)).reduce((s, t) => s + parseFloat(t.amount), 0);
  const savingsRate = income > 0 ? Math.round(((income - monthlyExpenses) / income) * 100) : 0;
  
  const history = userData?.transactions ? Object.entries(userData.transactions).map(([id, t]) => ({id, ...t})).sort((a,b) => new Date(b.date) - new Date(a.date)) : [];
  const isWealth = mode === 'wealth';

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden relative uppercase tracking-tighter">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userData={userData} />

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-stone-400"><LayoutGrid size={24} /></button>
               <h1 className="text-xl font-black italic tracking-tighter">
                  Welcome {userData?.name?.split(' ')[0] || 'User'}
               </h1>
            </div>
            <div className="flex items-center gap-8">
               <button onClick={() => setShowExpenseModal(true)} className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center active:scale-95 transition-all"><Plus size={24} /></button>
               <div onClick={() => navigate("/profile")} className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden bg-white/5 cursor-pointer">
                  {userData?.profileImg ? <img src={userData.profileImg} className="w-full h-full object-cover" /> : <User size={22} />}
               </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto px-12 py-12 hide-scrollbar">
           
           {!isWealth && activeDebts.length === 0 && (
             <section className="mb-16 animate-in fade-in slide-in-from-top-8 duration-1000">
                <div className="bg-[#0f0f0f] border border-white/5 rounded-[56px] p-16 flex flex-col items-center text-center relative overflow-hidden group shadow-3xl">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
                   <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full group-hover:bg-cyan-500/10 transition-colors duration-1000"></div>

                   <div className="relative z-10 space-y-8 max-w-2xl">
                      <div className="inline-flex items-center gap-3 px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-500">
                         <Trophy size={16} />
                         <span className="text-[10px] font-black tracking-[0.3em] uppercase">Debt-Free Milestone</span>
                      </div>

                      <div className="space-y-4">
                         <h2 className="text-7xl font-black tracking-tighter italic uppercase text-white leading-[0.9]">Zero Debt<br />Detected<span className="text-cyan-500">.</span></h2>
                         <p className="text-stone-500 font-bold text-lg tracking-tight max-w-lg mx-auto leading-relaxed lowercase">
                            Your financial trajectory is now optimized for aggressive wealth building.
                         </p>
                      </div>

                      <div className="pt-6">
                        <button onClick={() => switchMode('wealth')} className="group relative inline-flex items-center gap-6 bg-white text-black pl-10 pr-8 py-5 rounded-[24px] font-black text-[10px] tracking-[0.3em] uppercase transition-all active:scale-95">
                           Switch to Wealth Engine
                           <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:translate-x-1 transition-transform">
                              <ChevronRight size={18} className="text-white" />
                           </div>
                        </button>
                      </div>
                   </div>
                </div>
             </section>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <SummaryCard 
                title={isWealth ? "Portfolio Value" : "Total Owed"} 
                value={isWealth ? `₹${totalInvested.toLocaleString()}` : `₹${totalOwed.toLocaleString()}`} 
                colorClass={isWealth ? "text-cyan-500" : "text-rose-500"} 
              />
              <SummaryCard title="Debt-to-Income" value={`${debtIncomeRatio}%`} change={debtIncomeRatio < 30 ? "Safe Zone" : "Critical Load"} />
              <SummaryCard title="Savings Rate" value={`${savingsRate}%`} change={savingsRate > 20 ? "Growing Wealth" : "Underfunded"} />
              <SummaryCard title="Cash on Hand" value="0.84" change="Optimal Sync" />
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
              <div className="lg:col-span-2 space-y-12">
                 <AnalyticWidget title="Debt Payoff Progress" icon={Surge}>
                    <div className="h-[380px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chartData}>
                             <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#ffffff03" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#262626', fontSize: 10, fontWeight: '900'}} />
                             <YAxis axisLine={false} tickLine={false} tick={{fill: '#262626', fontSize: 10, fontWeight: '900'}} />
                             <ReTooltip contentStyle={{ backgroundColor: '#0d0d0d', border: 'none', borderRadius: '32px' }} />
                             {/* REAL DATA Trajectory */}
                             <Area type="monotone" dataKey="debtBalance" stroke="#ef4444" fill="url(#debtGrad)" strokeWidth={4} />
                             {/* Real Expense Bars */}
                             <Bar dataKey="expenses" fill="#06b6d4" radius={[8, 8, 0, 0]} opacity={0.3} barSize={20} />
                             <defs>
                                <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                   <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                          </ComposedChart>
                       </ResponsiveContainer>
                    </div>
                 </AnalyticWidget>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AnalyticWidget title="Expense Allocation" icon={PieIcon}>
                       <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                                   {pieData.map((_, i) => <Cell key={i} fill={["#06b6d4", "#ffffff", "#ef4444", "#3b82f6"][i % 4]} />)}
                                </Pie>
                                <ReTooltip />
                             </PieChart>
                          </ResponsiveContainer>
                       </div>
                    </AnalyticWidget>
                    <AnalyticWidget title="System Integrity" icon={ShieldCheck}>
                        <div className="h-[250px] flex items-center justify-center flex-col text-center">
                           <div className="relative mb-6">
                              <svg className="w-32 h-32 transform -rotate-90">
                                 <circle cx="64" cy="64" r="50" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                                 <circle cx="64" cy="64" r="50" fill="transparent" stroke="#06b6d4" strokeWidth="12" strokeDasharray={314} strokeDashoffset={314 * (1 - 0.74)} strokeLinecap="round" />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center font-black text-2xl">74%</span>
                           </div>
                           <p className="text-[10px] font-black text-stone-700 uppercase tracking-widest">Global Stability Rating</p>
                        </div>
                    </AnalyticWidget>
                 </div>
              </div>

              <div className="space-y-12">
                 <div className="space-y-6">
                    <h3 className="text-lg font-black italic tracking-tighter uppercase px-2 flex items-center justify-between">
                       Strategic Protocol <Target size={16} />
                    </h3>
                    {dailyHabits.map((h, i) => <HabitBox key={i} habit={h} index={i} isLocked={i > 0} onPricingClick={() => setShowPricingModal(true)} />)}
                 </div>
                 
                 <AnalyticWidget title="Principal Gravity" icon={Zap}>
                    <div className="space-y-6">
                       <div className="flex justify-between items-center text-[10px] font-black text-stone-700 uppercase">
                          <span>Interest Burden</span>
                          <span className="text-rose-500">22% of total load</span>
                       </div>
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 w-[22%]"></div>
                       </div>
                    </div>
                 </AnalyticWidget>

                 <div className="bg-[#121212] border border-white/5 rounded-[40px] p-10 space-y-4">
                    <Zap size={18} className="text-cyan-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Growth Forecast</h4>
                    <p className="text-xs font-bold text-stone-500 italic leading-tight uppercase">Estimated debt zero in <span className="text-cyan-500">14 months</span>.</p>
                 </div>
              </div>
           </div>

           <section className="space-y-8 mb-24">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase px-2">Global Ledger</h3>
              <div className="bg-[#121212] border border-white/5 rounded-[48px] overflow-hidden">
                 {history.slice(0, 8).map((t, i) => (
                   <div key={i} className="flex justify-between items-center px-12 py-8 border-b border-white/5 hover:bg-white/[0.02] transition-all group">
                      <div className="flex items-center gap-8">
                         <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all font-black text-[10px]">{i+1}</div>
                         <div>
                            <h4 className="text-xs font-black text-white uppercase mb-1">{t.category}</h4>
                            <p className="text-[9px] font-black text-stone-800 uppercase">{t.date}</p>
                         </div>
                      </div>
                      <h4 className="text-lg font-black text-white group-hover:text-cyan-500 transition-colors tracking-tighter">₹{parseFloat(t.amount).toLocaleString()}</h4>
                   </div>
                 ))}
                 {history.length === 0 && <p className="text-center py-20 text-stone-800 font-black text-[10px] uppercase tracking-widest">No historical logs detected</p>}
              </div>
           </section>
           
           <Footer />
        </div>
      </main>

      {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} />}
      {showExpenseModal && <ExpenseInputForm onClose={() => setShowExpenseModal(false)} />}
    </div>
  );
}