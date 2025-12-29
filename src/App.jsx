import { useState } from 'react'
import './App.css'
import Login from "../src/Components/Login/Login"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from './Components/Dashboard/Dashboard';
import Onboarding from './Components/Onboarding/Onboarding';
import ProtectedRoute from "./../routes/ProtectedRoute";
import DebtAI from './Components/DebtAI/DebtAI';


function App() {
  return (
    // <Routes>
    //   <Route path="/" element={<Login />} />

    //   <Route
    //     path="/dashboard"
    //     element={
    //       <ProtectedRoute>
    //         <Dashboard />
    //       </ProtectedRoute>
    //     }
    //   />

    //   <Route
    //     path="/onboarding"
    //     element={
    //       <ProtectedRoute>
    //         <Onboarding />
    //       </ProtectedRoute>
    //     }
    //   />
    // </Routes>
    <DebtAI />
  );
}

export default App;