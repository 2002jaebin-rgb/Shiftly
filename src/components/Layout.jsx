import React from 'react'
import Navbar from './Navbar'

/**
 * 공통 레이아웃
 * - 상단 Navbar
 * - 중앙 컨테이너
 * - 모바일/PWA 환경 고려한 padding
 */
const Layout = ({ user, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}

export default Layout
