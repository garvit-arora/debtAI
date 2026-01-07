import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar"; 
import PricingModal from "../Premium/Premium";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser } from "firebase/auth";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { app } from "../../firebase";
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
  Star
} from "lucide-react";

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
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Independent Saving States
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  
  // UI States
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [editingDebtIndex, setEditingDebtIndex] = useState(null);
  
  // Data State
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

  // 1. Fetch Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = ref(db, `users/${currentUser.uid}`);
        
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            let safeDebts = [];
            if (data.debts) {
                safeDebts = Array.isArray(data.debts) ? data.debts : Object.values(data.debts);
            }

            // Set Premium Status
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

  // --- ACTIONS ---

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      alert("Error signing out: " + error.message);
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
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await update(ref(db, `users/${user.uid}`), {
        settings: formData.settings
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleSetting = (key) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: !prev.settings[key]
      }
    }));
  };

  const handlePasswordReset = async () => {
    if(!formData.email) return;
    try {
      await sendPasswordResetEmail(auth, formData.email);
      alert(`Password reset email sent to ${formData.email}. Check your inbox!`);
    } catch (error) {
      alert("Error sending reset email: " + error.message);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `debt_ai_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm("Are you sure you want to delete your account? This is permanent.");
    if(!confirm1) return;
    
    try {
      await remove(ref(db, `users/${user.uid}`));
      await deleteUser(user);
      navigate("/login");
    } catch (error) {
      alert("Error deleting account (You may need to re-login first): " + error.message);
    }
  };

  // --- DEBT LOGIC ---
  const calculateEstimatedEMI = (amount, interest) => {
    const p = parseFloat(amount) || 0;
    const r = parseFloat(interest) || 0;
    const monthlyInterest = (p * (r / 100)) / 12;
    const minPay = (p * 0.02) + monthlyInterest; 
    return Math.round(minPay);
  };

  const handleSaveDebt = async () => {
    if(!currentDebt.name || !currentDebt.amount) return alert("Name and Amount are required");

    const newDebtObj = {
      name: currentDebt.name,
      amount: parseFloat(currentDebt.amount),
      interest: parseFloat(currentDebt.interest),
      dueDate: currentDebt.dueDate,
      stress: parseInt(currentDebt.stress),
      estimatedMinPayment: calculateEstimatedEMI(currentDebt.amount, currentDebt.interest)
    };

    let updatedDebts = [...formData.debts];
    if (editingDebtIndex !== null) {
      updatedDebts[editingDebtIndex] = newDebtObj;
    } else {
      updatedDebts.push(newDebtObj);
    }

    try {
      await update(ref(db, `users/${user.uid}`), { debts: updatedDebts });
      setShowDebtModal(false);
      setEditingDebtIndex(null);
    } catch (e) {
      alert("Error saving debt");
    }
  };

  const handleDeleteDebt = async (index) => {
    if(!window.confirm("Are you sure you want to delete this debt?")) return;
    const updatedDebts = formData.debts.filter((_, i) => i !== index);
    try {
      await update(ref(db, `users/${user.uid}`), { debts: updatedDebts });
    } catch (e) {
      alert("Error deleting debt");
    }
  };

  const openDebtModal = (index = null) => {
    if (index !== null) {
      setEditingDebtIndex(index);
      setCurrentDebt(formData.debts[index]);
    } else {
      setEditingDebtIndex(null);
      setCurrentDebt({ name: "", amount: "", interest: "", dueDate: "", stress: 5 });
    }
    setShowDebtModal(true);
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f8ecdd]">
      <Loader2 className="animate-spin h-10 w-10 text-[#5B2D2D]" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f8ecdd] font-sans relative">
      <div className="z-50 hidden md:block">
        <Sidebar />
      </div>

      {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} />}

      <main className="flex-1 md:ml-28 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
          
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#5B2D2D]">My Profile</h1>
              <p className="text-[#5B2D2D]/70">Manage your data and subscription.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* --- NEW: SUBSCRIPTION CARD --- */}
          <div className={`p-6 rounded-[30px] border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all relative overflow-hidden ${isPremium ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white border-gray-700" : "bg-white border-stone-100"}`}>
             
             {/* Decor */}
             {isPremium && (
                 <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                     <Crown size={150} />
                 </div>
             )}

             <div className="flex items-center gap-4 z-10">
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md ${isPremium ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-black" : "bg-stone-100 text-stone-400"}`}>
                     {isPremium ? <Crown size={32} fill="black" /> : <User size={32} />}
                 </div>
                 <div>
                     <h2 className="text-2xl font-bold">{isPremium ? "Pro Member" : "Basic Plan"}</h2>
                     <p className={`text-sm ${isPremium ? "text-white/60" : "text-stone-500"}`}>
                        {isPremium ? "You have unlocked all features." : "Upgrade to unlock AI Habits & more."}
                     </p>
                 </div>
             </div>

             <div className="z-10 w-full md:w-auto">
                 {!isPremium ? (
                     <button 
                        onClick={() => setShowPricingModal(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:shadow-[0_0_25px_rgba(250,204,21,0.7)] hover:scale-105 transition-all animate-pulse"
                     >
                        <Zap size={20} fill="currentColor" />
                        <span>Upgrade Now</span>
                     </button>
                 ) : (
                     <div className="flex items-center gap-2 px-6 py-2 bg-white/10 rounded-full border border-white/20">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-100">Active</span>
                     </div>
                 )}
             </div>
          </div>

          {/* GROUP 1: PERSONAL & FINANCIAL PROFILE */}
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[30px] border border-white/40 shadow-sm space-y-8">
            
            {/* Personal Details */}
            <div>
                <div className="flex items-center gap-2 mb-6 text-[#5B2D2D]">
                    <User size={24} />
                    <h2 className="text-xl font-bold">Personal & Financial</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-[#5B2D2D]/60 mb-1 ml-1">Full Name</label>
                        <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white border border-stone-200 rounded-xl p-3 text-[#5B2D2D] focus:ring-2 focus:ring-[#5B2D2D]/20 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#5B2D2D]/60 mb-1 ml-1">Email (Read Only)</label>
                        <input 
                        type="text" 
                        value={formData.email}
                        disabled
                        className="w-full bg-stone-100 border border-stone-200 rounded-xl p-3 text-stone-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#5B2D2D]/60 mb-1 ml-1">Monthly Income</label>
                        <div className="relative">
                        <span className="absolute left-3 top-3.5 text-stone-400">$</span>
                        <input 
                            type="number" 
                            value={formData.income}
                            onChange={(e) => setFormData({...formData, income: e.target.value})}
                            className="w-full bg-white border border-stone-200 rounded-xl p-3 pl-8 text-[#5B2D2D] focus:ring-2 focus:ring-[#5B2D2D]/20 outline-none"
                        />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#5B2D2D]/60 mb-1 ml-1">Monthly Expenses</label>
                        <div className="relative">
                        <span className="absolute left-3 top-3.5 text-stone-400">$</span>
                        <input 
                            type="number" 
                            value={formData.expenses}
                            onChange={(e) => setFormData({...formData, expenses: e.target.value})}
                            className="w-full bg-white border border-stone-200 rounded-xl p-3 pl-8 text-[#5B2D2D] focus:ring-2 focus:ring-[#5B2D2D]/20 outline-none"
                        />
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategy Selection */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-[#5B2D2D]">
                    <TrendingUp size={24} />
                    <h2 className="text-xl font-bold">Strategy</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strategies.map((strat) => (
                        <button
                        key={strat.id}
                        onClick={() => setFormData({...formData, strategy: strat.id})}
                        className={`p-4 rounded-xl border text-left transition-all ${
                            formData.strategy === strat.id 
                            ? "bg-[#5B2D2D] text-white border-[#5B2D2D] shadow-md" 
                            : "bg-white border-stone-200 text-stone-600 hover:border-[#5B2D2D]"
                        }`}
                        >
                        <div className="font-bold">{strat.label}</div>
                        <div className={`text-xs mt-1 ${formData.strategy === strat.id ? "text-orange-100" : "text-stone-400"}`}>
                            {strat.desc}
                        </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* SAVE BUTTON 1: Profile */}
            <div className="flex justify-end pt-2">
                <button 
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-6 py-3 bg-[#5B2D2D] text-white rounded-xl font-bold hover:bg-[#422121] transition-all disabled:opacity-70 shadow-lg"
                >
                    {savingProfile ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                    <span>{savingProfile ? "Saving..." : "Save Profile Changes"}</span>
                </button>
            </div>
          </div>

          {/* GROUP 2: SETTINGS & ACCOUNT */}
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[30px] border border-white/40 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-[#5B2D2D]">
              <Settings size={24} />
              <h2 className="text-xl font-bold">Settings & Preferences</h2>
            </div>

            <div className="space-y-6">
                {/* Notifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center justify-between">
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#5B2D2D]">Email Alerts</h4>
                                <p className="text-xs text-stone-500">Weekly summaries</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => toggleSetting('emailNotifications')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.settings?.emailNotifications ? 'bg-[#5B2D2D]' : 'bg-stone-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.settings?.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center justify-between">
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#5B2D2D]">Due Reminders</h4>
                                <p className="text-xs text-stone-500">2 days before due date</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => toggleSetting('billReminders')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.settings?.billReminders ? 'bg-[#5B2D2D]' : 'bg-stone-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.settings?.billReminders ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="border-t border-stone-200 pt-6">
                    <h3 className="text-sm font-bold text-[#5B2D2D] mb-4 uppercase tracking-wider">Account Actions</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={handlePasswordReset}
                            className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 font-medium"
                        >
                            <Lock size={18} />
                            Reset Password
                        </button>

                        <button 
                            onClick={handleExportData}
                            className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 font-medium"
                        >
                            <Download size={18} />
                            Export Data
                        </button>

                        <button 
                            onClick={handleDeleteAccount}
                            className="flex items-center gap-3 p-4 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-red-600 font-medium"
                        >
                            <AlertOctagon size={18} />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* SAVE BUTTON 2: Settings */}
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="flex items-center gap-2 px-6 py-3 bg-[#5B2D2D] text-white rounded-xl font-bold hover:bg-[#422121] transition-all disabled:opacity-70 shadow-lg"
              >
                {savingSettings ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                <span>{savingSettings ? "Saving..." : "Save Preferences"}</span>
              </button>
            </div>
          </div>

          {/* GROUP 3: DEBT PORTFOLIO */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
               <div className="flex items-center gap-2 text-[#5B2D2D]">
                <CreditCard size={24} />
                <h2 className="text-xl font-bold">Debt Portfolio</h2>
              </div>
              <button 
                onClick={() => openDebtModal(null)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold hover:bg-emerald-200 transition-colors"
              >
                <Plus size={18} />
                Add Debt
              </button>
            </div>

            {(!formData.debts || formData.debts.length === 0) ? (
               <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 rounded-[30px] text-center text-white shadow-lg flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                     <Trophy size={32} className="text-yellow-200" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">You are Debt Free!</h3>
                    <p className="text-emerald-100">Congratulations on achieving financial freedom.</p>
                  </div>
                  <div className="flex gap-2 items-center text-sm bg-white/10 px-4 py-2 rounded-full">
                     <CheckCircle2 size={16} />
                     <span>0 Active Debts</span>
                  </div>
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {formData.debts.map((debt, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#5B2D2D] text-lg">{debt.name}</h3>
                        <div className="flex gap-3 text-sm text-stone-500">
                           <span className="bg-stone-100 px-2 py-0.5 rounded-md text-stone-600 font-medium">
                             ${debt.amount}
                           </span>
                           <span>{debt.interest}% APR</span>
                           <span>Due: {debt.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-auto">
                      <button onClick={() => openDebtModal(idx)} className="p-2 text-stone-400 hover:bg-stone-100 hover:text-[#5B2D2D] rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteDebt(idx)} className="p-2 text-stone-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* --- DEBT MODAL --- */}
        {showDebtModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#5B2D2D]/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[30px] p-8 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setShowDebtModal(false)} className="absolute top-6 right-6 text-stone-400 hover:text-[#5B2D2D]">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-[#5B2D2D] mb-6">
                {editingDebtIndex !== null ? "Edit Debt" : "Add New Debt"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#5B2D2D]/70 ml-1 mb-1">Debt Name</label>
                  <input type="text" placeholder="e.g. Chase Visa" value={currentDebt.name} onChange={(e) => setCurrentDebt({...currentDebt, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#5B2D2D]/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5B2D2D]/70 ml-1 mb-1">Amount ($)</label>
                    <input type="number" value={currentDebt.amount} onChange={(e) => setCurrentDebt({...currentDebt, amount: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#5B2D2D]/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5B2D2D]/70 ml-1 mb-1">Interest (%)</label>
                    <input type="number" value={currentDebt.interest} onChange={(e) => setCurrentDebt({...currentDebt, interest: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#5B2D2D]/20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5B2D2D]/70 ml-1 mb-1">Next Due Date</label>
                    <input type="date" value={currentDebt.dueDate} onChange={(e) => setCurrentDebt({...currentDebt, dueDate: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#5B2D2D]/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5B2D2D]/70 ml-1 mb-1">Stress (1-10)</label>
                    <input type="number" max="10" min="1" value={currentDebt.stress} onChange={(e) => setCurrentDebt({...currentDebt, stress: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#5B2D2D]/20" />
                  </div>
                </div>
                <button onClick={handleSaveDebt} className="w-full py-4 bg-[#5B2D2D] text-white font-bold rounded-xl hover:bg-[#422121] transition-all mt-4">
                  {editingDebtIndex !== null ? "Update Debt" : "Add Debt"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}