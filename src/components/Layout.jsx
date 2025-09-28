import React from 'react'
import Navbar from './Navbar'

const Layout = ({ user, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      {/* 상단바 */}
      <Navbar user={user} />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </main>

      {/* 푸터 */}
      <footer className="border-t py-6 text-center text-sm text-gray-500">
        근무표는 간단하게, 일상에는 쉼표를
      </footer>
    </div>
  )
}

export default Layout
