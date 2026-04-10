import { getAuth } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { app } from "../../firebase";
import { useTheme } from "../../context/ThemeContext";
import { 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Loader2, 
  ShieldCheck, 
  User, 
  TrendingUp, 
  Layout, 
  CreditCard, 
  Activity, 
  HelpCircle,
  PiggyBank,
  Sparkles,
  Target,
  Calendar,
  X
} from "lucide-react";

export default function Onboarding() {
  const auth = getAuth(app);
  const navigate = useNavigate();
  const db = getDatabase(app);
  const { isDarkMode } = useTheme();

  const [phase, setPhase] = useState(0); 
  const [basicIndex, setBasicIndex] = useState(0);
  const [totalDebts, setTotalDebts] = useState(0);
  const [currentDebtIndex, setCurrentDebtIndex] = useState(0);
  const [debtDetailStep, setDebtDetailStep] = useState(0);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const [formData, setFormData] = useState({
    name: "", income: "", expenses: "", debts: [], strategy: "interest_first", stressProfile: "balanced"
  });

  const [currentAnswer, setCurrentAnswer] = useState("");

  const basicQuestions = [
    { key: "name", text: "Help us to personalize your experience!", sub: "What shall we call you?", type: "text", icon: <User size={24} /> },
    { key: "income", text: "What's your monthly income?", sub: "After-tax take-home pay (₹)", type: "number", icon: <TrendingUp size={24} /> },
    { key: "expenses", text: "How much are your fixed expenses?", sub: "Rent, bills, food, etc. (excluding debts) (₹)", type: "number", icon: <Layout size={24} /> },
  ];

  const debtDetailQuestions = [
    { key: "name", text: "What is this debt for?", sub: "e.g. Credit Card, Student Loan, etc.", type: "text" },
    { key: "amount", text: "How much do you owe?", sub: "Current total balance (₹)", type: "number" },
    { key: "interest", text: "What is the annual interest rate?", sub: "Average APR percentage (%)", type: "number" },
    { key: "isRecurring", text: "Is this a recurring payment?", sub: "Does this require a fixed monthly installment?", type: "select", options: [{label: 'Yes, Recurring', value: 'true'}, {label: 'No, One-time', value: 'false'}] },
    { key: "dueDate", text: "Next payment date?", sub: "When is your next bill due?", type: "date" }, 
    { key: "finalDate", text: "Final payment date?", sub: "When do you expect to be fully debt-free on this account?", type: "date" },
    { key: "stress", text: "Stress Level?", sub: "How much anxiety does this cause? (1-10)", type: "number", max: 10 },
  ];

  const strategies = [
    { id: "interest_first", label: "Interest Avalanche", desc: "Pay off high-interest for maximum savings.", icon: <TrendingUp size={20} /> },
    { id: "amount_first", label: "Balance Snowball", desc: "Smallest balances first for psychological wins.", icon: <Activity size={20} /> },
    { id: "stress_priority", label: "Stress Focus", desc: "Tackle what keeps you up at night.", icon: <ShieldCheck size={20} /> }
  ];
  
  const stressProfiles = [
    { id: "stressed", label: "Urgent & Focused", desc: "I want to clear this ASAP.", icon: <Sparkles size={20} /> },
    { id: "balanced", label: "Steady & Calm", desc: "A balanced life while paying back.", icon: <Check size={20} /> },
    { id: "supportive", label: "Anxious & Sensitive", desc: "Keep advice supportive and low-pressure.", icon: <HelpCircle size={20} /> },
  ];

  const getCurrentProgress = () => {
    const totalPrimarySteps = 6; 
    let current = phase + 1;
    return { current, total: totalPrimarySteps };
  };

  const progress = getCurrentProgress();

  const handleNext = () => {
    if (phase < 3 && !currentAnswer.toString().trim()) return;

    if (phase === 0) {
        setFormData(prev => ({ ...prev, [basicQuestions[basicIndex].key]: currentAnswer }));
        if (basicIndex < basicQuestions.length - 1) {
            setBasicIndex(prev => prev + 1);
            setCurrentAnswer("");
        } else {
            setPhase(1);
            setCurrentAnswer("");
        }
    }
    else if (phase === 1) {
        const count = parseInt(currentAnswer);
        setTotalDebts(count);
        if (count > 0) { 
          setPhase(2); 
          setFormData(prev => ({ ...prev, debts: [{}] })); 
          setCurrentAnswer("");
        } else { 
          setFormData(prev => ({ ...prev, debts: [], strategy: "none", stressProfile: "balanced" }));
          setPhase(5); 
          setCurrentAnswer("");
        }
    }
    else if (phase === 2) {
        setFormData(prev => {
          const newDebts = [...prev.debts];
          newDebts[currentDebtIndex] = { ...newDebts[currentDebtIndex], [debtDetailQuestions[debtDetailStep].key]: currentAnswer };
          return { ...prev, debts: newDebts };
        });
        if (debtDetailStep < debtDetailQuestions.length - 1) {
            setDebtDetailStep(prev => prev + 1);
            setCurrentAnswer("");
        } else {
            if (currentDebtIndex < totalDebts - 1) {
                setCurrentDebtIndex(prev => prev + 1);
                setDebtDetailStep(0);
                setFormData(prev => ({ ...prev, debts: [...prev.debts, {}] }));
                setCurrentAnswer("");
            } else {
                setPhase(3);
                setCurrentAnswer("");
            }
        }
    }
  };

  const handleBack = () => {
    if (phase === 0) {
        if (basicIndex > 0) setBasicIndex(prev => prev - 1);
    } else if (phase === 1) {
        setPhase(0); setBasicIndex(basicQuestions.length - 1);
    } else if (phase === 2) {
        if (debtDetailStep > 0) setDebtDetailStep(prev => prev - 1);
        else if (currentDebtIndex > 0) {
            setCurrentDebtIndex(prev => prev - 1);
            setDebtDetailStep(debtDetailQuestions.length - 1);
        } else {
            setPhase(1);
        }
    } else if (phase === 3) {
        setPhase(2); setDebtDetailStep(debtDetailQuestions.length - 1); setCurrentDebtIndex(totalDebts - 1);
    } else if (phase === 4) {
        setPhase(3);
    } else if (phase === 5) {
        setPhase(4);
    }
  };

  const saveToFirebase = async (data) => {
    setIsFinalizing(true);
    const user = auth.currentUser;
    if (user) {
      const processedDebts = (data.debts || []).map(debt => {
        const amount = parseFloat(debt.amount) || 0;
        const interest = parseFloat(debt.interest) || 0;
        
        return {
           ...debt,
           amount: amount,
           remainingAmount: amount,
           interest: interest,
           status: 'active',
           isRecurring: debt.isRecurring === 'true',
           createdAt: new Date().toISOString()
        };
      });

      await set(ref(db, "users/" + user.uid), {
        email: user.email, 
        name: data.name, 
        income: parseFloat(data.income) || 0, 
        expenses: parseFloat(data.expenses) || 0, 
        onboarded: true, 
        strategy: data.strategy, 
        stressProfile: data.stressProfile, 
        debts: processedDebts.reduce((acc, d, i) => ({...acc, [i]: d}), {}), // convert to object for firebase
        createdAt: Date.now()
      });
      setTimeout(() => navigate("/dashboard"), 1000);
    }
  };

  const currentQ = phase === 0 ? basicQuestions[basicIndex] : 
                   phase === 1 ? { text: "How many active debts?", sub: "Accounts to track and neutralize.", type: "number" } :
                   phase === 2 ? debtDetailQuestions[debtDetailStep] :
                   phase === 3 ? { text: "Repayment Strategy", sub: "How would you like to tackle your debts?" } :
                   phase === 4 ? { text: "Communication Profile", sub: "How should our AI communicate with you?" } :
                   { text: "Terms of Service", sub: "Activate your financial sync." };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white font-sans flex items-center justify-center p-4 sm:p-12 overflow-y-auto uppercase">
      {isFinalizing ? (
          <div className="flex flex-col items-center gap-6 animate-pulse">
              <Loader2 className="w-12 h-12 animate-spin text-white" />
              <h2 className="text-2xl font-black tracking-tighter uppercase">Syncing Data...</h2>
          </div>
      ) : (
        <div className="w-full max-w-xl bg-[#141414] border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative">
          <div className="flex gap-1.5 px-10 pt-10 pb-4">
              {[...Array(progress.total)].map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < progress.current ? "bg-white" : "bg-white/10"}`}></div>
              ))}
          </div>
          <div className="px-10 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">{progress.current} of {progress.total}</div>

          <div className="p-10 flex-1 flex flex-col min-h-[460px]">
            <h2 className="text-4xl font-black tracking-tighter mb-4 leading-tight uppercase font-sans italic">
                {phase === 2 && `Debt #${currentDebtIndex + 1}: `}{currentQ.text}
            </h2>
            <p className="text-stone-500 font-bold text-lg mb-10 leading-relaxed tracking-tight lowercase">{currentQ.sub}</p>

            <div className="flex-1">
                {phase < 3 ? (
                    currentQ.type === 'select' ? (
                        <div className="grid grid-cols-1 gap-3">
                            {currentQ.options.map((opt) => (
                                <button key={opt.value} onClick={() => { setCurrentAnswer(opt.value); setTimeout(handleNext, 100); }} className={`w-full text-left p-6 rounded-2xl border transition-all ${currentAnswer === opt.value ? 'bg-white text-black border-white' : 'bg-[#1a1a1a] border-white/5 text-white hover:bg-white/5'}`}>
                                    <span className="font-black text-xs tracking-widest uppercase">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <input
                                type={currentQ.type}
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                placeholder="Type response..."
                                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 text-xl font-bold focus:outline-none focus:border-white/20 transition-all placeholder:opacity-20"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                            />
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-20 ml-2">Press Enter for Next</p>
                        </div>
                    )
                ) : phase === 3 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {strategies.map((strat) => (
                            <button key={strat.id} onClick={() => { setFormData(prev => ({ ...prev, strategy: strat.id })); setPhase(4); }} className="w-full text-left p-6 bg-[#1a1a1a] border border-white/5 rounded-2xl hover:bg-white hover:text-black transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-black/5">{strat.icon}</div>
                                    <div>
                                        <div className="font-black text-xs tracking-widest uppercase">{strat.label}</div>
                                        <div className="text-[10px] opacity-50 font-bold lowercase">{strat.desc}</div>
                                    </div>
                                    <ArrowRight size={18} className="ml-auto opacity-20 group-hover:opacity-100" />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : phase === 4 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {stressProfiles.map((prof) => (
                            <button key={prof.id} onClick={() => { setFormData(prev => ({ ...prev, stressProfile: prof.id })); setPhase(5); }} className="w-full text-left p-6 bg-[#1a1a1a] border border-white/5 rounded-2xl hover:bg-white hover:text-black transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-black/5">{prof.icon}</div>
                                    <div>
                                        <div className="font-black text-xs tracking-widest uppercase">{prof.label}</div>
                                        <div className="text-[10px] opacity-50 font-bold lowercase">{prof.desc}</div>
                                    </div>
                                    <ArrowRight size={18} className="ml-auto opacity-20 group-hover:opacity-100" />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 h-[200px] overflow-y-auto text-xs leading-relaxed text-stone-600 font-bold uppercase hide-scrollbar">
                            <p className="mb-4">1. We are not financial advisors.</p>
                            <p className="mb-4">2. Your data is encrypted and secure.</p>
                            <p className="mb-4">3. Accuracy depends on your inputs.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 flex items-center justify-between pt-6 border-t border-white/5">
                <button onClick={handleBack} disabled={phase === 0 && basicIndex === 0} className="flex items-center gap-2 text-stone-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors disabled:opacity-0"><ArrowLeft size={16} /> Back</button>
                <div className="flex items-center gap-4">
                    {phase === 5 ? (
                      <button onClick={() => saveToFirebase(formData)} className="px-10 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 active:scale-95 transition-all"><Check size={18} /> Agree & Sync</button>
                    ) : (
                      <button onClick={handleNext} disabled={phase >= 3} className={`px-10 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 active:scale-95 transition-all ${phase >= 3 ? 'opacity-0' : ''}`}>Next Step <ArrowRight size={18} /></button>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}