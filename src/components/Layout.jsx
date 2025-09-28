import React from 'react'
import Navbar from './Navbar'

/**
 * Layout 컴포넌트
 * - Navbar 항상 상단에 표시
 * - children: 각 페이지(Route) 내용
 */
const Layout = ({ user, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 네비게이션 */}
      <Navbar user={user} />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}

export default Layout   // ✅ 반드시 있어야 App.jsx에서 import 가능
