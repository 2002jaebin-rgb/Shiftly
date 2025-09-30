import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

// 공통 컴포넌트
import Navbar from './components/Navbar'
import Layout from './components/Layout'

// 페이지
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ShiftDetailPage from './pages/ShiftDetailPage'
import SwapRequestsPage from './pages/SwapRequestsPage'
import StorePage from './pages/StorePage'
import ShiftNeedsPage from './pages/ShiftNeedsPage'
import JoinStorePage from './pages/JoinStorePage'
import AvailabilityPage from './pages/AvailabilityPage'
import MyShiftsPage from './pages/MyShiftsPage'
import ShiftAssignmentPage from './pages/ShiftAssignmentPage'
import StoreHomePage from './pages/StoreHomePage'
import OnboardingPage from './pages/OnboardingPage'

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
      (event, session) => {
        console.log('Auth event:', event)  // ✅ 이벤트 로그 찍기
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
      <Layout user={user}>
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

          {/* staff/manager – 근무 가능 시간 제출 */}
          <Route
            path="/stores/:storeId/availability"
            element={
              <ProtectedRoute user={user}>
                <AvailabilityPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* staff – 내 근무표 */}
          <Route
            path="/stores/:storeId/my-shifts"
            element={
              <ProtectedRoute user={user}>
                <MyShiftsPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* 매니저 – 근무 배정 */}
          <Route
            path="/stores/:storeId/assign"
            element={
              <ProtectedRoute user={user}>
                <ShiftAssignmentPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* 매장 기본 페이지 (이번 주 캘린더) */}
          <Route
            path="/stores/:storeId"
            element={
              <ProtectedRoute user={user}>
                <StoreHomePage user={user} />
              </ProtectedRoute>
            }
          />

          {/* 온보딩 */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute user={user}>
                <OnboardingPage user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stores/new"
            element={
              <ProtectedRoute user={user}>
                <CreateStorePage user={user} />
              </ProtectedRoute>
            }
          />

          {/* 기본 경로 */}
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
