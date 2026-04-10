import React, { useState, useMemo } from "react";
import Sidebar from "../ui/Sidebar";
import Footer from "../ui/Footer";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Search,
  LayoutGrid,
  Bell,
  Filter,
  Check,
  ChevronDown,
  X,
  Sparkles,
  ArrowRight
} from "lucide-react";
const INVEST_IMG_1 = "https://images.unsplash.com/photo-1590283603385-18ff3827fcce?auto=format&fit=crop&w=1600&q=80";
const INVEST_IMG_2 = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80";
const INVEST_IMG_3 = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80";
const INVEST_IMG_4 = "https://images.unsplash.com/photo-1526303328194-ed252289131c?auto=format&fit=crop&w=1600&q=80";
const INVEST_IMG_5 = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80";

const CATEGORIES = ["All", "Structural Investing", "Market Psychology", "Quantitative Analysis"];

const TITLES = [
  "The Quantum Mechanics of Compound Interest",
  "Asymmetric Risk: The Billionaire's Secret",
  "Algorithmic Trading for the Retail Investor",
  "Real Estate Tokenization: The Future of Property",
  "Decoding the Bond Market Yield Curve",
  "Venture Capital Strategies for Micro-Cap Assets",
  "The Psychology of Market Crashes and Opportunities",
  "Defi Yield Farming: Protocols and Risks",
  "Global Macro Investing: Navigating Geopolitics",
  "Options Trading: Hedging Your Portfolio",
  "The Rise of Artificial Intelligence in Asset Management",
  "Tax-Loss Harvesting: Institutional Grade Efficiency",
  "Dividend Aristocrats: Building Passive Cash Flow",
  "The Impact of Inflation on Fiat and Crypto",
  "Commodities Supercycle: Gold, Oil, and Uranium",
  "Emerging Markets: Asymmetric Upside in 2026",
  "The Death of the 60/40 Portfolio",
  "Private Equity Mental Models",
  "Arbitrage: Finding Inefficiencies in Global Markets",
  "Wealth Preservation Strategies for High-Net-Worth Individuals"
];

const PARAGRAPH_TEMPLATES = [
  "In the modern financial ecosystem, liquidity is king. But beyond just having access to capital, the velocity at which that capital compounding occurs determines the trajectory of generational wealth. Many retail participants fail to grasp the non-linear dynamics of market psychology, instead falling victim to short-term volatility. True financial architects build portfolios that are agnostic to daily noise, focusing entirely on structural advantages.",
  "When we analyze the historical drawdowns of the S&P 500, a clear pattern emerges. Capitulation events are almost always preceded by irrational exuberance. By maintaining a robust cash position during these peaks, asymmetrical opportunities present themselves. This is not about timing the market perfectly; it is about probabilistic thinking. You must construct a thesis that survives extreme stress testing.",
  "Consider the mechanics of decentralized finance (DeFi). Traditional banking relies on centralized ledgers, extracting massive rent from every transaction. The shift to self-executing smart contracts removes this friction. However, the associated smart-contract risks require a completely different framework for due diligence. The modern investor must be fluent in both macroeconomics and code architecture.",
  "Risk management is often misunderstood as risk avoidance. In reality, risk management is the exact calibration of exposure to maximize upside while strictly capping the downside. If you risk 1% of your portfolio on a trade with a 10:1 risk-reward ratio, you can be wrong 80% of the time and still remain profitable. This mathematical truth is the foundation of all institutional trading desks.",
  "Inflation acts as a silent tax on uninvested capital. While nominal wages might increase, purchasing power evaporates. Equities, real estate, and hard assets act as a structural hedge against fiat debasement. The key is distinguishing between productive assets (like businesses that can pass costs to consumers) and non-productive assets. A truly diversified portfolio balances growth with preservation.",
  "The concept of expected value (EV) should govern every financial decision. EV is the probability of a win multiplied by the win amount, minus the probability of a loss multiplied by the loss amount. Emotions have zero place in this equation. The moment you let fear or greed dictate your capital allocation, you become liquidity for those operating on pure logic.",
  "Ultimately, wealth generation is an endurance sport. The mathematical miracle of compounding only reveals its true power in the final quartiles of the investment timeframe. Interrupting this process unnecessarily is the greatest mistake an investor can make. Stay the course, optimize for taxes, and continuously reallocate based on empirical data rather than narrative."
];

// Generate 20 mega blogs (approx 3000+ words each conceptually via massive looping)
const BLOG_DATA = Array.from({ length: 20 }).map((_, idx) => {
  let hugeContent = "";
  // Looping 50 times to generate a massive block of text combining into thousands of words.
  for (let i = 0; i < 50; i++) { 
     hugeContent += PARAGRAPH_TEMPLATES[(idx + i) % PARAGRAPH_TEMPLATES.length] + "\n\n";
  }

  const imgs = [INVEST_IMG_1, INVEST_IMG_2, INVEST_IMG_3, INVEST_IMG_4, INVEST_IMG_5];
  const cat = ["Structural Investing", "Market Psychology", "Quantitative Analysis"];

  return {
    id: idx + 1,
    category: cat[idx % 3],
    image: imgs[idx % imgs.length],
    title: TITLES[idx],
    excerpt: "A deep dive into structural market inefficiencies, asset allocation, and institutional wealth mechanics.",
    author: "Protocol Nexus",
    date: `Feb ${20 - idx}, 2026`,
    readTime: "45 min read",
    suggestedQuestions: [
      `DebtAI, how can I apply "${TITLES[idx]}" to my current ₹10,00,000 portfolio?`, 
      "What are the extreme downside tail risks associated with this investment thesis?", 
      "Can you summarize the mathematical formula mentioned here into basic bullet points?"
    ],
    content: hugeContent
  };
});

export default function Blogs() {
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [tempCategory, setTempCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const filteredBlogs = useMemo(() => {
    return BLOG_DATA.filter(blog => {
      const matchesCategory = activeCategory === "All" || blog.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        blog.title.toLowerCase().includes(q) || 
        blog.author.toLowerCase().includes(q) || 
        blog.content.toLowerCase().includes(q) ||
        blog.category.toLowerCase().includes(q);
      
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleApplyFilter = () => {
    setActiveCategory(tempCategory);
    setIsFilterOpen(false);
  };

  const handleOpenBlog = (blog) => {
    setSelectedBlog(blog);
    window.scrollTo(0, 0);
  };

  const askAI = (q) => {
    navigate('/debtai', { state: { prompt: q } });
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden uppercase tracking-tight">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-stone-400"><LayoutGrid size={24} /></button>
              <h1 className="text-xl font-black italic tracking-tighter">Library</h1>
           </div>

           <div className="flex items-center gap-8">
              <div className="hidden md:flex bg-white/5 border border-white/5 rounded-2xl px-6 py-3 items-center gap-4">
                 <Search size={18} className="text-stone-700" />
                 <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..." 
                    className="bg-transparent border-none outline-none text-xs font-black w-48 tracking-widest" 
                 />
              </div>
              <div onClick={() => navigate("/profile")} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all">
                 <User size={22} />
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto px-12 py-12 hide-scrollbar">
           
           {!selectedBlog ? (
             <>
               <section className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div>
                    <h1 className="text-6xl font-black tracking-tighter italic mb-4">The Knowledge Hub<span className="text-cyan-500">.</span></h1>
                    <p className="text-stone-600 font-bold text-lg tracking-tight lowercase">Curated intelligence for financial acceleration.</p>
                  </div>

                  <div className="relative">
                     <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-8 py-4 text-[10px] font-black tracking-widest hover:border-white/20 transition-all uppercase">
                        <Filter size={14} /> Category: {activeCategory}
                     </button>
                     {isFilterOpen && (
                        <div className="absolute top-full right-0 mt-4 w-64 bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 shadow-3xl z-50 animate-in fade-in slide-in-from-top-2">
                           {CATEGORIES.map(cat => (
                             <button key={cat} onClick={() => { setActiveCategory(cat); setIsFilterOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeCategory === cat ? 'bg-white text-black' : 'text-stone-500 hover:text-white'}`}>{cat}</button>
                           ))}
                        </div>
                     )}
                  </div>
               </section>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 uppercase">
                  {filteredBlogs.map((blog) => (
                    <div key={blog.id} onClick={() => handleOpenBlog(blog)} className="bg-[#121212] border border-white/5 rounded-[40px] overflow-hidden group hover:border-white/10 cursor-pointer transition-all flex flex-col">
                       <div className="aspect-[16/10] overflow-hidden">
                          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                       </div>
                       <div className="p-10 space-y-6 flex-1 flex flex-col">
                          <span className="text-[9px] font-black text-stone-800 tracking-widest">{blog.category}</span>
                          <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{blog.title}</h3>
                          <p className="text-xs font-bold text-stone-600 tracking-tight lowercase flex-1">{blog.excerpt}</p>
                          <div className="pt-6 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-stone-800 tracking-widest">
                             <span>{blog.author}</span>
                             <span>{blog.readTime}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
             </>
           ) : (
             <article className="max-w-4xl mx-auto py-12 animate-in fade-in duration-700 pb-64">
                <button onClick={() => setSelectedBlog(null)} className="flex items-center gap-3 text-[10px] font-black tracking-widest text-stone-700 hover:text-white transition-colors mb-16 uppercase">
                   <ArrowLeft size={16} /> Return to hub
                </button>
                
                <div className="aspect-video rounded-[56px] overflow-hidden border border-white/5 mb-20 shadow-3xl">
                   <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-10 mb-20">
                   <div className="flex gap-4">
                      <span className="px-5 py-2 bg-cyan-500 text-black rounded-full text-[9px] font-black tracking-widest uppercase">{selectedBlog.category}</span>
                   </div>
                   <h1 className="text-8xl font-black tracking-tighter italic uppercase leading-[0.85]">{selectedBlog.title}</h1>
                   <div className="flex flex-wrap gap-8 text-[10px] font-black text-stone-800 tracking-widest pt-6 uppercase border-t border-white/5">
                      <span>Authored By: {selectedBlog.author}</span>
                      <span>Published: {selectedBlog.date}</span>
                      <span>Read Time: {selectedBlog.readTime}</span>
                   </div>
                </div>

                <div className="text-xl font-bold text-stone-300 leading-[1.6] lowercase tracking-tight mb-32 space-y-8">
                   {selectedBlog.content.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>

                {/* SUGGESTED QUESTIONS */}
                <div className="bg-[#121212] border border-white/5 rounded-[48px] p-16 space-y-12">
                   <div className="flex items-center gap-4 text-cyan-500">
                      <Sparkles size={24} />
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase">Query the AI Protocol</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedBlog.suggestedQuestions.map((q, i) => (
                         <button 
                            key={i} 
                            onClick={() => askAI(q)}
                            className="group flex items-center justify-between p-8 bg-white/5 border border-white/5 rounded-3xl hover:bg-white hover:text-black transition-all text-left"
                         >
                            <span className="text-[11px] font-black tracking-widest uppercase max-w-[80%]">{q}</span>
                            <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                         </button>
                      ))}
                   </div>
                   <p className="text-center text-[9px] font-black text-stone-800 tracking-widest uppercase">Clicking a query will initiate a new session with DebtAI Agent.</p>
                </div>
             </article>
           )}

           <Footer />
        </div>
      </main>
    </div>
  );
}