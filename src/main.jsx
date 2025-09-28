import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './tw.css'       // ✅ Tailwind (유틸리티 클래스)
import './index.css'    // ✅ 기존 커스텀 CSS (btn, card 등 유지)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
