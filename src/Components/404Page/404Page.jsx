import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdErrorOutline, MdHome, MdAttachMoney } from "react-icons/md";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation(); // <--- Captures the bad URL

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF3E0] overflow-hidden relative font-sans">
      
      {/* --- BACKGROUND ANIMATIONS --- */}
      {/* Floating Coins (using icons) */}
      <div className="absolute top-1/4 left-10 text-yellow-500/20 animate-bounce delay-700">
        <MdAttachMoney size={120} />
      </div>
      <div className="absolute bottom-1/4 right-10 text-green-500/20 animate-bounce delay-100">
        <MdAttachMoney size={100} />
      </div>

      {/* Blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse delay-1000"></div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        
        {/* The Big 404 */}
        <div className="relative inline-block mb-6">
            <h1 className="text-[8rem] sm:text-[12rem] font-black text-gray-900 leading-none select-none drop-shadow-xl tracking-tighter">
                404
            </h1>
            
            {/* The "Stamp" Effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-sm sm:text-base font-bold px-4 py-2 -rotate-12 border-2 border-white shadow-lg uppercase tracking-widest whitespace-nowrap">
                Asset Liquidated
            </div>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">
            Financial Void Detected
        </h2>
        
        <p className="text-gray-600 text-lg sm:text-xl mb-8 leading-relaxed">
            The path <code className="bg-red-100 text-red-600 px-2 py-1 rounded font-mono text-base mx-1">{location.pathname}</code> 
            <br className="hidden sm:block" />
            has defaulted, does not exist, or was seized by the bank.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
            <button 
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <MdErrorOutline size={22} />
                Go Back
            </button>
            <button 
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gray-900 text-white font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <MdHome size={22} />
                Return to Safety
            </button>
        </div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-6 text-gray-400 text-xs sm:text-sm font-mono flex flex-col items-center gap-1 opacity-60">
        <span>ERROR_CODE: INSUFFICIENT_FUNDS</span>
        <span>ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
      </div>
    </div>
  );
};

export default NotFound;