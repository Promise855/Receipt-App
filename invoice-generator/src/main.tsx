import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ReceiptPreview from './pages/ReceiptPreview.tsx'
import './index.css'
import { useCompanyStore } from './stores/useCompanyStore';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

useCompanyStore.getState().loadFromStorage();

const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {path === '/receipt-preview' ? <ReceiptPreview /> : <App />}
  </React.StrictMode>,
)