import React from 'react'
import ReactDOM from 'react-dom/client'
import FireCalcPro from './FireCalcPro.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <FireCalcPro />
    </AuthProvider>
  </React.StrictMode>,
)
