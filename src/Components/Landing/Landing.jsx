import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  ArrowRight, 
  ExternalLink, 
  Moon, 
  Sun, 
  Mic,
  BrainCircuit,
  Activity,
  ShieldCheck,
  Target,
  TrendingUp,
  Layout
} from 'lucide-react';
import Footer from '../ui/Footer';
import logo from '../../assets/icons/logo2.png';
import PricingModal from '../Premium/Premium';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebase";
import './Landing.css';

const Landing = () => {
  const { isDarkMode, toggleTheme } = useTheme();
   const [showPricingModal, setShowPricingModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('premium') === 'true') {
      setShowPricingModal(true);
    }
  }, [location]);
  
  const promptGrid = [
    "How can I reduce my credit card interest?",
    "Explain my spending patterns in simple terms",
    "Why did my groceries expense jump this month?",
    "Help me understand the trade-offs of my auto loan",
    "Suggest a small habit to start saving",
    "How do I clear my medical debt faster?",
    "What are the stress indicators in my finances?",
    "Explain the 'snowball' vs 'avalanche' method",
    "Am I spending too much on entertainment?"
  ];

  const features = [
    {
      title: "Translates complex financial patterns into simple, human sentences.",
      cta: "Learn about AI-powered awareness",
      link: "/login",
      gradient: "from-orange-400/20 to-amber-900/20"
    },
    {
      title: "A calm view of spending patterns and stress indicators.",
      cta: "Explore your health snapshot",
      link: "/login",
      gradient: "from-emerald-400/20 to-teal-900/20"
    },
    {
      title: "Minimal data points to generate insights—your history is never for sale.",
      cta: "Read about our privacy-first design",
      link: "/legal",
      gradient: "from-blue-500/20 to-indigo-900/20"
    },
    {
      title: "Understand the 'why' behind money concepts and trade-offs.",
      cta: "See more on education-led clarity",
      link: "/login",
      gradient: "from-purple-500/20 to-rose-900/20"
    }
  ];

  return (
    <div className="landing-container min-h-screen">
      {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} />}
      {/* Navigation */}
      <nav className="navbar fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 transition-all duration-300">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="DebtAI" className="w-10 h-10 object-contain transition-transform" />
          <span className="text-xl font-bold tracking-tight">DebtAI</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-sm font-bold rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Log in
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="hidden md:block px-5 py-2 text-sm font-bold rounded-full border border-border hover:bg-secondary transition-colors"
          >
            Sign up for free
          </button>
        </div>
      </nav>

      <main className="pt-24 md:pt-32">
        {/* Hero Section */}
        <section className="hero-section px-6 text-center max-w-5xl mx-auto">
          {/* Removed DebtAI tag above heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 md:mb-8 leading-[1.1]"
          >
            AI that explains <br />
            <span className="text-emerald-600 dark:text-emerald-400">your finances, </span>
            <span className="italic font-serif font-light text-muted">not advises them.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed px-4"
          >
            Navigate debt and expenses with empathy. No complex charts, no judgment—just clear, human-readable insights to help you breathe easier.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-20 px-6"
          >
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 bg-foreground text-background rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity group text-sm md:text-base"
            >
              Start your journey <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/support')}
              className="w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 font-bold flex items-center justify-center gap-2 hover:bg-secondary rounded-full transition-colors group text-sm md:text-base"
            >
              Contact Us <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Prompt Grid Mockup */}
          <div className="prompt-mosaic-container relative overflow-hidden h-[300px] md:h-[400px] mb-20 md:mb-32 pointer-events-none select-none">
            <div className="prompt-mosaic">
               {/* Multiple rows of prompts */}
               {[0, 1, 2].map((row) => (
                 <div key={row} className={`flex gap-4 mb-4 whitespace-nowrap marquee-row-${row}`}>
                    {[...promptGrid, ...promptGrid].map((text, i) => (
                      <div key={i} className="px-6 py-4 bg-secondary rounded-2xl border border-border text-foreground text-sm font-bold shadow-sm backdrop-blur-sm">
                        {text}
                      </div>
                    ))}
                 </div>
               ))}
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-background"></div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-l from-background via-transparent to-background"></div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background via-transparent to-background"></div>
          </div>
        </section>

        {/* Feature Sections */}
        {features.map((feature, index) => (
          <section key={index} className="feature-section py-20 px-6 max-w-6xl mx-auto text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 px-4"
            >
              {feature.title}
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link
                to={feature.link}
                className="text-muted hover:text-foreground inline-flex items-center gap-1 font-medium mb-12 transition-colors group"
              >
                {feature.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`feature-image-container relative bg-gradient-to-br ${feature.gradient} rounded-[32px] md:rounded-[48px] p-4 md:p-16 h-[400px] md:h-[700px] overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 group`}
            >
               <div className="glass-ui-mockup w-full h-full bg-white/40 dark:bg-black/60 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col light-mode-shadow">
                  {/* Mock UI header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/10">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">Debt Intelligence</span>
                    </div>
                    <div className="flex gap-2">
                       <div className="w-2 h-2 rounded-full bg-red-400"></div>
                       <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                       <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    </div>
                  </div>
                  {/* Mock content */}
                  <div className="flex-1 p-8 flex flex-col justify-center text-left">
                    <div className="max-w-md space-y-6">
                      <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                        <p className="text-sm italic opacity-70">"Translate my balance sheet into human sentences..."</p>
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 bg-emerald-500/30 rounded w-full"></div>
                        <div className="h-3 bg-emerald-500/20 rounded w-5/6"></div>
                        <div className="h-3 bg-foreground/10 rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
               </div>
            </motion.div>
          </section>
        ))}

        {/* Explore Features Grid (Redesigned) */}
        <section className="py-20 md:py-32 px-6 max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-center mb-12 md:mb-20 leading-none">Designed for <br /><span className="text-stone-500">financial peace.</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#141414] border border-white/5 rounded-[32px] p-10 space-y-6">
                <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <Activity size={24} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Debt-Free Timeline</h3>
                <p className="text-stone-500 font-medium leading-relaxed">Calculates exactly when you'll reach zero balance based on your current cash flow.</p>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-[32px] p-10 space-y-6">
                <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <BrainCircuit size={24} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Intelligence Module</h3>
                <p className="text-stone-500 font-medium leading-relaxed">An AI that reads your spending and suggests small, painless adjustments to save more.</p>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-[32px] p-10 space-y-6">
                <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={24} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Privacy by Default</h3>
                <p className="text-stone-500 font-medium leading-relaxed">Your data is encrypted end-to-end. We don't sell your info. We don't even see it.</p>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-[32px] p-10 space-y-6">
                <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <Target size={24} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Snowball Method</h3>
                <p className="text-stone-500 font-medium leading-relaxed">Focus on small wins first to build psychological momentum and stay motivated.</p>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-[32px] p-10 space-y-6">
                <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <TrendingUp size={24} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Avalanche Engine</h3>
                <p className="text-stone-500 font-medium leading-relaxed">Strategically targets high-interest accounts to minimize total cost over time.</p>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-[32px] p-10 space-y-6">
                <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                    <Layout size={24} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Unified View</h3>
                <p className="text-stone-500 font-medium leading-relaxed">See all accounts in one place without jumping between bank apps and spreadsheets.</p>
            </div>
          </div>
        </section>



        {/* Final CTA */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto bg-stone-900 text-white rounded-[48px] py-32 text-center px-4">
            <h2 className="text-4xl md:text-6xl font-bold mb-10 max-w-4xl mx-auto leading-tight">
              Join thousands who have found clarity and freedom with DebtAI.
            </h2>
            <button 
              onClick={() => navigate('/login')}
              className="px-12 py-6 bg-white text-black rounded-full font-bold text-xl inline-flex items-center gap-2 hover:bg-emerald-100 transition-all"
            >
              Get Started for Free <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      <div className="w-full">
         <Footer />
      </div>
    </div>
  );
};

export default Landing;
