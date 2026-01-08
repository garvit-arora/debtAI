import React, { useState, useEffect } from "react";
import Footer from "../ui/Footer";
import Sidebar from "../ui/Sidebar";
import ExpenseInputForm from "../ui/ExpenseInputForm";
import CameraOverlay from "../ui/CameraOverlay";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { app } from "../../firebase";
import {
  Plus,
  ScanLine,
  ArrowUpRight,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  User,
  Camera,
  Calendar,
  Tag,
  Loader2
} from "lucide-react";

const quickActionStyle =
  "relative h-16 w-48 text-sm font-bold text-[#5B2D2D] bg-white rounded-[24px] transition-all duration-300 flex items-center overflow-hidden shadow-sm hover:shadow-md cursor-pointer active:scale-95";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [chart2Range, setChart2Range] = useState("Monthly");

  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getDatabase(app);


   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the auth user state
        const userRef = ref(db, "users/" + currentUser.uid);
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            console.log("No data available");
            // Optional: Redirect to onboarding
             navigate("/onboarding"); 
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [auth, db, navigate]);

  // 3. Helper Functions to Process Data
  
  // Calculate "Debt Free Date" based on (Total Debt / Disposable Income)
  const getDebtFreeDate = () => {
    if (!userData || !userData.debts) return "Calculating...";
    
    const totalDebt = userData.debts.reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);
    const disposableIncome = (userData.income - userData.expenses);
    
    if (disposableIncome <= 0) return "Unknown";

    const monthsToFreedom = Math.ceil(totalDebt / disposableIncome);
    const date = new Date();
    date.setMonth(date.getMonth() + monthsToFreedom);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Find the most urgent debt (highest stress or soonest due)
  const getUrgentDebt = () => {
    if (!userData || !userData.debts || userData.debts.length === 0) return null;
    // Simple logic: return the one with highest stress for now
    return userData.debts.reduce((prev, current) => (prev.stress > current.stress) ? prev : current);
  };

  const urgentDebt = getUrgentDebt();

  // CHART 1 LOGIC (Last 7 Days Trend)
  const getWeeklyTrend = () => {
    if (!userData || !userData.transactions) return Array(7).fill({ day: "", amount: 0, percent: 0 });

    const transactions = Object.values(userData.transactions);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = [];

    // 1. Generate last 7 days array (dates and labels)
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayLabel = days[d.getDay()];
        last7Days.push({ date: dateString, day: dayLabel, amount: 0 });
    }

    transactions.forEach(t => {
        const tDate = t.date; // Assuming transaction date is stored as YYYY-MM-DD
        const dayEntry = last7Days.find(d => d.date === tDate);
        if (dayEntry) {
            dayEntry.amount += parseFloat(t.amount);
        }
    });

    // 3. Find max spend to calculate bar height percentages
    const maxSpend = Math.max(...last7Days.map(d => d.amount));
    
    // 4. Add percentage property
    return last7Days.map(d => ({
        ...d,
        percent: maxSpend > 0 ? (d.amount / maxSpend) * 100 : 0
    }));
  };

  const trendData = getWeeklyTrend();

  // CHART 2 FILTERING LOGIC
  const filterTransactions = (transactions) => {
    if (!transactions) return [];
    
    const now = new Date();
    const transactionList = Object.values(transactions);

    return transactionList.filter(t => {
      const tDate = new Date(t.date);
      const diffTime = Math.abs(now - tDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (chart2Range === "Weekly") return diffDays <= 7;
      if (chart2Range === "Monthly") return diffDays <= 30;
      if (chart2Range === "Yearly") return diffDays <= 365;
      return true;
    });
  };

  const [selectedFile, setSelectedFile] = useState(null);

  // When user picks a file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  // Upload function
  const handleUpload = async (file) => {
  if (!file) return;
  if (!user) {
    alert("User still loading. Try again in a second.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", user.uid);

  try {
        // Ensure your backend is running on port 5000
        const res = await fetch(`${BACKEND_URL}/upload-pdf`, {
        method: "POST",
        body: formData,
        });
        const data = await res.json();
        console.log("Uploaded:", data);
        alert("Bill uploaded successfully!");
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload bill.");
    }
  };

  // const [showCamera, setShowCamera] = useState(false);
   
  //Process transactions to get category percentages
  const getCategoryBreakdown = () => {
    if (!userData || !userData.transactions) return [];

    // Apply the filter first
    const filteredTransactions = filterTransactions(userData.transactions);
    
    // If no transactions match the filter (e.g., no expenses this week), return empty
    if (filteredTransactions.length === 0) return [];

    const total = filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Group by category
    const grouped = filteredTransactions.reduce((acc, curr) => {
      const cat = curr.category || "Others";
      acc[cat] = (acc[cat] || 0) + parseFloat(curr.amount);
      return acc;
    }, {});

    // Convert to array and format for display
    const colors = {
      "Food": "bg-emerald-500",
      "Rent": "bg-[#30302e]",
      "Transport": "bg-blue-500",
      "Entertainment": "bg-orange-400",
      "Others": "bg-stone-400"
    };

    return Object.keys(grouped).map(cat => ({
      label: cat,
      amount: `₹${grouped[cat].toFixed(0)}`,
      percent: `${Math.round((grouped[cat] / total) * 100)}%`,
      color: colors[cat] || "bg-stone-400",
      rawPercent: (grouped[cat] / total) * 100 // for width
    })).sort((a,b) => b.rawPercent - a.rawPercent); // Sort highest to lowest
  };

  const categoryData = getCategoryBreakdown();

   if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f8ecdd]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#5B2D2D]" size={48} />
          <p className="text-[#5B2D2D] font-bold">Syncing your finances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8ecdd] font-sans selection:bg-[#5B2D2D] selection:text-white relative">
      {showExpenseModal && (
        // Pass a prop to close the modal from inside the form if needed
        <ExpenseInputForm onClose={() => setShowExpenseModal(false)} />
      )}

      {/* {showCamera && <CameraOverlay onClose={() => setShowCamera(false)} />} */}

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
                Hello, {userData?.name || "User"}. You are on track to be debt-free by {getDebtFreeDate()}.
              </p>
            </div>

            {/* buttons */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setShowExpenseModal(true)}
                className={quickActionStyle}
              >
                <div
                  className={`w-16 h-16 flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-800 rounded-[24px]`}
                >
                  {<Plus />}
                </div>
                <div className="whitespace-nowrap  ml-2">
                  <span>Add Expense</span>
                </div>
              </button>

              {/* SCAN BILL */}
              <label className={quickActionStyle}>
                <div className="w-16 h-16 flex items-center justify-center shrink-0 bg-orange-100 text-orange-800 rounded-[24px]">
                  <ScanLine />
                </div>
                <div className="whitespace-nowrap ml-2">
                  <span>Scan Bill</span>
                </div>

                {/* Invisible file input over the button */}
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={!user}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* PROGRESS BAR */}
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-[30px] shadow-sm border border-white/40">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#5B2D2D]">
                    Monthly Budget
                  </h3>
                  <p className="text-sm text-stone-500">
                    You've spent {Math.round((userData?.expenses / userData?.income) * 100) || 0}% of your income </p>
                </div>

                <div className="w-10 h-10 rounded-full bg-[#edffd9] flex items-center justify-center text-[#5B2D2D]">
                  <TrendingUp size={20} />
                </div>
              </div>

              <div className="w-full h-4 bg-stone-200 rounded-full overflow-hidden">
                {/* Colored fill bar with width 45% */}
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-1000"
                  style={{ width: `₹{Math.min((userData?.expenses / userData?.income) * 100, 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between mt-2 text-sm font-bold text-stone-600">
                <span>₹{userData?.expenses || 0} spent</span>
                <span>₹{userData?.income || 0} limit</span>
              </div>
            </div>
          </div>

          {/* right side */}
          <div className="flex flex-col gap-6 h-full">
            <div className="flex justify-end">
              <button
                onClick={() => navigate("/profile")}
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
                  <span className="text-[#f8ecdd] text-sm font-medium tracking-widest uppercase">
                    DebtAI Assistant
                  </span>
                </div>

                {/* Center */}
                <div className="space-y-4">
                  <h2 className="text-3xl text-white font-light">
                    "How can I save{" "}
                    <span className="text-emerald-400 font-bold">₹1000</span> on
                    groceries this week?"
                  </h2>
                  <p className="text-stone-400 text-sm">
                    Tap to chat with your financial data. No judgement, just math.
                  </p>
                </div>

                {/* fake input */}
                <div className="w-full h-12 bg-white/10 rounded-full flex items-center px-4 backdrop-blur-md border border-white/5">
                  <span className="text-stone-400 text-sm">
                    Ask anything...
                  </span>
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

          {/* <div className="bg-orange-50 border border-orange-100 p-6 rounded-[24px] flex items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-white rounded-full text-orange-600 shadow-sm">
                <DollarSign size={24} />
              </div>
              <div>
                <h4 className="font-bold text-[#5B2D2D]">
                  Credit Card Payment Due
                </h4>
                <p className="text-sm text-stone-500">
                  Minimum $120 due in 2 days. Avoid interest by paying now.
                </p>
              </div>
            </div>
            <button className="px-6 py-3 bg-[#5B2D2D] text-[#f8ecdd] rounded-full font-bold text-sm hover:bg-stone-800 transition-colors">
              Mark as Paid
            </button>
          </div> */}

          {urgentDebt ? (
             <div className="bg-orange-50 border border-orange-100 p-6 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="flex gap-4 items-center">
                 <div className="p-3 bg-white rounded-full text-orange-600 shadow-sm">
                   <DollarSign size={24} />
                 </div>
                 <div>
                   {/* DYNAMIC URGENT DEBT INFO */}
                   <h4 className="font-bold text-[#5B2D2D]">{urgentDebt.name} Payment</h4>
                   <p className="text-sm text-stone-500">
                     Estimated Min Pay: ₹{urgentDebt.estimatedMinPayment}. Stress Level: {urgentDebt.stress}/10.
                   </p>
                 </div>
               </div>
               <button className="px-6 py-3 bg-[#5B2D2D] text-[#f8ecdd] rounded-full font-bold text-sm hover:bg-stone-800 transition-colors">
                Mark as Paid
               </button>
             </div>
           ) : (
             <div className="p-6 bg-emerald-100 font-semibold border border-emerald-300 rounded-[24px] text-emerald-800">
               No urgent debts found! Great job.
             </div>
           )}
        </div>

        <div>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-[#5B2D2D]">
              Analytics
            </h3>

            <div className="bg-white p-1 rounded-full flex gap-1 shadow-sm overflow-x-auto max-w-full">
              {["Weekly", "Monthly", "Yearly"].map((range) => (
                <button
                  key={range}
                  onClick={() => setChart2Range(range)}
                  className={`
                    px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap
                    ${chart2Range === range 
                      ? "bg-[#2b2b28] text-[#f8ecdd] shadow-sm" 
                      : "text-stone-600 hover:bg-stone-100"}
                  `}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
            {/* <div className="bg-white p-6 rounded-[30px] h-64 shadow-sm border border-stone-100 flex flex-col">
              <h4 className="text-stone-500 font-bold text-sm mb-4">
                Weekly Spending Trend
              </h4>
              
              <div className="flex-1 flex items-end justify-between gap-2 px-2">
                {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                  <div
                    key={i}
                    className="w-full bg-emerald-100 rounded-t-lg relative group"
                  >
                   
                    <div
                      style={{ height: `${h}%` }}
                      className="absolute bottom-0 w-full bg-[#5B2D2D] rounded-t-lg transition-all duration-1000 group-hover:bg-emerald-500"
                    ></div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-2 text-xs text-stone-400 font-bold">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div> */}

            {/* Chart 1: Spending Trend (Hybrid Fix + Enhanced Dots) */}
            <div className="bg-white py-6 px-10 rounded-[30px] h-64 shadow-sm border border-stone-100 flex flex-col relative z-0 overflow-visible">
              <h4 className="text-stone-500 font-bold text-sm mb-6">
                Weekly Spending Trend
              </h4>

              {/* Graph Container */}
              <div className="flex-1 relative w-full mb-6 z-0">
                
                {/* LAYER 1: The SVG Line (Background) */}
                <svg
                  className="absolute inset-0 w-full h-full overflow-visible z-0"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke="#5B2D2D"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    points={trendData.map((d, i) => {
                      const divisor = trendData.length > 1 ? trendData.length - 1 : 1;
                      const x = (i / divisor) * 100;
                      const y = 100 - d.percent;
                      return `${x},${y}`;
                    }).join(" ")}
                  />
                </svg>

                {/* LAYER 2: HTML Dots & Tooltips (Foreground) */}
                {trendData.map((d, i) => {
                  const divisor = trendData.length > 1 ? trendData.length - 1 : 1;
                  const leftPos = (i / divisor) * 100;
                  const bottomPos = d.percent;

                  return (
                    <div
                      key={i}
                      // Increased w-8 h-8 creates a larger invisible hover target
                      className="absolute group z-10 w-10 h-10 flex items-center justify-center cursor-pointer -translate-x-1/2 translate-y-1/2"
                      style={{
                        left: `${leftPos}%`,
                        bottom: `${bottomPos}%`,
                      }}
                    >
                      {/* ENHANCED DOT STRUCTURE */}
                      
                      {/* 1. The Glow Ring (Expands on hover) */}
                      <div className="absolute w-full h-full bg-emerald-500/20 rounded-full scale-50 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100"></div>
                      
                      {/* 2. The Main Dot (Solid center) */}
                      <div className="relative z-10 w-3 h-3 bg-emerald-500 rounded-full border-[1px] border-white shadow-[0_2px_5px_rgba(16,185,129,0.3)] transition-all duration-300 group-hover:scale-125 group-hover:bg-emerald-600"></div>


                      {/* The Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 pointer-events-none whitespace-nowrap z-30">
                        <div className="bg-[#30302e] text-[#f8ecdd] text-[10px] font-bold py-1.5 px-2.5 rounded-lg shadow-xl">
                          ₹{d.amount.toFixed(0)}
                        </div>
                        {/* Little triangle arrow */}
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#30302e] absolute left-1/2 -translate-x-1/2 top-full"></div>
                      </div>
                    </div>
                  );
                })}
                
                {/* LAYER 3: X-Axis Labels */}
                <div className="absolute top-full w-full flex justify-between text-xs text-stone-400 font-bold mt-2">
                  {trendData.map((d, i) => (
                    // Negative margins ensure the text centers exactly under the dot's center point
                    <div key={i} className="w-10 text-center -ml-5 first:ml-0 last:-ml-10 first:text-left last:text-right">
                        {d.day}
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Chart 2: Expense Breakdown */}  
            <div className="bg-white p-6 rounded-[30px] min-h-[16rem] shadow-sm border border-stone-100">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-stone-500 font-bold text-sm">Where your money went</h4>
                 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                   {chart2Range} View
                 </span>
              </div>
              
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                 {categoryData.length > 0 ? (
                    categoryData.map((item, index) => (
                      <ExpenseItem 
                        key={index}
                        label={item.label} 
                        amount={item.amount} 
                        percent={item.percent}
                        widthVal={`${item.rawPercent}%`} 
                        color={item.color} 
                      />
                    ))
                 ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-stone-400 gap-2">
                       <p className="text-sm italic">No expenses found for this {chart2Range.toLowerCase()}.</p>
                       <p className="text-xs">Use "Add Expense" to start tracking.</p>
                    </div>
                 )}

              </div>
            </div>


          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

// --- HELPER COMPONENT FOR EXPENSE LIST ---
// This makes the 'Where your money went' section code cleaner
const ExpenseItem = ({ label, amount, percent, widthVal, color }) => (
  <div className="flex items-center gap-4">
    <div className={`w-3 h-3 rounded-full ${color}`}></div>
    <div className="flex-1">
      <div className="flex justify-between text-sm font-bold text-[#5B2D2D]">
        <span>{label}</span>
        <span>{amount}</span>
      </div>
      <div className="w-full h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden">
        <div
          style={{ width: widthVal || percent }} // Use widthVal if provided, else percent string
          className={`h-full ${color} rounded-full`}
        ></div>
      </div>
    </div>
  </div>
);

export default Dashboard;
