import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../supabaseClient'

const Navbar = ({ user }) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    const { error } = await auth.signOut()
    if (error) {
      alert('로그아웃 중 오류가 발생했습니다.')
      return
    }
    navigate('/login')
  }

  return (
    <nav style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/dashboard">대시보드</Link>
          <Link to="/swap-requests">교체 요청</Link>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontSize: 14, color: '#555' }}>{user.email}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/login">로그인</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
