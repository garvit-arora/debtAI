import React, { useState } from "react";
import { X, Check, Crown, Loader2, Zap, BrainCircuit, ShieldCheck, Activity, Target, Sparkles, Orbit, Gem } from "lucide-react";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { usePopup } from "../../context/PopupContext";

const PricingModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const auth = getAuth(app);
  const { isDarkMode } = useTheme();
  const { showPopup } = usePopup();
  
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL_TWO; 

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planType) => {
    if (planType === "free") return onClose();
    
    const user = auth.currentUser;
    if (!user) return showPopup({ title: "Authorization", message: "Initial authentication required for upgrade.", type: "warning" });
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) { showPopup({ title: "System Module", message: "Razorpay SDK failed to load.", type: "error" }); setLoading(false); return; }
      const response = await fetch(`${BACKEND_URL}/create-order`, { method: "POST" });
      const orderData = await response.json();
      if (!orderData.id) { showPopup({ title: "Server Response", message: "Critical error in order generation.", type: "error" }); setLoading(false); return; }

      const options = {
        key: "rzp_test_S182UxzRik68G2",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "DebtAI Premium",
        description: `${planType} Plan Access`,
        order_id: orderData.id,
        handler: async function (response) {
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
             if (verifyData.status === "success") { showPopup({ title: "Access Granted", message: "Pro Tier Active! All systems initialized.", type: "success" }); onClose(); } 
             else { showPopup({ title: "Verification", message: "Payment verification mismatch.", type: "error" }); }
          } catch (e) { showPopup({ title: "System Error", message: "Error confirming payment protocol.", type: "error" }); }
        },
        prefill: { name: user.displayName || "User", email: user.email },
        theme: { color: "#000000" },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      showPopup({ title: "Protocol Error", message: "Something went wrong in the transaction layer.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      type: "free",
      name: "Basic Plan",
      price: "0",
      description: "Explore core financial modules.",
      icon: <Activity className="text-blue-500" size={32} />,
      features: [
        "20 AI Inquiries daily",
        "Legacy latency layers",
        "Manual data sync",
        "Basic debt tracking"
      ],
      cta: "Current Plan",
      highlighted: false
    },
    {
      type: "pro",
      name: "High Growth",
      price: billingCycle === "monthly" ? "49" : "499",
      description: "Absolute financial clarity at scale.",
      icon: <Zap className="text-amber-500" size={32} />,
      features: [
        "Unlimited AI Intelligence",
        "Priority architectural access",
        "Daily Habit Guidance",
        "Unlimited Bill Scanning",
        "Spatial Report Modules"
      ],
      cta: "Change Plan",
      highlighted: true
    },
    {
      type: "enterprise",
      name: "Hyper Growth",
      price: billingCycle === "monthly" ? "149" : "1499",
      description: "Multi-layered wealth management.",
      icon: <Orbit className="text-purple-500" size={32} />,
      features: [
        "Multi-user synchronization",
        "Integrated API architecture",
        "Dedicated wealth architect",
        "Advanced spatial auditing",
        "Priority beta gateway"
      ],
      cta: "Change Plan",
      highlighted: false
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-card border border-border rounded-[40px] w-full max-w-[1300px] my-auto shadow-3xl relative p-6 md:p-10 transition-colors duration-300 max-h-[95vh] overflow-y-auto hide-scrollbar"
        >
          <button onClick={onClose} className="absolute top-6 right-8 p-2 bg-secondary rounded-full hover:bg-border transition-all z-50 text-foreground border border-border">
            <X size={20} />
          </button>

          <header className="text-center mb-8 space-y-2">
            <h2 className="text-4xl font-black tracking-tighter">Choose Your Plan</h2>
            <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">Architect your future with precision.</p>

            <div className="flex items-center justify-center mt-4">
              <div className="bg-secondary p-1 rounded-2xl border border-border flex items-center">
                <button 
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-8 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === "monthly" ? "bg-background text-foreground shadow-sm border border-border" : "text-muted hover:text-foreground"}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setBillingCycle("annual")}
                  className={`px-8 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === "annual" ? "bg-background text-foreground shadow-sm border border-border" : "text-muted hover:text-foreground"}`}
                >
                  Annual <span className="text-[#10b981] ml-1.5 font-bold">-50% OFF</span>
                </button>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-col rounded-[40px] p-10 transition-all border relative overflow-hidden ${plan.highlighted ? "bg-[#fdfbf7] text-black border-stone-200 shadow-[0_0_60px_rgba(0,0,0,0.05)] z-10" : "bg-card border-border hover:bg-secondary/50"}`}
              >
                {plan.highlighted && (
                    <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] rotate-12 pointer-events-none scale-150">
                        <Gem size={120} />
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                  <div className={`p-4 rounded-3xl border ${plan.highlighted ? "bg-stone-100 border-stone-200" : "bg-secondary border-border"}`}>
                    {plan.icon}
                  </div>
                  {plan.highlighted && (
                      <span className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">POPULAR</span>
                  )}
                </div>

                <h3 className="text-2xl font-black tracking-tight mb-2">{plan.name}</h3>
                <p className={`text-[11px] font-bold uppercase tracking-widest mb-10 ${plan.highlighted ? "opacity-60" : "text-muted"}`}>{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-10">
                  <span className="text-5xl font-black tracking-tighter">₹{plan.price}</span>
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${plan.highlighted ? "opacity-60" : "opacity-30"}`}>{billingCycle === "monthly" ? "/mo" : "/yr"}</span>
                </div>

                <div className="space-y-5 flex-1 mb-12">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-4">
                      <div className={`p-1 rounded-full ${plan.highlighted ? "bg-black/5 text-black" : "bg-foreground/10 text-foreground"}`}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                      <span className="text-xs font-bold opacity-80 leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => handleUpgrade(plan.type)}
                  disabled={loading}
                  className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${plan.highlighted ? "bg-black text-white hover:opacity-90 shadow-xl shadow-black/10" : "bg-foreground text-background"}`}
                >
                  {loading && plan.type !== 'free' ? <Loader2 className="animate-spin" size={18} /> : null}
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="h-10"></div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PricingModal;