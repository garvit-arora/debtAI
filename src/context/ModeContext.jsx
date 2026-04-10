import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase';

const ModeContext = createContext();

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};

export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState('repayment'); // 'repayment' or 'wealth'
  const [debtsCount, setDebtsCount] = useState(0);
  const auth = getAuth(app);
  const db = getDatabase(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const activeDebts = data.debts ? Object.values(data.debts).filter(d => d.status !== 'paid').length : 0;
            setDebtsCount(activeDebts);
            
            // Auto revert to repayment if debts are added
            if (activeDebts > 0 && data.activeMode === 'wealth') {
               update(ref(db, `users/${user.uid}`), { activeMode: 'repayment' });
               setMode('repayment');
            } else if (data.activeMode) {
               setMode(data.activeMode);
            }
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const switchMode = async (newMode) => {
    const user = auth.currentUser;
    if (!user) return;
    
    // Strict requirement: No active debts to enter wealth mode
    if (newMode === 'wealth' && debtsCount > 0) {
       alert("Clear all debts first to unlock Wealth Module.");
       return;
    }
    
    await update(ref(db, `users/${user.uid}`), { activeMode: newMode });
    setMode(newMode);
  };

  return (
    <ModeContext.Provider value={{ mode, switchMode, debtsCount }}>
      {children}
    </ModeContext.Provider>
  );
};
