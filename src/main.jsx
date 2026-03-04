import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components/UI/CardsAndButtons.css';
import './components/Layout.css';
import './components/UI/Tables.css';
import './components/UI/Form.css';
import './components/UI/BadgesAndToasts.css';
import './components/ConfirmModal.css';
import './pages/VistasListado.css';
import './pages/Login.css';

import { ToastProvider } from './context/ToastContext.jsx'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider> {/* ENVOLVEMOS LA APP */}
      <App />
    </ToastProvider>
  </StrictMode>,
)