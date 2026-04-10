import React from "react";
import { Github, Twitter, Linkedin } from "lucide-react";
import logo from '../../assets/icons/logo2.png';

export default function Footer({ className = "" }) {
  return (
    <footer className={`mt-auto pt-16 pb-8 border-t border-white/5 bg-[#050505] relative z-10 w-full ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 px-12">
        <div className="flex flex-col items-center md:items-start tracking-tighter">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
               <img src={logo} alt="DebtAI" className="w-full h-full object-contain p-2" />
            </div>
            <span className="text-xl font-black text-white italic tracking-tighter uppercase">DebtAI</span>
          </div>
          <p className="text-[9px] font-black text-stone-800 tracking-widest uppercase">© 2026 DEBTAI LABS.</p>
        </div>

        <div className="flex items-center gap-8">
           <a href="#" className="text-stone-800 hover:text-white transition-colors"><Twitter size={18} /></a>
           <a href="#" className="text-stone-800 hover:text-white transition-colors"><Github size={18} /></a>
           <a href="#" className="text-stone-800 hover:text-white transition-colors"><Linkedin size={18} /></a>
        </div>

        <div className="flex items-center gap-6">
           {["Privacy", "Terms", "Support"].map(item => (
             <a key={item} href={`/${item.toLowerCase()}`} className="text-[10px] font-black text-stone-700 hover:text-white transition-colors tracking-widest uppercase">{item}</a>
           ))}
        </div>
      </div>
    </footer>
  );
}
