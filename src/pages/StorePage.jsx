import React, { useState, useEffect } from 'react'
import { db } from '../supabaseClient'

const StorePage = ({ user }) => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [newStoreName, setNewStoreName] = useState('')
  const [error, setError] = useState('')

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
    const { data, error } = await db.stores.create(newStoreName.trim())
    if (error) {
      alert(error.message || '매장 생성 실패')
    } else {
      // 매장 만든 사람은 SELECT 정책에서 created_by=auth.uid()로 즉시 보임
      alert(`매장 생성 완료. 매장 ID: ${data.id}`)
      setNewStoreName('')
      await loadStores()
    }
  }

  if (loading) return <p>불러오는 중...</p>

  return (
    <div style={{ maxWidth: 720, margin: '24px auto' }}>
      <h2>내 매장</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {stores.length === 0 ? (
        <p>아직 매장이 없습니다.</p>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <ul>
            {stores.map((s, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <b>{s.store?.name || '(이름 없음)'}</b> <span style={{ color: '#666' }}>({s.role})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <h3>매장 만들기 (매니저)</h3>
        <form onSubmit={handleCreateStore} style={{ marginTop: 12 }}>
          <input
            type="text"
            placeholder="매장 이름"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ marginLeft: 8 }}>
            만들기
          </button>
        </form>
        <p style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
          매장 생성 후 표시되는 <b>매장 ID</b>를 직원에게 전달하세요. 직원은 ‘매장 참여’에서 해당 ID로 합류할 수 있습니다.
        </p>
      </div>

      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <h3>직원(알바) 안내</h3>
        <p style={{ fontSize: 14, color: '#444' }}>
          상단 메뉴 또는 주소창에서 <b>/stores/join</b> 페이지로 이동하여 매니저가 준 <b>매장 ID</b>를 입력하세요.
        </p>
      </div>
    </div>
  )
}

export default StorePage
