import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ShiftDetailPage from './pages/ShiftDetailPage'
import SwapRequestsPage from './pages/SwapRequestsPage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
      setLoading(false)
    }
    bootstrap()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{ padding: 16 }}>로딩 중…</div>

  return (
    <Router>
      <Navbar user={user} />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px' }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />

          <Route
            path="/dashboard"
            element={user ? <DashboardPage user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/shift/:id"
            element={user ? <ShiftDetailPage user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/swap-requests"
            element={user ? <SwapRequestsPage user={user} /> : <Navigate to="/login" />}
          />

          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
