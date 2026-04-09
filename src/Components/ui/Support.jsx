import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, ArrowLeft, MessageSquare, Globe, ShieldCheck } from "lucide-react";
import logo from "../../assets/icons/logo2.png";

export default function Support() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <div className="max-w-4xl mx-auto px-6 py-20">
        
        <Link to="/login" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition-colors mb-12 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-xs uppercase tracking-widest">Back to Account Access</span>
        </Link>

        <header className="mb-20">
          <img src={logo} alt="DebtAI" className="w-16 h-16 mb-8" />
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Support Repository</h1>
          <p className="text-stone-400 text-xl font-medium max-w-xl">Our technical and strategic units are standing by to assist your financial architecture.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-stone-900/50 border border-stone-800 p-8 rounded-[40px] hover:bg-stone-900 transition-all group">
            <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center mb-6">
                <Mail size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Electronic Mail</h3>
            <p className="text-stone-500 text-sm mb-6 font-medium">For technical inquiries and account authorization issues.</p>
            <a href="mailto:support@debtai.in" className="text-xl font-black tracking-tight hover:underline decoration-stone-500">support@debtai.in</a>
          </div>

          <div className="bg-stone-900/50 border border-stone-800 p-8 rounded-[40px] hover:bg-stone-900 transition-all group">
            <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center mb-6">
                <Phone size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Voice Interface</h3>
            <p className="text-stone-500 text-sm mb-6 font-medium">Strategic assistance and enterprise consultation.</p>
            <a href="tel:+911234567890" className="text-xl font-black tracking-tight hover:underline decoration-stone-500">+91 123 456 7890</a>
          </div>

          <div className="bg-stone-900/50 border border-stone-800 p-8 rounded-[40px] hover:bg-stone-900 transition-all group">
            <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Immediate Response</h3>
            <p className="text-stone-500 text-sm mb-6 font-medium">Standard wait-time: ~120 minutes during work cycles.</p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               System Active
            </div>
          </div>

          <div className="bg-stone-900/50 border border-stone-800 p-8 rounded-[40px] hover:bg-stone-900 transition-all group">
            <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Operational Integrity</h3>
            <p className="text-stone-500 text-sm mb-6 font-medium">All sessions are encrypted and logged for auditing.</p>
            <p className="text-xs font-bold text-stone-600 uppercase tracking-widest">Protocol v4.0.2</p>
          </div>
        </div>

        <footer className="mt-20 pt-10 border-t border-stone-900 text-center">
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-700">© 2026 DebtAI Financial Architecture</p>
        </footer>
      </div>
    </div>
  );
}
