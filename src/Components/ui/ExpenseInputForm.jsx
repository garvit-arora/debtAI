import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getDatabase, ref, push, runTransaction } from "firebase/database";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase"; // Ensure path is correct

const ExpenseInputForm = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0], // Default to today
    category: "Food", // Default category
    description: ""
  });

  const auth = getAuth(app);
  const db = getDatabase(app);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.date) return;

    setLoading(true);
    const user = auth.currentUser;

    if (user) {
      try {
        const amountVal = parseFloat(formData.amount);

        // 1. Save the specific transaction details
        const transactionsRef = ref(db, `users/${user.uid}/transactions`);
        await push(transactionsRef, {
          ...formData,
          amount: amountVal,
          createdAt: Date.now()
        });

        // 2. Update the TOTAL expenses for the user (so the Budget Bar updates)
        const totalExpensesRef = ref(db, `users/${user.uid}/expenses`);
        await runTransaction(totalExpensesRef, (currentTotal) => {
          return (currentTotal || 0) + amountVal;
        });

        // 3. Close modal
        setLoading(false);
        onClose();
        // Optional: Trigger a window reload or use context to refresh dashboard if needed
        // For now, React state in Dashboard might need a trigger or simple reload works
        window.location.reload(); 

      } catch (error) {
        console.error("Error saving expense:", error);
        setLoading(false);
        alert("Failed to save expense");
      }
    }
  };

  return (
    <div>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#30302e]/60 backdrop-blur-md p-4 animate-fadeIn">
        <div className="bg-white w-full max-w-md rounded-[35px] shadow-2xl overflow-hidden animate-scaleUp">
          
          {/* Modal Header */}
          <div className="bg-[#5B2D2D] p-6 flex justify-between items-center">
            <h3 className="text-[#f8ecdd] text-xl font-bold">Add New Expense</h3>
            <button onClick={onClose} className="text-[#f8ecdd] hover:bg-white/10 p-2 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Modal Form */}
          <form className="p-8 flex flex-col gap-5" onSubmit={handleSubmit}>
            
            {/* Amount */}
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-lg">$</span>
                <input 
                  type="number" 
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00" 
                  className="w-full pl-10 pr-4 py-4 bg-stone-50 rounded-2xl text-2xl font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" 
                  required
                />
              </div>
            </div>

            {/* Date & Category Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Date</label>
                <div className="relative">
                   <input 
                     type="date" 
                     name="date"
                     value={formData.date}
                     onChange={handleChange}
                     className="w-full px-4 py-3 bg-stone-50 rounded-xl font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                     required
                   />
                </div>
              </div>
              <div className="flex-1">
                 <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Category</label>
                 <select 
                   name="category"
                   value={formData.category}
                   onChange={handleChange}
                   className="w-full px-4 py-3 bg-stone-50 rounded-xl font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                 >
                   <option value="Food">Food</option>
                   <option value="Transport">Transport</option>
                   <option value="Rent">Rent</option>
                   <option value="Entertainment">Entertainment</option>
                   <option value="Others">Others</option>
                 </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">
                What was this for?
              </label>
              <input 
                type="text" 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Starbucks, Uber..." 
                className="w-full px-4 py-3 bg-stone-50 rounded-xl font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
              />
            </div>

            {/* Save Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Save Expense"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ExpenseInputForm;