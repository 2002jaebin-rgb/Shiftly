import React, { useState, useEffect } from 'react'
import { db } from '../supabaseClient'

const SwapRequestsPage = ({ user }) => {
  const [swapRequests, setSwapRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSwapRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadSwapRequests = async () => {
    try {
      setLoading(true)
      setError('')
      const { data, error } = await db.swapRequests.getByUserId(user.id)
      if (error) throw error
      setSwapRequests(data || [])
    } catch (err) {
      console.error(err)
      setError('교체 요청을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 매니저 승인/거절 액션
  const updateStatus = async (request, newStatus) => {
    try {
      // 1) 요청 상태 변경
      const { error } = await db.swapRequests.updateStatus(request.id, newStatus)
      if (error) throw error

      // 2) 승인일 때만, 시프트 소유자 교체
      if (newStatus === 'accepted') {
        const { error: sErr } = await db.shifts.update(request.shift_id, { user_id: request.target_id })
        if (sErr) throw sErr
      }

      await loadSwapRequests()
      alert(`요청이 ${newStatus === 'accepted' ? '승인' : '거절'}되었습니다.`)
    } catch (err) {
      console.error(err)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }

  const formatRange = (row) => {
    const hasISO = (v) => typeof v === 'string' && v.includes('T')
    if (row?.start_time && hasISO(row.start_time)) {
      const s = new Date(row.start_time)
      const e = new Date(row.end_time)
      const dateStr = s.toLocaleDateString()
      const sTime = s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const eTime = e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      return `${dateStr} ${sTime} ~ ${eTime}`
    }
    return `${row?.date || ''} ${row?.start_time || ''} ~ ${row?.end_time || ''}`
  }

  if (loading) return <div>불러오는 중…</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  if (!swapRequests.length) {
    return <div>교체 요청이 없습니다.</div>
  }

  return (
    <div>
      <h2>교체 요청</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {swapRequests.map((req) => (
          <div key={req.id} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12 }}>
            <div><strong>요청 ID:</strong> {req.id}</div>
            <div><strong>상태:</strong> {req.status}</div>

            {/* 관계형 select로 가져오는 경우를 대비해 유연하게 표시 */}
            <div style={{ marginTop: 8 }}>
              <div><strong>시프트:</strong> {formatRange(req.shift || req)}</div>
              <div><strong>요청자:</strong> {req.requester?.name || req.requester?.email || req.requester_id}</div>
              <div><strong>대상자:</strong> {req.target?.name || req.target?.email || req.target_id}</div>
            </div>

            {/* 간단 권한 가정: 매니저만 승인/거절 버튼을 본다고 가정하려면, user.role 확인 필요(프로필 테이블 기준) */}
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => updateStatus(req, 'accepted')}>
                승인
              </button>
              <button className="btn btn-secondary" onClick={() => updateStatus(req, 'rejected')}>
                거절
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SwapRequestsPage
