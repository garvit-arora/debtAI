import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update, push } from "firebase/database";
import { getAuth } from "firebase/auth";
import { 
  BsCalendarEvent, 
  BsExclamationCircle, 
  BsCheckCircle, 
  BsClockHistory, 
  BsArrowRight, 
  BsPlusLg, 
  BsPencilSquare, 
  BsX,
  BsHeartPulse // Icon for Stress
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const PendingDebts = () => {
  const [activeDebts, setActiveDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDate: "",
    interestRate: "",
    stressLevel: "Medium" // Default value
  });

  const auth = getAuth();
  const db = getDatabase();
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const debtsRef = ref(db, `users/${user.uid}/debts`);
      
      onValue(debtsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const loadedDebts = Object.keys(data)
            .map((key) => ({
              id: key,
              ...data[key],
            }))
            .filter((debt) => debt.status !== "paid"); 

          // Sort by due date
          loadedDebts.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          setActiveDebts(loadedDebts);
        } else {
          setActiveDebts([]);
        }
        setLoading(false);
      });
    } else {
      navigate("/login");
    }
  }, [auth, db, navigate]);

  // --- ACTIONS ---

  const handleOpenModal = (debt = null) => {
    if (debt) {
      // Edit Mode
      setEditingId(debt.id);
      setFormData({
        name: debt.name,
        amount: debt.amount,
        dueDate: debt.dueDate,
        interestRate: debt.interestRate || "0",
        stressLevel: debt.stressLevel || "Medium"
      });
    } else {
      // Add Mode
      setEditingId(null);
      setFormData({ 
        name: "", 
        amount: "", 
        dueDate: "", 
        interestRate: "",
        stressLevel: "Medium" 
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveDebt = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const payload = {
      name: formData.name,
      amount: formData.amount,
      dueDate: formData.dueDate,
      interestRate: formData.interestRate,
      stressLevel: formData.stressLevel // Save Stress Level
    };

    if (editingId) {
      // Update
      const debtRef = ref(db, `users/${user.uid}/debts/${editingId}`);
      await update(debtRef, payload);
    } else {
      // Create
      const debtsListRef = ref(db, `users/${user.uid}/debts`);
      await push(debtsListRef, {
        ...payload,
        status: "pending",
        createdAt: new Date().toISOString()
      });
    }
    setIsModalOpen(false);
  };

  const markAsPaid = async (debtId) => {
    const user = auth.currentUser;
    if (user) {
      const debtRef = ref(db, `users/${user.uid}/debts/${debtId}`);
      await update(debtRef, { status: "paid" });
    }
  };

  const getDaysLeft = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  // Helper for Stress Colors
  const getStressColor = (level) => {
    switch(level) {
      case "Low": return "bg-blue-50 text-blue-700 border-blue-100";
      case "High": return "bg-orange-50 text-orange-700 border-orange-100";
      case "Extreme": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-stone-100 text-stone-600 border-stone-200"; // Medium
    }
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-stone-50">Loading...</div>;

  return (
    <div className=" highlight-blue min-h-screen bg-stone-50 text-stone-800 p-6 md:p-12 relative">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 mb-2">Pending Obligations</h1>
            <p className="text-stone-500 text-lg">Manage, track, and clear your debts.</p>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 hover:bg-emerald-800 transition-all shadow-lg"
          >
            <BsPlusLg /> Add New Debt
          </button>
        </header>

        {activeDebts.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white border border-stone-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="bg-emerald-100 p-6 rounded-full mb-6">
              <BsCheckCircle className="text-4xl text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You are debt free!</h2>
            <p className="text-stone-500 mb-8">No pending payments found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {activeDebts.map((debt) => {
              const daysLeft = getDaysLeft(debt.dueDate);
              const isOverdue = daysLeft < 0;
              const isUrgent = daysLeft >= 0 && daysLeft <= 3;

              return (
                <div key={debt.id} className={`relative p-6 rounded-2xl border bg-white transition-all hover:shadow-lg group ${isOverdue ? "border-red-200" : "border-stone-200"}`}>
                  
                  <button 
                    onClick={() => handleOpenModal(debt)}
                    className="absolute top-6 right-6 text-stone-300 hover:text-stone-600 transition-colors p-2"
                  >
                    <BsPencilSquare size={20} />
                  </button>

                  {/* Badges Container */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {/* Time Badge */}
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider border border-red-100">
                        <BsExclamationCircle /> Overdue {Math.abs(daysLeft)} days
                      </span>
                    ) : isUrgent ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider border border-orange-100">
                        <BsClockHistory /> Due Soon
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                        <BsCalendarEvent /> {daysLeft} days left
                      </span>
                    )}

                    {/* NEW: Stress Badge */}
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${getStressColor(debt.stressLevel)}`}>
                      <BsHeartPulse /> {debt.stressLevel || "Medium"} Stress
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-stone-900 mb-1">{debt.name}</h3>
                    <p className="text-4xl font-light text-stone-600 tracking-tighter">₹{parseFloat(debt.amount).toLocaleString()}</p>
                    <p className="text-sm text-stone-400 mt-2">Due: {new Date(debt.dueDate).toLocaleDateString()}</p>
                  </div>

                  <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                    <div className="text-xs font-mono text-stone-400">{debt.interestRate}% APR</div>
                    <button onClick={() => markAsPaid(debt.id)} className="flex items-center gap-2 px-5 py-2 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                      Mark Paid <BsArrowRight />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-800"
            >
              <BsX size={28} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-stone-900">
              {editingId ? "Edit Obligation" : "Add New Obligation"}
            </h2>
            
            <form onSubmit={handleSaveDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-stone-900"
                  placeholder="e.g. Credit Card"
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-stone-900"
                    placeholder="5000"
                    required
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">APR (%)</label>
                  <input 
                    type="number" 
                    value={formData.interestRate}
                    onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-stone-900"
                    placeholder="15"
                  />
                </div>
              </div>

              {/* NEW: Stress Level Input */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Mental Stress Level</label>
                <select
                  value={formData.stressLevel}
                  onChange={(e) => setFormData({...formData, stressLevel: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-stone-900 appearance-none"
                >
                  <option value="Low">Low - It's annoying but manageable</option>
                  <option value="Medium">Medium - I think about it often</option>
                  <option value="High">High - It keeps me awake</option>
                  <option value="Extreme">Extreme - I feel drowning</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-stone-900"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition-colors mt-4">
                {editingId ? "Save Changes" : "Create Debt"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingDebts;