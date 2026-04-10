import { useState } from 'react'
import './App.css'
import Login from "../src/Components/Login/Login"
import Landing from './Components/Landing/Landing';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from './Components/Dashboard/Dashboard';
import Onboarding from './Components/Onboarding/Onboarding';
import ProtectedRoute from "./../routes/ProtectedRoute";
import DebtAI from './Components/DebtAI/DebtAI';
import { AuthProvider } from './context/AuthContent';
import NotFound from './Components/ui/NotFound';
import Pending from './Components/Pending/Pending';
import CalendarPage from './Components/Calendar/Calendar';
import Profile from './Components/Profile/Profile';
import Blogs from './Components/Blogs/Blogs';
import Legal from './Components/ui/Legal';
import Support from './Components/ui/Support';
import { ThemeProvider } from './context/ThemeContext';
import { PopupProvider } from './context/PopupContext';
import { ModeProvider } from './context/ModeContext';
import ThinkTwice from './Components/Tools/ImpulsePause';
import ComingSoon from './Components/ui/ComingSoon';
import MutualFunds from './Components/Stock/MutualFunds';
import Investments from './Components/Stock/Investments';
import Stocks from './Components/Stock/Stocks';
import Settings from './Components/Profile/Settings';
import Crypto from './Components/Wealth/Crypto';
import LegacyTool from './Components/Stock/LegacyTool';
import WealthAI from './Components/Wealth/WealthAI';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ModeProvider>
          <PopupProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/support" element={<Support />} />
              
              <Route path="/think-twice" element={<ProtectedRoute><ThinkTwice /></ProtectedRoute>} />
              <Route path="/impulse-pause" element={<ProtectedRoute><ThinkTwice /></ProtectedRoute>} />
              <Route path="/portfolio" element={<ProtectedRoute><Investments /></ProtectedRoute>} />
              <Route path="/mutual-funds" element={<ProtectedRoute><MutualFunds /></ProtectedRoute>} />
              <Route path="/funding" element={<ProtectedRoute><MutualFunds /></ProtectedRoute>} />
              <Route path="/stocks" element={<ProtectedRoute><LegacyTool /></ProtectedRoute>} />
              <Route path="/crypto" element={<ProtectedRoute><Crypto /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/blogs" element={<ProtectedRoute><Blogs /></ProtectedRoute>} />
              <Route path="/pending" element={<ProtectedRoute><Pending /></ProtectedRoute>} />
              <Route path="/debtai" element={<ProtectedRoute><DebtAI /></ProtectedRoute>} />
              <Route path="/wealth-ai" element={<ProtectedRoute><WealthAI /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PopupProvider>
        </ModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;