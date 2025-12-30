import { useState } from 'react'
import './App.css'
import Login from "../src/Components/Login/Login"
import Hero from './Components/Hero/Hero';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from './Components/Dashboard/Dashboard';
import Onboarding from './Components/Onboarding/Onboarding';
import ProtectedRoute from "./../routes/ProtectedRoute";
import DebtAI from './Components/DebtAI/DebtAI';
import CustomCursor from './Components/ui/CustomCursor';

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Hero />} />

      <Route
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
      />
    </Routes>
    
  </>
  );
}

export default App;