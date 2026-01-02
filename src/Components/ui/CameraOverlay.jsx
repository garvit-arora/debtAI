import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const CameraOverlay = ({ onClose }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    // 1. Access Camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Error accessing camera:", err));
    }
    
    // 2. Cleanup: Stop camera when component closes (unmounts)
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fadeIn">
      
      {/* Top Bar */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <h3 className="text-white font-bold text-lg">Scan Bill</h3>
        <button 
          onClick={onClose} 
          className="bg-white/20 p-2 rounded-full backdrop-blur-md hover:bg-white/30 transition-colors"
        >
          <X className="text-white" />
        </button>
      </div>

      {/* Camera Feed Container */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        ></video>
        
        {/* Scanning Box UI Overlay */}
        <div className="relative z-10 w-72 h-96 border-2 border-emerald-400 rounded-[30px] shadow-[0_0_100px_rgba(52,211,153,0.2)] overflow-hidden">
           {/* Animated Scan Line */}
           <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_#34d399] animate-scan"></div>
           
           {/* Corner Markers */}
           <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl"></div>
           <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl"></div>
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl"></div>
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl"></div>
        </div>

        <p className="absolute bottom-32 z-10 text-white/80 font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
          Align bill within the frame
        </p>
      </div>

      {/* Bottom Capture Bar */}
      <div className="h-28 bg-black flex items-center justify-center pb-4">
         <button 
           onClick={onClose}
           className="w-20 h-20 rounded-full border-[6px] border-white/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
         >
            <div className="w-16 h-16 bg-white rounded-full shadow-lg"></div>
         </button>
      </div>
    </div>
  );
};

export default CameraOverlay;