import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar";
import Footer from "../ui/Footer";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../firebase";
import { 
  TrendingUp, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  LayoutGrid, 
  Loader2,
  Filter,
  BarChart3,
  Globe,
  PieChart as PieIcon,
  Zap,
  ChevronRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line
} from "recharts";
import { useNavigate } from "react-router-dom";

const STOCK_DATA = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: "2,984.50", change: "+1.24%", isUp: true },
  { symbol: "TCS", name: "Tata Consultancy Services", price: "4,120.15", change: "-0.85%", isUp: false },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", price: "1,450.30", change: "+0.45%", isUp: true },
  { symbol: "INFY", name: "Infosys Ltd", price: "1,620.00", change: "-1.10%", isUp: false },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", price: "1,085.60", change: "+2.15%", isUp: true },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", price: "1,210.45", change: "+0.90%", isUp: true },
  { symbol: "SBIN", name: "State Bank of India", price: "745.20", change: "+0.30%", isUp: true },
];

const ANALYTICS_MOCK = [
  { name: 'Mon', volatility: 400, volume: 2400 },
  { name: 'Tue', volatility: 300, volume: 1398 },
  { name: 'Wed', volatility: 200, volume: 9800 },
  { name: 'Thu', volatility: 278, volume: 3908 },
  { name: 'Fri', volatility: 189, volume: 4800 },
];

export default function Stocks() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const auth = getAuth(app);
  const db = getDatabase(app);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        onValue(ref(db, `users/${u.uid}`), (snap) => {
           if (snap.exists()) setUserData(snap.val());
        });
        setTimeout(() => setLoading(false), 800);
      } else navigate("/login");
    });
    return unsub;
  }, []);

  const filteredStocks = STOCK_DATA.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-white" size={48} /></div>;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden uppercase tracking-tighter">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-stone-400"><LayoutGrid size={24} /></button>
               <h1 className="text-xl font-black italic tracking-tighter">Welcome {userData?.name?.split(' ')[0] || 'Garvit'}</h1>
            </div>
            <div className="flex bg-white/5 border border-white/5 rounded-2xl px-6 py-3 items-center gap-4 w-64 md:w-96">
               <Search size={16} className="text-stone-700" />
               <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Analyze Indices..." 
                  className="bg-transparent border-none outline-none text-[10px] font-black w-full tracking-widest placeholder:text-stone-800" 
               />
            </div>
        </header>

        <div className="flex-1 overflow-y-auto pl-8 pr-12 py-12 hide-scrollbar">
           
           <section className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                 <h1 className="text-7xl font-black tracking-tighter italic mb-6">Stock Sense<span className="text-cyan-500">.</span></h1>
                 <p className="text-stone-600 font-bold text-lg tracking-tight leading-relaxed max-w-xl lowercase">
                    Quant-based equity analysis and institutional market tracking. Direct ledger integration for real-time asset pricing.
                 </p>
              </div>
              
              <div className="bg-[#121212] border border-white/5 rounded-[48px] p-10 flex flex-col justify-between">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/10 text-cyan-500">
                       <BarChart3 size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Market Volatility Index</span>
                 </div>
                 <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={ANALYTICS_MOCK}>
                          <Area type="monotone" dataKey="volatility" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </section>

           <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 mb-24">
              <div className="xl:col-span-2 space-y-6">
                 <div className="flex items-center justify-between mb-8 px-4">
                    <h3 className="text-xs font-black tracking-widest uppercase text-stone-700">Equities List</h3>
                    <Filter size={16} className="text-stone-800" />
                 </div>
                 
                 <div className="space-y-4">
                    {filteredStocks.map((stock) => (
                      <div key={stock.symbol} className="bg-[#121212] border border-white/5 rounded-[32px] p-8 flex items-center justify-between hover:border-white/10 transition-all group cursor-pointer">
                         <div className="flex items-center gap-8">
                            <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center font-black text-xs text-stone-600 group-hover:bg-white group-hover:text-black transition-all">
                               {stock.symbol.slice(0, 1)}
                            </div>
                            <div>
                               <h4 className="text-lg font-black tracking-tighter text-white mb-1 uppercase">{stock.name}</h4>
                               <p className="text-[10px] font-black text-stone-800 tracking-widest">{stock.symbol}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <h4 className="text-xl font-black tracking-tighter text-white mb-1">₹{stock.price}</h4>
                            <div className={`flex items-center justify-end gap-1 text-[10px] font-black ${stock.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                               {stock.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                               {stock.change}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="bg-[#121212] border border-white/5 rounded-[48px] p-10 space-y-10">
                    <div className="flex items-center gap-4">
                       <PieIcon size={18} className="text-stone-700" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-stone-700">Portfolio Distribution</span>
                    </div>
                    <div className="space-y-8">
                       {[
                         { label: "Energy", color: "bg-cyan-500", val: 45 },
                         { label: "Tech", color: "bg-white", val: 32 },
                         { label: "Finance", color: "bg-rose-500", val: 18 },
                         { label: "Other", color: "bg-stone-800", val: 5 },
                       ].map(item => (
                         <div key={item.label} className="space-y-3">
                            <div className="flex justify-between text-[9px] font-black tracking-widest uppercase">
                               <span className="text-stone-400">{item.label}</span>
                               <span className="text-white">{item.val}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                               <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-[#121212] border border-white/5 rounded-[48px] p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-cyan-500/20 group-hover:text-cyan-500/40 transition-colors">
                       <Zap size={48} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-700 mb-6">Execution Signal</h4>
                    <p className="text-xl font-black tracking-tighter italic text-cyan-500 leading-tight uppercase mb-8">
                       Bullish momentum detected in small-cap assets.
                    </p>
                    <button className="flex items-center gap-4 text-[9px] font-black tracking-widest uppercase text-stone-500 hover:text-white transition-colors">
                       Read Analysis <ChevronRight size={12} />
                    </button>
                 </div>

                 <div 
                    onClick={() => navigate("/legacy")}
                    className="bg-[#121212] border border-white/5 rounded-[48px] p-10 relative overflow-hidden group cursor-pointer hover:border-white/20 transition-all shadow-2xl"
                 >
                    <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors">
                       <Globe size={48} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-700 mb-6">Quantum Protocol</h4>
                    <p className="text-xl font-black tracking-tighter italic text-white leading-tight uppercase mb-8">
                       Launch Legacy <span className="text-cyan-500">Nexus-9</span> AI Terminal.
                    </p>
                    <div className="flex items-center gap-4 text-[9px] font-black tracking-widest uppercase text-stone-500 group-hover:text-white transition-colors">
                       Initialize Core <ChevronRight size={12} />
                    </div>
                 </div>
              </div>
           </div>

           <Footer />
        </div>
      </main>
    </div>
  );
}
