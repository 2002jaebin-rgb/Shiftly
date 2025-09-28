import React from 'react'
import { Link } from 'react-router-dom'

const DashboardPage = ({ user }) => {
  const menuItems = [
    {
      title: '내 매장',
      desc: '매장 목록 확인 및 관리',
      href: '/stores',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      title: '근무 필요 인원',
      desc: '매니저가 근무 수요를 설정',
      href: '/stores/16/needs', // TODO: storeId 동적으로 바꿔야 함
      color: 'bg-green-100 text-green-700'
    },
    {
      title: '내 근무 가능 시간',
      desc: '내 availability 제출',
      href: '/stores/16/availability', // TODO: storeId 동적으로 바꿔야 함
      color: 'bg-yellow-100 text-yellow-700'
    },
    {
      title: '내 근무표',
      desc: '배정된 근무 일정 확인',
      href: '/stores/16/my-shifts', // TODO: storeId 동적으로 바꿔야 함
      color: 'bg-purple-100 text-purple-700'
    }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">대시보드</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.href}
            className={`rounded-xl shadow hover:shadow-md p-6 flex flex-col justify-between transition ${item.color}`}
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-sm">{item.desc}</p>
            </div>
            <span className="mt-4 text-sm font-medium underline">바로가기 →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage
