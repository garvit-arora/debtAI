import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar";
import Footer from "../ui/Footer";
import { 
  Plus,
  Loader2,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  LayoutGrid,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";

export default function ImpulsePause() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [purchaseName, setPurchaseName] = useState("");
  const [userData, setUserData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const auth = getAuth(app);
  const db = getDatabase(app);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      onValue(ref(db, "users/" + user.uid), (snapshot) => {
        if (snapshot.exists()) setUserData(snapshot.val());
      });
    }
  }, []);

  const runAnalysis = () => {
    if (!purchaseAmount || !userData) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    
    setTimeout(() => {
        const amount = parseFloat(purchaseAmount);
        const income = parseFloat(userData.income || 0);
        const activeDebts = userData.debts ? Object.values(userData.debts).filter(d => d.status !== 'paid') : [];
        const totalDebt = activeDebts.reduce((s,d) => s + (parseFloat(d.remainingAmount || d.amount) || 0), 0) || 1;
        
        const workHours = (amount / (income / 160)).toFixed(1);
        const impact = ((amount / totalDebt) * 100).toFixed(2);
        const isDangerous = amount > (income * 0.1);

        setAnalysis({ workHours, impact, isDangerous });
        setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden uppercase">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userData={userData} />

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-stone-500"><LayoutGrid size={24} /></button>
               <h1 className="text-xl font-black italic tracking-tighter">Budget Logic</h1>
            </div>
            <button onClick={() => navigate(-1)} className="text-[10px] font-black text-stone-700 hover:text-white transition-colors uppercase tracking-[0.2em]">Close</button>
        </header>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-12 py-32 flex flex-col items-center">
           <div className="max-w-xl w-full space-y-32">
              
              <section className="text-center space-y-6">
                 <h2 className="text-5xl font-black tracking-tighter italic">Think Before You Buy<span className="text-stone-800">.</span></h2>
                 <p className="text-stone-700 font-bold text-sm tracking-widest lowercase opacity-60">Intercepting impulse spending through hard debt logic.</p>
              </section>

              <div className="space-y-16">
                 <div className="space-y-4">
                    <label className="text-[9px] font-black text-stone-800 tracking-widest uppercase ml-4">Descriptor</label>
                    <input 
                       type="text" 
                       value={purchaseName} 
                       onChange={(e) => setPurchaseName(e.target.value)} 
                       placeholder="Luxury Watch / Trip" 
                       className="w-full bg-transparent text-white text-4xl font-black outline-none border-b-2 border-white/5 focus:border-white transition-all py-6 px-4 placeholder:text-stone-900" 
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[9px] font-black text-stone-800 tracking-widest uppercase ml-4">Capital (₹)</label>
                    <input 
                       type="number" 
                       value={purchaseAmount} 
                       onChange={(e) => setPurchaseAmount(e.target.value)} 
                       placeholder="0" 
                       className="w-full bg-transparent text-white text-7xl font-black outline-none border-b-2 border-white/5 focus:border-white transition-all py-6 px-4 placeholder:text-stone-900" 
                    />
                 </div>

                 <button 
                    onClick={runAnalysis} 
                    disabled={isAnalyzing || !purchaseAmount}
                    className="w-full py-8 bg-white text-black rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] active:scale-95 transition-all shadow-3xl disabled:opacity-20 flex items-center justify-center gap-4"
                 >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={24} /> : <>Run AI Sync <ArrowRight size={20} /></>}
                 </button>
              </div>

              {analysis && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-16 py-12 border-t border-white/5">
                   <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-2">
                         <h4 className="text-[10px] font-black text-stone-700 tracking-widest uppercase">Life-Hours Lost</h4>
                         <p className="text-5xl font-black text-white italic tracking-tighter">{analysis.workHours}</p>
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-[10px] font-black text-stone-700 tracking-widest uppercase">Debt Friction</h4>
                         <p className="text-5xl font-black text-white italic tracking-tighter">+{analysis.impact}%</p>
                      </div>
                   </div>

                   <div className={`p-8 rounded-[32px] border text-center ${analysis.isDangerous ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-white/5 border-white/10 text-white'}`}>
                      <p className="text-xs font-black italic tracking-tight uppercase leading-relaxed">
                         Intervention: Redirecting these funds to your debt principal yields a 4.2x increase in freedom velocity.
                      </p>
                   </div>
                </div>
              )}
           </div>

           <Footer className="w-full mt-40" />
        </div>
      </main>
    </div>
  );
}
