import React, { useEffect, useState } from 'react'
import { db } from '../supabaseClient'

const MemberManagementModal = ({ storeId, onClose, myRole }) => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // ✅ 멤버 목록 로드
  const loadMembers = async () => {
    setLoading(true)
    const { data, error } = await db.storeMembers.listForStore(storeId)
    console.log("📌 listForStore result:", data, error)
    setMembers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadMembers()
  }, [storeId])

  // ✅ 역할 변경
  const handleRoleChange = async (userId, role) => {
    if (myRole !== 'manager') return alert('권한이 없습니다.')
    setProcessing(true)
    const { error } = await db.storeMembers.updateRole(storeId, userId, role)
    if (error) alert('역할 변경 실패: ' + error.message)
    else await loadMembers()
    setProcessing(false)
  }

  // ✅ 멤버 삭제
  const handleRemove = async (userId) => {
    if (myRole !== 'manager') return alert('권한이 없습니다.')
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    setProcessing(true)
    const { error } = await db.storeMembers.remove(storeId, userId)
    if (error) alert('삭제 실패: ' + error.message)
    else await loadMembers()
    setProcessing(false)
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
                {myRole === 'manager' && <th className="p-2 border">액션</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.user_id}>
                  <td className="p-2 border">
                    {m.profiles?.display_name || m.user_id.slice(0, 8) + '…'}
                  </td>
                  <td className="p-2 border">{m.role}</td>
                  {myRole === 'manager' && (
                    <td className="p-2 border space-x-2">
                      {m.role !== 'manager' && (
                        <button
                          onClick={() => handleRoleChange(m.user_id, 'manager')}
                          disabled={processing}
                          className="text-blue-600"
                        >
                          매니저로
                        </button>
                      )}
                      {m.role !== 'staff' && (
                        <button
                          onClick={() => handleRoleChange(m.user_id, 'staff')}
                          disabled={processing}
                          className="text-green-600"
                        >
                          스태프로
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(m.user_id)}
                        disabled={processing}
                        className="text-red-600"
                      >
                        삭제
                      </button>
                    </td>
                  )}
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
