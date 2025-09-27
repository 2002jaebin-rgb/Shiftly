import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ShiftDetailPage from './pages/ShiftDetailPage'
import SwapRequestsPage from './pages/SwapRequestsPage'
import StorePage from './pages/StorePage'
import ShiftNeedsPage from './pages/ShiftNeedsPage'
import JoinStorePage from './pages/JoinStorePage'
import AvailabilityPage from './pages/AvailabilityPage'

// ✅ 보호 라우트 컴포넌트
const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 현재 사용자 확인
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getCurrentUser()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          로딩 중...
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} />}
        <Routes>
          {/* 로그인 */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
          />

          {/* 대시보드 */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute user={user}>
                <DashboardPage user={user} />
              </ProtectedRoute>
            } 
          />

          {/* 근무표 상세 */}
          <Route 
            path="/shift/:id" 
            element={
              <ProtectedRoute user={user}>
                <ShiftDetailPage user={user} />
              </ProtectedRoute>
            } 
          />

          {/* 교대 요청 */}
          <Route 
            path="/swap-requests" 
            element={
              <ProtectedRoute user={user}>
                <SwapRequestsPage user={user} />
              </ProtectedRoute>
            } 
          />

          {/* 매장 관리 */}
          <Route
            path="/stores"
            element={
              <ProtectedRoute user={user}>
                <StorePage user={user} />
              </ProtectedRoute>
            }
          />

          {/* 매장 합류 */}
          <Route
            path="/stores/join"
            element={
              <ProtectedRoute user={user}>
                <JoinStorePage user={user} />
              </ProtectedRoute>
            }
          />

          {/* 매니저 – 근무 필요 인원 설정 */}
          <Route
            path="/stores/:storeId/needs"
            element={
              <ProtectedRoute user={user}>
                <ShiftNeedsPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* staff – 근무 가능 시간 제출 (store 단위) */}
          <Route
            path="/stores/:storeId/availability"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <AvailabilityPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* 기본 경로 */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
