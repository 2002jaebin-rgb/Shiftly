import React, { useState, useEffect } from 'react'
import { db, supabase } from '../supabaseClient'
import { useParams } from 'react-router-dom'

const ShiftNeedsPage = ({ user }) => {
  const { storeId } = useParams()
  const [needs, setNeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [role, setRole] = useState(null) // ✅ 유저 권한 저장

  // 입력 상태
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [requiredStaff, setRequiredStaff] = useState(1)
  const [dueDate, setDueDate] = useState('')

  // 매장 근무 필요 인원 불러오기
  const loadNeeds = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await db.shiftNeeds.listForStore(storeId)
    if (error) setError(error.message)
    setNeeds(data || [])
    setLoading(false)
  }

  // 현재 유저의 role 확인
  const loadRole = async () => {
    const { data, error } = await supabase
      .from('store_members')
      .select('role')
      .eq('store_id', storeId)
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setRole(data.role)
    }
  }

  useEffect(() => {
    loadNeeds()
    loadRole()
  }, [storeId])

  const handleCreate = async (e) => {
    e.preventDefault()
    const { error } = await db.shiftNeeds.create(
      storeId,
      date,
      startTime,
      endTime,
      requiredStaff,
      dueDate
    )
    if (error) {
      alert(error.message)
    } else {
      setDate('')
      setStartTime('')
      setEndTime('')
      setRequiredStaff(1)
      setDueDate('')
      await loadNeeds()
    }
  }

  if (loading) return <p>불러오는 중...</p>

  return (
    <div style={{ maxWidth: 600, margin: '20px auto' }}>
      <h2>근무 필요 인원 설정</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {needs.map((n) => (
          <li key={n.id}>
            {n.date} {n.start_time}~{n.end_time}, {n.required_staff}명 필요
            (마감일: {n.due_date ? new Date(n.due_date).toLocaleString() : '없음'})
          </li>
        ))}
      </ul>

      {/* ✅ 매니저만 등록 폼 보이게 */}
      {role === 'manager' && (
        <form onSubmit={handleCreate} style={{ marginTop: 20 }}>
          <h3>새 필요 인원 추가</h3>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
          <input
            type="number"
            min="1"
            value={requiredStaff}
            onChange={(e) => setRequiredStaff(e.target.value)}
            required
          />
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginLeft: 8 }}
          >
            등록
          </button>
        </form>
      )}
    </div>
  )
}

export default ShiftNeedsPage
