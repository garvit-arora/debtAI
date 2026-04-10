import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const PopupContext = createContext(null);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState(null);

  const showPopup = useCallback(({ 
    title = "Notification", 
    message, 
    type = "info", // info, success, error, warning
    confirmText = "Okay",
    onConfirm = null 
  }) => {
    setPopup({ title, message, type, confirmText, onConfirm });
  }, []);

  const closePopup = useCallback(() => {
    setPopup(null);
  }, []);

  const handleConfirm = () => {
    if (popup?.onConfirm) popup.onConfirm();
    closePopup();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={24} />;
      case 'error': return <AlertCircle className="text-rose-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  return (
    <PopupContext.Provider value={{ showPopup, closePopup }}>
      {children}
      <AnimatePresence>
        {popup && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePopup}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8 text-center"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                  {getIcon(popup.type)}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black tracking-tighter text-white uppercase tracking-widest">{popup.title}</h3>
                  <p className="text-stone-400 font-medium text-sm leading-relaxed">{popup.message}</p>
                </div>
                <button 
                  onClick={handleConfirm}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-stone-200 transition-all active:scale-95 shadow-xl"
                >
                  {popup.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PopupContext.Provider>
  );
};
