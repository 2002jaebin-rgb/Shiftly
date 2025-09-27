import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../supabaseClient'

const Navbar = ({ user }) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    const { error } = await auth.signOut()
    if (!error) {
      navigate('/login')
    } else {
      alert('로그아웃 중 오류가 발생했습니다.')
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          Shiftly
        </Link>
        <ul className="navbar-nav">
          <li>
            <Link to="/dashboard">대시보드</Link>
          </li>
          <li>
            <Link to="/swap-requests">교체 요청</Link>
          </li>
          <li>
            <button onClick={handleLogout} className="btn btn-secondary">
              로그아웃
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
