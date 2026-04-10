import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar";
import Footer from "../ui/Footer";
import { getDatabase, ref, onValue, push, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";
import { 
  Plus, 
  TrendingUp, 
  Trash2, 
  LayoutGrid, 
  Loader2, 
  X,
  Briefcase
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MetricCard = ({ title, value }) => (
  <div className="bg-[#121212] border border-white/5 rounded-[40px] p-8 flex flex-col justify-between h-44 hover:border-white/10 transition-all">
    <h3 className="text-2xl font-black text-stone-200 uppercase tracking-tighter leading-none">{title}</h3>
    <h2 className="text-xl font-bold text-white tracking-tighter">{value}</h2>
  </div>
);

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", amount: "", type: "Stock" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const auth = getAuth(app);
  const db = getDatabase(app);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        onValue(ref(db, `users/${u.uid}/investments`), (snap) => {
          const data = snap.val();
          if (data) {
            setInvestments(Object.entries(data).map(([id, val]) => ({ id, ...val })));
          } else {
            setInvestments([]);
          }
          setLoading(false);
        });
      } else navigate("/login");
    });
    return unsub;
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    await push(ref(db, `users/${user.uid}/investments`), {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString()
    });
    setIsModalOpen(false);
    setFormData({ name: "", amount: "", type: "Stock" });
  };

  const deleteInvest = async (id) => {
    await remove(ref(db, `users/${user.uid}/investments/${id}`));
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-white" size={48} /></div>;

  const totalValue = investments.reduce((s, i) => s + parseFloat(i.amount || 0), 0);

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden uppercase tracking-tight">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-stone-400"><LayoutGrid size={24} /></button>
               <h1 className="text-xl font-black italic tracking-tighter">My Investments</h1>
            </div>
            <div className="flex items-center gap-6">
                <button onClick={() => setIsModalOpen(true)} className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl active:scale-95 transition-all"><Plus size={24} /></button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto px-12 py-12 hide-scrollbar">
           <section className="mb-16">
              <h1 className="text-6xl font-black tracking-tighter italic mb-12">Portfolio Overview<span className="text-cyan-500">.</span></h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                 <MetricCard title="Total Worth" value={`₹${totalValue.toLocaleString()}`} />
                 <MetricCard title="Assest Count" value={investments.length} />
                 <MetricCard title="System Status" value="Optimized" />
              </div>
           </section>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
              {investments.map((inv) => (
                <div key={inv.id} className="bg-[#121212] border border-white/5 rounded-[40px] p-8 hover:border-white/10 transition-all group relative">
                   <div className="flex justify-between items-start mb-8">
                      <div>
                         <h3 className="text-2xl font-black text-stone-200 uppercase tracking-tighter leading-none mb-2 truncate">{inv.name}</h3>
                         <span className="text-[9px] font-black text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{inv.type}</span>
                      </div>
                      <button onClick={() => deleteInvest(inv.id)} className="p-2 text-stone-800 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                   </div>
                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[9px] font-black text-stone-800 tracking-widest mb-1 uppercase">Amount Invested</p>
                         <p className="text-xl font-bold text-white tracking-tighter">₹{parseFloat(inv.amount).toLocaleString()}</p>
                      </div>
                   </div>
                </div>
              ))}
              {investments.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[48px] opacity-20 text-center">
                   <Briefcase size={64} className="mb-6" />
                   <p className="text-xl font-black uppercase tracking-widest">No active investments found</p>
                </div>
              )}
           </div>

           <Footer />
        </div>
      </main>

      {/* ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-[48px] w-full max-w-lg p-12 shadow-3xl relative uppercase">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-2 text-stone-500 hover:text-white"><X size={24} /></button>
            <h2 className="text-3xl font-black italic tracking-tighter mb-10 text-white">Add New Asset</h2>
            <form onSubmit={handleSave} className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-700 px-1 uppercase tracking-widest">Asset Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/5 rounded-3xl p-5 text-sm font-bold outline-none focus:border-white/20" placeholder="e.g. Apple Stock" required />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-stone-700 px-1 uppercase tracking-widest">Amount (₹)</label>
                     <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-black border border-white/5 rounded-3xl p-5 text-sm font-bold outline-none focus:border-white/20" placeholder="0" required />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-stone-700 px-1 uppercase tracking-widest">Type</label>
                     <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-black border border-white/5 rounded-3xl p-5 text-sm font-black outline-none focus:border-white/20 appearance-none">
                        <option value="Stock">Stock</option>
                        <option value="Mutual Fund">Mutual Fund</option>
                        <option value="Crypto">Crypto</option>
                        <option value="Gold">Gold</option>
                        <option value="Real Estate">Real Estate</option>
                     </select>
                  </div>
               </div>
               <button type="submit" className="w-full py-6 bg-white text-black rounded-[32px] text-xs font-black uppercase tracking-widest active:scale-95 transition-all">Add to Portfolio</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
