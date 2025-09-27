import React, { useState } from 'react'
import { db } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const JoinStorePage = ({ user }) => {
  const [storeId, setStoreId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleJoin = async (e) => {
    e.preventDefault()
    setError('')
    const idNum = Number(storeId)
    if (!idNum || idNum <= 0) {
      setError('올바른 매장 ID를 입력하세요.')
      return
    }
    setLoading(true)
    const { error } = await db.storeMembers.join(idNum, user.id)
    setLoading(false)
    if (error) {
      // 중복(이미 가입) 에러 코드: 23505
      if (error.code === '23505') {
        alert('이미 해당 매장에 소속되어 있습니다.')
        navigate('/stores')
        return
      }
      setError(error.message || '매장 참여에 실패했습니다.')
      return
    }
    alert('매장에 참여되었습니다.')
    navigate('/stores')
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2 style={{ marginBottom: 16 }}>매장 참여</h2>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>
        매니저로부터 받은 <b>매장 ID</b>를 입력하면 해당 매장에 합류할 수 있습니다.
      </p>

      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

      <form onSubmit={handleJoin}>
        <div className="form-group">
          <label>매장 ID</label>
          <input
            type="number"
            placeholder="예: 1"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? '참여 중...' : '매장 참여하기'}
        </button>
      </form>
    </div>
  )
}

export default JoinStorePage
