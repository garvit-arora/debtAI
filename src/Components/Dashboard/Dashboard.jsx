import React, { useState, useEffect, useRef } from "react";
import Footer from "../ui/Footer";
import Sidebar from "../ui/Sidebar";
import ExpenseInputForm from "../ui/ExpenseInputForm";
import PricingModal from "../Premium/Premium"; 
import { useNavigate, useLocation, Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, push, update, onValue } from "firebase/database";
import { app } from "../../firebase";
import { useTheme } from "../../context/ThemeContext";
import * as XLSX from "xlsx";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  RadialBarChart, RadialBar,
  BarChart, Bar,
  Cell
} from 'recharts';
import {
  Plus,
  TrendingUp,
  User,
  Loader2,
  BrainCircuit,
  Bell,
  MessageSquare,
  Download,
  CreditCard,
  ChevronDown,
  BarChart3,
  Wallet,
  TrendingDown,
  X,
  Sparkles,
  ShieldCheck,
  History,
  Lock,
  Zap,
  ArrowUpRight,
  PieChart as PieIcon
} from "lucide-react";

// --- CUSTOM UI COMPONENTS ---

const DashboardCard = ({ children, className = "" }) => (
  <div className={`bg-[#0d0d0d] border border-white/5 rounded-[32px] p-8 shadow-sm ${className}`}>
    {children}
  </div>
);

const MetricCard = ({ title, amount, percentage, isPositive }) => (
  <DashboardCard className="flex-1 cursor-default h-full">
    <div className="flex justify-between items-start mb-6">
      <p className="text-stone-500 text-[10px] font-black uppercase tracking-[0.3em]">{title}</p>
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPositive ? 'text-white bg-white/10' : 'text-rose-500 bg-rose-500/10'}`}>
        {isPositive ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
        {percentage}%
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="text-4xl font-black tracking-tighter text-white">₹{amount}</h3>
      <p className="text-[9px] font-bold text-stone-800 uppercase tracking-[0.2em] mt-1">Monthly Update</p>
    </div>
  </DashboardCard>
);

const HabitCard = ({ title, content, isLocked, onPricingClick }) => (
  <div onClick={() => isLocked && onPricingClick()} className={`relative overflow-hidden rounded-[28px] p-6 border border-white/5 h-48 flex flex-col justify-between cursor-pointer ${isLocked ? 'bg-[#0a0a0a]' : 'bg-white/5'}`}>
    {isLocked ? (
      <>
        <div className="flex justify-between items-start">
           <span className="text-[10px] font-black uppercase tracking-widest text-stone-700">Habit Analysis</span>
           <Lock size={16} className="text-stone-700" />
        </div>
        <div className="space-y-2">
           <h4 className="text-lg font-black text-stone-800 blur-[2px] select-none">{title}</h4>
           <div className="w-full h-2 bg-stone-900 rounded-full"></div>
           <div className="w-2/3 h-2 bg-stone-900 rounded-full"></div>
        </div>
        <button className="text-[9px] font-black uppercase tracking-widest text-white/20">Premium Locked</button>
      </>
    ) : (
      <>
        <div className="flex justify-between items-start">
           <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500/60">Habit Tracker</span>
           <Sparkles size={16} className="text-cyan-500/40" />
        </div>
        <div className="space-y-2">
           <h4 className="text-lg font-black text-white leading-tight">{title}</h4>
           <p className="text-xs font-medium text-stone-500 line-clamp-2 leading-relaxed">{content}</p>
        </div>
        <button className="text-[9px] font-black uppercase tracking-widest text-white">Active Insight</button>
      </>
    )}
  </div>
);

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [debtRadialData, setDebtRadialData] = useState([]);
  const [statsPeriod, setStatsPeriod] = useState("Weekly");
  
  // Real Deltas
  const [deltas, setDeltas] = useState({ balance: 0, income: 0, expense: 0 });

  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getDatabase(app);
  const notificationRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        onValue(ref(db, "users/" + currentUser.uid), (snapshot) => {
          if (snapshot.exists()) {
             const data = snapshot.val();
             setUserData(data);
             processRealData(data, statsPeriod);
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
  }, [auth, navigate, db, statsPeriod]);

  const processRealData = (data, period) => {
    const transactions = data.transactions ? Object.values(data.transactions) : [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    let processedData = [];

    if (period === "Weekly") {
      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          processedData.push({ 
              date: d.toISOString().split('T')[0], 
              name: days[d.getDay()], 
              income: (data.income / 30) || 0,
              expenses: 0 
          });
      }
      transactions.forEach(t => {
          const tDate = t.date ? t.date.split('T')[0] : "";
          const entry = processedData.find(d => d.date === tDate);
          if (entry) entry.expenses += parseFloat(t.amount);
      });

      // Calculate Expense Delta (Last 3 days vs previous 3 days)
      const currentExpenses = processedData.slice(-3).reduce((sum, d) => sum + d.expenses, 0);
      const prevExpenses = processedData.slice(0, 3).reduce((sum, d) => sum + d.expenses, 0);
      const expGrowth = prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0;
      
      setDeltas(prev => ({ ...prev, expense: expGrowth.toFixed(1) }));

    } else {
      for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          processedData.push({ 
              month: d.getMonth(),
              name: months[d.getMonth()], 
              income: parseFloat(data.income) || 0,
              expenses: 0 
          });
      }
      transactions.forEach(t => {
          const tDate = new Date(t.date);
          const entry = processedData.find(d => d.month === tDate.getMonth());
          if (entry) entry.expenses += parseFloat(t.amount);
      });
    }
    setChartData(processedData);

    const debts = data.debts ? Object.values(data.debts).filter(d => d.status !== 'paid') : [];
    const totalDebt = debts.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const colors = ['#ffffff', '#a8a29e', '#78716c', '#57534e', '#44403c'];
    const processedRadial = debts.map((d, i) => ({
        name: d.name,
        uv: totalDebt > 0 ? (parseFloat(d.amount) / totalDebt) * 100 : 0,
        fill: colors[i % colors.length]
    })).sort((a,b) => b.uv - a.uv).slice(0, 4);
    setDebtRadialData(processedRadial);

    // Mock Income/Balance deltas for stability
    setDeltas(prev => ({ 
        ...prev, 
        income: 4.2, 
        balance: 6.7 
    }));
  };

  const exportToCSV = () => {
    if (!userData) return;
    const transactions = userData.transactions ? Object.values(userData.transactions) : [];
    const debts = userData.debts ? Object.values(userData.debts) : [];

    let csvContent = "Type,Date,Category/Name,Amount,Description/Status\n";
    transactions.forEach(t => {
      csvContent += `Transaction,${new Date(t.date).toLocaleDateString()},${t.category},${t.amount},${t.description || ""}\n`;
    });
    debts.forEach(d => {
      csvContent += `Debt,${new Date(d.createdAt || Date.now()).toLocaleDateString()},${d.name},${d.amount},${d.status || "Active"}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DebtAI_Analytics_Export_${new Date().getFullYear()}.csv`);
    link.click();
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-white" size={48} /></div>;

  const readinessValue = 68;

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* NAVBAR */}
        <header className="h-24 border-b border-white/5 flex items-center justify-end px-12 bg-[#050505] sticky top-0 z-40 gap-10">
            <button 
              onClick={() => setShowPricingModal(true)}
              className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
            >
              Upgrade Plan
            </button>
            <button onClick={() => navigate('/support')} className="text-stone-600 hover:text-white transition-all">
               <MessageSquare size={22} />
            </button>
            <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className="text-stone-600 hover:text-white transition-all relative">
                   <Bell size={22} />
                   <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full border-2 border-[#050505]"></div>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-6 w-72 bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl z-50">
                     <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Notifications</span>
                        <button onClick={() => setShowNotifications(false)} className="text-stone-700 hover:text-white"><X size={16}/></button>
                     </div>
                     <p className="text-sm font-bold text-white/40 italic">No new notifications.</p>
                  </div>
                )}
            </div>
            <div onClick={() => navigate("/profile")} className="flex items-center gap-4 pl-10 border-l border-white/5 group cursor-pointer">
              <div className="text-right">
                <div className="text-sm font-black tracking-tighter">{userData?.name || "Member"}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-stone-700">Profile Logged</div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-white ring-1 ring-white/10 shadow-xl">
                 <User size={22} />
              </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto px-12 pt-4 pb-12 hide-scrollbar space-y-12">
          
          <section className="animate-in fade-in slide-in-from-left-4 duration-700">
             <h2 className="text-7xl font-black tracking-tighter text-white mb-4 italic uppercase">Dashboard<span className="text-stone-800">.</span></h2>
             <p className="text-stone-600 font-bold text-lg tracking-tight">Financial intelligence data for {userData?.name || "the user"}.</p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
            <DashboardCard className="lg:col-span-2 relative overflow-hidden bg-black border-white/5 h-40">
               <div className="relative z-10 flex flex-col h-full justify-between py-0">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-stone-600 text-[10px] font-black uppercase tracking-[0.4em] tracking-widest">Available Balance</span>
                    </div>
                    <div className="flex items-baseline gap-6">
                      <h3 className="text-5xl font-black tracking-tighter text-white">₹83,172.64</h3>
                      <span className="text-white text-[10px] font-black uppercase tracking-widest opacity-40">+{deltas.balance}% Growth</span>
                    </div>
                  </div>
               </div>
            </DashboardCard>

            <div className="h-40 w-full">
              <MetricCard 
                title="Monthly Income" 
                amount={userData?.income || "0"} 
                percentage={deltas.income} 
                isPositive={true} 
              />
            </div>
            <div className="h-40 w-full">
              <MetricCard 
                title="Monthly Expense" 
                amount={userData?.expenses || "0"} 
                percentage={deltas.expense} 
                isPositive={parseFloat(deltas.expense) < 0} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <DashboardCard className="lg:col-span-3">
              <div className="flex justify-between items-center mb-14">
                <h3 className="text-xl font-black tracking-tighter uppercase tracking-[0.2em]">Spending Stats</h3>
                <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/5">
                   {["Weekly", "Monthly"].map(t => (
                     <button 
                       key={t} 
                       onClick={() => setStatsPeriod(t)}
                       className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statsPeriod === t ? 'bg-white text-black' : 'text-stone-600'}`}
                     >
                       {t}
                     </button>
                   ))}
                </div>
              </div>

              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.05}/>
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.05}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#ffffff03" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#222', fontSize: 10, fontWeight: '900'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#222', fontSize: 10, fontWeight: '900'}} />
                    <ReTooltip 
                      contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid #ffffff10', borderRadius: '24px', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" animationDuration={1000} />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" animationDuration={1200} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>

            <DashboardCard className="flex flex-col">
               <h3 className="text-xl font-black tracking-tighter mb-14 uppercase tracking-[0.2em]">Debt Spread</h3>
               <div className="flex-1 relative flex items-center justify-center min-h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="35%" outerRadius="110%" barSize={14} data={debtRadialData}>
                      <RadialBar
                        minAngle={15}
                        background={{ fill: '#ffffff02' }}
                        clockWise
                        dataKey="uv"
                        cornerRadius={12}
                        animationDuration={1500}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] font-black text-stone-800 uppercase tracking-[0.4em] mb-2">Total</p>
                    <span className="text-3xl font-black text-white tracking-widest">{debtRadialData.length > 0 ? Math.round(debtRadialData[0].uv) : 0}%</span>
                  </div>
               </div>

               <div className="space-y-5 pt-12 mt-auto border-t border-white/5">
                  {debtRadialData.map((item, i) => (
                    <div key={i} className="flex justify-between items-center cursor-default">
                      <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }}></div>
                        <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-white tracking-tighter opacity-40">{Math.round(item.uv)}%</span>
                    </div>
                  ))}
               </div>
            </DashboardCard>
          </div>

          {/* FINANCIAL HABITS */}
          <section className="space-y-8">
             <div className="flex items-center gap-4">
               <Sparkles size={24} className="text-cyan-500" />
               <h3 className="text-3xl font-black tracking-tighter uppercase italic">Daily Habits</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <HabitCard 
                  title="50/30/20 Alignment" 
                  content="AI detects you can optimize ₹4,200 by shifting debt payments to high-interest first." 
                  isLocked={false} 
                />
                <HabitCard title="Micro-Investment Logic" content="" isLocked={true} onPricingClick={() => setShowPricingModal(true)} />
                <HabitCard title="Forensic Tax Mitigation" content="" isLocked={true} onPricingClick={() => setShowPricingModal(true)} />
             </div>
          </section>

          {/* DEBT INTELLIGENCE */}
          <section className="space-y-12">
             <div className="flex flex-col sm:flex-row justify-between items-end gap-8">
                <div>
                   <h3 className="text-4xl font-black tracking-tighter uppercase tracking-[0.1em]">Debt Intelligence</h3>
                   <p className="text-stone-700 font-bold text-lg">Detailed analysis of your liability landscape.</p>
                </div>
                <button onClick={exportToCSV} className="h-16 px-10 bg-white/5 border border-white/5 rounded-3xl text-stone-600 hover:text-white transition-all flex items-center gap-4 font-black text-[11px] uppercase tracking-[0.3em] shadow-xl">
                    <Download size={22} /> Download Insights
                </button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DashboardCard className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-600 mb-8">Investment Readiness</span>
                    <div className="relative w-64 h-64 flex items-center justify-center mb-10">
                       <svg className="w-full h-full transform -rotate-90">
                          <circle cx="128" cy="128" r="100" stroke="#1c1c1c" strokeWidth="20" fill="transparent" />
                          <circle cx="128" cy="128" r="100" stroke="white" strokeWidth="20" fill="transparent" 
                            strokeDasharray="628" strokeDashoffset={628 * (1 - readinessValue / 100)} 
                            className="transition-all duration-1000"
                          />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-6xl font-black tracking-tighter text-white">{readinessValue}%</span>
                          <span className="text-[10px] font-black uppercase text-stone-600 tracking-[0.2em] mt-2">Score Path</span>
                       </div>
                    </div>
                </DashboardCard>

                <DashboardCard className="p-0 overflow-hidden flex flex-col">
                   <div className="px-10 py-8 border-b border-white/5">
                      <h4 className="text-lg font-black uppercase tracking-widest text-white italic">Velocity Trend</h4>
                   </div>
                   <div className="flex-1 p-8">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff03" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#222', fontSize: 10, fontWeight: '900'}} />
                          <Bar dataKey="expenses" radius={[10, 10, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === chartData.length-1 ? '#fff' : '#1c1c1c'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Avg. Paydown Velocity</span>
                      <span className="text-lg font-black text-white">₹4,281.00</span>
                   </div>
                </DashboardCard>
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