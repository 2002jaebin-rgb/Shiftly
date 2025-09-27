import React from 'react'
import { Navigate } from 'react-router-dom'

// ✅ 로딩 상태 반영한 ProtectedRoute
const ProtectedRoute = ({ user, loading, children }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        로딩 중...
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}


export default ProtectedRoute
