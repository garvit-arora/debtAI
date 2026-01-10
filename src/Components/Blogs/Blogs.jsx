import React, { useState } from "react";
import Sidebar from "../ui/Sidebar";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Calendar, 
  User, 
  ChevronRight, 
  ShieldCheck, 
  DollarSign,
  PieChart,
  TrendingUp,
  Umbrella,
  BrainCircuit,
  Briefcase,
  FileText,
  Coffee,
  Sparkles,
  MessageSquare,
  Menu, // Added Menu Icon
  X // Added X Icon
} from "lucide-react";

// --- UPDATED BLOG CONTENT WITH AI SUGGESTIONS ---
const BLOG_DATA = [
  {
    id: 1,
    category: "Credit Health",
    icon: <ShieldCheck size={20} />,
    title: "The Ultimate Guide to Mastering Your Credit Score",
    excerpt: "Your credit score is the most important number in your financial life. Learn how to repair, build, and maintain a score that opens doors.",
    author: "DebtAI Financial Team",
    date: "Jan 8, 2026",
    readTime: "8 min read",
    questions: [
      "Write me a Goodwill Letter template to remove a late payment.",
      "Explain the Azul Method for credit utilization in detail.",
      "How exactly do I dispute an error on my credit report?"
    ],
    content: (
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <p className="text-xl font-medium text-[#5B2D2D]">
          Your credit score isn't just a number—it's a key that unlocks lower interest rates, better housing options, and even job opportunities.
        </p>
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">What Actually Makes Up Your Score?</h3>
        <p>FICO and VantageScore use slightly different models, but the core components remain consistent.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Payment History (35%):</strong> The single biggest factor. Did you pay on time?</li>
          <li><strong>Credit Utilization (30%):</strong> Ratio of current debt to credit limit. Keep it under 30%.</li>
          <li><strong>Length of Credit History (15%):</strong> Older accounts are better. Don't close old cards!</li>
          <li><strong>Credit Mix (10%):</strong> A mix of revolving (cards) and installment (loans) debt is healthy.</li>
          <li><strong>New Credit (10%):</strong> Don't apply for too many cards at once.</li>
        </ul>

        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">Actionable Strategies</h3>
        <h4 className="text-xl font-bold text-[#5B2D2D] mt-4">1. The 'Azul' Method</h4>
        <p>Pay off your balance <strong>3 days before</strong> the statement closes. This forces the issuer to report a $0 balance (0% utilization) to bureaus.</p>

        <h4 className="text-xl font-bold text-[#5B2D2D] mt-4">2. Become an Authorized User</h4>
        <p>Piggyback off a parent or partner's good credit history by getting added to their card.</p>
      </div>
    )
  },
  {
    id: 2,
    category: "Budgeting",
    icon: <PieChart size={20} />,
    title: "The Art of Sorting Finances: Budgeting 101",
    excerpt: "Budgeting isn't about restriction; it's about permission. Learn how to sort your income into buckets that guarantee wealth.",
    author: "Sarah Jenkins, CPA",
    date: "Jan 6, 2026",
    readTime: "6 min read",
    questions: [
      "Create a 50/30/20 budget for a $4,000 monthly income.",
      "What are some examples of Sinking Funds I should have?",
      "How do I do Zero-Based budgeting if my income varies?"
    ],
    content: (
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <p className="text-xl font-medium text-[#5B2D2D]">
          A budget is simply telling your money where to go instead of wondering where it went.
        </p>
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">The 50/30/20 Rule</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>50% Needs:</strong> Housing, utilities, groceries.</li>
          <li><strong>30% Wants:</strong> Dining out, Netflix, hobbies.</li>
          <li><strong>20% Savings/Debt:</strong> Future you fund.</li>
        </ul>

        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">The Bucket Strategy</h3>
        <p>Use separate bank accounts to physically separate your money:</p>
        <ol className="list-decimal pl-5 space-y-4">
          <li><strong>Bills Account:</strong> Fixed costs only.</li>
          <li><strong>Spending Account:</strong> Groceries and gas.</li>
          <li><strong>Fun Account:</strong> Guilt-free spending.</li>
        </ol>
      </div>
    )
  },
  {
    id: 3,
    category: "Debt Strategy",
    icon: <TrendingUp size={20} />,
    title: "Snowball vs. Avalanche: The Math vs. The Psychology",
    excerpt: "Two methods, one goal: Debt Freedom. Should you pay the smallest balance first or the highest interest?",
    author: "DebtAI Strategy Team",
    date: "Jan 5, 2026",
    readTime: "10 min read",
    questions: [
      "Simulate a Debt Snowball for 3 debts: $500, $2000, $5000.",
      "Why does the Avalanche method save more money?",
      "Can I switch from Snowball to Avalanche halfway through?"
    ],
    content: (
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <p className="text-xl font-medium text-[#5B2D2D]">
          Who gets paid first? The answer depends on whether you are motivated by math or by emotion.
        </p>
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">The Debt Snowball (Psychology)</h3>
        <p>List debts smallest to largest. Pay minimums on all, attack the smallest. The quick wins release dopamine and keep you motivated.</p>

        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">The Debt Avalanche (Math)</h3>
        <p>List debts highest interest rate to lowest. Mathematically saves the most money, but requires patience.</p>
      </div>
    )
  },
  {
    id: 4,
    category: "Savings",
    icon: <Umbrella size={20} />,
    title: "Emergency Funds: Your Financial Airbag",
    excerpt: "Life hits hard. Without a cushion, a flat tire becomes a debt spiral. Here is exactly how much you need.",
    author: "Alex Morgan",
    date: "Jan 4, 2026",
    readTime: "5 min read",
    questions: [
      "Where can I find high-yield savings accounts?",
      "Is $1,000 enough for a starter emergency fund?",
      "Should I invest my emergency fund in stocks?"
    ],
    content: (
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <p className="text-xl font-medium text-[#5B2D2D]">
          60% of people cannot cover a $1,000 emergency. This is the "Debt Trap."
        </p>
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">Phase 1: The Starter Fund</h3>
        <p>Save $1,000 to $2,000 immediately. Keep it in a separate bank account.</p>

        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">Phase 2: 3-6 Months</h3>
        <p>Once debt is gone, build a fund that covers 3-6 months of essential living expenses.</p>
      </div>
    )
  },
  {
    id: 5,
    category: "Investing",
    icon: <DollarSign size={20} />,
    title: "Investing for Beginners: Stocks, Bonds & ETFs",
    excerpt: "The stock market isn't a casino if you do it right. Learn the power of compound interest.",
    author: "DebtAI Investment Desk",
    date: "Jan 3, 2026",
    readTime: "12 min read",
    questions: [
      "Explain what an ETF is like I'm 5 years old.",
      "Calculate compound interest on $500/month for 30 years.",
      "What is the S&P 500?"
    ],
    content: (
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <p className="text-xl font-medium text-[#5B2D2D]">
          Investing is the only way to beat inflation. It is not about picking stocks; it's about buying the economy.
        </p>
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">Vocabulary</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Stock:</strong> Ownership in a company.</li>
          <li><strong>ETF:</strong> A basket of hundreds of stocks (safer).</li>
        </ul>
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">Compound Interest</h3>
        <p>Investing $500/month starting at age 25 results in $1.7 Million by age 65 (assuming 8% return).</p>
      </div>
    )
  },
  {
    id: 6,
    category: "Psychology",
    icon: <BrainCircuit size={20} />,
    title: "The Psychology of Money: Why We Spend",
    excerpt: "Discover the hidden biases like the Diderot Effect that drain your wallet.",
    author: "Dr. Elena Vance",
    date: "Jan 2, 2026",
    readTime: "9 min read",
    questions: [
      "How do I stop 'Lifestyle Creep'?",
      "What is the Diderot Effect?",
      "Give me tips to stop impulse buying."
    ],
    content: (
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <p className="text-xl font-medium text-[#5B2D2D]">
          Money isn't about math. It's about behavior.
        </p>
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">The Diderot Effect</h3>
        <p>One new purchase leads to a spiral of consumption. You buy a new dress, so you need new shoes, then new jewelry.</p>
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">Retail Therapy</h3>
        <p>Use the <strong>72-Hour Rule</strong>. Wait 3 days before buying non-essentials.</p>
      </div>
    )
  },
  {
    id: 7,
    category: "Income",
    icon: <Briefcase size={20} />,
    title: "Side Hustles: Passive Income in 2026",
    excerpt: "You can't budget your way out of poverty. Sometimes you need a bigger shovel.",
    author: "DebtAI Financial Team",
    date: "Jan 1, 2026",
    readTime: "7 min read",
    questions: [
      "List 5 side hustles with $0 startup cost.",
      "How can I sell digital products?",
      "What is 'Service Arbitrage'?"
    ],
    content: (
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">1. Digital Products</h3>
        <p>Sell templates, guides, or courses. Create once, sell forever.</p>
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">2. Arbitrage</h3>
        <p>Buy low at thrift stores, sell high on eBay.</p>
      </div>
    )
  },
  {
    id: 8,
    category: "Retirement",
    icon: <Clock size={20} />,
    title: "Retirement Planning: It's Never Too Early",
    excerpt: "How to build your nest egg using 401ks, Roth IRAs, and HSAs.",
    author: "Sarah Jenkins, CPA",
    date: "Dec 28, 2025",
    readTime: "9 min read",
    questions: [
      "What is the difference between Roth IRA and Traditional IRA?",
      "Explain the 4% rule for retirement.",
      "Why is an HSA called a secret weapon?"
    ],
    content: (
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">Order of Operations</h3>
        <ol className="list-decimal pl-5 space-y-2">
            <li>401(k) Match (Free money)</li>
            <li>Roth IRA (Tax-free growth)</li>
            <li>HSA (Triple tax advantage)</li>
        </ol>
      </div>
    )
  },
  {
    id: 9,
    category: "Taxes",
    icon: <FileText size={20} />,
    title: "Navigating Taxes: Deductions & Credits",
    excerpt: "Learn the legal ways to reduce your tax liability through strategic planning.",
    author: "DebtAI Financial Team",
    date: "Dec 20, 2025",
    readTime: "11 min read",
    questions: [
      "What is the difference between a tax credit and a deduction?",
      "Can I deduct student loan interest?",
      "What is tax loss harvesting?"
    ],
    content: (
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">Deductions vs Credits</h3>
        <p><strong>Credits</strong> are better. They reduce your tax bill dollar-for-dollar. <strong>Deductions</strong> just lower your taxable income.</p>
      </div>
    )
  },
  {
    id: 10,
    category: "Lifestyle",
    icon: <Coffee size={20} />,
    title: "Frugal Living: Saving Without Misery",
    excerpt: "Spend extravagantly on what you love and cut costs mercilessly on what you don't.",
    author: "Alex Morgan",
    date: "Dec 15, 2025",
    readTime: "6 min read",
    questions: [
      "How can I negotiate my car insurance bill?",
      "What are the 'Big Three' expenses to cut?",
      "Give me cheap meal prep ideas."
    ],
    content: (
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">The Big Three</h3>
        <p>Housing, Transportation, Food. Cut here to make a real impact.</p>
        <h3 className="text-2xl font-bold text-[#5B2D2D] mt-8">Negotiate Everything</h3>
        <p>Call your internet and insurance providers annually to ask for better rates.</p>
      </div>
    )
  }
];

export default function Blogs() {
  const [selectedBlog, setSelectedBlog] = useState(null);
  const navigate = useNavigate();
  
  // Mobile Sidebar State (Added)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenBlog = (blog) => {
    setSelectedBlog(blog);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedBlog(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- NEW: FUNCTION TO NAVIGATE TO AI CHAT ---
  const handleAskAI = (question) => {
    navigate("/debtai", { state: { autoPrompt: question } });
  };

  return (
    <div className="flex min-h-screen bg-[#f8ecdd] font-sans relative">
      
      {/* --- SIDEBAR LOGIC --- */}
      
      {/* 1. Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[40] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* 2. Mobile Drawer */}
      <div className={`fixed inset-y-0 left-0 z-[50] w-64 bg-transparent transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-stone-200 hover:text-white z-50"
        >
            <X size={24} />
        </button>
        <Sidebar />
      </div>

      {/* 3. Desktop Sidebar (Fixed) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 md:ml-28 p-6 md:p-12 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Row (Hamburger + Title) */}
          <div className="flex items-center gap-4 mb-4 md:mb-0">
             <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 -ml-2 text-[#5B2D2D] hover:bg-stone-200/50 rounded-lg md:hidden"
              >
                  <Menu size={28} />
             </button>
             
             {!selectedBlog && (
                <div className="text-left">
                  <h1 className="text-3xl md:text-5xl font-bold text-[#5B2D2D] mb-2">Financial Insights</h1>
                  <p className="text-[#5B2D2D]/70 text-sm md:text-lg max-w-2xl hidden sm:block">
                    Deep dives into credit, investing, and wealth building.
                  </p>
                </div>
              )}
          </div>
          {/* Mobile only subtitle */}
          {!selectedBlog && <p className="text-[#5B2D2D]/70 text-sm mb-8 sm:hidden">Deep dives into credit, investing, and wealth building.</p>}

          {selectedBlog ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-[#5B2D2D]/70 hover:text-[#5B2D2D] font-bold mb-8 transition-colors group"
              >
                <div className="p-2 bg-white rounded-full group-hover:bg-[#5B2D2D]/10 transition-colors">
                  <ArrowLeft size={20} />
                </div>
                Back to Articles
              </button>

              <article className="bg-white rounded-[40px] shadow-sm border border-stone-100 overflow-hidden mb-12">
                <div className="bg-[#5B2D2D] text-[#f8ecdd] p-8 md:p-16 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-10">
                    <BookOpen size={200} />
                  </div>
                  
                  <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-3 mb-6 text-orange-200 font-bold tracking-wider uppercase text-sm">
                      <span className="bg-white/10 px-3 py-1 rounded-full">{selectedBlog.category}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {selectedBlog.readTime}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">{selectedBlog.title}</h1>
                    
                    <div className="flex items-center gap-6 text-white/80 text-sm font-medium">
                      <div className="flex items-center gap-2"><User size={16} />{selectedBlog.author}</div>
                      <div className="flex items-center gap-2"><Calendar size={16} />{selectedBlog.date}</div>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-16 max-w-4xl mx-auto">
                  {selectedBlog.content}
                </div>
              </article>

              {/* --- NEW: AI SUGGESTION BOXES --- */}
              <div className="max-w-4xl mx-auto mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#5B2D2D]">Have questions about this?</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedBlog.questions.map((q, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleAskAI(q)}
                            className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all text-left flex flex-col justify-between group h-full"
                        >
                            <p className="font-medium text-stone-700 mb-4 group-hover:text-purple-700 transition-colors">"{q}"</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider group-hover:text-purple-600">
                                <MessageSquare size={14} />
                                Ask AI
                            </div>
                        </button>
                    ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BLOG_DATA.map((blog) => (
                <div 
                  key={blog.id}
                  onClick={() => handleOpenBlog(blog)}
                  className="group bg-white p-6 rounded-[30px] border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-[#5B2D2D]/5 text-[#5B2D2D] rounded-2xl group-hover:bg-[#5B2D2D] group-hover:text-white transition-colors duration-300">
                      {blog.icon}
                    </div>
                    <span className="text-xs font-bold text-[#5B2D2D]/40 bg-stone-50 px-3 py-1 rounded-full uppercase tracking-wider">
                      {blog.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#5B2D2D] mb-3 leading-snug group-hover:text-[#8B4513] transition-colors">{blog.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">{blog.excerpt}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-stone-100 mt-auto">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-400"><Clock size={14} />{blog.readTime}</div>
                    <span className="flex items-center gap-1 text-sm font-bold text-[#5B2D2D] group-hover:translate-x-1 transition-transform">Read Article <ChevronRight size={16} /></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}