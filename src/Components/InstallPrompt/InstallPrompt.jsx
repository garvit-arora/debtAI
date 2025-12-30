import React, { useState, useEffect } from "react";
import { MdClose, MdFileDownload, MdIosShare } from "react-icons/md";

const InstallPrompt = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Check if already installed
    const isApp = window.matchMedia("(display-mode: standalone)").matches;
    if (isApp) {
      setIsStandalone(true);
      return; 
    }

    // 2. Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // 3. Android/Chrome Event Listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show iOS prompt after delay
    if (ios && !isApp) {
      setTimeout(() => setIsVisible(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible || isStandalone) return null;

  return (
    // NOTIFICATION CONTAINER
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <div className="bg-gray-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-gray-700 flex items-center justify-between gap-3 max-w-xl mx-auto">
        
        {/* ICON & TEXT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black font-bold flex-shrink-0">
            <MdFileDownload size={20} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold leading-tight">Install DebtAI</h3>
            <p className="text-xs text-gray-300 truncate">
              {isIOS ? "Tap Share → Add to Home Screen" : "Add to Home Screen for better experience"}
            </p>
          </div>
        </div>

        {/* ACTION BUTTON (Android Only) */}
        {!isIOS && (
          <button
            onClick={handleInstallClick}
            className="text-amber-400 font-bold text-sm px-2 py-1 hover:text-amber-300 transition-colors whitespace-nowrap"
          >
            Install
          </button>
        )}

        {/* CLOSE BUTTON */}
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white p-1"
        >
          <MdClose size={18} />
        </button>
      </div>

      {/* iOS Pointer (Optional visual aid) */}
      {isIOS && (
        <div className="absolute top-full right-4 mt-2 flex flex-col items-end animate-bounce">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-gray-900"></div>
            <div className="bg-gray-900 text-xs px-2 py-1 rounded text-white">Tap here</div>
        </div>
      )}
    </div>
  );
};

export default InstallPrompt;