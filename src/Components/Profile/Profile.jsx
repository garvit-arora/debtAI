import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar"; 
import PricingModal from "../Premium/Premium";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser } from "firebase/auth";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { app } from "../../firebase";
import { useTheme } from "../../context/ThemeContext";
import { 
  User, 
  CreditCard, 
  TrendingUp, 
  Save, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  LogOut,
  X,
  Trophy,
  CheckCircle2,
  Settings,
  Bell,
  Lock,
  Download,
  AlertOctagon,
  Mail,
  Crown,
  Zap,
  Menu
} from "lucide-react";
import { usePopup } from "../../context/PopupContext";

const strategies = [
  { id: "stress_first", label: "Stress First", desc: "Target high anxiety debts." },
  { id: "amount_first", label: "Snowball (Smallest Amount)", desc: "Quick wins, build momentum." },
  { id: "interest_first", label: "Avalanche (Highest Interest)", desc: "Mathematically saves most money." },
  { id: "date_first", label: "Earliest Due Date", desc: "Avoid penalties." },
];

export default function Profile() {
  const auth = getAuth(app);
  const db = getDatabase(app);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { showPopup } = usePopup();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [editingDebtIndex, setEditingDebtIndex] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [planDetails, setPlanDetails] = useState("Free");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    income: "",
    expenses: "",
    strategy: "",
    debts: [],
    settings: {
      emailNotifications: true,
      billReminders: true
    }
  });

  const [currentDebt, setCurrentDebt] = useState({
    name: "", amount: "", interest: "", dueDate: "", stress: 5
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = ref(db, `users/${currentUser.uid}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            let safeDebts = [];
            if (data.debts) safeDebts = Array.isArray(data.debts) ? data.debts : Object.values(data.debts);
            setIsPremium(data.isPremium === true);
            setPlanDetails(data.plan || (data.isPremium ? "Pro" : "Basic"));
            setFormData({
              name: data.name || "",
              email: data.email || currentUser.email,
              income: data.income || 0,
              expenses: data.expenses || 0,
              strategy: data.strategy || "amount_first",
              debts: safeDebts,
              settings: data.settings || { emailNotifications: true, billReminders: true }
            });
          }
          setLoading(false);
        });
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      showPopup({ title: "Session", message: "Error signing out: " + error.message, type: "error" });
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await update(ref(db, `users/${user.uid}`), {
        name: formData.name,
        income: parseFloat(formData.income),
        expenses: parseFloat(formData.expenses),
        strategy: formData.strategy
      });
    } catch (error) {
      showPopup({ title: "Update Failed", message: "Registry synchronization failed.", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await update(ref(db, `users/${user.uid}`), { settings: formData.settings });
    } catch (error) {
      showPopup({ title: "Configuration", message: "Matrix settings failed to save.", type: "error" });
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleSetting = (key) => {
    setFormData(prev => ({ ...prev, settings: { ...prev.settings, [key]: !prev.settings[key] } }));
  };

  const handlePasswordReset = async () => {
    if(!formData.email) return;
    try {
      await sendPasswordResetEmail(auth, formData.email);
      showPopup({ title: "Security", message: `Protocol instructions sent to ${formData.email}.`, type: "success" });
    } catch (error) {
      showPopup({ title: "Security Warning", message: error.message, type: "error" });
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `debt_ai_export.json`;
    link.click();
  };

  const handleDeleteAccount = async () => {
    if(!window.confirm("Account deletion is permanent. Continue?")) return;
    try {
      await remove(ref(db, `users/${user.uid}`));
      await deleteUser(user);
    } catch (error) {
      showPopup({ title: "Purge Error", message: "Error: " + error.message, type: "error" });
    }
  };

  const handleSaveDebt = async () => {
    if(!currentDebt.name || !currentDebt.amount) return showPopup({ title: "Input Required", message: "Required fields missing in debt unit.", type: "warning" });
    const newDebtObj = { ...currentDebt, amount: parseFloat(currentDebt.amount), interest: parseFloat(currentDebt.interest) };
    let updatedDebts = [...formData.debts];
    if (editingDebtIndex !== null) updatedDebts[editingDebtIndex] = newDebtObj;
    else updatedDebts.push(newDebtObj);
    try {
      await update(ref(db, `users/${user.uid}`), { debts: updatedDebts });
      setShowDebtModal(false);
    } catch (e) {
      showPopup({ title: "Position Error", message: "Error initializing portfolio position.", type: "error" });
    }
  };

  const handleDeleteDebt = async (index) => {
    if(!window.confirm("Delete debt record?")) return;
    const updatedDebts = formData.debts.filter((_, i) => i !== index);
    try {
      await update(ref(db, `users/${user.uid}`), { debts: updatedDebts });
    } catch (e) {
      showPopup({ title: "Position Error", message: "Error purging portfolio position.", type: "error" });
    }
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-background text-foreground animate-pulse">Syncing Profile...</div>;

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans relative transition-colors duration-300">
      
      {isMobileMenuOpen && (<div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[40] md:hidden" onClick={() => setIsMobileMenuOpen(false)} />)}
      
      <div className={`fixed inset-y-0 left-0 z-[50] w-64 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 p-2 text-foreground z-50"><X size={24} /></button>
        <Sidebar aria-hidden={!isMobileMenuOpen} />
      </div>

      <div className="hidden md:block">
        <Sidebar />
      </div>

      {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} />}

      <main className="flex-1 md:ml-32 p-6 md:p-12 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto space-y-12 pb-12">
          
          <header className="flex justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 hover:bg-secondary rounded-xl md:hidden transition-colors"><Menu size={28} /></button>
               <div>
                 <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Profile</h1>
                 <p className="text-muted text-lg mt-2 font-medium">Profile architecture and configuration.</p>
               </div>
            </div>
            
            <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </header>

          <div className={`p-8 rounded-[40px] border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 transition-all relative overflow-hidden ${isPremium ? "bg-foreground text-background" : "card-theme"}`}>
             {isPremium && (<div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transform rotate-12"><Crown size={200} /></div>)}

             <div className="flex flex-col md:flex-row items-center gap-6 z-10 text-center md:text-left">
                 <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center transform transition-transform ${isPremium ? "bg-emerald-500 text-white" : "bg-secondary text-muted"}`}>
                     {isPremium ? <Crown size={40} /> : <User size={40} />}
                 </div>
                 <div>
                     <h2 className="text-3xl font-bold tracking-tighter">{isPremium ? "Pro Tier Authorization" : "Standard Plan"}</h2>
                     <p className={`text-sm font-bold uppercase tracking-[0.2em] mt-1 ${isPremium ? "text-foreground" : "text-muted"}`}>
                        {isPremium ? "All Intelligence Modules Active" : "Standard Plan"}
                     </p>
                 </div>
             </div>

             <div className="z-10 w-full md:w-auto">
                 {!isPremium ? (
                     <button onClick={() => setShowPricingModal(true)} className="btn-primary flex items-center justify-center gap-3 px-10 py-4"><Zap size={20} fill="currentColor" /> Upgrade PRO</button>
                 ) : (
                      <div className="flex items-center justify-center gap-2 px-6 py-2.5 border border-background/20 rounded-full bg-background/5 backdrop-blur-md">
                        <CheckCircle2 size={16} className="text-foreground" />
                        <span className="text-xs font-bold uppercase tracking-widest text-foreground">Integrated</span>
                      </div>
                 )}
             </div>
          </div>

          <section className="card-theme p-8 md:p-12 light-mode-shadow space-y-12">
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-secondary rounded-lg"><User size={24} /></div>
                    <h2 className="text-2xl font-bold tracking-tight">Core Repository</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">Legal Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-theme w-full p-4 font-medium outline-none focus:ring-4 focus:ring-foreground/5" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">Registry Email</label>
                        <input type="text" value={formData.email} disabled className="input-theme w-full p-4 opacity-50 cursor-not-allowed bg-secondary/30" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">Monthly Inflow (₹)</label>
                        <input type="number" value={formData.income} onChange={(e) => setFormData({...formData, income: e.target.value})} className="input-theme w-full p-4 font-medium outline-none focus:ring-4 focus:ring-foreground/5" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">Monthly Outflow (₹)</label>
                        <input type="number" value={formData.expenses} onChange={(e) => setFormData({...formData, expenses: e.target.value})} className="input-theme w-full p-4 font-medium outline-none focus:ring-4 focus:ring-foreground/5" />
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-secondary rounded-lg"><TrendingUp size={24} /></div>
                    <h2 className="text-2xl font-bold tracking-tight">Optimization Logic</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strategies.map((strat) => (
                        <button key={strat.id} onClick={() => setFormData({...formData, strategy: strat.id})} className={`p-6 rounded-3xl border text-left transition-all ${formData.strategy === strat.id ? "bg-foreground text-background border-foreground shadow-xl" : "bg-card border-border hover:bg-secondary"}`}>
                            <div className="font-bold text-lg mb-1">{strat.label}</div>
                            <div className={`text-xs font-medium ${formData.strategy === strat.id ? "opacity-60" : "text-muted"}`}>{strat.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary flex items-center justify-center gap-3 px-10 py-4 disabled:opacity-50">
                    {savingProfile ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                    <span className="text-sm uppercase tracking-widest font-bold tracking-widest">{savingProfile ? "Syncing..." : "Save"}</span>
                </button>
            </div>
          </section>

          <section className="card-theme p-8 md:p-12 light-mode-shadow">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-secondary rounded-lg"><Settings size={24} /></div>
              <h2 className="text-2xl font-bold tracking-tight">Configuration Matrix</h2>
            </div>

            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-secondary/30 p-6 rounded-[32px] border border-border flex items-center justify-between group transition-colors hover:bg-secondary">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center border border-border"><Mail size={22} className="opacity-70" /></div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-widest opacity-80">Network Alerts</h4>
                                <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">Temporal Summaries</p>
                            </div>
                        </div>
                        <button onClick={() => toggleSetting('emailNotifications')} className={`w-14 h-7 rounded-full p-1 transition-all ${formData.settings?.emailNotifications ? 'bg-foreground' : 'bg-muted'}`}><div className={`w-5 h-5 bg-background rounded-full shadow-md transition-transform ${formData.settings?.emailNotifications ? 'translate-x-7' : 'translate-x-0'}`}></div></button>
                    </div>

                    <div className="bg-secondary/30 p-6 rounded-[32px] border border-border flex items-center justify-between group transition-colors hover:bg-secondary">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center border border-border"><Bell size={22} className="opacity-70" /></div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-widest opacity-80">Cycle Reminders</h4>
                                <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">Expiring Obligations</p>
                            </div>
                        </div>
                        <button onClick={() => toggleSetting('billReminders')} className={`w-14 h-7 rounded-full p-1 transition-all ${formData.settings?.billReminders ? 'bg-foreground' : 'bg-muted'}`}><div className={`w-5 h-5 bg-background rounded-full shadow-md transition-transform ${formData.settings?.billReminders ? 'translate-x-7' : 'translate-x-0'}`}></div></button>
                    </div>
                </div>

                <div className="pt-10 border-t border-border">
                    <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mb-8">System Directives</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <button onClick={handlePasswordReset} className="btn-secondary py-5 flex items-center justify-center gap-3 text-sm"><Lock size={18} /> Credentials Reset</button>
                        <button onClick={handleExportData} className="btn-secondary py-5 flex items-center justify-center gap-3 text-sm"><Download size={18} /> Extract Registry</button>
                        <button onClick={handleDeleteAccount} className="flex items-center gap-3 p-5 bg-red-500/5 border border-red-500/20 text-red-500 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all justify-center"><AlertOctagon size={18} /> Purge Account</button>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-end">
              <button onClick={handleSaveSettings} disabled={savingSettings} className="btn-primary flex items-center justify-center gap-3 px-10 py-4 shadow-lg disabled:opacity-50">
                {savingSettings ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                <span className="text-sm uppercase tracking-widest font-bold">{savingSettings ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </section>

          <section className="space-y-6">
             <div className="flex justify-between items-end">
                <div className="flex items-center gap-3">
                 <div className="p-2 bg-secondary rounded-lg"><CreditCard size={24} /></div>
                 <h2 className="text-2xl font-bold tracking-tight">Financial Portfolio</h2>
               </div>
               <button onClick={() => openDebtModal(null)} className="btn-primary flex items-center gap-3 px-6 py-2.5 text-xs shadow-md"><Plus size={16} /> Add Position</button>
            </div>

            {formData.debts?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="card-theme p-6 light-mode-shadow border-border">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Total Liability</p>
                  <p className="text-2xl font-bold">₹{formData.debts.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0).toLocaleString()}</p>
                </div>
                <div className="card-theme p-6 light-mode-shadow border-border">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Avg. Interest</p>
                  <p className="text-2xl font-bold">{(formData.debts.reduce((sum, d) => sum + (parseFloat(d.interest) || 0), 0) / formData.debts.length).toFixed(1)}%</p>
                </div>
                <div className="card-theme p-6 light-mode-shadow border-border">
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Exposure Rate</p>
                   <p className="text-2xl font-bold">{((formData.debts.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) / (parseFloat(formData.income) || 1)) * 100).toFixed(0)}%</p>
                </div>
                <div className="card-theme p-6 light-mode-shadow border-border">
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Architecture</p>
                   <p className="text-2xl font-bold">{formData.debts.length} Units</p>
                </div>
              </div>
            )}

            {(!formData.debts || formData.debts.length === 0) ? (
               <div className="bg-black text-white p-12 rounded-[40px] text-center shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden group border border-white/10">
                  <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform"><Trophy size={150} /></div>
                  <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner"><Trophy size={40} className="text-white" /></div>
                  <div className="space-y-2">
                    <h3 className="text-4xl font-bold tracking-tighter">Zero Obligation Protocol</h3>
                    <p className="text-white/80 font-medium">System reports absolute financial independence.</p>
                  </div>
                  <div className="flex gap-2 items-center text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10 shadow-lg"><CheckCircle2 size={16} /> Maximum Liquidity Active</div>
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {formData.debts.map((debt, idx) => (
                  <div key={idx} className="card-theme p-6 light-mode-shadow flex flex-col sm:flex-row justify-between items-center gap-6 group transition-all border-border">
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                      <div className="w-14 h-14 rounded-2xl bg-secondary text-foreground flex items-center justify-center font-bold text-xl shadow-inner border border-border">{idx + 1}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-xl tracking-tight mb-2 truncate">{debt.name}</h3>
                        <div className="flex flex-wrap gap-4">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-500/5 px-3 py-1 rounded-full border border-red-500/10">₹{debt.amount}</span>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-muted">APR: {debt.interest}%</span>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Term: {debt.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => openDebtModal(idx)} className="p-3 bg-secondary rounded-xl text-muted hover:text-foreground transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => handleDeleteDebt(idx)} className="p-3 bg-secondary rounded-xl text-muted hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {showDebtModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in">
            <div className="bg-card border border-border rounded-[40px] p-10 w-full max-w-lg shadow-3xl relative">
              <button onClick={() => setShowDebtModal(false)} className="absolute top-8 right-8 p-3 bg-secondary rounded-full text-muted hover:text-foreground transition-all"><X size={20} /></button>
              <h2 className="text-3xl font-bold mb-10">{editingDebtIndex !== null ? "Modify Position" : "Initialize Position"}</h2>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">Descriptor</label>
                  <input type="text" placeholder="e.g. AMEX Gold" value={currentDebt.name} onChange={(e) => setCurrentDebt({...currentDebt, name: e.target.value})} className="input-theme w-full p-4 outline-none focus:ring-4 focus:ring-foreground/5 font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">Principal (₹)</label>
                    <input type="number" value={currentDebt.amount} onChange={(e) => setCurrentDebt({...currentDebt, amount: e.target.value})} className="input-theme w-full p-4 outline-none focus:ring-4 focus:ring-foreground/5 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">Coefficient (%)</label>
                    <input type="number" value={currentDebt.interest} onChange={(e) => setCurrentDebt({...currentDebt, interest: e.target.value})} className="input-theme w-full p-4 outline-none focus:ring-4 focus:ring-foreground/5 font-medium" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">Termination Point</label>
                    <input type="date" value={currentDebt.dueDate} onChange={(e) => setCurrentDebt({...currentDebt, dueDate: e.target.value})} className="input-theme w-full p-4 outline-none focus:ring-4 focus:ring-foreground/5 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 px-1">Stress (1-10)</label>
                    <input type="number" max="10" min="1" value={currentDebt.stress} onChange={(e) => setCurrentDebt({...currentDebt, stress: e.target.value})} className="input-theme w-full p-4 outline-none focus:ring-4 focus:ring-foreground/5 font-medium" />
                  </div>
                </div>
                <button onClick={handleSaveDebt} className="btn-primary w-full py-5 text-lg shadow-xl uppercase tracking-widest">{editingDebtIndex !== null ? "Confirm Update" : "Confirm Initialization"}</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}