import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar";
import { getDatabase, ref, onValue, update, push, remove } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { 
  Calendar, 
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
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PendingDebts = () => {
  const [activeDebts, setActiveDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Payoff Simulator State
  const [extraPayment, setExtraPayment] = useState(0);

  // Modal State
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

  // 1. Auth & Data Fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const debtsRef = ref(db, `users/${currentUser.uid}/debts`);
        
        onValue(debtsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const loadedDebts = Object.keys(data)
              .map((key) => ({
                id: key,
                ...data[key],
              }))
              .filter((debt) => debt.status !== "paid"); 

            // Sort: Extreme stress first, then High Interest
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

  // --- CALCULATIONS ---
  const totalDebt = activeDebts.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
  const avgInterest = activeDebts.length > 0 
    ? (activeDebts.reduce((sum, d) => sum + parseFloat(d.interestRate || 0), 0) / activeDebts.length).toFixed(1) 
    : 0;

  // Simulator Logic
  const calculateFreedomDate = () => {
    if (totalDebt === 0) return "Now!";
    // Assume 2% minimum payment + extra payment
    const monthlyPay = (totalDebt * 0.02) + extraPayment;
    if (monthlyPay <= 0) return "Never";
    const months = Math.ceil(totalDebt / monthlyPay);
    
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // --- ACTIONS ---
  const handleOpenModal = (debt = null) => {
    if (debt) {
      setEditingId(debt.id);
      setFormData({
        name: debt.name,
        amount: debt.amount,
        dueDate: debt.dueDate,
        interestRate: debt.interestRate || "0",
        stressLevel: debt.stressLevel || "Medium"
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", amount: "", dueDate: "", interestRate: "", stressLevel: "Medium" });
    }
    setIsModalOpen(true);
  };

  const handleSaveDebt = async (e) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      interestRate: parseFloat(formData.interestRate),
      stressLevel: formData.stressLevel
    };

    if (editingId) {
      await update(ref(db, `users/${user.uid}/debts/${editingId}`), payload);
    } else {
      await push(ref(db, `users/${user.uid}/debts`), {
        ...payload,
        status: "pending",
        createdAt: new Date().toISOString()
      });
    }
    setIsModalOpen(false);
  };

  const markAsPaid = async (debtId) => {
    if (!window.confirm("Congratulations! Mark this debt as fully paid?")) return;
    await update(ref(db, `users/${user.uid}/debts/${debtId}`), { status: "paid" });
  };

  const deleteDebt = async (debtId) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    await remove(ref(db, `users/${user.uid}/debts/${debtId}`));
  };

  const getStressColor = (level) => {
    switch(level) {
      case "Low": return "bg-blue-100 text-blue-700 border-blue-200";
      case "High": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Extreme": return "bg-red-100 text-red-700 border-red-200 animate-pulse";
      default: return "bg-stone-200 text-stone-600 border-stone-300";
    }
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#f8ecdd]">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#f8ecdd] font-sans relative">
      <div className="z-50 hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 md:ml-28 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#5B2D2D] mb-2">Debt Tracker</h1>
              <p className="text-[#5B2D2D]/70 text-lg">Organize, visualize, and eliminate your liabilities.</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-[#5B2D2D] text-[#f8ecdd] px-6 py-3 rounded-full font-bold hover:scale-105 hover:shadow-lg transition-all"
            >
              <Plus size={20} /> Add New Debt
            </button>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-[30px] border border-stone-100 shadow-sm flex flex-col justify-between h-40">
                <div className="flex justify-between items-start">
                    <span className="text-stone-400 font-bold text-sm uppercase tracking-wider">Total Outstanding</span>
                    <div className="p-2 bg-red-50 text-red-500 rounded-full"><DollarSign size={20}/></div>
                </div>
                <div className="text-4xl font-bold text-[#5B2D2D]">${totalDebt.toLocaleString()}</div>
            </div>

            <div className="bg-white p-6 rounded-[30px] border border-stone-100 shadow-sm flex flex-col justify-between h-40">
                <div className="flex justify-between items-start">
                    <span className="text-stone-400 font-bold text-sm uppercase tracking-wider">Avg. Interest Rate</span>
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-full"><TrendingDown size={20}/></div>
                </div>
                <div className="text-4xl font-bold text-[#5B2D2D]">{avgInterest}%</div>
            </div>

            {/* PAYOFF SIMULATOR */}
            <div className="bg-[#5B2D2D] p-6 rounded-[30px] text-white shadow-lg flex flex-col justify-between h-40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80} /></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/60 font-bold text-xs uppercase tracking-wider">Debt Free Estimate</span>
                        <span className="text-xl font-bold text-yellow-400">{calculateFreedomDate()}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="2000" 
                        step="50"
                        value={extraPayment}
                        onChange={(e) => setExtraPayment(Number(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer mb-2 accent-yellow-400"
                    />
                    <p className="text-xs text-white/50">Paying extra: <span className="text-white font-bold">${extraPayment}/mo</span></p>
                </div>
            </div>
          </div>

          {/* DEBT LIST */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#5B2D2D] flex items-center gap-2">
                <AlertCircle size={20}/> Active Obligations ({activeDebts.length})
            </h3>

            {activeDebts.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-[#5B2D2D]/20 rounded-[40px] p-16 text-center">
                    <div className="bg-emerald-100 p-6 rounded-full mb-6">
                        <CheckCircle2 className="text-4xl text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#5B2D2D] mb-2">Freedom!</h2>
                    <p className="text-[#5B2D2D]/60">You have no pending debts. Add one to start tracking.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {activeDebts.map((debt) => {
                        const daysLeft = Math.ceil((new Date(debt.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                        const isOverdue = daysLeft < 0;

                        return (
                            <div key={debt.id} className="group bg-white p-6 rounded-[30px] shadow-sm border border-stone-100 hover:shadow-md transition-all relative overflow-hidden">
                                {/* Side Color Bar based on Stress */}
                                <div className={`absolute left-0 top-0 bottom-0 w-2 ${debt.stressLevel === 'Extreme' ? 'bg-red-500' : debt.stressLevel === 'High' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>

                                <div className="pl-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStressColor(debt.stressLevel)}`}>
                                            {debt.stressLevel} Stress
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenModal(debt)} className="p-2 text-stone-300 hover:text-[#5B2D2D] hover:bg-stone-50 rounded-full transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => deleteDebt(debt.id)} className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-[#5B2D2D] mb-1">{debt.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-3xl font-light text-stone-700">${parseFloat(debt.amount).toLocaleString()}</span>
                                        <span className="text-sm text-stone-400">@ {debt.interestRate}% APR</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                                        <div className={`flex items-center gap-2 text-sm font-bold ${isOverdue ? "text-red-500" : "text-stone-400"}`}>
                                            <Clock size={16} /> 
                                            {isOverdue ? `Overdue by ${Math.abs(daysLeft)} days` : `Due in ${daysLeft} days`}
                                        </div>
                                        <button 
                                            onClick={() => markAsPaid(debt.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-[#5B2D2D] rounded-xl text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all group-hover:scale-105"
                                        >
                                            Pay Off <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
          </div>

        </div>
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-stone-50 rounded-full text-stone-400 hover:bg-stone-100 hover:text-[#5B2D2D]"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-[#5B2D2D]">
              {editingId ? "Edit Debt" : "New Obligation"}
            </h2>
            
            <form onSubmit={handleSaveDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Debt Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-[#5B2D2D] focus:outline-none focus:ring-2 focus:ring-[#5B2D2D]/20"
                  placeholder="e.g. Visa Card"
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Amount ($)</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-[#5B2D2D] focus:outline-none focus:ring-2 focus:ring-[#5B2D2D]/20"
                    placeholder="5000"
                    required
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">APR (%)</label>
                  <input 
                    type="number" 
                    value={formData.interestRate}
                    onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-[#5B2D2D] focus:outline-none focus:ring-2 focus:ring-[#5B2D2D]/20"
                    placeholder="18"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Stress Level</label>
                <div className="grid grid-cols-4 gap-2">
                    {["Low", "Medium", "High", "Extreme"].map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => setFormData({...formData, stressLevel: level})}
                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${formData.stressLevel === level ? "bg-[#5B2D2D] text-white border-[#5B2D2D]" : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"}`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-[#5B2D2D] focus:outline-none focus:ring-2 focus:ring-[#5B2D2D]/20"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-[#5B2D2D] text-white py-4 rounded-xl font-bold hover:bg-[#4a2424] transition-all shadow-lg mt-4">
                {editingId ? "Save Changes" : "Add Debt"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingDebts;