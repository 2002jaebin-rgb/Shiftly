import React, { useEffect, useState } from 'react'
import { db } from '../supabaseClient'

const MemberManagementModal = ({ storeId, onClose }) => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await db.storeMembers.listForStore(storeId)
      console.log("📌 listForStore result:", data, error) // ✅ 여기 로그 추가
      setMembers(data || [])
      setLoading(false)
    }
    load()
  }, [storeId])
  

  const handleRoleChange = async (userId, role) => {
    const { error } = await db.storeMembers.updateRole(storeId, userId, role)
    if (!error) {
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role } : m))
      )
    }
  }

  const handleRemove = async (userId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    const { error } = await db.storeMembers.remove(storeId, userId)
    if (!error) {
      setMembers((prev) => prev.filter((m) => m.user_id !== userId))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-96 p-4 relative">
        <h3 className="text-lg font-bold mb-4">멤버 관리</h3>
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>

        {loading ? (
          <p>불러오는 중...</p>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">이름</th>
                <th className="p-2 border">역할</th>
                <th className="p-2 border">액션</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.user_id}>
                  <td className="p-2 border">
                    {m.profiles?.display_name || m.user_id}
                  </td>
                  <td className="p-2 border">{m.role}</td>
                  <td className="p-2 border space-x-2">
                    {m.role !== 'manager' && (
                      <button
                        onClick={() => handleRoleChange(m.user_id, 'manager')}
                        className="text-blue-600"
                      >
                        매니저로
                      </button>
                    )}
                    {m.role !== 'staff' && (
                      <button
                        onClick={() => handleRoleChange(m.user_id, 'staff')}
                        className="text-green-600"
                      >
                        스태프로
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(m.user_id)}
                      className="text-red-600"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default MemberManagementModal
