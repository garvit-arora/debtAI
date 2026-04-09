import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutGrid,
  ListTodo,
  CalendarClock,
  Sparkle,
  FileText,
  Layers,
  Settings,
  HelpCircle
} from "lucide-react";
import logo2 from "../../assets/icons/logo2.png";

const navGroupTitle = "text-[10px] font-black uppercase tracking-[0.2em] text-stone-600 mb-4 px-4";

const NavItem = ({ to, icon: Icon, label, badge }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 mb-1 border border-transparent ${
        isActive 
          ? "bg-white/5 text-white border-white/5 shadow-sm" 
          : "text-stone-400 hover:bg-white/5 hover:text-white"
      }`
    }
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className="transition-transform group-hover:scale-105" />
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </div>
    {badge && (
      <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
        {badge}
      </span>
    )}
  </NavLink>
);

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="w-72 h-screen bg-[#0d0d0d] border-r border-white/5 flex flex-col p-6 sticky top-0 overflow-hidden font-sans">
      
      <div className="flex items-center justify-between mb-12 px-2">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 transition-transform">
            <img src={logo2} alt="DebtAI" className="w-6 h-6 object-contain" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">DebtAI</span>
        </Link>
      </div>

      {/* NAVIGATION SECTION */}
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-8 pr-1">
        <div>
          <h4 className={navGroupTitle}>Navigation</h4>
          <NavItem to="/dashboard" icon={LayoutGrid} label="Dashboard" />
          <NavItem to="/pending" icon={ListTodo} label="Active Debts" />
          <NavItem to="/calendar" icon={CalendarClock} label="Calendar" />
          <NavItem to="/debtai" icon={Sparkle} label="Intelligence" />
          <NavItem to="/blogs" icon={FileText} label="Blogs" />
        </div>
      </div>

      {/* FOOTER: SETTINGS ONLY */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center justify-between px-2 text-stone-500">
           <div className="flex items-center gap-4">
              <button onClick={() => navigate('/settings')} className="hover:text-white transition-colors"><Settings size={18} /></button>
              <button onClick={() => navigate('/support')} className="hover:text-white transition-colors"><HelpCircle size={18} /></button>
           </div>
           <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
             © 2026 DebtAI
           </div>
        </div>
      </div>

    </div>
  );
}