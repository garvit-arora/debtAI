import React, { useState } from 'react';
import Sidebar from '../ui/Sidebar';
import { Menu, X } from 'lucide-react';

const backendURL = import.meta.env.VITE_BACKEND_PYTHON_URL;

const LegacyTool = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden uppercase tracking-tighter">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Mobile Header for Iframe Page */}
        <header className="md:hidden flex items-center p-4 bg-[#050505] border-b border-white/5 z-10">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-colors">
                <Menu size={28} />
            </button>
            <h1 className="flex-1 text-center font-black italic text-sm tracking-widest uppercase opacity-60">Legacy Tool</h1>
        </header>

        <div className="flex-1 w-full bg-[#050505] relative overflow-hidden">
            <iframe 
                src={backendURL}
                title="DebtAI Tool"
                className="w-full h-full border-none"
            />
        </div>
      </main>
    </div>
  );
};

export default LegacyTool;