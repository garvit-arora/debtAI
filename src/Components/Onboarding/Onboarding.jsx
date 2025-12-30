import { getAuth } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { app } from "../../firebase";

export default function Onboarding() {
  const auth = getAuth(app);
  const navigate = useNavigate();
  const db = getDatabase(app);

  const titleRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);

  const [phase, setPhase] = useState(0);
  
  const [basicIndex, setBasicIndex] = useState(0);
  const [totalDebts, setTotalDebts] = useState(0);
  const [currentDebtIndex, setCurrentDebtIndex] = useState(0);
  const [debtDetailStep, setDebtDetailStep] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    income: "",
    expenses: "",
    debts: [], 
    strategy: ""
  });

  const [currentAnswer, setCurrentAnswer] = useState("");

  const basicQuestions = [
    { key: "name", text: "What is your name?", type: "text" },
    { key: "income", text: "What is your monthly income?", type: "number" },
    { key: "expenses", text: "What are your total monthly expenses?", type: "number" },
  ];

  const debtDetailQuestions = [
    { key: "name", text: "Name of this debt (e.g. Visa, Car Loan)", type: "text" },
    { key: "amount", text: "Total outstanding amount?", type: "number" },
    { key: "interest", text: "Interest Rate (%)?", type: "number" },
    { key: "dueDate", text: "When is the next due date?", type: "date" }, 
    { key: "stress", text: "Stress Level (1-10)?", type: "number", max: 10 },
  ];

  const strategies = [
    { id: "stress_first", label: "Stress First", desc: "Tackle the debts causing you the most anxiety." },
    { id: "amount_first", label: "Smallest Amount", desc: "The 'Snowball Method'. Quick wins to build momentum." },
    { id: "interest_first", label: "Highest Interest", desc: "The 'Avalanche Method'. Mathematically saves the most money." },
    { id: "date_first", label: "Earliest Due Date", desc: "Focus on what's due next to avoid penalties." },
  ];

  const getCurrentQuestion = () => {
    if (phase === 0) return basicQuestions[basicIndex];
    if (phase === 1) return { text: "How many active debts do you have?", type: "number" };
    if (phase === 2) {
      const q = debtDetailQuestions[debtDetailStep];
      return { 
        ...q, 
        text: `Debt ${currentDebtIndex + 1} of ${totalDebts}: ${q.text}` 
      };
    }
    if (phase === 3) return { text: "Choose your repayment strategy", type: "selection" };
    if (phase === 4) return { text: "End User License Agreement", type: "terms" };
    return { text: "All done!", type: "text" };
  };

  const currentQ = getCurrentQuestion();

  useEffect(() => {
    const el = titleRef.current;
    if(!el) return;
    const rect = el.getBoundingClientRect();

    gsap.fromTo(el,
      { x: window.innerWidth/2 - rect.left - rect.width/2, y: window.innerHeight/2 - rect.top - rect.height/2, scale: 1.6, opacity: 1 },
      { x: 0, y: 0, scale: 1, delay: 0.5, opacity: 1, duration: 1.5, ease: "power3.out", onComplete: showContent }
    );
  }, []);

  useEffect(() => {
    const totalSteps = basicQuestions.length + 1 + (totalDebts * debtDetailQuestions.length) + 1 + 1;
    let completed = basicIndex;
    if (phase > 0) completed = basicQuestions.length;
    if (phase > 1) completed += 1;
    if (phase === 2) completed += (currentDebtIndex * debtDetailQuestions.length) + debtDetailStep;
    if (phase === 3) completed = totalSteps - 2;
    if (phase === 4) completed = totalSteps - 1;

    const percent = Math.min((completed / (totalSteps || 1)) * 100, 100);
    gsap.to(progressRef.current, { width: `${percent}%`, duration: 0.5 });
  }, [phase, basicIndex, debtDetailStep, currentDebtIndex, totalDebts]);

  const showContent = () => {
    const elements = containerRef.current.children;
    gsap.fromTo(elements, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  };

  const transitionToNext = (callback) => {
    const elements = containerRef.current.children;
    gsap.to(elements, {
      opacity: 0, 
      y: -20, 
      duration: 0.3,
      stagger: 0.05,
      onComplete: () => {
        callback();
        setCurrentAnswer("");
        setTimeout(() => showContent(), 100);
      }
    });
  };

  const handleNext = () => {
    if (phase < 3 && !currentAnswer.trim()) return;

    transitionToNext(() => {
      if (phase === 0) {
        setFormData(prev => ({ ...prev, [basicQuestions[basicIndex].key]: currentAnswer }));
        if (basicIndex < basicQuestions.length - 1) setBasicIndex(prev => prev + 1);
        else setPhase(1);
      }
      
      else if (phase === 1) {
        const count = parseInt(currentAnswer);
        setTotalDebts(count);
        if (count > 0) {
          setPhase(2);
          setFormData(prev => ({ ...prev, debts: [{}] }));
        } else {
          saveToFirebase({ ...formData, debts: [] });
        }
      }

      else if (phase === 2) {
        setFormData(prev => {
          const newDebts = [...prev.debts];
          newDebts[currentDebtIndex] = { 
            ...newDebts[currentDebtIndex], 
            [debtDetailQuestions[debtDetailStep].key]: currentAnswer 
          };
          return { ...prev, debts: newDebts };
        });

        if (debtDetailStep < debtDetailQuestions.length - 1) {
          setDebtDetailStep(prev => prev + 1);
        } else {
          if (currentDebtIndex < totalDebts - 1) {
            setCurrentDebtIndex(prev => prev + 1);
            setDebtDetailStep(0);
            setFormData(prev => ({ ...prev, debts: [...prev.debts, {}] }));
          } else {
            setPhase(3);
          }
        }
      }
    });
  };

  const handleStrategySelect = (strategyId) => {
    transitionToNext(() => {
      setFormData(prev => ({ ...prev, strategy: strategyId }));
      setPhase(4); 
    });
  };

  const handleAcceptTerms = () => {
    transitionToNext(() => {
        setPhase(5);
        saveToFirebase(formData);
    });
  };

  const calculateEstimatedEMI = (debt) => {
    const p = parseFloat(debt.amount) || 0;
    const r = parseFloat(debt.interest) || 0;
    const monthlyInterest = (p * (r / 100)) / 12;
    const minPay = (p * 0.02) + monthlyInterest; 
    return Math.round(minPay);
  };

  const saveToFirebase = async (data) => {
    const user = auth.currentUser;
    if (user) {
      const processedDebts = data.debts.map(debt => ({
        ...debt,
        amount: parseFloat(debt.amount),
        interest: parseFloat(debt.interest),
        stress: parseInt(debt.stress),
        estimatedMinPayment: calculateEstimatedEMI(debt)
      }));

      await set(ref(db, "users/" + user.uid), {
        email: user.email,
        name: data.name,
        income: parseFloat(data.income),
        expenses: parseFloat(data.expenses),
        onboarded: true,
        strategy: data.strategy,
        debts: processedDebts,
        createdAt: Date.now(),
        termsAccepted: true,
        termsAcceptedAt: Date.now(),
        userAgent: navigator.userAgent
      });
      
      setTimeout(() => navigate("/dashboard"), 1500);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-start pt-24 gap-12 bg-[#FAF3E0] text-gray-900 font-sans overflow-hidden px-4">
      
      <div className="w-full max-w-xl h-2 bg-gray-200 rounded-full overflow-hidden">
        <div ref={progressRef} className="h-full bg-black rounded-full w-0"></div>
      </div>

      <h1 ref={titleRef} className="text-3xl md:text-5xl font-bold tracking-tight text-center">
        {phase === 4 ? "Terms & Conditions" : "Onboarding"}
      </h1>

      {phase < 5 ? (
        <div ref={containerRef} className="w-full max-w-lg flex flex-col items-center gap-6">
          
          <h2 className="text-2xl font-medium text-center opacity-0">
            {currentQ.text}
          </h2>

          {/* INPUT PHASE */}
          {phase < 3 && (
            <>
              <input
                type={currentQ.type}
                value={currentAnswer}
                style={{opacity:0}}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type here..."
                className="px-4 py-3 border-2 border-gray-300 rounded-xl w-full text-lg focus:outline-none focus:border-black focus:ring-0 transition-colors bg-white/50 backdrop-blur-sm"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
              <button 
                onClick={handleNext} 
                className="px-8 py-3 bg-black text-white text-lg rounded-xl hover:scale-105 transition-transform shadow-lg opacity-0"
              >
                Next →
              </button>
            </>
          )}

          {/* STRATEGY PHASE */}
          {phase === 3 && (
            <div className="grid grid-cols-1 gap-3 w-full opacity-0">
              {strategies.map((strat) => (
                <button
                  key={strat.id}
                  onClick={() => handleStrategySelect(strat.id)}
                  className="group flex flex-col items-start p-4 bg-white border-2 border-transparent hover:border-black rounded-xl shadow-sm hover:shadow-md transition-all text-left"
                >
                  <span className="font-bold text-lg">{strat.label}</span>
                  <span className="text-sm text-gray-500 group-hover:text-gray-700">{strat.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* TERMS & CONDITIONS PHASE */}
          {phase === 4 && (
            <div className="w-full opacity-0 flex flex-col gap-6">
                
                {/* Scrollable Terms Container */}
                <div className="w-full h-96 bg-white/90 p-6 rounded-xl border border-gray-300 overflow-y-auto text-sm text-gray-700 shadow-inner leading-relaxed">
                    
                    <h3 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider">Last Updated: {new Date().toLocaleDateString()}</h3>
                    
                    <h4 className="font-bold text-gray-900 mt-4 mb-1">1. ACCEPTANCE OF TERMS</h4>
                    <p className="mb-4">
                        By accessing, downloading, or using the DebtAI platform ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not use the Service. These Terms constitute a legally binding agreement between you and DebtAI.
                    </p>
                    
                    <h4 className="font-bold text-gray-900 mt-4 mb-1">2. NO FINANCIAL ADVICE</h4>
                    <p className="mb-4">
                        <strong>IMPORTANT:</strong> DebtAI is a technology platform that provides information and AI-driven insights for educational and planning purposes only. We are <strong>not</strong> a bank, financial planner, broker, or investment advisor.
                        <br/><br/>
                        Nothing in the Service constitutes professional financial, legal, or tax advice. The strategies (e.g., "Snowball", "Avalanche") are generated based on mathematical models and user input. You should consult with a qualified professional before making significant financial decisions.
                    </p>
                    
                    <h4 className="font-bold text-gray-900 mt-4 mb-1">3. ACCURACY OF INFORMATION</h4>
                    <p className="mb-4">
                        You are solely responsible for the accuracy, completeness, and timeliness of the financial data you input (e.g., income, debt amounts, interest rates). DebtAI does not verify your data. Incorrect inputs will result in incorrect analysis. We are not liable for any errors resulting from inaccurate user data.
                    </p>
                    
                    <h4 className="font-bold text-gray-900 mt-4 mb-1">4. PRIVACY & DATA SECURITY</h4>
                    <p className="mb-4">
                        Your privacy is paramount. We collect and store your data using industry-standard encryption protocols via Google Firebase. We analyze your data to provide the Service. We do not sell your personal identifiable information (PII) to third-party advertisers without your explicit consent. By using the Service, you consent to our Data Privacy Policy.
                    </p>

                    <h4 className="font-bold text-gray-900 mt-4 mb-1">5. LIMITATION OF LIABILITY</h4>
                    <p className="mb-4">
                        TO THE FULLEST EXTENT PERMITTED BY LAW, DEBTAI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE.
                    </p>

                    <h4 className="font-bold text-gray-900 mt-4 mb-1">6. INDEMNIFICATION</h4>
                    <p className="mb-4">
                        You agree to defend, indemnify, and hold harmless DebtAI and its licensees and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, or b) a breach of these Terms.
                    </p>

                    <h4 className="font-bold text-gray-900 mt-4 mb-1">7. MODIFICATIONS TO SERVICE</h4>
                    <p className="mb-4">
                        We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. You agree that DebtAI shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
                    </p>

                    <h4 className="font-bold text-gray-900 mt-4 mb-1">8. GOVERNING LAW</h4>
                    <p className="mb-4">
                        These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the company is established, without regard to its conflict of law provisions.
                    </p>

                    <p className="mt-8 italic text-xs text-gray-500 border-t pt-4">
                        By clicking "Agree & Create Account", you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                    </p>
                </div>

                <button 
                    onClick={handleAcceptTerms} 
                    className="w-full py-4 bg-black text-white text-lg rounded-xl font-bold hover:bg-gray-900 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <span>Agree & Create Account</span>
                    <span className="text-xl">→</span>
                </button>
            </div>
          )}

        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 animate-pulse mt-10">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
          <h2 className="text-2xl font-semibold">Finalizing Setup...</h2>
        </div>
      )}
    </div>
  );
}