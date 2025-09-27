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
    const { error } = await db.stores.create(newStoreName.trim(), user.id)
    if (error) {
      alert(error.message)
    } else {
      setNewStoreName('')
      await loadStores()
    }
  }

  if (loading) return <p>불러오는 중...</p>

  return (
    <div>
      <h2>내 매장</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {stores.length === 0 ? (
        <p>아직 매장이 없습니다.</p>
      ) : (
        <ul>
          {stores.map((s, idx) => (
            <li key={idx}>
              {s.stores?.name} ({s.role})
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCreateStore} style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="매장 이름"
          value={newStoreName}
          onChange={(e) => setNewStoreName(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ marginLeft: 8 }}>
          매장 만들기
        </button>
      </form>
    </div>
  )
}

export default StorePage   // ✅ 이 줄이 꼭 있어야 합니다
