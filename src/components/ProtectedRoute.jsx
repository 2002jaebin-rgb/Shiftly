import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    // 로그인 안 된 상태 → /login 으로 강제 이동
    return <Navigate to="/login" replace />
  }
  // 로그인 된 상태 → 원래 페이지 보여주기
  return children
}

export default ProtectedRoute
