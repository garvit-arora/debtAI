import React from "react";
import { Link } from "react-router-dom";
import { PiggyBank, Home, ArrowLeft, TrendingDown, Landmark, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans px-6 overflow-hidden selection:bg-white selection:text-black">
      
      {/* Subtle Financial Background Grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, backgroundSize: '60px 60px' }}>
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
        
        {/* Floating Financial Icon */}
        <div className="mb-8 flex items-center justify-center w-24 h-24 bg-stone-900 border border-stone-800 rounded-full shadow-2xl animate-float">
            <PiggyBank size={48} className="text-stone-300" />
        </div>

        <div className="space-y-4 mb-16">
          <h1 className="text-7xl md:text-[180px] font-black tracking-tighter opacity-10 leading-none select-none">404</h1>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight -mt-8">This page is in <br /><span className="text-stone-500 italic">a deficit.</span></h2>
          <p className="text-stone-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
            We checked the books, but this page isn't adding up. It might have been liquidated or lost in interest.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link to="/" className="flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-3xl font-bold text-lg hover:bg-stone-200 transition-all active:scale-95 shadow-2xl">
            <Home size={20} />
            <span>Back to Solvency</span>
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center justify-center gap-3 bg-stone-900 border border-stone-800 text-white px-10 py-5 rounded-3xl font-bold text-lg hover:bg-stone-800 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
            <span>Previous Transaction</span>
          </button>
        </div>

        {/* Financial Status Footer */}
        <div className="mt-20 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 opacity-30">
            <div className="flex items-center gap-2">
                <TrendingDown size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Visibility: Defaulted</span>
            </div>
            <div className="flex items-center gap-2">
                <Landmark size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Liquidity: Zero</span>
            </div>
            <div className="flex items-center gap-2">
                <Search size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Audit: 404 Errors Found</span>
            </div>
        </div>

      </div>

      <p className="fixed bottom-10 text-[10px] font-bold uppercase tracking-[0.4em] opacity-20">
        DebtAI • Balances don't always match
      </p>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
