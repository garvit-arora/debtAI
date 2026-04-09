import React, { useState } from 'react';
import Sidebar from '../ui/Sidebar';
import { Menu, X } from 'lucide-react';

const backendURL = import.meta.env.VITE_BACKEND_PYTHON_URL;

const LegacyTool = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative transition-colors duration-300">
      
      {/* Mobile Sidebar Logic */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[40] md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-[50] w-64 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 p-2 text-foreground z-50"><X size={24} /></button>
        <Sidebar aria-hidden={!isMobileMenuOpen} />
      </div>

      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 md:ml-32 relative flex flex-col h-full">
        {/* Mobile Header for Iframe Page */}
        <header className="md:hidden flex items-center p-4 bg-background border-b border-border z-10">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 hover:bg-secondary rounded-xl transition-colors">
                <Menu size={28} />
            </button>
            <h1 className="flex-1 text-center font-bold text-sm uppercase tracking-widest opacity-60">Legacy Tool</h1>
        </header>

        <div className="flex-1 w-full bg-white relative">
            {/* If the background is white, we might want to overlay a subtle message or ensure it looks clean */}
            <iframe 
                src={backendURL}
                title="Nexus AI Tool"
                className="w-full h-full border-none"
            />
        </div>
      </main>
    </div>
  );
};

export default LegacyTool;