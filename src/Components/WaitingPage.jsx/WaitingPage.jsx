import React, { useState, useEffect, useRef } from "react";
import { ref, push, serverTimestamp } from "firebase/database";
import { waitlistDb } from "../../firebaseWaitinglist"
import { BsArrowRight, BsCheckCircleFill, BsStars } from "react-icons/bs";
import gsap from "gsap";
import logo from "../../assets/icons/logo2.png"; 

const WaitingPage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); 
  const containerRef = useRef(null);
  const formRef = useRef(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Staggered Text Entry
      tl.from(".anim-entry", {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      });
      tl.from(
        formRef.current,
        {
          scale: 0.95,
          opacity: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");

    try {
      const leadsRef = ref(waitlistDb, "leads");
      await push(leadsRef, {
        email: email,
        joinedAt: serverTimestamp(),
        source: "web_landing_v2",
        userAgent: navigator.userAgent,
      });
      setTimeout(() => {
          setStatus("success");
          setEmail("");
      }, 800);
      
    } catch (error) {
      console.error("Waitlist Error:", error);
      setStatus("error");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-stone-50 selection:bg-emerald-200 selection:text-emerald-900 font-sans"
    >
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/60 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-100/60 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-orange-50/80 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-noise opacity-[0.03]"></div>
      </div>
      <header className="absolute top-0 left-0 w-full p-6 flex justify-center z-20">
        <div className="anim-entry flex items-center gap-2 px-5 py-2 rounded-full border border-white/40 shadow-sm backdrop-blur-md bg-white/30">
          <img src={logo} alt="DebtAI" className="h-6 w-auto opacity-80" />
          <span className="font-semibold text-stone-700 tracking-tight">DebtAI</span>
        </div>
      </header>
      <main className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="anim-entry inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-widest uppercase mb-8">
          <BsStars className="text-emerald-600" />
          <span>Private Beta Access</span>
        </div>
        <h1 className="anim-entry text-5xl md:text-7xl font-bold tracking-tighter text-stone-900 leading-[1.1] mb-6">
          Finance without <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-500">
            the panic.
          </span>
        </h1>

        <p className="anim-entry text-lg md:text-xl text-stone-600 max-w-lg mx-auto leading-relaxed mb-10">
          The AI planner that prioritizes your peace of mind. 
          Stop drowning in interest—start navigating with clarity.
        </p>
        <div ref={formRef} className="w-full max-w-md">
          {status === "success" ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-3xl shadow-xl shadow-emerald-900/5 text-center transform transition-all duration-500 animate-fade-in-up">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                <BsCheckCircleFill />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">You're on the list!</h3>
              <p className="text-stone-600">
                We'll notify you as soon as a spot opens up. Prepare to breathe easier.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-[20px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative p-2 bg-white rounded-[18px] shadow-2xl shadow-stone-200/50 border border-stone-100 flex items-center">
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  required
                  className="flex-1 px-4 py-3 bg-transparent text-stone-800 placeholder-stone-400 font-medium focus:outline-none text-lg w-full"
                />
                
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-6 py-3 rounded-xl bg-stone-900 text-white font-semibold hover:bg-emerald-700 transition-all duration-300 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                >
                  {status === "loading" ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Join</span>
                      <BsArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
          {status !== "success" && (
             <p className="anim-entry mt-6 text-sm text-stone-400 font-medium">
                Join <span className="text-stone-600 font-bold">2,000+</span> others waiting for clarity.
             </p>
          )}
          
          {status === "error" && (
             <p className="mt-4 text-red-500 text-sm font-semibold bg-red-50 py-2 px-4 rounded-lg inline-block">
                Something went wrong. Please try again.
             </p>
          )}
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="absolute bottom-6 w-full text-center z-10">
        <p className="text-xs text-stone-400 font-mono tracking-wide uppercase opacity-60 hover:opacity-100 transition-opacity">
          © {new Date().getFullYear()} DebtAI Systems
        </p>
      </footer>
    </div>
  );
};

export default WaitingPage;