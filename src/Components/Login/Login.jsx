import React, { useEffect, useState } from "react";
import logo from "../../assets/icons/logo2.png";
import { getDatabase, ref, get, set } from "firebase/database";
import Loader from "../Loader.jsx";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { app } from "../../firebase";
import { useTheme } from "../../context/ThemeContext";
import { Eye, EyeOff, LogIn, Globe } from "lucide-react";
import phoneMockup from "/home/masky-is-online/.gemini/antigravity/brain/bd507fd4-5d11-4b87-9597-f4e8a3f09613/hand_holding_debt_app_phone_1775753131204.png";

export default function Login() {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const googleProvider = new GoogleAuthProvider();

  const afterLogin = async (user) => {
    const db = getDatabase(app);
    const userRef = ref(db, "users/" + user.uid);
    const snapshot = await get(userRef);

    const data = snapshot.val();
    if (!snapshot.exists()) {
      await set(userRef, { email: user.email, createdAt: Date.now(), onboarded: false });
      navigate("/onboarding");
    } else if (!data.onboarded) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        afterLogin(user);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await afterLogin(result.user);
        return;
      }
      if (methods.includes("password")) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await afterLogin(result.user);
        return;
      }
      alert("Account linked with another provider.");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert(error.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      await afterLogin(result.user);
    } catch (error) {
      setLoading(false);
      alert("Google sign-in failed.");
    } 
  };

  if (loading) return <Loader />;

  return (
    <div className="h-screen bg-black flex font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
      
      {/* Left side: Visual (Full Bleed, No Filter) */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
          <img src={phoneMockup} alt="DebtAI App" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Right side: Dark Card (Overlapping UI) */}
      <div className="w-full lg:w-[48%] h-screen bg-[#121212] lg:-ml-20 rounded-t-[40px] lg:rounded-t-none lg:rounded-l-[80px] flex flex-col p-8 md:p-12 relative border-l border-white/5 z-20 shadow-[-50px_0_100px_rgba(0,0,0,0.7)]">
          
          <div className="flex justify-between items-center mb-12">
              <Link to="/" className="flex items-center gap-3 group transition-all">
                  <img src={logo} alt="DebtAI" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
                  <span className="text-2xl font-black tracking-tighter text-white group-hover:text-cyan-400 transition-colors">DebtAI</span>
              </Link>
              <Link to="/support" className="text-stone-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
                  <Globe size={16} />
                  Help
              </Link>
          </div>

          <div className="max-w-sm w-full mx-auto flex-1 flex flex-col justify-center">
              <div className="mb-14">
                <h1 className="text-6xl font-black text-white tracking-tighter leading-tight italic">
                    Welcome<span className="text-cyan-400">.</span>
                </h1>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-3">
                      <div className="group">
                          <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email or Username"
                            className="w-full h-14 px-8 rounded-full border border-white/10 bg-white/5 text-white font-medium placeholder:text-stone-600 focus:outline-none focus:border-white focus:bg-white/10 transition-all outline-none text-sm"
                          />
                      </div>
                      <div className="group relative">
                          <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full h-14 px-8 rounded-full border border-white/10 bg-white/5 text-white font-medium placeholder:text-stone-600 focus:outline-none focus:border-white focus:bg-white/10 transition-all outline-none text-sm"
                          />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-stone-600 hover:text-white transition-colors">
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                      </div>
                  </div>

                  <div className="flex justify-center">
                      <Link to="/support" className="text-stone-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Forgot password?</Link>
                  </div>

                  <button 
                    onClick={handleEmailAuth}
                    className="w-full h-14 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-stone-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-2xl"
                  >
                      <LogIn size={18} strokeWidth={3} />
                      Continue
                  </button>

                  <div className="flex items-center gap-4 my-6">
                    <div className="h-px bg-white/5 flex-1"></div>
                    <span className="text-[9px] font-bold text-stone-700 uppercase tracking-widest">or</span>
                    <div className="h-px bg-white/5 flex-1"></div>
                  </div>

                  <div className="">
                      <button onClick={loginWithGoogle} className="w-full h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center gap-4 text-white hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-[0.3em]">
                         <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EB4335"/>
                         </svg>
                         Continue with Google
                      </button>
                  </div>
              </form>
          </div>

          <div className="flex justify-center text-[11px] font-black uppercase tracking-[0.4em] text-stone-400 mt-auto pt-8">
              <div className="flex gap-12">
                  <Link to="/support" className="hover:text-white transition-colors cursor-pointer tracking-widest">Contact</Link>
                  <Link to="/legal" className="hover:text-white transition-colors cursor-pointer tracking-widest">Privacy</Link>
              </div>
          </div>
      </div>

    </div>
  );
}