import React from 'react'
import Navbar from './Navbar'

const Layout = ({ user, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 상단바 */}
      <Navbar user={user} />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </main>

      {/* 푸터 (선택 사항) */}
      <footer className="border-t py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Shiftly. All rights reserved.
      </footer>
    </div>
  )
}

export default Layout
