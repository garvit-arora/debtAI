import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../ui/Sidebar";
import Footer from "../ui/Footer";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { app } from "../../firebase";
import { 
  User, 
  ShieldCheck, 
  Bell, 
  Lock, 
  Trash2, 
  ChevronRight, 
  LayoutGrid,
  Loader2,
  X,
  FileText,
  Edit3,
  Repeat,
  Calendar,
  Zap,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePopup } from "../../context/PopupContext";

const SettingSection = ({ title, children }) => (
  <div className="bg-[#0f0f0f] border border-white/5 rounded-[48px] p-10 space-y-8">
     <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">{title}</h3>
     <div className="space-y-6">{children}</div>
  </div>
);

const SettingItem = ({ label, desc, onClick, icon: Icon, color = "text-stone-500" }) => (
  <div onClick={onClick} className="flex justify-between items-center group cursor-pointer hover:bg-white/5 p-4 rounded-3xl transition-all border border-transparent hover:border-white/5">
     <div className="flex items-center gap-6">
        <div className={`p-4 rounded-2xl bg-[#050505] border border-white/5 ${color}`}><Icon size={20} /></div>
        <div>
           <p className="text-xs font-black tracking-widest text-white uppercase">{label}</p>
           <p className="text-[10px] font-bold text-stone-700 tracking-tight lowercase">{desc}</p>
        </div>
     </div>
     <ChevronRight size={18} className="text-stone-800 group-hover:text-white transition-colors" />
  </div>
);

export default function Settings() {
  const [userData, setUserData] = useState(null);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { showPopup } = usePopup();
  const auth = getAuth(app);
  const db = getDatabase(app);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        onValue(ref(db, `users/${u.uid}`), (snap) => {
           if (snap.exists()) {
             const data = snap.val();
             setUserData(data);
             const debtList = data.debts ? Object.entries(data.debts).map(([id, v]) => ({ id, ...v })) : [];
             
             // APPLY STRATEGIC SORTING
             const strategy = data.strategy || "interest_first";
             debtList.sort((a, b) => {
                if (strategy === "interest_first") return parseFloat(b.interest || b.interestRate) - parseFloat(a.interest || a.interestRate);
                if (strategy === "amount_first") return parseFloat(a.amount) - parseFloat(b.amount);
                if (strategy === "stress_priority" || strategy === "stress_first") return (parseInt(b.stress) || 0) - (parseInt(a.stress) || 0);
                return 0;
             });
             setDebts(debtList);
           }
           setLoading(false);
        });
      } else navigate("/login");
    });
    return unsub;
  }, []);

  const deleteDebt = async (id) => {
     if(window.confirm("Permanently remove this liability?")) {
        await remove(ref(db, `users/${auth.currentUser.uid}/debts/${id}`));
        showPopup({ title: "Liability Purged", message: "Account has been disconnected.", type: "success" });
     }
  };

  const saveEdit = async () => {
    if(!editingDebt || !auth.currentUser) return;
    setIsUpdating(true);
    try {
      await update(ref(db, `users/${auth.currentUser.uid}/debts/${editingDebt.id}`), {
        ...editingDebt,
        amount: parseFloat(editingDebt.amount) || 0,
        interest: parseFloat(editingDebt.interest || editingDebt.interestRate) || 0,
        isRecurring: editingDebt.isRecurring === true || editingDebt.isRecurring === 'true'
      });
      showPopup({ title: "Sync Success", message: "Liability configuration updated.", type: "success" });
      setEditingDebt(null);
    } catch(e) {
      showPopup({ title: "Sync Error", message: "Failed to update record.", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-white" size={48} /></div>;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden uppercase">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] sticky top-0 z-40">
            <div className="flex items-center gap-6">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-stone-400"><LayoutGrid size={24} /></button>
                <h1 className="text-xl font-black italic tracking-tighter">System Settings</h1>
            </div>
            <button onClick={() => navigate(-1)} className="px-6 py-2 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Back</button>
        </header>

        <div className="flex-1 overflow-y-auto px-12 py-12 hide-scrollbar space-y-12">
           <div className="max-w-4xl mx-auto space-y-12 pb-32">
              <section className="space-y-4">
                 <h1 className="text-7xl font-black tracking-tighter italic">Configuration<span className="text-rose-500">.</span></h1>
                 <p className="text-stone-600 font-bold text-lg tracking-tight lowercase">Manage liabilities sorted by your <span className="text-white">"{userData?.strategy?.replace('_', ' ')}"</span> strategy.</p>
              </section>

              <SettingSection title="Active Liabilities">
                 {debts.map((d, i) => (
                    <div key={d.id} className="flex justify-between items-center bg-black border border-white/5 rounded-[40px] p-8 hover:border-white/10 transition-all group">
                       <div className="flex items-center gap-8">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-stone-800 font-black text-xs">{i + 1}</div>
                          <div>
                             <div className="flex items-center gap-2 mb-1">
                                <p className="text-lg font-black text-white uppercase tracking-tighter">{d.name}</p>
                                {d.isRecurring && <Repeat size={12} className="text-cyan-500" />}
                             </div>
                             <p className="text-[10px] font-bold text-stone-700 tracking-tight uppercase">
                                ₹{parseFloat(d.amount).toLocaleString()} • {d.interest || d.interestRate}% APR • {d.stress || 0} Stress
                             </p>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <button onClick={() => setEditingDebt(d)} className="p-4 rounded-2xl bg-white/5 text-stone-500 hover:text-white group-hover:bg-white group-hover:text-black transition-all"><Edit3 size={16}/></button>
                          <button onClick={() => deleteDebt(d.id)} className="p-4 rounded-2xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                       </div>
                    </div>
                 ))}
                 {debts.length === 0 && <p className="text-center py-8 text-stone-800 font-black text-[10px] tracking-widest uppercase">No active records</p>}
                 <button onClick={() => navigate('/pending')} className="w-full py-6 bg-white text-black rounded-[32px] text-[10px] font-black tracking-widest uppercase active:scale-95 transition-all mt-4 shadow-xl">Add new debt entry</button>
              </SettingSection>

              <SettingSection title="Account Identity">
                 <SettingItem label="Personal Profile" desc="Identity, income, and communication." icon={User} onClick={() => navigate('/profile')} />
                 <SettingItem label="Architecture Rules" desc="Change debt payoff strategies." icon={Zap} color="text-cyan-500" onClick={() => navigate('/profile')} />
              </SettingSection>

              <div className="pt-12 text-center">
                 <p className="text-[10px] font-black text-stone-900 tracking-widest uppercase tracking-[0.5em]">DebtAI OS v2.4.0</p>
              </div>
           </div>
           <Footer />
        </div>
      </main>

      {/* EDIT DEBT MODAL */}
      {editingDebt && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-[#0d0d0d] border border-white/10 rounded-[56px] p-16 w-full max-w-2xl shadow-3xl relative uppercase">
              <button onClick={() => setEditingDebt(null)} className="absolute top-12 right-12 p-2 text-stone-500 hover:text-white"><X size={24}/></button>
              <h2 className="text-4xl font-black italic tracking-tighter mb-12">Edit Asset Protocol</h2>
              
              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-800 px-1 tracking-widest">Descriptor</label>
                    <input type="text" value={editingDebt.name} onChange={(e) => setEditingDebt({...editingDebt, name: e.target.value})} className="w-full bg-black border border-white/5 rounded-[24px] p-6 text-sm font-black outline-none focus:border-white/20" />
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-stone-800 px-1 tracking-widest">Amount (₹)</label>
                       <input type="number" value={editingDebt.amount} onChange={(e) => setEditingDebt({...editingDebt, amount: e.target.value})} className="w-full bg-black border border-white/5 rounded-[24px] p-6 text-sm font-black outline-none focus:border-white/20" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-stone-800 px-1 tracking-widest">APR (%)</label>
                       <input type="number" value={editingDebt.interest || editingDebt.interestRate} onChange={(e) => setEditingDebt({...editingDebt, interest: e.target.value})} className="w-full bg-black border border-white/5 rounded-[24px] p-6 text-sm font-black outline-none focus:border-white/20" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-stone-800 px-1 tracking-widest">Recurring Protocol</label>
                       <div className="flex p-1 bg-black border border-white/5 rounded-[24px]">
                          <button onClick={() => setEditingDebt({...editingDebt, isRecurring: false})} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase transition-all ${editingDebt.isRecurring === false || editingDebt.isRecurring === 'false' ? 'bg-white text-black' : 'text-stone-600'}`}>One-time</button>
                          <button onClick={() => setEditingDebt({...editingDebt, isRecurring: true})} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase transition-all ${editingDebt.isRecurring === true || editingDebt.isRecurring === 'true' ? 'bg-white text-black' : 'text-stone-600'}`}>Monthly</button>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-stone-800 px-1 tracking-widest">Final Maturity Date</label>
                       <input type="date" value={editingDebt.finalDate || ""} onChange={(e) => setEditingDebt({...editingDebt, finalDate: e.target.value})} className="w-full bg-black border border-white/5 rounded-[24px] p-6 text-sm font-black outline-none focus:border-white/20" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-800 px-1 tracking-widest">Anxiety Quotient (1-10)</label>
                    <input type="number" value={editingDebt.stress || 5} onChange={(e) => setEditingDebt({...editingDebt, stress: e.target.value})} className="w-full bg-black border border-white/5 rounded-[24px] p-6 text-sm font-black outline-none focus:border-white/20" min="1" max="10" />
                 </div>

                 <button onClick={saveEdit} disabled={isUpdating} className="w-full py-8 bg-white text-black rounded-[32px] text-xs font-black tracking-[0.4em] active:scale-95 transition-all mt-6 shadow-3xl">
                    {isUpdating ? <Loader2 className="animate-spin" size={24} /> : <span className="flex items-center justify-center gap-4"><Check size={20} /> Patch Record</span>}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
