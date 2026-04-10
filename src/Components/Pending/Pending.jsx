import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar";
import Footer from "../ui/Footer";
import { getDatabase, ref, onValue, update, push, remove } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useTheme } from "../../context/ThemeContext";
import { 
  CheckCircle2, 
  Clock, 
  Plus, 
  Edit2, 
  X,
  TrendingDown,
  Trash2,
  LayoutGrid,
  User,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MetricCard = ({ title, value, change }) => (
  <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8 flex flex-col justify-between h-44 hover:border-white/10 transition-all">
    <div className="flex justify-between items-start">
      <h3 className="text-xl font-black text-stone-200 uppercase tracking-tighter leading-none">{title}</h3>
      {change && (
        <span className={`text-[9px] font-black uppercase tracking-widest ${change.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}`}>
          {change}
        </span>
      )}
    </div>
    <div>
      <h2 className="text-2xl font-black text-white tracking-tighter">{value}</h2>
      <div className="w-full h-1 bg-white/5 rounded-full mt-4"></div>
    </div>
  </div>
);

const DebtCard = ({ debt, onEdit, onDelete, onPay }) => {
  const daysLeft = Math.ceil((new Date(debt.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  const remaining = parseFloat(debt.remainingAmount || debt.amount);
  const total = parseFloat(debt.amount);
  const progress = Math.round(((total - remaining) / total) * 100);
  
  return (
    <div className="bg-[#121212] border border-white/5 rounded-[40px] p-8 hover:border-white/10 transition-all group relative overflow-hidden uppercase">
      <div className="flex justify-between items-start mb-8">
        <div>
           <h4 className="text-xl font-black text-white group-hover:text-cyan-500 transition-colors uppercase tracking-tight">{debt.name}</h4>
           <div className="flex items-center gap-2 mt-2">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                debt.stressLevel === 'Extreme' ? 'bg-rose-500/10 text-rose-500' : 
                debt.stressLevel === 'High' ? 'bg-orange-500/10 text-orange-500' :
                'bg-emerald-500/10 text-emerald-500'
              }`}>{debt.stressLevel || 'Normal'} Stress</span>
           </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => onEdit(debt)} className="p-2 text-stone-800 hover:text-white transition-colors"><Edit2 size={16} /></button>
           <button onClick={() => onDelete(debt.id)} className="p-2 text-stone-800 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold text-stone-700 uppercase tracking-widest mb-8">
         <Clock size={12} /> {debt.dueDate} ({daysLeft} days left)
      </div>

      <div className="space-y-4 mb-8">
         <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-800">Payment Progress</span>
            <span className="text-xs font-black text-white">{progress}%</span>
         </div>
         <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
         </div>
      </div>

      <div className="flex justify-between items-end">
         <div>
            <p className="text-[9px] font-black text-stone-800 tracking-widest mb-1">Remaining Balance</p>
            <p className="text-2xl font-black text-white tracking-tighter">₹{remaining.toLocaleString()}</p>
         </div>
         <button onClick={() => onPay(debt)} className="px-6 py-2.5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Settle</button>
      </div>
    </div>
  );
};

const PendingDebts = () => {
  const [activeDebts, setActiveDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", amount: "", dueDate: "", interestRate: "", stressLevel: "Normal" });

  const auth = getAuth();
  const db = getDatabase();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        onValue(ref(db, `users/${currentUser.uid}/debts`), (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const loaded = Object.keys(data).map((key) => ({ id: key, ...data[key] })).filter((d) => d.status !== "paid"); 
            loaded.sort((a, b) => (parseFloat(b.interestRate) || 0) - (parseFloat(a.interestRate) || 0));
            setActiveDebts(loaded);
          } else setActiveDebts([]);
          setLoading(false);
        });
      } else navigate("/login");
    });
    return () => unsubscribe();
  }, []);

  const totalDebt = activeDebts.reduce((sum, d) => sum + parseFloat(d.remainingAmount || d.amount || 0), 0);
  const avgInterest = activeDebts.length > 0 ? (activeDebts.reduce((sum, d) => sum + parseFloat(d.interestRate || 0), 0) / activeDebts.length).toFixed(1) : 0;

  const handleOpenModal = (debt = null) => {
    if (debt) {
      setEditingId(debt.id);
      setFormData({ name: debt.name, amount: debt.amount, dueDate: debt.dueDate, interestRate: debt.interestRate || "0", stressLevel: debt.stressLevel || "Normal" });
    } else {
      setEditingId(null);
      setFormData({ name: "", amount: "", dueDate: "", interestRate: "", stressLevel: "Normal" });
    }
    setIsModalOpen(true);
  };

  const handleSaveDebt = async (e) => {
    e.preventDefault();
    if (!user) return;
    const payload = { ...formData, amount: parseFloat(formData.amount), remainingAmount: parseFloat(formData.amount), interestRate: parseFloat(formData.interestRate) || 0 };
    if (editingId) {
      await update(ref(db, `users/${user.uid}/debts/${editingId}`), payload);
    } else {
      await push(ref(db, `users/${user.uid}/debts`), { ...payload, status: "pending", createdAt: new Date().toISOString() });
    }
    setIsModalOpen(false);
  };

  const handleRepay = async (e) => {
    e.preventDefault();
    if (!user || !selectedDebt) return;
    const amountToPay = parseFloat(payAmount);
    const currentRemaining = parseFloat(selectedDebt.remainingAmount || selectedDebt.amount);
    const newRemaining = Math.max(0, currentRemaining - amountToPay);
    const updates = { remainingAmount: newRemaining };
    if (newRemaining === 0) updates.status = "paid";
    await update(ref(db, `users/${user.uid}/debts/${selectedDebt.id}`), updates);
    await push(ref(db, `users/${user.uid}/transactions`), { amount: amountToPay, category: `Repaid: ${selectedDebt.name}`, date: new Date().toISOString().split('T')[0], type: 'debt_payment' });
    setIsPayModalOpen(false);
    setPayAmount("");
    setSelectedDebt(null);
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#050505] text-white"><Loader2 className="animate-spin" size={48} /></div>;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden uppercase tracking-tight">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-stone-400"><LayoutGrid size={24} /></button>
               <h2 className="text-xl font-black text-white italic tracking-tighter">My Debts</h2>
            </div>
            <div className="flex items-center gap-8">
               <button onClick={() => handleOpenModal()} className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl active:scale-90 transition-all"><Plus size={24} /></button>
               <div onClick={() => navigate("/profile")} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all"><User size={22} /></div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto px-12 py-12 hide-scrollbar">
           <section className="mb-12">
              <h1 className="text-6xl font-black tracking-tighter mb-2 italic">Debt Tracker<span className="text-stone-800">.</span></h1>
           </section>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <MetricCard title="Total Owed" value={`₹${totalDebt.toLocaleString()}`} />
              <MetricCard title="Average Interest" value={`${avgInterest}%`} />
              <MetricCard title="Total Count" value={activeDebts.length} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {activeDebts.length > 0 ? activeDebts.map((debt) => (
                <DebtCard key={debt.id} debt={debt} onEdit={handleOpenModal} onDelete={(id) => remove(ref(db, `users/${user.uid}/debts/${id}`))} onPay={(d) => { setSelectedDebt(d); setIsPayModalOpen(true); }} />
              )) : (
                <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[48px] opacity-20 text-center">
                   <p className="text-xl font-black uppercase tracking-widest">No Active Debts Found</p>
                </div>
              )}
           </div>

           <Footer />
        </div>
      </main>

      {/* REPAY MODAL */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-[48px] w-full max-w-sm p-12 shadow-3xl relative uppercase">
            <button onClick={() => setIsPayModalOpen(false)} className="absolute top-10 right-10 p-2 text-stone-500 hover:text-white"><X size={24} /></button>
            <h2 className="text-3xl font-black italic tracking-tighter mb-8 text-white">Repay</h2>
            <form onSubmit={handleRepay} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-800 px-1 uppercase tracking-widest">Amount (₹)</label>
                  <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder={`Max: ${parseFloat(selectedDebt?.remainingAmount || selectedDebt?.amount)}`} className="w-full bg-black border border-white/5 rounded-3xl p-5 text-sm font-bold outline-none focus:border-white/20" required />
               </div>
               <button type="submit" className="w-full py-6 bg-white text-black rounded-[32px] text-xs font-black uppercase tracking-widest active:scale-95 transition-all">Confirm</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-[48px] w-full max-w-lg p-12 shadow-3xl relative uppercase">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-2 text-stone-500 hover:text-white"><X size={24} /></button>
            <h2 className="text-4xl font-black italic tracking-tighter mb-10 text-white truncate">{editingId ? "Update Debt" : "Add New Debt"}</h2>
            <form onSubmit={handleSaveDebt} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-800 px-1">Descriptor</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/5 rounded-3xl p-5 text-sm font-bold outline-none focus:border-white/20" placeholder="e.g. Bank Loan" required />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-stone-800 px-1">Amount (₹)</label>
                   <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-black border border-white/5 rounded-3xl p-5 text-sm font-bold outline-none focus:border-white/20" required />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-stone-800 px-1">Interest (%)</label>
                   <input type="number" value={formData.interestRate} onChange={(e) => setFormData({...formData, interestRate: e.target.value})} className="w-full bg-black border border-white/5 rounded-3xl p-5 text-sm font-bold outline-none focus:border-white/20" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-stone-800 px-1">Due Date</label>
                   <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-black border border-white/5 rounded-3xl p-5 text-sm font-bold outline-none focus:border-white/20" required />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-stone-800 px-1">Stress Level</label>
                   <select value={formData.stressLevel} onChange={(e) => setFormData({...formData, stressLevel: e.target.value})} className="w-full bg-black border border-white/5 rounded-3xl p-5 text-sm font-black outline-none focus:border-white/20 appearance-none">
                      <option value="Normal">Normal</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Extreme">Extreme</option>
                   </select>
                 </div>
              </div>
              <button type="submit" className="w-full py-6 bg-white text-black rounded-[32px] text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">{editingId ? "Update Record" : "Save Record"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingDebts;