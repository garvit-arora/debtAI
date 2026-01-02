import React, { useState } from "react";
import Footer from "../ui/Footer";
import Sidebar from "../ui/Sidebar";

import { 
  Plus, 
  ScanLine, 
  ArrowUpRight, 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  User
} from "lucide-react";

// --- DUMMY DATA FOR VISUALS ---

const quickActions = [
  { id: 1, icon: <Plus />, label: "Add Expense", color: "bg-emerald-100 text-emerald-800" },
  { id: 2, icon: <ScanLine />, label: "Scan Bill", color: "bg-orange-100 text-orange-800" },
  { id: 3, icon: <ArrowUpRight />, label: "Transfer", color: "bg-blue-100 text-blue-800" },
];

function Dashboard() {
    // State to track which quick button is expanded. 
    // 'null' means none are expanded.
  const [expandedAction, setExpandedAction] = useState(null);

  return (
    
    <div className="flex min-h-screen bg-[#f8ecdd] font-sans selection:bg-[#5B2D2D] selection:text-white">
      
     
      <div className="z-50">
        <Sidebar />
      </div>

    
      <main className="flex-1 ml-0 md:ml-28 p-6 md:p-12 overflow-y-auto">
        
       
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* HEADING */}
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#5B2D2D] mb-2">
                Let's Start <br /> Strong!
              </h1>
              <p className="text-[#30302e] opacity-70">
                Good Morning, Gaggu. You are on track to be debt-free by Dec 2026.
              </p>
            </div>

              {/* QUICK ACTIONS */}
            <div className="flex gap-4">
              {quickActions.map((action) => (
                // If this ID matches 'expandedAction', width grows to 'w-48'.

                <div
                  key={action.id}
                  onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                  className={`
                    relative h-16 rounded-[24px] cursor-pointer 
                    transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] 
                    flex items-center overflow-hidden shadow-sm hover:shadow-md
                    ${expandedAction === action.id ? "w-48 bg-white" : "w-16 bg-white"}
                  `}
                >
                 
                  <div className={`w-16 h-16 flex items-center justify-center shrink-0 ${action.color} rounded-[24px]`}>
                    {action.icon}
                  </div>
                  
                  {/* 'whitespace-nowrap' prevents text wrapping during animation */}
                  <div className="whitespace-nowrap ml-2 opacity-0 animate-fadeIn"
                       style={{ opacity: expandedAction === action.id ? 1 : 0, transition: "opacity 0.3s 0.2s" }}>
                    <span className="text-sm font-bold text-[#5B2D2D]">{action.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* PROGRESS BAR */}
           
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-[30px] shadow-sm border border-white/40">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#5B2D2D]">Monthly Budget</h3>
                  <p className="text-sm text-stone-500">You've spent 45% of your goal</p>
                </div>
               
                <div className="w-10 h-10 rounded-full bg-[#edffd9] flex items-center justify-center text-[#5B2D2D]">
                  <TrendingUp size={20} />
                </div>
              </div>

              <div className="w-full h-4 bg-stone-200 rounded-full overflow-hidden">
                {/* Colored fill bar with width 45% */}
                <div className="h-full w-[45%] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
              </div>
              
              <div className="flex justify-between mt-2 text-sm font-bold text-stone-600">
                <span>$2,340 spent</span>
                <span>$5,000 limit</span>
              </div>
            </div>

          
          </div>


          {/* right side */}      
          <div className="flex flex-col gap-6 h-full">
            
            <div className="flex justify-end">
              <button 
                onClick={() => navigate('/profile')} 
                className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-full shadow-sm text-[#5B2D2D] font-bold hover:shadow-md transition-all hover:scale-105 active:scale-95 border border-white/40"
              >
                
                <div className="w-8 h-8 rounded-full bg-[#f8ecdd] flex items-center justify-center text-[#5B2D2D]">
                  <User size={18} strokeWidth={2.5} />
                </div>
                <span>Profile</span>
              </button>
            </div>

            <div className="relative group cursor-pointer h-full min-h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#30302e] to-[#141414] rounded-[35px] p-8 flex flex-col justify-between shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
                          
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[#f8ecdd] text-sm font-medium tracking-widest uppercase">DebtAI Assistant</span>
              </div>

              {/* Center */}
              <div className="space-y-4">
                <h2 className="text-3xl text-white font-light">
                  "How can I save <span className="text-emerald-400 font-bold">$200</span> on groceries this week?"
                </h2>
                <p className="text-stone-400 text-sm">
                  Tap to chat with your financial data. No judgement, just math.
                </p>
              </div>

              {/* fake input */}
              <div className="w-full h-12 bg-white/10 rounded-full flex items-center px-4 backdrop-blur-md border border-white/5">
                <span className="text-stone-400 text-sm">Ask anything...</span>
                <div className="ml-auto w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                   <ArrowUpRight size={16} />
                </div>
              </div>
              </div>
            </div>
          </div>

        </div>
        


        {/* ALERT  */}
        <div className="mb-12">
           <h3 className="text-xl font-bold text-[#5B2D2D] mb-6 flex items-center gap-2">
             <AlertTriangle className="text-orange-500" /> Attention Needed
           </h3>
           
           <div className="bg-orange-50 border border-orange-100 p-6 rounded-[24px] flex items-center justify-between">
             <div className="flex gap-4 items-center">
               <div className="p-3 bg-white rounded-full text-orange-600 shadow-sm">
                 <DollarSign size={24} />
               </div>
               <div>
                 <h4 className="font-bold text-[#5B2D2D]">Credit Card Payment Due</h4>
                 <p className="text-sm text-stone-500">Minimum $120 due in 2 days. Avoid interest by paying now.</p>
               </div>
             </div>
             <button className="px-6 py-3 bg-[#5B2D2D] text-[#f8ecdd] rounded-full font-bold text-sm hover:bg-stone-800 transition-colors">
               Pay Now
             </button>
           </div>
        </div>


       
        <div>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-[#5B2D2D]">Analytics Overview</h3>
            
           
            <div className="bg-white p-1 rounded-full flex gap-1 shadow-sm">
              <button className="px-4 py-1.5 rounded-full bg-[#30302e] text-[#f8ecdd] text-xs font-bold shadow-sm">Weekly</button>
              <button className="px-4 py-1.5 rounded-full text-stone-500 hover:bg-stone-100 text-xs font-bold transition-colors">Monthly</button>
              <button className="px-4 py-1.5 rounded-full text-stone-500 hover:bg-stone-100 text-xs font-bold transition-colors">Yearly</button>
            </div>
          </div>

         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1 */}
            <div className="bg-white p-6 rounded-[30px] h-64 shadow-sm border border-stone-100 flex flex-col">
               <h4 className="text-stone-500 font-bold text-sm mb-4">Spending Trend</h4>
               {/* Visual Placeholder for a Graph (Bars) */}
               <div className="flex-1 flex items-end justify-between gap-2 px-2">
                  {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                    <div key={i} className="w-full bg-emerald-100 rounded-t-lg relative group">
                      {/* The Fill */}
                      <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-[#5B2D2D] rounded-t-lg transition-all duration-1000 group-hover:bg-emerald-500"></div>
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-2 text-xs text-stone-400 font-bold">
                 <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
               </div>
            </div>

            {/* Chart 2: Expense Breakdown */}
            <div className="bg-white p-6 rounded-[30px] h-64 shadow-sm border border-stone-100">
               <h4 className="text-stone-500 font-bold text-sm mb-4">Where your money went</h4>
               <div className="space-y-4">
                 <ExpenseItem label="Rent & Utilities" amount="$1,200" percent="40%" color="bg-[#30302e]" />
                 <ExpenseItem label="Food & Dining" amount="$450" percent="25%" color="bg-emerald-500" />
                 <ExpenseItem label="Entertainment" amount="$120" percent="10%" color="bg-orange-400" />
               </div>
            </div>

          </div>
        </div>

        < Footer />
        

      </main>
    </div>
  );
}

// --- HELPER COMPONENT FOR EXPENSE LIST ---
// This makes the 'Where your money went' section code cleaner
const ExpenseItem = ({ label, amount, percent, color }) => (
  <div className="flex items-center gap-4">
    <div className={`w-3 h-3 rounded-full ${color}`}></div>
    <div className="flex-1">
      <div className="flex justify-between text-sm font-bold text-[#5B2D2D]">
        <span>{label}</span>
        <span>{amount}</span>
      </div>
      {/* Mini Progress Bar */}
      <div className="w-full h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden">
        <div style={{ width: percent }} className={`h-full ${color} rounded-full`}></div>
      </div>
    </div>
  </div>
);

export default Dashboard;