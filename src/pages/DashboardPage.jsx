import React from 'react'
import { Link } from 'react-router-dom'

const DashboardPage = ({ user }) => {
  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
        <p className="text-gray-600 mt-1">
          환영합니다, <span className="font-medium">{user?.email}</span> 님 👋
        </p>
      </header>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 매장 관리 */}
        <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">매장 관리</h2>
          <p className="text-sm text-gray-500 mt-2 flex-1">
            매장을 생성하거나 참여하고, 소속된 매장을 확인하세요.
          </p>
          <Link
            to="/stores"
            className="mt-4 inline-block bg-[#3AC0C3] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#2FA6A9] transition"
          >
            매장으로 이동
          </Link>
        </div>

        {/* 근무 필요 인원 설정 */}
        <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">근무 필요 인원</h2>
          <p className="text-sm text-gray-500 mt-2 flex-1">
            매니저는 날짜별 필요한 인원을 설정할 수 있습니다.
          </p>
          <Link
            to="/stores"
            className="mt-4 inline-block bg-[#3AC0C3] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#2FA6A9] transition"
          >
            설정하기
          </Link>
        </div>

        {/* 근무 가능 시간 제출 */}
        <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">근무 가능 시간</h2>
          <p className="text-sm text-gray-500 mt-2 flex-1">
            Staff는 본인이 가능한 시간을 제출할 수 있습니다.
          </p>
          <Link
            to="/stores"
            className="mt-4 inline-block bg-[#3AC0C3] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#2FA6A9] transition"
          >
            제출하기
          </Link>
        </div>

        {/* 내 근무표 */}
        <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">내 근무표</h2>
          <p className="text-sm text-gray-500 mt-2 flex-1">
            배정된 내 근무 일정을 확인하세요.
          </p>
          <Link
            to="/stores"
            className="mt-4 inline-block bg-[#3AC0C3] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#2FA6A9] transition"
          >
            확인하기
          </Link>
        </div>

        {/* 교대 요청 */}
        <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">교대 요청</h2>
          <p className="text-sm text-gray-500 mt-2 flex-1">
            교대 근무가 필요할 때 요청을 관리하세요.
          </p>
          <Link
            to="/swap-requests"
            className="mt-4 inline-block bg-[#3AC0C3] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#2FA6A9] transition"
          >
            요청하기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
