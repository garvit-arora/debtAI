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
  PiggyBank
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
    name: "", income: "", expenses: "", debts: [], strategy: ""
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
    { key: "dueDate", text: "When is the next payment due?", sub: "Standard monthly date", type: "date" }, 
    { key: "stress", text: "How much stress does this cause?", sub: "Rate from 1 to 10", type: "number", max: 10 },
  ];

  const strategies = [
    { id: "interest_first", label: "Interest Avalanche", desc: "Pay off high-interest for maximum savings.", icon: <TrendingUp size={20} /> },
    { id: "amount_first", label: "Balance Snowball", desc: "Smallest balances first for psychological wins.", icon: <Activity size={20} /> },
    { id: "stress_first", label: "Stress Priority", desc: "Tackle what keeps you up at night.", icon: <ShieldCheck size={20} /> },
    { id: "date_first", label: "Due Date Sync", desc: "Focus on earliest upcoming deadlines.", icon: <Layout size={20} /> },
  ];

  const getCurrentProgress = () => {
    const totalPrimarySteps = 5; 
    let current = phase + 1;
    if (phase === 0) current = 1;
    if (phase === 1) current = 2;
    if (phase === 2) current = 3;
    if (phase === 3) current = 4;
    if (phase === 4) current = 5;
    return { current, total: totalPrimarySteps };
  };

  const progress = getCurrentProgress();

  const handleNext = () => {
    if (phase < 3 && !currentAnswer.trim()) return;

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
          setFormData(prev => ({ ...prev, debts: [], strategy: "none" }));
          setPhase(4); 
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
        setPhase(2);
        setCurrentDebtIndex(totalDebts - 1);
        setDebtDetailStep(debtDetailQuestions.length - 1);
    } else if (phase === 4) {
        if (totalDebts > 0) setPhase(3);
        else setPhase(1);
    }
  };

  const saveToFirebase = async (data) => {
    setIsFinalizing(true);
    const user = auth.currentUser;
    if (user) {
      const processedDebts = (data.debts || []).map(debt => ({
        ...debt,
        amount: parseFloat(debt.amount) || 0,
        interest: parseFloat(debt.interest) || 0,
        stress: parseInt(debt.stress) || 5,
        estimatedMinPayment: Math.round(((parseFloat(debt.amount) || 0) * 0.02) + (((parseFloat(debt.amount) || 0) * ((parseFloat(debt.interest) || 0) / 100)) / 12))
      }));

      await set(ref(db, "users/" + user.uid), {
        email: user.email, name: data.name, income: parseFloat(data.income) || 0, expenses: parseFloat(data.expenses) || 0, onboarded: true, strategy: data.strategy || "interest_first", debts: processedDebts, createdAt: Date.now(), termsAccepted: true, termsAcceptedAt: Date.now()
      });
      setTimeout(() => navigate("/dashboard"), 1000);
    }
  };

  const currentQ = phase === 0 ? basicQuestions[basicIndex] : 
                   phase === 1 ? { text: "How many active debts?", sub: "Total number of accounts to track", type: "number" } :
                   phase === 2 ? debtDetailQuestions[debtDetailStep] :
                   phase === 3 ? { text: "Choose your payoff strategy", sub: "How would you like to tackle your debts?" } :
                   { text: "Terms & Conditions", sub: "Final step to activate your account." };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white font-sans flex items-center justify-center p-6 sm:p-12 selection:bg-white selection:text-black overflow-y-auto">
      
      {isFinalizing ? (
          <div className="flex flex-col items-center gap-6 animate-pulse">
              <Loader2 className="w-12 h-12 animate-spin text-white" />
              <h2 className="text-2xl font-bold tracking-tight uppercase tracking-[0.2em]">Syncing Architecture...</h2>
          </div>
      ) : (
        <div className="w-full max-w-xl bg-[#141414] border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative">
          
          {/* Progress Bar */}
          <div className="flex gap-1.5 px-10 pt-10 pb-4">
              {[...Array(progress.total)].map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < progress.current ? "bg-white" : "bg-white/10"}`}></div>
              ))}
          </div>
          <div className="px-10 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">{progress.current} of {progress.total}</div>

          <div className="p-10 flex-1 flex flex-col min-h-[400px]">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4 leading-tight">
                {phase === 2 && `Debt #${currentDebtIndex + 1}: `}{currentQ.text}
            </h2>
            <p className="text-stone-500 font-medium text-lg mb-10 leading-relaxed">{currentQ.sub}</p>

            <div className="flex-1">
                {phase < 3 ? (
                    <div className="space-y-4">
                        <input
                            type={currentQ.type}
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder="Type response..."
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 text-xl font-bold focus:outline-none focus:border-white/20 transition-all placeholder:opacity-20 hide-scrollbar overflow-hidden"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        />
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-20 ml-2">Press Enter for Next</p>
                    </div>
                ) : phase === 3 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {strategies.map((strat) => (
                            <button 
                                key={strat.id} 
                                onClick={() => { setFormData(prev => ({ ...prev, strategy: strat.id })); setPhase(4); }}
                                className="w-full text-left p-6 bg-[#1a1a1a] border border-white/5 rounded-2xl hover:bg-white hover:text-black transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-black/5">{strat.icon}</div>
                                    <div>
                                        <div className="font-bold text-lg">{strat.label}</div>
                                        <div className="text-xs opacity-50 group-hover:opacity-100 font-medium">{strat.desc}</div>
                                    </div>
                                    <ArrowRight size={18} className="ml-auto opacity-20 group-hover:opacity-100" />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 h-[250px] overflow-y-auto text-sm leading-relaxed text-stone-400 font-medium hide-scrollbar">
                            <p className="mb-4">1. We are not financial advisors. All strategies are conceptual.</p>
                            <p className="mb-4">2. Your data is encrypted and used only for your dashboard functionality.</p>
                            <p className="mb-4">3. Accuracy of results depends entirely on the accuracy of your inputs.</p>
                            <Link to="/legal" target="_blank" className="text-white underline font-bold mt-4 inline-block">Read Full Agreement →</Link>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 flex items-center justify-between pt-6 border-t border-white/5">
                <button 
                    onClick={handleBack}
                    disabled={phase === 0 && basicIndex === 0}
                    className="flex items-center gap-2 text-stone-500 font-bold text-sm uppercase tracking-widest hover:text-white transition-colors disabled:opacity-0"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="flex items-center gap-4">
                    {phase === 4 ? (
                        <button 
                            onClick={() => saveToFirebase(formData)}
                            className="px-10 py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center gap-3 shadow-2xl"
                        >
                            <Check size={18} /> Agree & Continue
                        </button>
                    ) : (
                        <button 
                            onClick={handleNext}
                            className="px-10 py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center gap-3 shadow-2xl"
                        >
                            Continue <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}