import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar";
import { getDatabase, ref, onValue, update, push, remove } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useTheme } from "../../context/ThemeContext";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Plus, 
  Edit2, 
  X,
  Zap,
  TrendingDown,
  DollarSign,
  Trash2,
  Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PendingDebts = () => {
  const { isDarkMode } = useTheme();
  const [activeDebts, setActiveDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [extraPayment, setExtraPayment] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDate: "",
    interestRate: "",
    stressLevel: "Medium"
  });

  const auth = getAuth();
  const db = getDatabase();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const debtsRef = ref(db, `users/${currentUser.uid}/debts`);
        onValue(debtsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const loadedDebts = Object.keys(data).map((key) => ({ id: key, ...data[key] })).filter((debt) => debt.status !== "paid"); 
            loadedDebts.sort((a, b) => {
                const stressOrder = { "Extreme": 4, "High": 3, "Medium": 2, "Low": 1 };
                const stressDiff = (stressOrder[b.stressLevel] || 0) - (stressOrder[a.stressLevel] || 0);
                if (stressDiff !== 0) return stressDiff;
                return parseFloat(b.interestRate) - parseFloat(a.interestRate);
            });
            setActiveDebts(loadedDebts);
          } else {
            setActiveDebts([]);
          }
          setLoading(false);
        });
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, db, navigate]);

  const totalDebt = activeDebts.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
  const avgInterest = activeDebts.length > 0 ? (activeDebts.reduce((sum, d) => sum + parseFloat(d.interestRate || 0), 0) / activeDebts.length).toFixed(1) : 0;

  const calculateFreedomDate = () => {
    if (totalDebt === 0) return "Now!";
    const monthlyPay = (totalDebt * 0.02) + extraPayment;
    if (monthlyPay <= 0) return "Never";
    const months = Math.ceil(totalDebt / monthlyPay);
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleOpenModal = (debt = null) => {
    if (debt) {
      setEditingId(debt.id);
      setFormData({ name: debt.name, amount: debt.amount, dueDate: debt.dueDate, interestRate: debt.interestRate || "0", stressLevel: debt.stressLevel || "Medium" });
    } else {
      setEditingId(null);
      setFormData({ name: "", amount: "", dueDate: "", interestRate: "", stressLevel: "Medium" });
    }
    setIsModalOpen(true);
  };

  const handleSaveDebt = async (e) => {
    e.preventDefault();
    if (!user) return;
    const payload = { ...formData, amount: parseFloat(formData.amount), interestRate: parseFloat(formData.interestRate) };
    if (editingId) {
      await update(ref(db, `users/${user.uid}/debts/${editingId}`), payload);
    } else {
      await push(ref(db, `users/${user.uid}/debts`), { ...payload, status: "pending", createdAt: new Date().toISOString() });
    }
    setIsModalOpen(false);
  };

  const markAsPaid = async (debtId) => {
    if (!window.confirm("Congratulations! Mark as paid?")) return;
    await update(ref(db, `users/${user.uid}/debts/${debtId}`), { status: "paid" });
  };

  const deleteDebt = async (debtId) => {
    if (!window.confirm("Delete this record?")) return;
    await remove(ref(db, `users/${user.uid}/debts/${debtId}`));
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-background text-foreground animate-pulse">Analyzing Obligations...</div>;

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[40] md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-[50] w-64 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 p-2 text-foreground z-50"><X size={24} /></button>
        <Sidebar aria-hidden={!isMobileMenuOpen} />
      </div>

      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 md:ml-32 p-6 md:p-12 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <div className="flex items-start gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 hover:bg-secondary rounded-xl md:hidden transition-colors"><Menu size={28} /></button>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Debt Center</h1>
                <p className="text-muted text-lg mt-2 font-medium">Strategic organization for financial freedom.</p>
              </div>
            </div>
            <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-3 px-8 py-4 w-full md:w-auto justify-center shadow-lg"><Plus size={20} /> Add Obligation</button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="card-theme p-8 light-mode-shadow flex flex-col justify-between h-44 hover:bg-secondary transition-all">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted">Total Outstanding</span>
                    <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl"><DollarSign size={22}/></div>
                </div>
                <div className="text-4xl font-bold font-mono tracking-tighter">₹{totalDebt.toLocaleString()}</div>
            </div>

            <div className="card-theme p-8 light-mode-shadow flex flex-col justify-between h-44 hover:bg-secondary transition-all">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted">Avg. Rate (APR)</span>
                    <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl"><TrendingDown size={22}/></div>
                </div>
                <div className="text-4xl font-bold font-mono tracking-tighter">{avgInterest}%</div>
            </div>

            <div className="bg-black text-white p-8 rounded-[32px] shadow-xl flex flex-col justify-between h-44 relative overflow-hidden group border border-white/10">
                <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform"><Zap size={100} /></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Freedom Forecast</span>
                        <span className="text-xl font-bold text-emerald-400">{calculateFreedomDate()}</span>
                    </div>
                    <div>
                        <input type="range" min="0" max="10000" step="100" value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value))} className="w-full h-2.5 bg-background/20 rounded-full appearance-none cursor-pointer mb-3" />
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                            <span>Accelerate: ₹{extraPayment}/mo</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <section className="space-y-8">
            <h3 className="text-2xl font-bold flex items-center gap-3">
                <AlertCircle size={24} className="text-red-500"/> Active Accounts ({activeDebts.length})
            </h3>

            {activeDebts.length === 0 ? (
                <div className="card-theme py-24 flex flex-col items-center text-center light-mode-shadow border-dashed">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6"><CheckCircle2 className="text-emerald-500" size={40} /></div>
                    <h2 className="text-3xl font-bold mb-2">Maximum Liquidity reached</h2>
                    <p className="text-muted font-medium">You have zero pending debts. Absolute freedom achieved.</p>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                    {activeDebts.map((debt) => {
                        const daysLeft = Math.ceil((new Date(debt.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                        const isOverdue = daysLeft < 0;
                        const stressColor = debt.stressLevel === 'Extreme' ? 'text-red-500 border-red-500/20 bg-red-500/5' : debt.stressLevel === 'High' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' : 'text-blue-500 border-blue-500/20 bg-blue-500/5';

                        return (
                            <div key={debt.id} className="card-theme p-8 light-mode-shadow relative overflow-hidden transition-all border-border group">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${stressColor}`}>
                                            {debt.stressLevel} Intensity
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenModal(debt)} className="p-2.5 bg-secondary rounded-xl text-muted hover:text-foreground transition-colors"><Edit2 size={16} /></button>
                                            <button onClick={() => deleteDebt(debt.id)} className="p-2.5 bg-secondary rounded-xl text-muted hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-3xl font-bold tracking-tight mb-2">{debt.name}</h3>
                                        <div className="flex items-end gap-3">
                                            <span className="text-4xl font-mono tracking-tighter">₹{parseFloat(debt.amount).toLocaleString()}</span>
                                            <span className="text-sm font-bold text-muted mb-1.5">{debt.interestRate}% APR</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-border">
                                        <div className={`flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest ${isOverdue ? "text-red-500 animate-pulse" : "text-muted"}`}>
                                            <Clock size={16} /> 
                                            {isOverdue ? `Expired ${Math.abs(daysLeft)} days ago` : `Expires in ${daysLeft} days`}
                                        </div>
                                        <button onClick={() => markAsPaid(debt.id)} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-transform">RESOLVE <ArrowRight size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
          </section>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-card border border-border rounded-[40px] w-full max-w-lg p-10 shadow-3xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2.5 bg-secondary rounded-full text-muted hover:text-foreground transition-all"><X size={20} /></button>
            <h2 className="text-3xl font-bold mb-10">{editingId ? "Edit Obligation" : "New Liability"}</h2>
            <form onSubmit={handleSaveDebt} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Entry Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-theme w-full p-4 outline-none focus:ring-2 focus:ring-foreground/5" placeholder="e.g. Credit Card X" required />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-60">Volume (₹)</label>
                  <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="input-theme w-full p-4 outline-none focus:ring-2 focus:ring-foreground/5" placeholder="5000" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-60">Coefficient (%)</label>
                  <input type="number" value={formData.interestRate} onChange={(e) => setFormData({...formData, interestRate: e.target.value})} className="input-theme w-full p-4 outline-none focus:ring-2 focus:ring-foreground/5" placeholder="18" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Psychological Stress</label>
                <div className="grid grid-cols-4 gap-3">
                    {["Low", "Medium", "High", "Extreme"].map((level) => (<button key={level} type="button" onClick={() => setFormData({...formData, stressLevel: level})} className={`py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${formData.stressLevel === level ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted hover:bg-secondary"}`}>{level}</button>))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Termination Date</label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="input-theme w-full p-4 outline-none focus:ring-2 focus:ring-foreground/5" required />
              </div>
              <button type="submit" className="btn-primary w-full py-5 text-lg shadow-xl">{editingId ? "Update Registry" : "Initialize Entry"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingDebts;