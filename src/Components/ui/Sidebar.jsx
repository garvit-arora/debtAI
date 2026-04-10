import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutGrid, 
  CreditCard, 
  Calendar, 
  BookOpen, 
  User, 
  LogOut, 
  HelpCircle, 
  Settings,
  MessageSquare,
  TrendingDown,
  Zap,
  ArrowRightLeft,
  Briefcase,
  Layers,
  BarChart3,
  Search,
  PieChart,
  X
} from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../../firebase";
import { useMode } from "../../context/ModeContext";
import logo from '../../assets/icons/logo2.png'

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
      ${active 
        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
        : "text-stone-500 hover:text-white hover:bg-white/5"}
    `}
  >
    <Icon size={18} className={`${active ? "text-black" : "group-hover:text-white"}`} />
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, switchMode, debtsCount } = useMode();
  const auth = getAuth(app);

  const isWealth = mode === 'wealth';

  const menuItems = isWealth ? [
    { icon: LayoutGrid, label: "Wealth Dashboard", path: "/dashboard" },
    { icon: MessageSquare, label: "Wealth AI Helper", path: "/wealth-ai" },
    { icon: Briefcase, label: "My Investments", path: "/portfolio" },
    { icon: BarChart3, label: "Stock Market", path: "/stocks" },
    { icon: Layers, label: "Mutual Funds", path: "/mutual-funds" },
    { icon: Zap, label: "Crypto Market", path: "/crypto" },
    { icon: BookOpen, label: "Financial Blogs", path: "/blogs" },
  ] : [
    { icon: LayoutGrid, label: "Main Dashboard", path: "/dashboard" },
    { icon: CreditCard, label: "My Debts", path: "/pending" },
    { icon: MessageSquare, label: "AI Helper", path: "/debtai" },
    { icon: Calendar, label: "Payment Dates", path: "/calendar" },
    { icon: Zap, label: "Think Twice", path: "/think-twice" },
    { icon: BookOpen, label: "Knowledge Hub", path: "/blogs" },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <aside className={`
        fixed inset-y-0 left-0 z-[101] w-72 bg-[#0d0d0d] border-r border-white/5 flex flex-col p-6 font-sans transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static h-full
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex items-center justify-between mb-12 px-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                    <img src={logo} alt="DebtAI Logo" className="w-full h-full object-contain p-2" />
                </div>
                <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">{isWealth ? "WealthAI" : "DebtAI"}</h1>
            </div>
            <button onClick={onClose} className="lg:hidden text-stone-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto hide-scrollbar">
           <div className="px-6 mb-4">
              <p className="text-[9px] font-black text-stone-800 uppercase tracking-[0.3em]">{isWealth ? "Grow Your Money" : "Pay Your Debts"}</p>
           </div>
           
           {menuItems.map((item) => (
             <SidebarItem
               key={item.label}
               icon={item.icon}
               label={item.label}
               active={location.pathname === item.path}
               onClick={() => { navigate(item.path); onClose(); }}
             />
           ))}

           <div className="pt-8 px-6">
              <div className="h-px bg-white/5 w-full mb-8"></div>
              {isWealth ? (
                <button 
                  onClick={() => { switchMode('repayment'); navigate("/dashboard"); onClose(); }}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all"
                >
                   <ArrowRightLeft size={18} />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Back to Debts</span>
                </button>
              ) : (
                <button 
                  disabled={debtsCount > 0}
                  onClick={() => switchMode('wealth')}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/5 transition-all
                    ${debtsCount > 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-cyan-500/10 hover:text-cyan-500'}
                  `}
                >
                   <Briefcase size={18} className={debtsCount === 0 ? "text-cyan-500" : ""} />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Start Investing</span>
                </button>
              )}
           </div>
        </nav>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-2">
            <SidebarItem icon={User} label="Profile" active={location.pathname === "/profile"} onClick={() => { navigate("/profile"); onClose(); }} />
            <SidebarItem icon={Settings} label="Settings" active={location.pathname === "/settings"} onClick={() => { navigate("/settings"); onClose(); }} />
            <SidebarItem icon={HelpCircle} label="Help & Support" active={location.pathname === "/support"} onClick={() => { navigate("/support"); onClose(); }} />
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 text-stone-700 hover:text-rose-500 transition-colors"
            >
              <LogOut size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sign Out</span>
            </button>
        </div>
      </aside>
    </>
  );
}