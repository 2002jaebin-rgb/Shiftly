import React, { useEffect, useState } from 'react'
import { db } from '../supabaseClient'

const StorePage = ({ user }) => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [newStoreName, setNewStoreName] = useState('')
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const loadStores = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await db.stores.listForUser(user.id)
    if (error) setError(error.message)
    setStores(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadStores()
  }, [])

  const handleCreateStore = async (e) => {
    e.preventDefault()
    if (!newStoreName.trim()) return
    const { error } = await db.stores.create(newStoreName.trim())
    if (error) {
      alert(error.message)
    } else {
      setNewStoreName('')
      setShowCreate(false)
      await loadStores()
    }
  }

  if (loading) return <p>불러오는 중...</p>

  return (
    <div>
      {/* 상단 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">내 매장</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-[#3AC0C3] text-white px-4 py-2 rounded-lg shadow hover:bg-[#2FA6A9] transition"
        >
          매장 만들기
        </button>
      </div>

      {/* 오류 */}
      {error && <p className="text-red-500">{error}</p>}

      {/* 매장 리스트 */}
      {stores.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500">
          아직 매장이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm hover:shadow-md p-6 transition border border-gray-100"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{s.store?.name}</h3>
                  <p className="text-sm text-gray-500">역할: {s.role}</p>
                </div>
                <a
                  href={`/stores/${s.store?.id}/needs`}
                  className="text-[#3AC0C3] font-medium hover:underline"
                >
                  관리 →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 새 매장 추가 Form */}
      {showCreate && (
        <form
          onSubmit={handleCreateStore}
          className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-bold mb-4 text-gray-800">새 매장 추가</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="매장 이름"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3AC0C3] focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#3AC0C3] text-white px-4 py-2 rounded-lg shadow hover:bg-[#2FA6A9] transition"
            >
              저장
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default StorePage
