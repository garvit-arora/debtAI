import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar";
import Footer from "../ui/Footer";
import { 
  TrendingUp, 
  Search, 
  ArrowUpRight, 
  LayoutGrid, 
  Loader2,
  Filter,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../firebase";

const MF_MOCK_DATA = [
  { name: "Quant Small Cap Fund", nav: "245.40", return3Y: "45.2%", category: "Equity" },
  { name: "Parag Parikh Flexi Cap", nav: "78.12", return3Y: "24.8%", category: "Equity" },
  { name: "ICICI Prudential Bluechip", nav: "112.45", return3Y: "18.5%", category: "Equity" },
  { name: "HDFC Top 100", nav: "985.30", return3Y: "21.2%", category: "Equity" },
  { icon: "growth", name: "SBI Contra Fund", nav: "312.10", return3Y: "29.4%", category: "Equity" },
  { name: "Nippon India Small Cap", nav: "156.20", return3Y: "38.7%", category: "Equity" },
  { name: "Mirae Asset Large Cap", nav: "98.45", return3Y: "15.9%", category: "Equity" },
];

export default function MutualFunds() {
  const navigate = useNavigate();
  const [funds, setFunds] = useState([]);
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
        setTimeout(() => {
          setFunds(MF_MOCK_DATA);
          setLoading(false);
        }, 1000);
      } else navigate("/login");
    });
    return unsub;
  }, []);

  const filteredFunds = funds.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden uppercase tracking-tight">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-stone-400"><LayoutGrid size={24} /></button>
               <h1 className="text-xl font-black italic tracking-tighter">Welcome {userData?.name?.split(' ')[0] || 'Garvit'}</h1>
            </div>
            <button onClick={() => navigate("/dashboard")} className="px-6 py-2 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Back</button>
        </header>

        <div className="flex-1 overflow-y-auto px-12 py-12 hide-scrollbar pb-32">
           <section className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-4">
                 <h1 className="text-6xl font-black tracking-tighter italic">Growth Funds<span className="text-cyan-500">.</span></h1>
                 <p className="text-stone-600 font-bold text-lg tracking-tight">Institutional grade equity tracking and performance.</p>
              </div>
              <div className="flex bg-white/5 border border-white/5 rounded-2xl px-6 py-4 items-center gap-4 w-full max-w-md">
                 <Search size={18} className="text-stone-700" />
                 <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search funds..." 
                    className="bg-transparent border-none outline-none text-xs font-black w-full tracking-widest placeholder:text-stone-800" 
                 />
              </div>
           </section>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-64 bg-white/5 animate-pulse rounded-[40px] border border-white/5"></div>
                ))
              ) : filteredFunds.map((fund, i) => (
                <div key={i} className="bg-[#121212] border border-white/5 rounded-[40px] p-8 hover:border-white/10 transition-all group">
                   <div className="flex justify-end items-start mb-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{fund.return3Y} 3Y</span>
                   </div>
                   <div className="mb-8">
                      <h3 className="text-2xl font-black tracking-tighter text-stone-200 uppercase truncate mb-1">{fund.name}</h3>
                      <p className="text-[10px] font-black text-stone-800 tracking-[0.2em]">{fund.category} Module</p>
                   </div>
                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[9px] font-black text-stone-800 tracking-widest mb-1 uppercase">NAV</p>
                         <p className="text-xl font-bold text-white tracking-tighter">₹{fund.nav}</p>
                      </div>
                      <button className="flex items-center gap-2 group-hover:text-cyan-500 transition-colors">
                         <span className="text-[10px] font-black tracking-widest uppercase">Invest</span>
                         <ArrowUpRight size={18} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
           
           <Footer />
        </div>
      </main>
    </div>
  );
}
