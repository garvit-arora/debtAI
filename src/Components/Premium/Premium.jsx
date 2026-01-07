import React, { useState } from "react";
import { X, Check, Crown, Loader2 } from "lucide-react";
import { getDatabase, ref, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";

const PricingModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);
  const db = getDatabase(app);

  const handleUpgrade = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      // SIMULATE PAYMENT PROCESS
      setTimeout(async () => {
        await update(ref(db, `users/${user.uid}`), {
          isPremium: true,
          plan: "pro_monthly"
        });
        setLoading(false);
        onClose();
        alert("Welcome to Premium! Enjoy your unlocked features.");
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* LEFT: FREE PLAN */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-stone-50">
          <div>
            <h3 className="text-stone-500 font-bold uppercase tracking-wider text-sm mb-2">Current Plan</h3>
            <h2 className="text-3xl font-bold text-stone-800 mb-6">Basic</h2>
            <div className="space-y-4">
              <li className="flex items-center gap-3 text-stone-600">
                <Check size={18} /> <span>Basic Dashboard</span>
              </li>
              <li className="flex items-center gap-3 text-stone-600">
                <Check size={18} /> <span>1 Daily Habit</span>
              </li>
              <li className="flex items-center gap-3 text-stone-600">
                <Check size={18} /> <span>Manual Debt Tracking</span>
              </li>
            </div>
          </div>
          <button disabled className="mt-8 w-full py-3 rounded-xl border border-stone-200 text-stone-400 font-bold cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* RIGHT: PREMIUM PLAN */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-[#5B2D2D] text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Crown size={200} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <Crown size={20} className="text-yellow-400 fill-yellow-400" />
                <h3 className="text-orange-100 font-bold uppercase tracking-wider text-sm">Recommended</h3>
            </div>
            <h2 className="text-3xl font-bold mb-2">DebtAI Premium</h2>
            <p className="text-orange-100/60 mb-6">Unlock the full power of AI financial planning.</p>
            
            <div className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="p-1 bg-white/20 rounded-full"><Check size={14} /></div>
                <span><strong>3 AI Daily Habits</strong> (Unlock Hidden Insights)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1 bg-white/20 rounded-full"><Check size={14} /></div>
                <span>Unlimited Bill Scanning</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1 bg-white/20 rounded-full"><Check size={14} /></div>
                <span>Priority AI Chat Support</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1 bg-white/20 rounded-full"><Check size={14} /></div>
                <span>Export Data to Excel/CSV</span>
              </li>
            </div>
          </div>

          <div className="mt-8 relative z-10">
             <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-orange-100/60 mb-1">/ month</span>
             </div>
             <button 
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-4 bg-white text-[#5B2D2D] rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg flex items-center justify-center gap-2"
             >
                {loading ? <Loader2 className="animate-spin" /> : <Crown size={18} />}
                <span>Upgrade Now</span>
             </button>
             <p className="text-xs text-center mt-3 text-orange-100/40">Cancel anytime. Secure payment.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;