import { NavLink } from "react-router-dom";
import {
  LayoutGrid, // Dashboard
  ListTodo, // Pending
  CalendarClock, // Calendar
  TrendingUp, // Stocks
  BookOpenText, // Blogs
  Sparkle, // DebtAI
} from "lucide-react";
import React from "react";
import logo2 from "../../assets/icons/logo2.png";

const navClass =
  "group flex flex-col items-center justify-center  p-2 w-full rounded-xl transition-all duration-300 hover:bg-[#4d3636] active:scale-95 cursor-pointer shrink-0";

const navText =
  "text-[10px] md:text-[12px] font-bold tracking-wide text-[#f8ecdd] uppercase group-hover:text-[#edffd9] transition-colors";

const navIcons =
  "p-2 w-10 h-10 md:w-12 md:h-12 rounded-xl text-[#f8ecdd] stroke-[2.5] fill-none bg-white/5 shadow-sm transition-all duration-300 group-hover:bg-[#edffd9] group-hover:text-[#141414]";

export default function Sidebar() {
  return (
    <div
      className="
      /* Layout Basics */
      flex flex-col items-center py-6
      
      /* Mobile: Fill the Drawer */
      w-full h-full bg-[#272626]
      
      /* Desktop: Floating Dock Style - Fixed to Viewport */
      md:bg-gradient-to-b md:from-[#656563] md:to-[#272626] 
      md:backdrop-blur-xl md:border md:border-white/20 md:shadow-2xl 
      md:rounded-[30px] md:w-24 md:h-[95vh] 
      md:fixed md:top-4 md:left-4 md:z-50
      "
    >
      {/* LOGO */}
      <NavLink
        to="/"
        className="mb-6 md:mb-8 hover:scale-110 transition-transform shrink-0"
      >
        <img src={logo2} alt="Logo" className="w-12 h-12 md:w-16 md:h-16" />
      </NavLink>

      {/* NAVIGATION ITEMS */}
      {/* Updates made here: 
          1. [&::-webkit-scrollbar]:hidden -> Hides scrollbar on Chrome/Safari/Edge 
          2. [-ms-overflow-style:none] -> Hides on IE
          3. [scrollbar-width:none] -> Hides on Firefox
      */}
      <nav className="flex flex-col w-full gap-3 md:gap-4 items-center overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
      </nav>
    </div>
  );
}