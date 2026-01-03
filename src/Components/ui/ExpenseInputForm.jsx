import React from 'react'
import { X } from 'lucide-react';

const ExpenseInputForm = ({ onClose }) => {
  return (
    <div>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#30302e]/60 backdrop-blur-md p-4 animate-fadeIn">
                <div className="bg-white w-full max-w-md rounded-[35px] shadow-2xl overflow-hidden animate-scaleUp">
                  
                  {/* Modal Header */}
                  <div className="bg-[#5B2D2D] p-6 flex justify-between items-center">
                    <h3 className="text-[#f8ecdd] text-xl font-bold">Add New Expense</h3>
                    <button onClick={onClose}
                    className="text-[#f8ecdd] hover:bg-white/10 p-2 rounded-full transition-colors">
                      <X size={24} />
                    </button>
                  </div>
      
                  {/* Modal Form */}
                  <form className="p-8 flex flex-col gap-5">
                    
                    {/* Amount */}
                    <div>
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-lg">$</span>
                        <input type="number" placeholder="0.00" className="w-full pl-10 pr-4 py-4 bg-stone-50 rounded-2xl text-2xl font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                      </div>
                    </div>
      
                    {/* Date & Category Row */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Date</label>
                        <div className="relative">
                           <input type="date" className="w-full px-4 py-3 bg-stone-50 rounded-xl font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                      </div>
                      <div className="flex-1">
                         <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Category</label>
                         <select className="w-full px-4 py-3 bg-stone-50 rounded-xl font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none">
                           <option>Food</option>
                           <option>Transport</option>
                           <option>Rent</option>
                           <option>Others</option>
                         </select>
                      </div>
                    </div>
      
                    {/* Description */}
                    <div>
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">
                        What was this for?
                        </label>
                        <input 
                        type="text" 
                        placeholder="e.g. Starbucks, Uber..." 
                        className="w-full px-4 py-3 bg-stone-50 rounded-xl font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                        />
                    </div>

                    {/* Save Button */}
                    <button 
                        type="submit" 
                        className="mt-4 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
                    >
                        Save Expense
                    </button>
                  </form>
                </div>
              </div>
    </div>
  )
}

export default ExpenseInputForm
