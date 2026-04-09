import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../ui/Sidebar";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, push, remove } from "firebase/database";
import { app } from "../../firebase";
import { useTheme } from "../../context/ThemeContext";
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
  getDate
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  AlertCircle, 
  X,
  Loader2,
  Trash2,
  TrendingDown,
  Clock,
  Menu,
  MessageSquare,
  Bell,
  User,
  Zap,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CalendarPage = () => {
  const auth = getAuth(app);
  const db = getDatabase(app);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [debts, setDebts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newItem, setNewItem] = useState({
    type: "event", 
    title: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    isRecurring: false
  });

  const notificationRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        onValue(ref(db, "users/" + currentUser.uid), (snapshot) => {
            if (snapshot.exists()) {
               setUserData(snapshot.val());
            }
        });
        const debtsRef = ref(db, `users/${currentUser.uid}/debts`);
        onValue(debtsRef, (snapshot) => {
          const data = snapshot.val();
          const loadedDebts = data ? Object.entries(data).map(([id, val]) => ({ id, ...val, type: 'debt' })) : [];
          setDebts(loadedDebts);
        });
        const eventsRef = ref(db, `users/${currentUser.uid}/calendarEvents`);
        onValue(eventsRef, (snapshot) => {
          const data = snapshot.val();
          const loadedEvents = data ? Object.entries(data).map(([id, val]) => ({ id, ...val, type: 'event' })) : [];
          setEvents(loadedEvents);
          setLoading(false);
        });
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const getEventsForDay = (day) => {
    const dayNum = getDate(day);
    const dateStr = format(day, "yyyy-MM-dd");
    const matchedEvents = events.filter(e => e.date === dateStr);
    const matchedDebts = debts.filter(d => {
      if (d.dueDate === dateStr) return true;
      if (d.emiDay && parseInt(d.emiDay) === dayNum) return true;
      return false;
    });
    return [...matchedEvents, ...matchedDebts];
  };

  const getUpcomingWeek = () => {
    const today = new Date();
    let upcoming = [];
    for(let i=0; i<7; i++) {
        const checkDay = addDays(today, i);
        const dayEvents = getEventsForDay(checkDay);
        dayEvents.forEach(ev => upcoming.push({ ...ev, actualDate: checkDay }));
    }
    return upcoming.sort((a,b) => a.actualDate - b.actualDate);
  };

  const getMonthlyOutflow = () => {
    let total = 0;
    const daysInMonth = endOfMonth(currentMonth).getDate();
    for(let i=1; i<=daysInMonth; i++) {
        const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const evs = getEventsForDay(checkDate);
        evs.forEach(e => total += (parseFloat(e.amount) || 0));
    }
    return total;
  };

  const handleSave = async () => {
    if (!newItem.title || !user) return;
    if (newItem.type === 'debt') {
      const debtData = { name: newItem.title, amount: parseFloat(newItem.amount) || 0, dueDate: newItem.date, emiDay: newItem.isRecurring ? getDate(new Date(newItem.date)) : null, status: 'pending' };
      await push(ref(db, `users/${user.uid}/debts`), debtData);
    } else {
      await push(ref(db, `users/${user.uid}/calendarEvents`), { ...newItem, amount: parseFloat(newItem.amount) || 0 });
    }
    setShowModal(false);
    setNewItem({ type: "event", title: "", amount: "", date: new Date().toISOString().split('T')[0], isRecurring: false });
  };

  const handleDelete = async (item) => {
    if(!user) return;
    const path = item.type === 'debt' ? 'debts' : 'calendarEvents';
    await remove(ref(db, `users/${user.uid}/${path}/${item.id}`));
  }

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#050505]"><Loader2 className="animate-spin text-white" size={48} /></div>;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const selectedDayEvents = getEventsForDay(selectedDate);
  const upcomingEvents = getUpcomingWeek();

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* NAVBAR */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#050505] sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/premium')}
              className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
            >
              Upgrade Plan
            </button>
          </div>

          <div className="flex items-center gap-10">
            <button onClick={() => navigate('/support')} className="text-stone-600 hover:text-white transition-all transform hover:scale-110 active:scale-90">
               <MessageSquare size={22} />
            </button>
            <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className="text-stone-600 hover:text-white transition-all relative">
                   <Bell size={22} />
                   <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full border-2 border-[#050505]"></div>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-6 w-72 bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl z-50">
                     <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Notifications</span>
                        <button onClick={() => setShowNotifications(false)} className="text-stone-700 hover:text-white"><X size={16}/></button>
                     </div>
                     <p className="text-sm font-bold text-white/40 italic">No new notifications.</p>
                  </div>
                )}
            </div>
            <div onClick={() => navigate("/profile")} className="flex items-center gap-4 pl-10 border-l border-white/5 group cursor-pointer transition-none">
              <div className="text-right">
                <div className="text-sm font-black tracking-tighter">{userData?.name || "Member"}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-stone-700">Profile Logged</div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-white ring-1 ring-white/10 shadow-xl">
                 <User size={22} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-12 py-12 hide-scrollbar space-y-12">
          
          <section className="flex flex-col lg:flex-row justify-between items-end gap-10">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h2 className="text-7xl font-black tracking-tighter text-white mb-4 italic uppercase outline-text text-white">Calendar<span className="text-stone-800">.</span></h2>
              <p className="text-stone-600 font-bold text-lg tracking-tight">Timeline narrative of your financial commitments.</p>
            </div>
            
            <div className="flex items-center bg-white/[0.03] p-1.5 rounded-[24px] border border-white/5">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 text-stone-600 hover:text-white"><ChevronLeft size={20} /></button>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] min-w-[160px] text-center text-white">{format(currentMonth, "MMMM yyyy")}</span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 text-stone-600 hover:text-white"><ChevronRight size={20} /></button>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            <div className="lg:col-span-2 space-y-10">
              
              <div className="bg-black border border-white/5 rounded-[40px] p-10 flex justify-between items-center relative overflow-hidden h-40">
                  <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-600 mb-2">Projected Monthly Outflow</p>
                      <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">₹{getMonthlyOutflow().toLocaleString()}</h2>
                  </div>
                  <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl"></div>
              </div>

              <div className="space-y-6">
                  <div className="grid grid-cols-7 px-4">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (<div key={day} className="text-center text-[10px] font-black text-stone-600 uppercase tracking-[0.4em]">{day}</div>))}
                  </div>

                  <div className="grid grid-cols-7 gap-3">
                      {(() => {
                          const cells = [];
                          let dayCursor = startDate;
                          while (dayCursor <= endDate) {
                              for (let i = 0; i < 7; i++) {
                                  const currentCursor = dayCursor;
                                  const dayEvents = getEventsForDay(currentCursor);
                                  const isSelected = isSameDay(currentCursor, selectedDate);
                                  const isCurrentMonth = isSameMonth(currentCursor, monthStart);
                                  const isToday = isSameDay(currentCursor, new Date());
                                  
                                  cells.push(
                                      <div key={currentCursor.toString()} onClick={() => setSelectedDate(currentCursor)} className={`relative min-h-[140px] p-5 cursor-pointer rounded-[32px] border flex flex-col justify-between ${!isCurrentMonth ? "opacity-10 border-transparent" : (isToday ? "bg-white text-black border-white shadow-2xl" : "bg-[#0d0d0d] border-white/5")} ${isSelected && !isToday ? "ring-2 ring-white/20" : ""}`}>
                                          <div className="flex justify-between items-start">
                                              <span className="text-sm font-black tracking-tighter">{format(currentCursor, "d")}</span>
                                              {dayEvents.length > 0 && isCurrentMonth && (<span className={`text-[9px] font-black ${isToday ? "text-stone-600" : "text-stone-500"}`}>₹{dayEvents.reduce((acc, curr) => acc + (parseFloat(curr.amount)||0), 0)}</span>)}
                                          </div>
                                          <div className="space-y-1.5">
                                              {dayEvents.slice(0, 1).map((ev, idx) => (<div key={idx} className={`text-[9px] font-black uppercase tracking-widest truncate px-2.5 py-1 rounded-xl border ${isToday ? 'bg-black/5 border-black/10 text-black' : 'bg-white/5 border-white/10 text-white'}`}>{ev.title || ev.name}</div>))}
                                              {dayEvents.length > 1 && (<span className={`text-[8px] font-black uppercase tracking-widest pl-1 mt-1 ${isToday ? "text-stone-600" : "text-stone-700"}`}>+{dayEvents.length - 1} more</span>)}
                                          </div>
                                      </div>
                                  );
                                  dayCursor = addDays(dayCursor, 1);
                              }
                          }
                          return cells;
                      })()}
                  </div>
              </div>
            </div>

            <aside className="space-y-10">
              
              <div className="bg-[#0d0d0d] border border-white/5 transition-none rounded-[40px] p-10 min-h-[480px] flex flex-col shadow-2xl">
                <header className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter text-white italic uppercase">{format(selectedDate, "eeee")}</h3>
                    <p className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] mt-2">{format(selectedDate, "MMMM do")}</p>
                  </div>
                  <button onClick={() => { setNewItem(prev => ({...prev, date: format(selectedDate, "yyyy-MM-dd")})); setShowModal(true); }} className="w-14 h-14 rounded-[24px] bg-white text-black flex items-center justify-center shadow-xl active:scale-90 transition-all"><Plus size={28} /></button>
                </header>

                <div className="flex-1 space-y-5 overflow-y-auto pr-2 hide-scrollbar">
                  {selectedDayEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-10 border-2 border-dashed border-white/10 rounded-[40px]">
                      <CalendarIcon size={56} className="mb-6" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Scheduling</p>
                    </div>
                  ) : (
                    selectedDayEvents.map((item, idx) => (
                      <div key={idx} className="bg-white/5 p-6 rounded-[32px] border border-white/5 flex justify-between items-center group transition-none">
                        <div className="flex items-center gap-5 min-w-0">
                          <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 bg-[#050505] text-white opacity-40`}><CalendarIcon size={20} /></div>
                          <div className="min-w-0">
                            <h4 className="font-black truncate text-sm text-white uppercase tracking-tight">{item.title || item.name}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-600 mt-1">{item.amount ? `₹${item.amount}` : 'Variable Volume'}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(item)} className="p-3 text-stone-600 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-[#0d0d0d] border border-white/5 transition-none rounded-[40px] p-10 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"><Clock size={16} className="text-stone-600" /></div>
                      <h4 className="text-[11px] font-black font-black uppercase tracking-[0.3em] text-stone-500">Upcoming Timeline</h4>
                  </div>
                  
                  <div className="space-y-6">
                      {upcomingEvents.length === 0 ? (
                          <p className="text-xs font-black uppercase tracking-widest text-stone-700 italic">Clearance detected.</p>
                      ) : (
                          upcomingEvents.slice(0, 4).map((ev, i) => (
                              <div key={i} className="flex gap-5 items-center">
                                  <div className="shrink-0 w-14 h-14 bg-black rounded-2xl flex flex-col items-center justify-center border border-white/5">
                                      <span className="text-[8px] font-black uppercase tracking-tighter opacity-20 mb-0.5">{format(ev.actualDate, 'MMM')}</span>
                                      <span className="text-xl font-black tracking-tighter text-white">{format(ev.actualDate, 'd')}</span>
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-sm font-black truncate text-white uppercase tracking-tight">{ev.title || ev.name}</p>
                                      <p className="text-[10px] font-black text-stone-700 uppercase tracking-widest mt-1">₹{ev.amount || '0'}</p>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
            </aside>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0d0d0d] border border-white/10 rounded-[48px] p-12 w-full max-w-lg shadow-[0_0_100px_black] relative">
              <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 p-2 text-stone-500 hover:text-white"><X size={24} /></button>
              <h2 className="text-4xl font-black tracking-tighter text-white mb-10 uppercase italic">Entry Registry<span className="text-stone-800">.</span></h2>
              <div className="space-y-8">
                <div className="flex p-1.5 bg-black border border-white/5 rounded-3xl">
                  {['event', 'debt'].map(t => (<button key={t} onClick={() => setNewItem({...newItem, type: t})} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${newItem.type === t ? 'bg-white text-black' : 'text-stone-600 hover:text-white'}`}>{t === 'debt' ? 'Liability' : 'Standard Log'}</button>))}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-700 px-1">Descriptor</label>
                  <input type="text" placeholder="Identifier" className="w-full bg-black border border-white/5 rounded-3xl p-5 text-sm font-black tracking-tight focus:border-white/20 transition-all outline-none" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-700 px-1">Volume (₹)</label>
                    <input type="number" placeholder="0.00" className="w-full bg-black border border-white/5 rounded-3xl p-5 text-sm font-black tracking-tight focus:border-white/20 transition-all outline-none" value={newItem.amount} onChange={(e) => setNewItem({...newItem, amount: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-700 px-1">Entry Point</label>
                    <input type="date" className="w-full bg-black border border-white/5 rounded-3xl p-5 text-sm font-black tracking-tight focus:border-white/20 transition-all outline-none" value={newItem.date} onChange={(e) => setNewItem({...newItem, date: e.target.value})} />
                  </div>
                </div>
                {newItem.type === 'debt' && (
                  <label className="flex items-center gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-[32px] cursor-pointer">
                    <input type="checkbox" checked={newItem.isRecurring} onChange={(e) => setNewItem({...newItem, isRecurring: e.target.checked})} className="w-6 h-6 bg-black border-white/20 rounded accent-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Recurring Monthly Obligation</span>
                  </label>
                )}
                <button onClick={handleSave} className="w-full py-6 bg-white text-black rounded-3xl text-lg font-black uppercase tracking-widest shadow-2xl active:scale-[0.98] transition-all">Execute Registration</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CalendarPage;