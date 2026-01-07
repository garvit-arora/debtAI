import { NavLink } from "react-router-dom";
import {
  LayoutGrid, // Dashboard
  PieChart, // Analytics
  Wallet, // Wallet
  ListTodo, // Pending
  CalendarClock, // Calendar
  Bell, // Alerts
  Settings, // Settings
  User, // Profile
  TrendingUp,
  Sparkle,
  BookOpenText,
} from "lucide-react";
import React from "react";
import logo2 from "../../assets/icons/logo2.png";

const navClass =
  "group flex flex-col items-center justify-center gap-1 p-1 md:p-2 w-full rounded-xl transition-all duration-300 hover:scale-102 hover:bg-[#4d3636] active:scale-95";

const navText =
  "hidden md:block text-[12px] font-bold tracking-wide text-[#f8ecdd] uppercase group-hover:text-[#edffd9] transition-colors";

// 3. ICONS
// Added 'fill-current' and 'stroke-none' for solid color look.
// Removed borders for a cleaner 'filled' aesthetic on the dark background.
const navIcons =
  "p-2 md:p-2 w-10 h-10 md:w-13 md:h-13 rounded-xl text-[#f8ecdd] stroke-[2.5] fill-none bg-white/5 shadow-sm transition-all duration-300 group-hover:bg-[#edffd9] group-hover:text-[#141414]";

export default function Sidebar() {
  return (
    <div
      className="
      fixed z-50 
      
      /* Mobile Layout (Phone) */
      bottom-4 left-1/2 -translate-x-1/2 
      w-[90%] h-20 
      flex-row 
      
      /* Laptop Layout (Screen > 768px) */
      md:top-4 md:left-4 md:bottom-auto md:translate-x-0
      md:w-24 md:h-[95vh] 
      md:flex-col 
      
      /* Visuals (Glassmorphism + Your Colors) */
      rounded-[30px] 
      bg-gradient-to-b from-[#656563] to-[#272626] 
      backdrop-blur-xl border border-white/20 shadow-2xl 
      
      flex items-center justify-between py-4 px-2
    "
    >
      {/* LOGO: Hidden on mobile to save space, Visible on Laptop */}
      <NavLink
        to="/"
        className="hidden md:block mb-4 hover:scale-110 transition-transform shrink-0"
      >
        <img src={logo2} alt="Logo" className="w-16 h-16" />
      </NavLink>

      {/* NAVIGATION ITEMS */}
      <nav className="flex md:flex-col w-full h-full justify-evenly items-center gap-1">
        <NavLink to="/dashboard" className={navClass}>
          <LayoutGrid className={navIcons} />
          <span className={navText}>Home</span>
        </NavLink>

        <NavLink to="/pending" className={navClass}>
          <ListTodo className={navIcons} />
          <span className={navText}>Pending</span>
        </NavLink>

        <NavLink to="/debtai" className={navClass}>
          <Sparkle className={navIcons} />
          <span className={navText}>DebtAI</span>
        </NavLink>
        <NavLink to="/stocks" className={navClass}>
          <TrendingUp className={navIcons} />
          <span className={navText}>Stocks</span>
        </NavLink>

        <NavLink to="/blogs" className={navClass}>
          <BookOpenText className={navIcons} />
          <span className={navText}>Blogs</span>
        </NavLink>

        <NavLink to="/calendar" className={navClass}>
          <CalendarClock className={navIcons} />
          <span className={navText}>Calendar</span>
        </NavLink>

        {/* <NavLink to="/profile" className={navClass}>
          <User className={navIcons} />
          <span className={navText}>Profile</span>
        </NavLink> */}
      </nav>
    </div>
  );
}
