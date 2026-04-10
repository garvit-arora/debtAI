import React, { useState } from "react";
import Sidebar from "../ui/Sidebar";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Calendar, 
  User, 
  ChevronRight, 
  ShieldCheck, 
  PieChart, 
  TrendingUp, 
  Sparkles, 
  MessageSquare, 
  Menu, 
  X,
  Search,
  Filter,
  ArrowUpRight,
  ChevronDown
} from "lucide-react";

// --- IMAGES ---
const HERO_IMG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"; 
const CREDIT_IMG = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2011&auto=format&fit=crop";
const BUDGET_IMG = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop";
const DEBT_IMG = "https://images.unsplash.com/photo-1543286386-2e659306cd6c?q=80&w=2070&auto=format&fit=crop";
const INVEST_IMG = "https://images.unsplash.com/photo-1611974714471-da0722108133?q=80&w=2070&auto=format&fit=crop";
const PSYCH_IMG = "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2006&auto=format&fit=crop";
const EMI_IMG = "https://images.unsplash.com/photo-1579621970795-87faff2f9160?q=80&w=2070&auto=format&fit=crop";
const EMERGENCY_IMG = "https://images.unsplash.com/photo-1454165205744-3b78555e5572?q=80&w=2070&auto=format&fit=crop";
const TAX_IMG = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop";
const PASSIVE_IMG = "https://images.unsplash.com/photo-1591696208162-a9774946e6ca?q=80&w=2070&auto=format&fit=crop";
const AI_IMG = "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop";

const BLOG_DATA = [
  {
    id: 1,
    category: "Credit Health",
    image: CREDIT_IMG,
    title: "Mastering Your Credit Score",
    excerpt: "Your credit score is the key to financial mobility. Learn how to repair, build, and maintain a score that opens doors.",
    author: "Garvit Arora",
    date: "Jan 12, 2026",
    readTime: "12 min read",
    content: (
      <div className="space-y-8">
        <p className="text-xl font-medium text-white leading-relaxed">
          The three-digit number that dictates your financial destiny. Whether you're applying for a mortgage, a car loan, or a new credit card, your credit score is the first thing lenders see.
        </p>
        <h3 className="text-3xl font-black italic uppercase tracking-tighter">The Calculation Protocol</h3>
        <p>Your score isn't random. It's built on a proprietary weighting of your financial behavior:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                <h4 className="font-black text-white mb-2 uppercase text-xs tracking-widest">Payment History (35%)</h4>
                <p className="text-sm text-stone-500">The most critical factor. One late payment can slash your score significantly.</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                <h4 className="font-black text-white mb-2 uppercase text-xs tracking-widest">Credit Utilization (30%)</h4>
                <p className="text-sm text-stone-500">The ratio of your used credit vs total limit. Aim for under 10% for elite status.</p>
            </div>
        </div>
        <h3 className="text-3xl font-black italic uppercase tracking-tighter">Forensic Repair Strategies</h3>
        <p>If your score is suppressed, the remediation process begins with accuracy. Under the FCRA, you have the right to challenge inaccuracies. AI DebtAI identifies these discrepancies automatically, saving you months of manual auditing.</p>
      </div>
    )
  },
  {
    id: 2,
    category: "Debt Strategy",
    image: DEBT_IMG,
    title: "Snowball vs Avalanche Method",
    excerpt: "Choosing between psychological wins and mathematical efficiency. Which strategy fits your financial personality?",
    author: "Strategy Team",
    date: "Jan 10, 2026",
    readTime: "10 min read",
    content: (
      <div className="space-y-8">
        <p className="text-xl font-medium text-white leading-relaxed">
          Debt is a mathematical problem that often requires a psychological solution. The two most prominent strategies offer different entry points into freedom.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-10">
          <div className="space-y-4">
             <h4 className="text-2xl font-black text-white uppercase italic">The Snowball</h4>
             <p className="text-stone-400">Order by balance size. Pay the smallest first. Why? Quick wins trigger dopamine, creating the momentum needed for larger hurdles.</p>
          </div>
          <div className="space-y-4">
             <h4 className="text-2xl font-black text-white uppercase italic">The Avalanche</h4>
             <p className="text-stone-400">Order by Interest Rate. Mathematically superior. You pay the least amount of interest over time, though psychological wins take longer.</p>
          </div>
        </div>
        <p className="italic border-l-4 border-white pl-8 py-4 text-stone-500 text-lg">"The best plan is the one you actually stick to. DebtAI simulates both to show you exactly how much time vs money you trade."</p>
      </div>
    )
  },
  {
    id: 3,
    category: "Budgeting",
    image: BUDGET_IMG,
    title: "The 50/30/20 Rule: A Framework",
    excerpt: "Stop guessing and start allocating. This simple ratio ensures growth while allowing for lifestyle enjoyment.",
    author: "Budgeting Dept.",
    date: "Jan 08, 2026",
    readTime: "9 min read",
    content: (
      <div className="space-y-8">
        <p className="text-xl font-medium text-white leading-relaxed">
          Complex budgeting systems often fail because they are too rigid. The 50/30/20 rule is a fluid framework designed for sustainable wealth.
        </p>
        <ul className="space-y-6">
            <li className="flex items-start gap-4">
                <span className="text-4xl font-black text-stone-800">50</span>
                <div>
                   <h5 className="font-black text-white uppercase tracking-widest text-xs mb-1">Needs</h5>
                   <p className="text-stone-500">Essential survivability—housing, food, utilities, minimum debt payments.</p>
                </div>
            </li>
            <li className="flex items-start gap-4">
                <span className="text-4xl font-black text-stone-800">30</span>
                <div>
                   <h5 className="font-black text-white uppercase tracking-widest text-xs mb-1">Wants</h5>
                   <p className="text-stone-500">Lifestyle choices—dining, entertainment, hobbies. This prevents burnout.</p>
                </div>
            </li>
            <li className="flex items-start gap-4">
                <span className="text-4xl font-black text-stone-800">20</span>
                <div>
                   <h5 className="font-black text-white uppercase tracking-widest text-xs mb-1">Financial Progress</h5>
                   <p className="text-stone-500">The wealth engine—extra debt payments, retirement funding, emergency savings.</p>
                </div>
            </li>
        </ul>
      </div>
    )
  },
  {
    id: 4,
    category: "Investing",
    image: INVEST_IMG,
    title: "Transitioning Debt to Wealth",
    excerpt: "The exact moment you should stop aggressive debt paydown and start compound interest aggregation.",
    author: "Investment Team",
    date: "Jan 05, 2026",
    readTime: "15 min read",
    content: (
      <div className="space-y-8">
        <p className="text-xl font-medium text-white leading-relaxed">The opportunity cost of debt isn't just interest—it's the wealth you aren't building while your capital is tied up in liabilities.</p>
        <p>The cardinal rule: If your debt interest rate is lower than your expected market return, you build wealth faster by investing. However, the psychological 'freedom' of zero debt often outweighs the 1-2% mathematical gain.</p>
      </div>
    )
  },
  {
    id: 5,
    category: "Psychology",
    image: PSYCH_IMG,
    title: "The Psychology of Spending",
    excerpt: "Why we buy things we don't need with money we don't have. Understanding the Dopamine Trap.",
    author: "Behavioral Analysis",
    date: "Jan 02, 2026",
    readTime: "11 min read",
    content: (
        <div className="space-y-8">
          <p className="text-xl font-medium text-white leading-relaxed">Our brains are hardwired for instant gratification, a vestige of our hunter-gatherer past where resources were scarce and temporary.</p>
          <p>Modern marketing leverages this biology. Every 'one-click buy' is a carefully engineered dopamine delivery system. Recognizing the 'Vantage Point' of your spending impulses is the first step toward decoupling your emotions from your bank account.</p>
        </div>
      )
  },
  {
    id: 6,
    category: "Interest Trap",
    image: EMI_IMG,
    title: "Navigating the EMI Interest Trap",
    excerpt: "Low monthly payments are the ultimate illusion. Learn how the amortization schedule hides the real cost.",
    author: "Forensic Audit",
    date: "Dec 30, 2025",
    readTime: "14 min read",
    content: (
        <div className="space-y-8">
          <p className="text-xl font-medium text-white leading-relaxed">The danger of EMI is that it masks the total price through 'affordability' focused on monthly outflow rather than total cost of ownership.</p>
          <p>A ₹50,000 product at 15% interest for 24 months costs drastically more than a 6-month tenure. DebtAI's Velocity Meter shows you the 'Total Interest Leak' in real-time.</p>
        </div>
      )
  },
  {
    id: 7,
    category: "Security",
    image: EMERGENCY_IMG,
    title: "Building an Emergency Fortress",
    excerpt: "Why 3 months isn't always enough and how to calculate your personalized 'Stability Index'.",
    author: "Risk Management",
    date: "Dec 25, 2025",
    readTime: "8 min read",
    content: (
        <div className="space-y-8">
          <p className="text-xl font-medium text-white leading-relaxed">An emergency fund is insurance for your sanity. Without it, one flat tire can derail a year of debt paydown.</p>
          <p>We recommend a Tiered approach: 1 month of 'Survival' cash (liquid), followed by 5 months of 'Architectural' stability (HYSAs or low-risk bonds).</p>
        </div>
      )
  },
  {
    id: 8,
    category: "Tax Logic",
    image: TAX_IMG,
    title: "Tax Optimization for High Earners",
    excerpt: "It's not about how much you make, but how much you keep. Intelligent deduction mapping.",
    author: "Tax Architect",
    date: "Dec 20, 2025",
    readTime: "13 min read",
    content: (
        <div className="space-y-8">
          <p className="text-xl font-medium text-white leading-relaxed">Tax is your largest single expense. Treating it as a passive cost is an architectural failure.</p>
          <p>From 401k/HSA stacking to standard vs itemized auditing, we dissect the logic layers used by the top 1% to reduce their fiscal footprint.</p>
        </div>
      )
  },
  {
    id: 9,
    category: "Passive Income",
    image: PASSIVE_IMG,
    title: "The Reality of Passive Income",
    excerpt: "Moving past the 'Beach Side Laptop' myth into real dividend and rental yield strategies.",
    author: "Wealth Dept.",
    date: "Dec 15, 2025",
    readTime: "16 min read",
    content: (
        <div className="space-y-8">
          <p className="text-xl font-medium text-white leading-relaxed">Passive income isn't free—it requires either significant capital or significant time upfront.</p>
          <p>Dividends, Index Funds, and REITs are the primary paths for the debt-conscious investor. Each has a 'Time-to-Yield' coefficient that must align with your payoff velocity.</p>
        </div>
      )
  },
  {
    id: 10,
    category: "AI Revolution",
    image: AI_IMG,
    title: "AI & The Future of Money",
    excerpt: "How neural networks are replacing spreadsheet-based financial planning for elite accuracy.",
    author: "Architecture Lab",
    date: "Dec 10, 2025",
    readTime: "10 min read",
    content: (
        <div className="space-y-8">
          <p className="text-xl font-medium text-white leading-relaxed">Spreadsheets are static records of the past. AI is a dynamic predictor of the future.</p>
          <p>By analyzing thousands of data points across global markets and your personal spending habits, DebtAI provides a level of forensic oversight previously reserved for institutional hedge funds.</p>
        </div>
      )
  }
];

export default function Blogs() {
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredBlogs = activeCategory === "All" 
    ? BLOG_DATA 
    : BLOG_DATA.filter(b => b.category === activeCategory);

  const handleOpenBlog = (blog) => {
    setSelectedBlog(blog);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBack = () => {
    setSelectedBlog(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const featuredBlog = BLOG_DATA[0];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
      
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto hide-scrollbar relative">
        
        {/* HERO / NAVBAR INTEGRATED (ONLY IF NOT IN BLOG DETAIL) */}
        {!selectedBlog && (
          <div className="relative h-[65vh] w-full shrink-0">
             <img src={HERO_IMG} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-60" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80"></div>
             
             {/* INTEGRATED NAVBAR */}
             <div className="relative z-10 px-12 pt-8 flex items-center justify-between">
                <div className="flex items-center gap-10">
                   <h2 className="text-2xl font-black tracking-tighter italic uppercase text-white">Knowledge Hub<span className="text-stone-800">.</span></h2>
                   <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-stone-400">
                      <button className="hover:text-white transition-none">Strategy</button>
                      <button className="hover:text-white transition-none">Security</button>
                      <button className="hover:text-white transition-none">Investment</button>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 gap-3">
                      <Search size={14} className="text-stone-600" />
                      <input type="text" placeholder="Search insights..." className="bg-transparent outline-none text-[10px] font-black uppercase tracking-widest w-48 placeholder:text-stone-700" />
                   </div>
                   <button onClick={() => navigate('/premium')} className="px-6 py-2 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-2xl">Access Premium</button>
                </div>
             </div>

             {/* HERO CONTENT */}
             <div className="absolute bottom-20 left-12 right-12 z-10 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex items-center gap-4">
                   <span className="px-5 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full">{featuredBlog.category}</span>
                   <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Featured Analysis</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] uppercase italic">{featuredBlog.title}</h1>
                <p className="text-stone-400 text-lg font-medium max-w-2xl leading-relaxed">{featuredBlog.excerpt}</p>
                <div className="flex items-center gap-8 pt-4">
                   <div className="flex items-center gap-4 font-black">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                         <User size={18} className="text-white" />
                      </div>
                      <span className="text-xs uppercase tracking-widest">{featuredBlog.author}</span>
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-stone-600 flex items-center gap-2">
                       <Clock size={14} /> {featuredBlog.readTime}
                   </div>
                   <button onClick={() => handleOpenBlog(featuredBlog)} className="flex items-center gap-2 text-white group">
                      <span className="text-[10px] font-black uppercase tracking-widest">Begin Inquest</span>
                      <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                   </button>
                </div>
             </div>
          </div>
        )}

        <div className={`px-12 pb-24 ${selectedBlog ? 'pt-12' : 'pt-24'}`}>
          
          {selectedBlog ? (
            <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-500">
              <button 
                onClick={handleBack}
                className="flex items-center gap-4 text-stone-600 mb-12"
              >
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                  <ArrowLeft size={20} />
                </div>
                <span className="uppercase tracking-[0.4em] text-[10px] font-black">Return to Library</span>
              </button>

              <div className="space-y-12">
                  <header className="space-y-10">
                    <div className="space-y-6">
                        <span className="px-5 py-2 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest rounded-full text-stone-400">{selectedBlog.category}</span>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-[0.9]">{selectedBlog.title}</h1>
                    </div>
                    <div className="flex items-center justify-between py-10 border-y border-white/5">
                        <div className="flex items-center gap-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5"><User size={20} className="text-stone-400" /></div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-700">Analyst</p>
                                    <p className="text-sm font-black text-white">{selectedBlog.author}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5"><Calendar size={20} className="text-stone-400" /></div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-700">Indexed</p>
                                    <p className="text-sm font-black text-white">{selectedBlog.date}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-stone-600">
                            <Clock size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{selectedBlog.readTime}</span>
                        </div>
                    </div>
                  </header>

                  <div className="relative aspect-[21/9] rounded-[48px] overflow-hidden border border-white/5 shadow-2xl">
                     <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="max-w-4xl text-stone-400 font-medium leading-relaxed text-lg pb-24">
                    {selectedBlog.content}
                  </div>
              </div>
            </div>
          ) : (
            <div className="space-y-20 max-w-7xl mx-auto">
              
              <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                  <div className="space-y-4">
                     <h2 className="text-5xl font-black tracking-tighter uppercase italic text-white underline decoration-white/10 underline-offset-8">Inquest Catalog<span className="text-stone-800">.</span></h2>
                     <p className="text-stone-600 font-bold text-lg">Detailed forensic intelligence across the financial spectrum.</p>
                  </div>
                  <div className="flex items-center gap-8 border-b border-white/5 pb-2">
                     {["All", "Credit Health", "Debt Strategy", "Budgeting", "Psychology"].map(cat => (
                       <button 
                         key={cat} 
                         onClick={() => setActiveCategory(cat)}
                         className={`text-[10px] font-black uppercase tracking-[0.3em] pb-3 transition-all relative ${activeCategory === cat ? 'text-white' : 'text-stone-800'}`}
                       >
                         {cat}
                         {activeCategory === cat && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>}
                       </button>
                     ))}
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                {filteredBlogs.map((blog) => (
                  <div key={blog.id} onClick={() => handleOpenBlog(blog)} className="group cursor-pointer flex flex-col space-y-8">
                    <div className="relative aspect-[16/10] rounded-[40px] overflow-hidden border border-white/5 shadow-2xl">
                       <img src={blog.image} alt={blog.title} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                       <span className="absolute top-6 left-6 px-4 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-white">{blog.category}</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-stone-700">
                           <span>{blog.date}</span>
                           <span className="flex items-center gap-1.5"><Clock size={12} /> {blog.readTime}</span>
                        </div>
                        <h3 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-[0.9] group-hover:text-stone-400 transition-colors">{blog.title}</h3>
                        <p className="text-stone-600 text-sm font-bold leading-relaxed line-clamp-2">{blog.excerpt}</p>
                    </div>
                    <div className="pt-4 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><ArrowUpRight size={18} className="text-stone-600" /></div>
                       <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Read Documentation</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER CALLOUT */}
              <div className="bg-[#0d0d0d] border border-white/5 rounded-[56px] p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
                  <div className="relative z-10 space-y-8 max-w-2xl">
                     <h3 className="text-5xl font-black tracking-tighter text-white italic uppercase leading-[0.9]">Master Your Financial Architecture.</h3>
                     <p className="text-stone-600 text-lg font-bold leading-relaxed">Join the elite layer of tactical earners using AI-driven oversight to accelerate their path to equity.</p>
                     <button className="bg-white text-black px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-3xl active:scale-95 transition-all">Execute Onboarding</button>
                  </div>
                  <div className="relative z-10 shrink-0">
                     <div className="w-64 h-64 bg-white/5 border border-white/10 rounded-[48px] flex items-center justify-center p-12 rotate-12">
                        <ShieldCheck size={120} className="text-white/20" />
                     </div>
                  </div>
                  <div className="absolute right-[-10%] bottom-[-10%] w-[600px] h-[600px] bg-white/[0.01] blur-[150px] rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}