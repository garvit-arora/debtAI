import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar";
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
  getDate,
  isAfter,
  isBefore,
  parseISO
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
  Menu // Added Menu Icon
} from "lucide-react";

const CalendarPage = () => {
  const auth = getAuth(app);
  const db = getDatabase(app);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  
  // Mobile Sidebar State (Added)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [debts, setDebts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    type: "event", 
    title: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    isRecurring: false
  });

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch Debts
        const debtsRef = ref(db, `users/${currentUser.uid}/debts`);
        onValue(debtsRef, (snapshot) => {
          const data = snapshot.val();
          const loadedDebts = data ? Object.entries(data).map(([id, val]) => ({ id, ...val, type: 'debt' })) : [];
          setDebts(loadedDebts);
        });

        // Fetch Events
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

  // --- HELPERS ---

  // Get events for a specific single day
  const getEventsForDay = (day) => {
    const dayNum = getDate(day);
    const dateStr = format(day, "yyyy-MM-dd");

    const matchedEvents = events.filter(e => e.date === dateStr);
    const matchedDebts = debts.filter(d => {
      if (d.dueDate === dateStr) return true;
      // EMI Check: Matches day number AND ensures we don't show it for past months if created recently (optional logic)
      if (d.emiDay && parseInt(d.emiDay) === dayNum) return true;
      return false;
    });

    return [...matchedEvents, ...matchedDebts];
  };

  // Get upcoming events for the next 7 days
  const getUpcomingWeek = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    let upcoming = [];

    // Scan next 7 days
    for(let i=0; i<7; i++) {
        const checkDay = addDays(today, i);
        const dayEvents = getEventsForDay(checkDay);
        dayEvents.forEach(ev => {
            upcoming.push({ ...ev, actualDate: checkDay });
        });
    }
    return upcoming.sort((a,b) => a.actualDate - b.actualDate);
  };

  // Calculate Total Outflow for the currently viewed month
  const getMonthlyOutflow = () => {
    let total = 0;
    const daysInMonth = endOfMonth(currentMonth).getDate();
    
    for(let i=1; i<=daysInMonth; i++) {
        // Construct date for this month
        const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const evs = getEventsForDay(checkDate);
        evs.forEach(e => total += (parseFloat(e.amount) || 0));
    }
    return total;
  };

  // --- RENDERERS ---

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          {/* Hamburger Button (Added) */}
          <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-[#5B2D2D] hover:bg-stone-200/50 rounded-lg md:hidden mt-1"
          >
              <Menu size={28} />
          </button>
          
          <div>
            <h1 className="text-4xl font-bold text-[#5B2D2D]">Financial Calendar</h1>
            <p className="text-[#5B2D2D]/70 mt-1">Manage your EMIs, dues, and cuts.</p>
          </div>
        </div>
        
        {/* Month Navigator */}
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-stone-100 self-end md:self-auto">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-stone-100 rounded-full text-[#5B2D2D]">
            <ChevronLeft size={24} />
          </button>
          <span className="text-lg font-bold text-[#5B2D2D] min-w-[140px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-stone-100 rounded-full text-[#5B2D2D]">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        
        const dayEvents = getEventsForDay(day);
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        // STYLE LOGIC
        let bgClass = "bg-white"; // Default
        let textClass = "text-stone-700";
        
        if (!isCurrentMonth) {
            bgClass = "bg-stone-50/50";
            textClass = "text-stone-300";
        }
        
        // Permanent Dark Brown for TODAY
        if (isToday) {
            bgClass = "bg-[#5B2D2D] shadow-md transform scale-[1.02] z-10";
            textClass = "text-white";
        } 
        // Light Brown Ring for SELECTED (if not today)
        else if (isSelected) {
            bgClass = "bg-[#fdf6ec] ring-2 ring-[#5B2D2D] z-10";
            textClass = "text-[#5B2D2D]";
        }

        days.push(
          <div
            key={day}
            className={`
              relative min-h-[110px] p-2 cursor-pointer transition-all border border-stone-100 rounded-xl m-0.5
              flex flex-col justify-between
              ${bgClass}
              ${!isToday && !isSelected && isCurrentMonth ? "hover:bg-stone-50" : ""}
            `}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex justify-between items-start">
                <span className={`text-sm font-bold ${textClass}`}>{formattedDate}</span>
                {dayEvents.length > 0 && (
                    <span className={`text-[10px] font-bold ${isToday ? "text-orange-200" : "text-stone-400"}`}>
                        ₹{dayEvents.reduce((acc, curr) => acc + (parseFloat(curr.amount)||0), 0)}
                    </span>
                )}
            </div>
            
            {/* Dots/Bars for events */}
            <div className="flex flex-col gap-1 mt-1">
              {dayEvents.slice(0, 2).map((ev, idx) => (
                <div 
                  key={idx} 
                  className={`text-[9px] truncate px-1.5 py-0.5 rounded-md font-medium
                    ${isToday 
                        ? 'bg-white/20 text-white' 
                        : (ev.type === 'debt' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800')
                    }
                  `}
                >
                  {ev.title || ev.name}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <span className={`text-[9px] pl-1 ${isToday ? "text-white/60" : "text-stone-400"}`}>
                    +{dayEvents.length - 2} more
                </span>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="rounded-3xl overflow-hidden shadow-sm bg-white p-2 border border-stone-100/50">{rows}</div>;
  };

  // --- ACTIONS ---

  const handleSave = async () => {
    if (!newItem.title || !user) return;

    if (newItem.type === 'debt') {
      const debtData = {
        name: newItem.title,
        amount: parseFloat(newItem.amount) || 0,
        dueDate: newItem.date,
        emiDay: newItem.isRecurring ? getDate(new Date(newItem.date)) : null, 
        stress: 5, 
        category: "Manual Entry"
      };
      await push(ref(db, `users/${user.uid}/debts`), debtData);
    } else {
      await push(ref(db, `users/${user.uid}/calendarEvents`), {
        ...newItem,
        amount: parseFloat(newItem.amount) || 0
      });
    }
    setShowModal(false);
    setNewItem({ type: "event", title: "", amount: "", date: new Date().toISOString().split('T')[0], isRecurring: false });
  };

  const handleDelete = async (item) => {
    if(!user) return;
    const path = item.type === 'debt' ? 'debts' : 'calendarEvents';
    if(window.confirm("Delete this item?")) {
        await remove(ref(db, `users/${user.uid}/${path}/${item.id}`));
    }
  }

  if (loading) return <div className="flex h-screen w-full items-center justify-center bg-[#f8ecdd]"><Loader2 className="animate-spin text-[#5B2D2D]" /></div>;

  const selectedDayEvents = getEventsForDay(selectedDate);
  const upcomingEvents = getUpcomingWeek();

  return (
    <div className="flex min-h-screen bg-[#f8ecdd] font-sans relative">
      
      {/* --- SIDEBAR LOGIC --- */}
      
      {/* 1. Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[40] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* 2. Mobile Drawer */}
      <div className={`fixed inset-y-0 left-0 z-[50] w-64 bg-transparent transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-stone-200 hover:text-white z-50"
        >
            <X size={24} />
        </button>
        <Sidebar />
      </div>

      {/* 3. Desktop Sidebar (Fixed) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <main className="flex-1 md:ml-28 p-6 md:p-12 overflow-y-auto w-full">
        {renderHeader()}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: MONTH SUMMARY & CALENDAR */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Monthly Snapshot Card */}
            <div className="bg-gradient-to-r from-[#5B2D2D] to-[#422020] rounded-[24px] p-6 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-white/60 text-sm font-medium mb-1">Projected Outflow ({format(currentMonth, 'MMMM')})</p>
                    <h2 className="text-4xl font-bold">₹{getMonthlyOutflow().toLocaleString()}</h2>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm z-10">
                    <TrendingDown size={24} className="text-orange-200" />
                </div>
                {/* Decoration */}
                <div className="absolute -right-10 -bottom-20 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-1 px-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-bold text-[#5B2D2D]/50 uppercase tracking-wider">
                    {day}
                </div>
                ))}
            </div>

            {/* Calendar Grid */}
            {renderCells()}
          </div>

          {/* RIGHT COLUMN: DETAILS & UPCOMING */}
          <div className="flex flex-col gap-6">
            
            {/* Selected Day Details */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-[30px] border border-white/40 shadow-sm min-h-[300px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#5B2D2D]">{format(selectedDate, "eeee")}</h3>
                  <p className="text-[#5B2D2D]/60 font-medium">{format(selectedDate, "MMMM do")}</p>
                </div>
                <button 
                  onClick={() => {
                    setNewItem(prev => ({...prev, date: format(selectedDate, "yyyy-MM-dd")}));
                    setShowModal(true);
                  }}
                  className="w-12 h-12 rounded-full bg-[#5B2D2D] text-white flex items-center justify-center hover:bg-[#4a2424] shadow-lg transition-transform active:scale-95"
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="space-y-3">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-10 text-[#5B2D2D]/30 border-2 border-dashed border-[#5B2D2D]/10 rounded-2xl">
                    <CalendarIcon size={40} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nothing scheduled.</p>
                  </div>
                ) : (
                  selectedDayEvents.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                          ${item.type === 'debt' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
                          {item.type === 'debt' ? <AlertCircle size={18} /> : <CalendarIcon size={18} />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-[#5B2D2D] truncate">{item.title || item.name}</h4>
                          <p className="text-xs text-stone-500 capitalize">{item.amount ? `₹${item.amount}` : 'No amount'}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(item)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Next 7 Days Widget */}
            <div className="bg-[#5B2D2D]/5 p-6 rounded-[30px] border border-[#5B2D2D]/10">
                <div className="flex items-center gap-2 mb-4">
                    <Clock size={18} className="text-[#5B2D2D]" />
                    <h4 className="font-bold text-[#5B2D2D]">Upcoming (7 Days)</h4>
                </div>
                
                <div className="space-y-3">
                    {upcomingEvents.length === 0 ? (
                        <p className="text-sm text-[#5B2D2D]/50 italic">You are clear for the week!</p>
                    ) : (
                        upcomingEvents.slice(0, 4).map((ev, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                                <div className="font-bold text-[#5B2D2D] w-12 text-center bg-white rounded-lg py-1 shadow-sm">
                                    <span className="block text-[10px] uppercase opacity-50">{format(ev.actualDate, 'MMM')}</span>
                                    <span className="block text-lg leading-none">{format(ev.actualDate, 'd')}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#5B2D2D] truncate">{ev.title || ev.name}</p>
                                    <p className="text-xs text-[#5B2D2D]/60">{ev.amount ? `₹${ev.amount}` : ''}</p>
                                </div>
                            </div>
                        ))
                    )}
                    {upcomingEvents.length > 4 && (
                        <p className="text-xs text-center text-[#5B2D2D]/50 mt-2">+{upcomingEvents.length - 4} more items</p>
                    )}
                </div>
            </div>

          </div>
        </div>

        {/* MODAL (Same as before but consistent styling) */}
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#5B2D2D]/20 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-[#5B2D2D] transition-colors">
                <X size={18} />
              </button>
              
              <h2 className="text-2xl font-bold text-[#5B2D2D] mb-6">Add to Calendar</h2>
              
              <div className="space-y-5">
                {/* Type Selection */}
                <div className="flex gap-2 p-1.5 bg-stone-100 rounded-xl">
                  {['event', 'debt'].map(t => (
                    <button
                      key={t}
                      onClick={() => setNewItem({...newItem, type: t})}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all shadow-sm ${
                        newItem.type === t ? 'bg-white text-[#5B2D2D]' : 'bg-transparent text-stone-400 hover:text-stone-600 shadow-none'
                      }`}
                    >
                      {t === 'debt' ? 'Debt / EMI' : 'Event / Cut'}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B2D2D]/70 ml-1 mb-1.5">Title</label>
                  <input 
                    type="text" 
                    placeholder={newItem.type === 'debt' ? "e.g. Home Loan EMI" : "e.g. Salary Deduction"}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#5B2D2D]/20 text-[#5B2D2D] font-medium placeholder:text-stone-300"
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-[#5B2D2D]/70 ml-1 mb-1.5">Amount (₹)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#5B2D2D]/20 text-[#5B2D2D] font-medium"
                      value={newItem.amount}
                      onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-[#5B2D2D]/70 ml-1 mb-1.5">Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#5B2D2D]/20 text-[#5B2D2D] font-medium"
                      value={newItem.date}
                      onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                    />
                  </div>
                </div>

                {newItem.type === 'debt' && (
                  <div className="flex items-center gap-3 p-4 bg-orange-50/50 border border-orange-100 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="recurring"
                      checked={newItem.isRecurring}
                      onChange={(e) => setNewItem({...newItem, isRecurring: e.target.checked})}
                      className="w-5 h-5 accent-[#5B2D2D] rounded"
                    />
                    <label htmlFor="recurring" className="text-sm font-medium text-[#5B2D2D] cursor-pointer select-none">
                      Repeat this monthly (EMI)
                    </label>
                  </div>
                )}

                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-[#5B2D2D] text-white font-bold rounded-xl hover:bg-[#4a2424] transition-all transform active:scale-[0.98] shadow-lg shadow-[#5B2D2D]/20 mt-2"
                >
                  Save Item
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CalendarPage;