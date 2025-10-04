import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../supabaseClient'
import MemberManagementModal from '../components/MemberManagementModal'

const StoreHomePage = ({ user }) => {
  const { storeId } = useParams()
  const [myRole, setMyRole] = useState(null)
  const [showMemberModal, setShowMemberModal] = useState(false)

  useEffect(() => {
    const fetchRole = async () => {
      const { data: memberships } = await db.storeMembers.myStores()
      const me = memberships?.find((m) => m.store_id == storeId)
      setMyRole(me?.role || null)
    }
    fetchRole()
  }, [storeId])

  return (
    <div className="p-6">
      <header className="flex items-end justify-between mb-6">
        <h1 className="text-2xl font-bold">매장 홈</h1>
        <div className="flex gap-2">
          <Link
            to={`/stores/${storeId}/assign`}
            className="px-3 py-2 rounded-lg bg-blue-500 text-white"
          >
            배정 관리
          </Link>
          {myRole === 'manager' && (
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-3 py-2 rounded-lg bg-gray-500 text-white"
            >
              멤버 관리
            </button>
          )}
        </div>
      </header>

      <section className="mt-6">
        <p className="text-gray-700">
          매장 ID: <b>{storeId}</b>
        </p>
        <p className="text-gray-500 text-sm mt-2">
          여기에 매장별 안내나 위젯들을 추가할 수 있습니다.
        </p>
      </section>

      {/* 멤버 관리 모달 */}
      {showMemberModal && (
        <MemberManagementModal
          storeId={storeId}
          onClose={() => setShowMemberModal(false)}
        />
      )}
    </div>
  )
}

export default StoreHomePage
