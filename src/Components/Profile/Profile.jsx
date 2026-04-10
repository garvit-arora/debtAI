import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar"; 
import Footer from "../ui/Footer";
import PricingModal from "../Premium/Premium";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { app } from "../../firebase";
import { useTheme } from "../../context/ThemeContext";
import { 
  User, 
  Save, 
  Loader2, 
  LogOut,
  Globe,
  Sparkles,
  ShieldAlert,
  Edit3,
  Camera,
  Layers,
  Target
} from "lucide-react";
import { usePopup } from "../../context/PopupContext";

const DashboardCard = ({ children, className = "" }) => (
  <div className={`bg-[#0d0d0d] border border-white/5 rounded-[40px] p-10 shadow-sm ${className}`}>
    {children}
  </div>
);

export default function Profile() {
  const auth = getAuth(app);
  const db = getDatabase(app);
  const navigate = useNavigate();
  const { showPopup } = usePopup();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    financialGoal: "",
    income: "",
    expenses: "",
    strategy: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        onValue(ref(db, `users/${currentUser.uid}`), (snapshot) => {
          const data = snapshot.val();
          setUserData(data);
          if (data) {
            setFormData({
              name: data.name || "",
              email: data.email || currentUser.email,
              bio: data.bio || "",
              financialGoal: data.financialGoal || "",
              income: data.income || 0,
              expenses: data.expenses || 0,
              strategy: data.strategy || "amount_first"
            });
          }
          setLoading(false);
        });
      } else navigate("/login");
    });
    return () => unsubscribe();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await update(ref(db, `users/${user.uid}`), formData);
      showPopup({ title: "Profile Synchronized", message: "Your personal details have been updated.", type: "success" });
    } catch (error) {
      showPopup({ title: "Update Failed", message: "Check connection and try again.", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-white" size={48} /></div>;

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black uppercase">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] sticky top-0 z-40">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-stone-400"><Layers size={24} /></button>
            <div className="hidden lg:block"></div>
            <button onClick={() => navigate('/settings')} className="flex items-center gap-2 px-6 py-2 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Settings Tool</button>
        </header>

        <div className="flex-1 overflow-y-auto px-12 py-12 hide-scrollbar space-y-12">
           <section className="mb-12">
              <h2 className="text-7xl font-black tracking-tighter text-white mb-2 italic uppercase">Account Info<span className="text-cyan-500">.</span></h2>
              <p className="text-stone-600 font-bold text-lg tracking-tight lowercase">Manage your identity and financial presence.</p>
           </section>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-32">
              <div className="lg:col-span-2 space-y-12">
                 <DashboardCard className="relative overflow-hidden group">
                    <div className="flex items-center gap-8 mb-12">
                       <div className="relative">
                          <div className="w-32 h-32 rounded-[40px] bg-white text-black flex items-center justify-center overflow-hidden border-4 border-white/5">
                             {userData?.profileImg ? <img src={userData.profileImg} className="w-full h-full object-cover" /> : <User size={48} />}
                          </div>
                          <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-cyan-500 rounded-2xl flex items-center justify-center text-black shadow-2xl hover:scale-110 transition-all border-4 border-[#050505]"><Camera size={16} /></button>
                       </div>
                       <div>
                          <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none mb-2">{formData.name}</h3>
                          <p className="text-[10px] font-black text-stone-700 tracking-[0.2em]">{formData.email}</p>
                       </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black text-stone-800 tracking-widest">Personal Bio</label>
                          <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-3xl p-5 text-sm font-bold focus:border-white/10 outline-none resize-none" placeholder="Brief description of your financial journey..." />
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black text-stone-800 tracking-widest">Ultimate Financial Goal</label>
                          <input type="text" value={formData.financialGoal} onChange={(e) => setFormData({...formData, financialGoal: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-3xl p-5 text-sm font-bold focus:border-white/10 outline-none" placeholder="e.g. Debt free by 30" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-stone-800 tracking-widest">Monthly Income (₹)</label>
                          <input type="number" value={formData.income} onChange={(e) => setFormData({...formData, income: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-3xl p-5 text-sm font-bold focus:border-white/10 outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-stone-800 tracking-widest">Fixed Expenses (₹)</label>
                          <input type="number" value={formData.expenses} onChange={(e) => setFormData({...formData, expenses: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-3xl p-5 text-sm font-bold focus:border-white/10 outline-none" />
                       </div>
                       <button type="submit" disabled={savingProfile} className="md:col-span-2 py-6 bg-white text-black rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95">
                          {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Synchronize Data</>}
                       </button>
                    </form>
                 </DashboardCard>
              </div>

              <div className="space-y-12">
                 <DashboardCard className="bg-cyan-500/5 border-cyan-500/10">
                    <div className="flex items-center gap-4 text-cyan-500 mb-8">
                       <Target size={20} />
                       <span className="text-[10px] font-black tracking-widest">Current Strategy</span>
                    </div>
                    <p className="text-xl font-black italic text-white uppercase tracking-tighter mb-8">{formData.strategy.replace('_', ' ')} active</p>
                    <button onClick={() => navigate('/settings')} className="w-full py-4 text-cyan-500 bg-cyan-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all">Change Protocol</button>
                 </DashboardCard>

                 <div className="p-10 bg-[#0d0d0d] border border-white/5 rounded-[40px] space-y-6">
                    <div className="flex items-center gap-4 text-stone-500">
                       <Globe size={18} />
                       <span className="text-[10px] font-black tracking-widest">Regional Settings</span>
                    </div>
                    <p className="text-xs font-bold text-stone-800 italic uppercase">System Parity: Global (INR)</p>
                 </div>
              </div>
           </div>

           <Footer />
        </div>
      </main>

      {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} />}
    </div>
  );
}