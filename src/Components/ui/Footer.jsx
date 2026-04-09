import React from 'react';
import { Link } from 'react-router-dom';
import { BsTwitter, BsLinkedin, BsInstagram, BsFacebook } from "react-icons/bs";
import logo from '../../assets/icons/logo2.png';

const Footer = () => {
  return (
    <footer className="w-full bg-background border-t border-border pt-20 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          
          <div className="col-span-2 lg:col-span-2 space-y-8">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="DebtAI" className="h-10 w-auto grayscale transition-all hover:grayscale-0" />
              <span className="text-2xl font-black tracking-tighter">DebtAI</span>
            </Link>
            <p className="text-stone-500 font-medium max-w-xs leading-relaxed">
              Empowering individuals to reclaim their financial freedom through intuitive AI-driven debt management.
            </p>
            <div className="flex gap-4">
               <SocialLink icon={<BsTwitter size={18} />} href="https://x.com/debt_ai" />
               <SocialLink icon={<BsLinkedin size={18} />} href="https://linkedin.com/company/debt-ai" />
               <SocialLink icon={<BsInstagram size={18} />} href="https://instagram.com/debt_ai" />
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Product</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/onboarding" className="text-stone-400 hover:text-white transition-colors">Analyzer</Link></li>
              <li><Link to="/debtai" className="text-stone-400 hover:text-white transition-colors">Intelligence</Link></li>
              <li><Link to="/pending" className="text-stone-400 hover:text-white transition-colors">Track Sheets</Link></li>
              <li><Link to="/calendar" className="text-stone-400 hover:text-white transition-colors">Sync Calendar</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Company</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/blogs" className="text-stone-400 hover:text-white transition-colors">Insights</Link></li>
              <li><Link to="/support" className="text-stone-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/support" className="text-stone-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Legal</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/legal" className="text-stone-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/legal" className="text-stone-400 hover:text-white transition-colors">Privacy Protocol</Link></li>
              <li><Link to="/legal" className="text-stone-400 hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-[10px] font-black tracking-[0.4em] uppercase text-white/20">
             © {new Date().getFullYear()} DebtAI Financial Architecture
           </p>
           <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest text-white/20">
              <span className="hover:text-white transition-colors cursor-default">v4.2.0 Stable</span>
              <span className="hover:text-white transition-colors cursor-default text-emerald-500/50">Nodes Active</span>
           </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ icon, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-stone-500 hover:bg-white hover:text-black hover:border-white transition-all transform hover:scale-110"
  >
    {icon}
  </a>
);

export default Footer;
