import React, { useState } from "react";
// Importing the Sidebar we made earlier
import Sidebar from "../ui/Sidebar";
// Importing Icons for the dashboard UI
import { 
  Plus, 
  ScanLine, 
  ArrowUpRight, 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign 
} from "lucide-react";

// --- DUMMY DATA FOR VISUALS ---
// These mimic the "Quick Action" buttons. 
// When clicked, they will expand.
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
    // 1. MAIN WRAPPER
    // 'flex' puts sidebar and content side-by-side.
    // 'bg-[#f8ecdd]' applies your Cream background color.
    // 'min-h-screen' ensures it covers the full viewport height.
    <div className="flex min-h-screen bg-[#f8ecdd] font-sans selection:bg-[#5B2D2D] selection:text-white">
      
      {/* 2. SIDEBAR CONTAINER */}
      {/* We wrap it in a div to ensure it stays isolated on the left */}
      <div className="z-50">
        <Sidebar />
      </div>

      {/* 3. MAIN SCROLLABLE CONTENT AREA */}
      {/* 'flex-1' makes this take up all remaining width. */}
      {/* 'ml-20 md:ml-28' adds left margin so content isn't hidden behind the fixed Sidebar. */}
      {/* 'p-8' gives breathing room inside. */}
      <main className="flex-1 ml-0 md:ml-28 p-6 md:p-12 overflow-y-auto">
        
        {/* --- TOP SECTION: SPLIT CONTAINER --- */}
        {/* 'grid' creates a layout. On large screens (lg), it splits 2/3 left, 1/3 right. */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* A. LEFT PART (Heading, Progress, Buttons) */}
          {/* 'col-span-2' means it takes up 2 slots of the grid */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* HEADING */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#5B2D2D] mb-2 tracking-tight">
                Let's Start Strong!
              </h1>
              <p className="text-[#30302e] opacity-70">
                Good Morning, Gaggu. You are on track to be debt-free by Dec 2025.
              </p>
            </div>

            {/* PROGRESS BAR CARD (The "Slidebar") */}
            {/* 'bg-white/50' creates a semi-transparent glass effect. */}
            {/* 'rounded-[30px]' gives that soft UI look. */}
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-[30px] shadow-sm border border-white/40">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#5B2D2D]">Monthly Budget</h3>
                  <p className="text-sm text-stone-500">You've spent 45% of your goal</p>
                </div>
                {/* The Flash Icon Badge */}
                <div className="w-10 h-10 rounded-full bg-[#edffd9] flex items-center justify-center text-[#5B2D2D]">
                  <TrendingUp size={20} />
                </div>
              </div>

              {/* The Actual Bar */}
              {/* Gray background bar */}
              <div className="w-full h-4 bg-stone-200 rounded-full overflow-hidden">
                {/* Colored fill bar with width 45% */}
                <div className="h-full w-[45%] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
              </div>
              
              <div className="flex justify-between mt-2 text-sm font-bold text-stone-600">
                <span>$2,340 spent</span>
                <span>$5,000 limit</span>
              </div>
            </div>

            {/* EXPANDABLE QUICK ACTIONS (The Buttons) */}
            <div className="flex gap-4">
              {quickActions.map((action) => (
                // This div handles the animation. 
                // If this ID matches 'expandedAction', width grows to 'w-48'.
                // If not, it stays a small circle 'w-16'.
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
                  {/* The Icon (Always visible) */}
                  <div className={`w-16 h-16 flex items-center justify-center shrink-0 ${action.color} rounded-[24px]`}>
                    {action.icon}
                  </div>
                  
                  {/* The Text (Only visible when expanded) */}
                  {/* 'whitespace-nowrap' prevents text wrapping during animation */}
                  <div className="whitespace-nowrap ml-2 opacity-0 animate-fadeIn"
                       style={{ opacity: expandedAction === action.id ? 1 : 0, transition: "opacity 0.3s 0.2s" }}>
                    <span className="text-sm font-bold text-[#5B2D2D]">{action.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* B. RIGHT PART (The Chatbot Box) */}
          {/* This takes up 1 slot in the grid */}
          <div className="relative group cursor-pointer h-full min-h-[300px]">
            {/* The Box Container */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#30302e] to-[#141414] rounded-[35px] p-8 flex flex-col justify-between shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
              
              {/* Header inside Box */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[#f8ecdd] text-sm font-medium tracking-widest uppercase">DebtAI Assistant</span>
              </div>

              {/* Central Text */}
              <div className="space-y-4">
                <h2 className="text-3xl text-white font-light">
                  "How can I save <span className="text-emerald-400 font-bold">$200</span> on groceries this week?"
                </h2>
                <p className="text-stone-400 text-sm">
                  Tap to chat with your financial data. No judgement, just math.
                </p>
              </div>

              {/* Bottom Input Mockup */}
              <div className="w-full h-12 bg-white/10 rounded-full flex items-center px-4 backdrop-blur-md border border-white/5">
                <span className="text-stone-400 text-sm">Ask anything...</span>
                <div className="ml-auto w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                   <ArrowUpRight size={16} />
                </div>
              </div>
            </div>
          </div>

        </div>
        {/* --- END OF TOP SECTION --- */}


        {/* --- ALERT SECTION --- */}
        <div className="mb-12">
           <h3 className="text-xl font-bold text-[#5B2D2D] mb-6 flex items-center gap-2">
             <AlertTriangle className="text-orange-500" /> Attention Needed
           </h3>
           
           {/* Alert Card */}
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


        {/* --- ANALYTICS / GRAPHS SECTION --- */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-[#5B2D2D]">Analytics Overview</h3>
            
            {/* Filter Pills */}
            <div className="bg-white p-1 rounded-full flex gap-1 shadow-sm">
              <button className="px-4 py-1.5 rounded-full bg-[#30302e] text-[#f8ecdd] text-xs font-bold shadow-sm">Weekly</button>
              <button className="px-4 py-1.5 rounded-full text-stone-500 hover:bg-stone-100 text-xs font-bold transition-colors">Monthly</button>
              <button className="px-4 py-1.5 rounded-full text-stone-500 hover:bg-stone-100 text-xs font-bold transition-colors">Yearly</button>
            </div>
          </div>

          {/* Grid for Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Spending Trend */}
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

        {/* --- FOOTER --- */}
        <footer className="mt-20 border-t border-[#5B2D2D]/10 pt-8 pb-4 text-center">
          <p className="text-stone-400 text-sm">© 2025 DebtAI Systems. Breathing room included.</p>
        </footer>

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