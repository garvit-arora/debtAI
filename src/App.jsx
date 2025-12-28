import { useState } from 'react'
import './App.css'
import Login from "../src/Components/Login/Login"
import Hero from './Components/Hero/Hero';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from './Components/Dashboard/Dashboard';
import Onboarding from './Components/Onboarding/Onboarding';
import ProtectedRoute from "./../routes/ProtectedRoute";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
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
        path="/landing-page"
        element={
          <ProtectedRoute>
            <Hero />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;