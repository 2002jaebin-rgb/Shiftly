import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const Navbar = ({ user }) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('로그아웃 에러:', error.message)
    } else {
      console.log('로그아웃 성공')
      navigate('/login', { replace: true })
      window.location.reload()   // ✅ 세션 확실히 초기화
    }
  }

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <Link to="/dashboard" className="text-xl font-bold text-[#3AC0C3]">
        쉽표
      </Link>

      <div className="flex gap-4 items-center">
        <Link to="/dashboard" className="text-gray-700 hover:text-[#3AC0C3]">
          대시보드
        </Link>
        <Link to="/stores" className="text-gray-700 hover:text-[#3AC0C3]">
          내 매장
        </Link>
        <Link to="/swap-requests" className="text-gray-700 hover:text-[#3AC0C3]">
          교대 요청
        </Link>

        {user && (
          <button
            onClick={handleLogout}
            className="ml-4 bg-[#3AC0C3] text-white px-4 py-2 rounded-lg hover:bg-[#2A9FA2] transition"
          >
            로그아웃
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
