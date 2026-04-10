import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar";
import Footer from "../ui/Footer";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, push, remove } from "firebase/database";
import { app } from "../../firebase";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isToday
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X,
  Loader2,
  Trash2,
  LayoutGrid,
  Calendar as CalendarIcon,
  Repeat
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const COLOR_OPTIONS = [
  { name: "Cyan", class: "bg-cyan-500", border: "border-cyan-500/20", text: "text-cyan-500" },
  { name: "Rose", class: "bg-rose-500", border: "border-rose-500/20", text: "text-rose-500" },
  { name: "Emerald", class: "bg-emerald-500", border: "border-emerald-500/20", text: "text-emerald-500" },
  { name: "Amber", class: "bg-amber-500", border: "border-amber-500/20", text: "text-amber-500" },
  { name: "Purple", class: "bg-purple-500", border: "border-purple-500/20", text: "text-purple-500" }
];

export default function CalendarPage() {
  const auth = getAuth(app);
  const db = getDatabase(app);
  const navigate = useNavigate();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    finalDate: "",
    isRecurring: false,
    color: COLOR_OPTIONS[0].class,
    type: "event"
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        onValue(ref(db, `users/${u.uid}`), (snap) => {
           if (snap.exists()) setUserData(snap.val());
        });
        onValue(ref(db, `users/${u.uid}/calendarEvents`), (snap) => {
          const data = snap.val();
          setEvents(data ? Object.entries(data).map(([id, v]) => ({ id, ...v })) : []);
        });
        onValue(ref(db, `users/${u.uid}/debts`), (snap) => {
           const data = snap.val();
           setDebts(data ? Object.entries(data).map(([id, v]) => ({ id, ...v })) : []);
           setLoading(false);
        });
      } else navigate("/login");
    });
    return unsub;
  }, []);

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const getDayItems = (day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const matchedEvents = events.filter(e => e.date === dateStr);
    const matchedDebts = debts.filter(d => d.dueDate === dateStr && d.status !== 'paid');
    return [
       ...matchedEvents.map(e => ({ ...e, type: 'event' })),
       ...matchedDebts.map(d => ({ ...d, title: d.name, type: 'debt', color: 'bg-rose-500' }))
    ];
  };

  const handleSave = async () => {
    if (!newItem.title || !user) return;
    await push(ref(db, `users/${user.uid}/calendarEvents`), {
      ...newItem,
      amount: parseFloat(newItem.amount) || 0,
    });
    setShowModal(false);
    setNewItem({ title: "", amount: "", date: format(new Date(), "yyyy-MM-dd"), finalDate: "", isRecurring: false, color: COLOR_OPTIONS[0].class, type: "event" });
  };

  const deleteItem = async (e, id) => {
     e.stopPropagation();
     await remove(ref(db, `users/${user.uid}/calendarEvents/${id}`));
  };

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-white" size={48} /></div>;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden uppercase">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] sticky top-0 z-40">
            <div className="flex items-center gap-6">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-stone-400"><LayoutGrid size={24} /></button>
                <h1 className="text-xl font-black italic tracking-tighter">Budget Tracker</h1>
            </div>
            <div className="flex items-center gap-8">
               <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 text-stone-600 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
               <h2 className="text-lg font-black italic tracking-tighter">{format(currentMonth, "MMMM yyyy")}</h2>
               <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 text-stone-600 hover:text-white transition-colors"><ChevronRight size={20}/></button>
               <button onClick={() => setShowModal(true)} className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center active:scale-90 transition-all ml-4"><Plus size={24} /></button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
           <div className="grid grid-cols-7 border-b border-white/5 bg-[#080808]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} className="p-4 text-center text-[9px] font-black text-stone-700 tracking-[0.2em]">{d}</div>
              ))}
           </div>

           <div className="grid grid-cols-7 auto-rows-fr h-full min-h-[800px]">
              {calendarDays.map((day, i) => {
                 const items = getDayItems(day);
                 const isSameMo = isSameMonth(day, currentMonth);
                 return (
                    <div key={i} className={`border-r border-b border-white/5 p-4 min-h-[140px] transition-all hover:bg-white/[0.02] relative ${!isSameMo && 'opacity-10'}`}>
                       <span className={`text-xs font-black ${isToday(day) ? 'bg-cyan-500 text-black px-2 py-0.5 rounded' : 'text-stone-700'}`}>
                          {format(day, "d")}
                       </span>
                       <div className="mt-4 space-y-2">
                          {items.map((it, idx) => (
                             <div key={idx} className={`${it.color || 'bg-stone-900'} p-2 rounded-lg flex flex-col gap-1 relative group cursor-default transition-transform hover:scale-[1.02]`}>
                                <div className="flex justify-between items-start">
                                   <div className="flex items-center gap-1 overflow-hidden">
                                      {it.isRecurring && <Repeat size={8} className="text-black/40 shrink-0" />}
                                      <span className="text-[8px] font-black text-black leading-tight truncate uppercase">{it.title}</span>
                                   </div>
                                   {it.type === 'event' && <button onClick={(e) => deleteItem(e, it.id)} className="opacity-0 group-hover:opacity-100 text-black/40 hover:text-black"><X size={10} /></button>}
                                </div>
                                <span className="text-[8px] font-bold text-black/60 tracking-tighter">₹{it.amount.toLocaleString()}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 );
              })}
           </div>

           <Footer className="w-full mt-24" />
        </div>
      </main>

      {/* ADD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in">
           <div className="bg-[#0d0d0d] border border-white/10 rounded-[48px] p-12 w-full max-w-xl shadow-3xl relative uppercase">
              <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 p-2 text-stone-500 hover:text-white"><X size={24}/></button>
              <h2 className="text-3xl font-black italic tracking-tighter mb-10">New Calendar Entry</h2>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-800 px-1 tracking-widest">Entry Name / Liability Identity</label>
                    <input type="text" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} className="w-full bg-black border border-white/5 rounded-[24px] p-5 text-sm font-black outline-none focus:border-white/20" placeholder="e.g. Car EMI / Rent" />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-stone-800 px-1 tracking-widest">Monetary Volume (₹)</label>
                       <input type="number" value={newItem.amount} onChange={(e) => setNewItem({...newItem, amount: e.target.value})} className="w-full bg-black border border-white/5 rounded-[24px] p-5 text-sm font-black outline-none focus:border-white/20" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-stone-800 px-1 tracking-widest">Initial Execution Date</label>
                       <input type="date" value={newItem.date} onChange={(e) => setNewItem({...newItem, date: e.target.value})} className="w-full bg-black border border-white/5 rounded-[24px] p-5 text-sm font-black outline-none focus:border-white/20" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6 items-center">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-stone-800 px-1 tracking-widest flex items-center gap-2">Protocol Type <Repeat size={10} /></label>
                       <div className="flex p-1 bg-black border border-white/5 rounded-2xl">
                          <button onClick={() => setNewItem({...newItem, isRecurring: false})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${!newItem.isRecurring ? 'bg-white text-black' : 'text-stone-600'}`}>One-time</button>
                          <button onClick={() => setNewItem({...newItem, isRecurring: true})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${newItem.isRecurring ? 'bg-white text-black' : 'text-stone-600'}`}>Monthly</button>
                       </div>
                    </div>
                    {newItem.isRecurring && (
                      <div className="space-y-2 animate-in slide-in-from-left-4">
                         <label className="text-[10px] font-black text-stone-800 px-1 tracking-widest">Final Maturity Date</label>
                         <input type="date" value={newItem.finalDate} onChange={(e) => setNewItem({...newItem, finalDate: e.target.value})} className="w-full bg-black border border-white/5 rounded-[24px] p-5 text-sm font-black outline-none focus:border-white/20" />
                      </div>
                    )}
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-stone-800 px-1 tracking-widest uppercase">Visual Categorization</label>
                    <div className="flex gap-4">
                       {COLOR_OPTIONS.map(c => (
                          <button key={c.name} onClick={() => setNewItem({...newItem, color: c.class})} className={`w-8 h-8 rounded-full ${c.class} transition-all ${newItem.color === c.class ? 'ring-4 ring-white ring-offset-4 ring-offset-black' : 'scale-90 opacity-40 hover:opacity-100 hover:scale-100'}`} title={c.name}></button>
                       ))}
                    </div>
                 </div>

                 <button onClick={handleSave} className="w-full py-6 bg-white text-black rounded-[32px] text-xs font-black tracking-[0.2em] active:scale-95 transition-all mt-4">Execute Synchronization</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}