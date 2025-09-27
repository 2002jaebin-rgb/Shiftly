import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../supabaseClient'

const ShiftDetailPage = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shift, setShift] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSwapForm, setShowSwapForm] = useState(false)
  const [targetUserId, setTargetUserId] = useState('')
  const [users, setUsers] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadShiftAndUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadShiftAndUsers = async () => {
    try {
      setLoading(true)
      setError('')

      // 헬퍼에 getById가 없을 수 있으니 전체 후 필터
      const { data: allShifts, error: sErr } = await db.shifts.getAll()
      if (sErr) throw sErr
      const found = (allShifts || []).find((s) => String(s.id) === String(id))
      setShift(found || null)

      const { data: allUsers, error: uErr } = await db.users.getAll()
      if (uErr) throw uErr
      // 본인 제외
      setUsers((allUsers || []).filter((u) => u.id !== user.id))
    } catch (err) {
      console.error(err)
      setError('시프트 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
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

  const handleCreateSwapRequest = async () => {
    if (!targetUserId) {
      alert('교체 대상자를 선택해주세요.')
      return
    }
    try {
      setSubmitting(true)
      const swapData = {
        shift_id: shift.id,
        requester_id: user.id,
        target_id: targetUserId,
        status: 'pending',
      }
      const { data, error } = await db.swapRequests.create(swapData)
      if (error) throw error
      alert('교체 요청이 등록되었습니다.')
      setShowSwapForm(false)
      navigate('/swap-requests')
    } catch (err) {
      console.error(err)
      alert('교체 요청 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>불러오는 중…</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!shift) return <div>해당 시프트를 찾을 수 없습니다.</div>

  const isOwner = shift.user_id === user.id

  return (
    <div>
      <h2>시프트 상세</h2>
      <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12, marginBottom: 16 }}>
        <div><strong>근무</strong></div>
        <div>{formatRange(shift)}</div>
        <div>상태: {shift.status}</div>
        <div>배정 사용자: {shift.user_id}</div>
      </div>

      {isOwner ? (
        <div style={{ marginBottom: 16 }}>
          {!showSwapForm ? (
            <button className="btn btn-primary" onClick={() => setShowSwapForm(true)}>
              교체 요청하기
            </button>
          ) : (
            <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
              <div style={{ marginBottom: 8 }}>
                <label>교체 대상자 선택:&nbsp;</label>
                <select value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)}>
                  <option value="">-- 선택 --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleCreateSwapRequest} disabled={submitting}>
                {submitting ? '요청 중…' : '요청 등록'}
              </button>
              <button className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={() => setShowSwapForm(false)}>
                취소
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: 16, color: '#666' }}>
          이 시프트의 소유자가 아니므로 교체 요청을 생성할 수 없습니다.
        </div>
      )}

      <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
        대시보드로 돌아가기
      </button>
    </div>
  )
}

export default ShiftDetailPage
