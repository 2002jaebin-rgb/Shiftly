import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const Navbar = ({ user }) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      {/* 로고 */}
      <Link to="/dashboard" className="text-xl font-bold text-[#3AC0C3]">
        쉽표
      </Link>

      {/* 메뉴 */}
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

        {/* 로그아웃 버튼 */}
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
