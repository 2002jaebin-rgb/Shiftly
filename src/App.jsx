import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase, db } from './supabaseClient'

// 공통
import Layout from './components/Layout'
import Navbar from './components/Navbar'

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

// 보호 라우트
const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      if (user) {
        const { data: p } = await db.profiles.getMine()
        setProfile(p || null)
      }
    }
    init()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        if (session?.user) {
          const { data: p } = await db.profiles.getMine()
          setProfile(p || null)
        } else {
          setProfile(null)
        }
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
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />

          {/* 온보딩(역할 선택) */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute user={user}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* 대시보드: 역할/소속 매장에 따라 리디렉션 가드 */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                {profile && !profile.account_role ? (
                  <Navigate to="/onboarding" replace />
                ) : (
                  <DashboardPage user={user} />
                )}
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

          {/* 매장 리스트/생성 */}
          <Route
            path="/stores"
            element={
              <ProtectedRoute user={user}>
                <StorePage user={user} />
              </ProtectedRoute>
            }
          />

          {/* 매장 기본페이지(이번 주 캘린더) */}
          <Route
            path="/stores/:storeId"
            element={
              <ProtectedRoute user={user}>
                <StoreHomePage user={user} />
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

          {/* 매니저 – 근무 필요 인원 설정(레거시/보조) */}
          <Route
            path="/stores/:storeId/needs"
            element={
              <ProtectedRoute user={user}>
                <ShiftNeedsPage user={user} />
              </ProtectedRoute>
            }
          />

          {/* staff/manager – 근무 가능 시간 제출(레거시/보조) */}
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

          {/* 기본 경로 */}
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
