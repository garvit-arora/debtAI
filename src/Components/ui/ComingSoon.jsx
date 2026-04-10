import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { LayoutGrid, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon({ title = "Module" }) {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden uppercase">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <h1 className="text-xl font-black italic tracking-tighter">{title}</h1>
            </div>
            <button onClick={() => navigate(-1)} className="px-6 py-2 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Back</button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center mb-8">
               <Timer size={48} className="text-stone-700" />
            </div>
            <h2 className="text-6xl font-black italic tracking-tighter mb-4 uppercase">{title} Architecture</h2>
            <p className="text-stone-600 font-bold text-lg max-w-md tracking-tight mb-12">
               This module is currently being synchronized with our core financial engine.
            </p>
            <button onClick={() => navigate('/dashboard')} className="px-12 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Return to Dashboard</button>
        </div>
        <Footer />
      </main>
    </div>
  );
}
