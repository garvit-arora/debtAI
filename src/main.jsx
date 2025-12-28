import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'flowbite';

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LoaderProvider } from './context/LoaderContext';

ReactDOM. createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <LoaderProvider>
    <App />
    </LoaderProvider>
  </BrowserRouter>,
)
