import React, { useState } from 'react';
import { X, Loader2, Camera, Sparkles } from 'lucide-react';
import { getDatabase, ref, push, runTransaction } from "firebase/database";
import { getAuth } from "firebase/auth";
import { usePopup } from "../../context/PopupContext";
import { scanBill } from "../../services/AzureOCRService";
import { app } from "../../firebase"; 

const ExpenseInputForm = ({ onClose }) => {
  const { showPopup } = usePopup();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    category: "Food",
    description: ""
  });

  const auth = getAuth(app);
  const db = getDatabase(app);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const result = await scanBill(file);
      if (result.amount) {
        setFormData(prev => ({ ...prev, amount: result.amount.toString() }));
        showPopup({
          title: "Architecture Scan Successful",
          message: `Detected amount: ₹${result.amount}. System form updated.`,
          type: "success"
        });
      } else {
        showPopup({
          title: "Partial Scan",
          message: "System detected text but could not confidentially identify the total amount. Please verify manually.",
          type: "warning"
        });
      }
    } catch (err) {
      showPopup({
        title: "Scan Failure",
        message: err.message || "Failed to process bill architecture.",
        type: "error"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.date) return;

    setLoading(true);
    const user = auth.currentUser;

    if (user) {
      try {
        const amountVal = parseFloat(formData.amount);
        const transactionsRef = ref(db, `users/${user.uid}/transactions`);
        await push(transactionsRef, {
          ...formData,
          amount: amountVal,
          createdAt: Date.now()
        });

        const totalExpensesRef = ref(db, `users/${user.uid}/expenses`);
        await runTransaction(totalExpensesRef, (currentTotal) => {
          return (currentTotal || 0) + amountVal;
        });

        setLoading(false);
        onClose();
        window.location.reload(); 

      } catch (error) {
        console.error("Error saving expense:", error);
        setLoading(false);
        showPopup({ title: "Sync Error", message: "Failed to synchronize expense payload.", type: "error" });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-[#0f0f0f] w-full max-w-lg rounded-[40px] border border-white/5 shadow-2xl overflow-hidden flex flex-col p-10">
        
        <div className="flex justify-between items-center mb-10">
           <div>
              <h3 className="text-3xl font-black tracking-tighter text-white italic">Add Expense<span className="text-stone-800">.</span></h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-600">New Transaction Entry</p>
           </div>
           <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all text-stone-500">
             <X size={20} />
           </button>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 mb-3 block">Amount Architecture</label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-black text-2xl">₹</span>
              <input 
                type="number" 
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00" 
                className="w-full pl-12 pr-40 py-8 bg-white/[0.02] border border-white/5 rounded-3xl text-4xl font-black text-white focus:outline-none focus:border-white/10 transition-all placeholder:text-stone-900" 
                required
              />
              <label className="absolute right-3 top-3 h-[calc(100%-24px)] px-6 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer flex items-center gap-3 transition-all border border-white/5">
                 {isScanning ? <Loader2 size={18} className="animate-spin text-cyan-500" /> : <Camera size={18} className="text-cyan-500" />}
                 <span className="text-[10px] font-black uppercase tracking-widest">{isScanning ? 'Syncing...' : 'Scan Bill'}</span>
                 <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isScanning} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 mb-2 block">Timestamp</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl font-bold text-white focus:outline-none focus:border-white/10 text-sm" 
                required
              />
            </div>
            <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 mb-2 block">Classification</label>
               <select 
                 name="category"
                 value={formData.category}
                 onChange={handleChange}
                 className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl font-bold text-white focus:outline-none focus:border-white/10 text-sm appearance-none"
               >
                 {["Food", "Transport", "Rent", "Wellness", "Debt Paydown", "Others"].map(c => (
                   <option key={c} value={c}>{c}</option>
                 ))}
               </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 mb-2 block">Annotation</label>
            <input 
              type="text" 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Starbucks, Uber..." 
              className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl font-bold text-white focus:outline-none focus:border-white/10 text-sm" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || isScanning}
            className="w-full py-6 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-stone-200 active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Save Transaction <Sparkles size={18}/></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseInputForm;