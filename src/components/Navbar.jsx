import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = ({ user }) => {
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        {/* 로고 / 앱 이름 */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="쉽표 로고" className="h-8 w-8" />
          <span className="text-xl font-semibold text-[#3AC0C3] tracking-tight">
            쉽표
          </span>
        </Link>

        {/* 메뉴 */}
        <nav className="flex items-center gap-6">
          <Link to="/dashboard" className="text-gray-700 hover:text-[#3AC0C3] transition">
            대시보드
          </Link>
          <Link to="/stores" className="text-gray-700 hover:text-[#3AC0C3] transition">
            매장
          </Link>
          <Link to="/swap-requests" className="text-gray-700 hover:text-[#3AC0C3] transition">
            교대 요청
          </Link>

          {user && (
            <span className="text-sm text-gray-500 border-l pl-4">
              {user.email}
            </span>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
