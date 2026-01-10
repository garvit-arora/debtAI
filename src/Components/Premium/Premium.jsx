import React, { useState } from "react";
import { X, Check, Crown, Loader2, Zap, CalendarClock } from "lucide-react";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";

const PricingModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);
  
  // Ensure this points to your running backend
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL_TWO; 

  // Helper to load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please login first.");

    setLoading(true);

    try {
      // 1. Load Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load.");
        setLoading(false);
        return;
      }

      // 2. Create Order (Ensure your backend is creating an order for 4900 paise!)
      const response = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
      });
      
      const orderData = await response.json();

      if (!orderData.id) {
        alert("Server error. Could not create order.");
        setLoading(false);
        return;
      }

      // 3. Razorpay Options
      const options = {
        key: "rzp_test_S182UxzRik68G2", // Paste your Key ID here
        amount: orderData.amount,
        currency: orderData.currency,
        name: "DebtAI Premium",
        description: "1 Month Premium Access",
        order_id: orderData.id,
        
        handler: async function (response) {
          // 4. Verify on Backend
          try {
             const verifyRes = await fetch(`${BACKEND_URL}/verify-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: user.uid 
                }),
             });

             const verifyData = await verifyRes.json();

             if (verifyData.status === "success") {
               alert("🎉 Payment Successful! 1 Month Access Unlocked.");
               onClose(); 
             } else {
               alert("Payment verification failed.");
             }
          } catch (e) {
             alert("Error confirming payment.");
          }
        },
        prefill: {
          name: user.displayName || "User",
          email: user.email,
        },
        theme: {
          color: "#FFD700",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
      paymentObject.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
        setLoading(false);
      });

    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      // Keep loading true while modal is open to prevent double clicks
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
        <div className="hidden md:flex flex-1 p-12 flex-col justify-between bg-stone-50 text-stone-600">
          <div>
            <h3 className="font-bold uppercase tracking-wider text-sm mb-2 opacity-50">Current Status</h3>
            <h2 className="text-3xl font-bold text-stone-800 mb-6">Basic User</h2>
            <div className="space-y-4">
              <li className="flex items-center gap-3 opacity-70"><Check size={18} /> <span>Limited Daily Habits</span></li>
              <li className="flex items-center gap-3 opacity-70"><Check size={18} /> <span>Basic Dashboard</span></li>
              <li className="flex items-center gap-3 opacity-70"><Check size={18} /> <span>Manual Tracking</span></li>
            </div>
          </div>
          <p className="text-xs text-stone-400">Upgrade to remove limits.</p>
        </div>

        {/* RIGHT: PREMIUM PLAN */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-[#1a1a1a] text-white relative overflow-hidden">
          {/* Background Crown */}
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none text-yellow-500">
            <Crown size={200} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <Crown size={20} className="text-yellow-400 fill-yellow-400" />
                <h3 className="text-yellow-400 font-bold uppercase tracking-wider text-sm">One-Time Pass</h3>
            </div>
            <h2 className="text-3xl font-bold mb-2">30-Day Premium</h2>
            <p className="text-white/60 mb-6 text-sm">Full access for 1 month. No auto-debit.</p>
            
            <div className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="p-1 bg-yellow-500/20 text-yellow-400 rounded-full"><Check size={14} /></div>
                <span><strong>3 AI Daily Habits</strong> (Unlocked)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1 bg-yellow-500/20 text-yellow-400 rounded-full"><Check size={14} /></div>
                <span>Unlimited Bill Scanning</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1 bg-yellow-500/20 text-yellow-400 rounded-full"><Check size={14} /></div>
                <span>Priority AI Debt Strategy</span>
              </li>
            </div>
          </div>

          <div className="mt-auto relative z-10">
             {/* PRICE SECTION */}
             <div className="flex items-end gap-3 mb-6 bg-white/10 p-4 rounded-xl border border-white/10">
                <div>
                    <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider block mb-1">Special Offer</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">₹49</span>
                        <span className="text-white/40 line-through text-sm">₹999</span>
                    </div>
                </div>
                <div className="ml-auto text-right">
                    <span className="flex items-center gap-1 text-xs text-white/60 mb-1 justify-end">
                        <CalendarClock size={12} /> Valid for
                    </span>
                    <span className="text-sm font-bold text-white">1 Month</span>
                </div>
             </div>

             <button 
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-xl font-bold hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-2"
             >
                {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} fill="black" />}
                <span>Pay ₹49 & Unlock</span>
             </button>
             <p className="text-[10px] text-center mt-4 text-white/30">
                Payment is valid for 30 days. You will need to renew manually after expiry.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;