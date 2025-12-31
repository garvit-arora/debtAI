import { useState } from 'react'
import './App.css'
import Login from "../src/Components/Login/Login"
import Hero from './Components/Hero/Hero';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from './Components/Dashboard/Dashboard';
import Onboarding from './Components/Onboarding/Onboarding';
import ProtectedRoute from "./../routes/ProtectedRoute";
import DebtAI from './Components/DebtAI/DebtAI';
import { AuthProvider } from './context/AuthContent';
import NotFound from './Components/404Page/404Page';
import InstallPrompt from './Components/InstallPrompt/InstallPrompt';
import WaitingPage from './Components/WaitingPage.jsx/WaitingPage';

function App() {
  return (
    <>
    <AuthProvider>
    <Routes>
      {/* <Route path="/" element={<Hero />} /> */}
    <Route path="/" element={<WaitingPage />} />

      {/* <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/debtai"
        element={
          <ProtectedRoute>
            <DebtAI />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={
            <Login />
        }
      /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    <InstallPrompt />
    
  </AuthProvider>
  </>
  );
}

export default App;